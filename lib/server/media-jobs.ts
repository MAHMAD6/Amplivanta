import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { notify } from "@/lib/notifications";
import { db } from "@/lib/db";
import { buildFalPayload, extractOutputs, FAL_TASKS, validateMediaInput, type FalTaskCode, type MediaInput } from "@/lib/media/fal-tasks";
import { falTask, pollFalJob, submitFalJob } from "@/lib/providers/fal";
import { consumeCredits, refundUsage } from "@/lib/server/credits";
import { buildObjectKey, isStorageConfigured, objectUrl, putObject } from "@/lib/storage";

/**
 * Creative Studio generation pipeline (fal.ai Integration Guidelines):
 * validate → entitlement and credits → approved model → submit → store
 * request id → webhook/poll → copy output to storage → draft asset.
 * Credits are debited at submission and refunded if the job fails.
 */

const CREDIT_SOURCE = "media_generation";
const APP_URL = () => process.env.NEXTAUTH_URL || process.env.BETTER_AUTH_URL || "";
const MAX_BYTES = () => Number(process.env.FAL_MAX_OUTPUT_BYTES) || 200 * 1024 * 1024;

/** Per-job token embedded in the webhook URL, on top of fal's signature. */
export function webhookToken(jobId: string): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";
  return createHmac("sha256", secret).update(`fal-webhook:${jobId}`).digest("hex").slice(0, 32);
}

export function webhookTokenValid(jobId: string, token: string): boolean {
  const expected = Buffer.from(webhookToken(jobId));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export type CreateJobResult = { ok: true; jobId: string; credits: number } | { ok: false; status: number; error: string };

export async function createMediaJob(ctx: { workspaceId: string; userId: string }, code: FalTaskCode, input: MediaInput): Promise<CreateJobResult> {
  const def = FAL_TASKS[code];
  const task = falTask(code);
  if (!task) return { ok: false, status: 503, error: `${def.label} is not available yet.` };
  if (!isStorageConfigured()) return { ok: false, status: 503, error: "Asset storage must be configured before generating media." };

  const v = validateMediaInput(code, input);
  if (!v.ok) return { ok: false, status: 400, error: v.error };

  let imageUrl: string | null = null;
  if (v.value.imageAssetId) {
    const source = await db.asset.findFirst({ where: { id: v.value.imageAssetId, workspaceId: ctx.workspaceId }, select: { fileUrl: true, mimeType: true } });
    if (!source || !(source.mimeType ?? "").startsWith("image/")) return { ok: false, status: 400, error: "That image is not in this workspace." };
    imageUrl = await objectUrl(source.fileUrl);
  }

  const job = await db.mediaGenerationJob.create({
    data: {
      workspaceId: ctx.workspaceId,
      userId: ctx.userId,
      task: code,
      kind: def.kind,
      model: task.model,
      prompt: v.value.prompt,
      input: v.value as never,
      creditsCharged: task.credits,
    },
  });

  const debit = await consumeCredits(ctx.workspaceId, task.credits, { type: CREDIT_SOURCE, id: job.id, note: code, actorUserId: ctx.userId });
  if (!debit.ok) {
    await db.mediaGenerationJob.update({ where: { id: job.id }, data: { status: "failed", error: "insufficient_credits", creditsCharged: 0 } });
    return debit.error === "insufficient_credits"
      ? { ok: false, status: 402, error: `${def.label} needs ${task.credits} credits. Buy credits or upgrade your plan.` }
      : { ok: false, status: 500, error: "Credits could not be debited, so nothing was generated." };
  }

  const base = APP_URL();
  const webhook = base.startsWith("https://") ? `${base}/api/webhooks/fal?job=${job.id}&t=${webhookToken(job.id)}` : null;
  const submitted = await submitFalJob(task.model, buildFalPayload(code, v.value, imageUrl), webhook);
  if (!submitted.ok) {
    await failJob(job.id, submitted.error);
    return { ok: false, status: 502, error: submitted.error };
  }
  await db.mediaGenerationJob.update({
    where: { id: job.id },
    data: { status: "processing", requestId: submitted.requestId, statusUrl: submitted.statusUrl, responseUrl: submitted.responseUrl },
  });
  return { ok: true, jobId: job.id, credits: task.credits };
}

async function failJob(jobId: string, error: string) {
  const job = await db.mediaGenerationJob.update({ where: { id: jobId }, data: { status: "failed", error: error.slice(0, 500), completedAt: new Date() } });
  await notify({ workspaceId: job.workspaceId, userId: job.userId, category: "system", severity: "warning", title: "Media generation failed", body: `${error.slice(0, 200)}${job.creditsCharged > 0 ? " Credits charged for it are refunded." : ""}`, link: "/app/creative-studio/images", resourceType: "MediaGenerationJob", resourceId: job.id });
  if (job.creditsCharged > 0 && !job.creditsRefunded) {
    const r = await refundUsage(job.workspaceId, { type: CREDIT_SOURCE, id: job.id, note: "generation failed" });
    if (r.ok) await db.mediaGenerationJob.update({ where: { id: jobId }, data: { creditsRefunded: true } });
  }
}

const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "video/mp4": "mp4", "video/webm": "webm" };

/**
 * Finishes a job exactly once. Claims it atomically (processing → finalizing),
 * re-reads the result from fal, copies outputs into storage as draft assets.
 * Safe to call from the webhook and from status polling concurrently.
 */
export async function settleMediaJob(jobId: string): Promise<{ status: string }> {
  const job = await db.mediaGenerationJob.findUnique({ where: { id: jobId } });
  if (!job) return { status: "missing" };
  if (job.status !== "processing" || !job.statusUrl || !job.responseUrl) return { status: job.status };

  const poll = await pollFalJob(job.statusUrl, job.responseUrl);
  if (!poll.ok) return { status: job.status };
  if (poll.state === "IN_QUEUE" || poll.state === "IN_PROGRESS") {
    await db.mediaGenerationJob.update({ where: { id: jobId }, data: { updatedAt: new Date() } });
    return { status: "processing" };
  }

  const claim = await db.mediaGenerationJob.updateMany({ where: { id: jobId, status: "processing" }, data: { status: "finalizing" } });
  if (claim.count === 0) return { status: "finalizing" };

  if (poll.state === "FAILED") {
    await failJob(jobId, poll.error);
    return { status: "failed" };
  }

  const outputs = poll.state === "COMPLETED" ? extractOutputs(poll.payload) : [];
  if (outputs.length === 0) {
    await failJob(jobId, "The provider returned no media.");
    return { status: "failed" };
  }

  try {
    const assetIds: string[] = [];
    const label = FAL_TASKS[job.task as FalTaskCode]?.label ?? "AI media";
    for (const [i, o] of outputs.entries()) {
      const res = await fetch(o.url, { signal: AbortSignal.timeout(120000) });
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const contentType = (o.contentType ?? res.headers.get("content-type") ?? "").split(";")[0].trim();
      if (!contentType.startsWith(`${job.kind}/`)) throw new Error("Unexpected media type");
      const bytes = new Uint8Array(await res.arrayBuffer());
      if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES()) throw new Error("Output file size out of range");
      const name = `${label} ${new Date().toISOString().slice(0, 10)}${outputs.length > 1 ? ` (${i + 1})` : ""}.${EXT[contentType] ?? "bin"}`;
      const key = buildObjectKey(job.workspaceId, name, "generated");
      await putObject(key, bytes, contentType);
      const asset = await db.asset.create({
        data: {
          workspaceId: job.workspaceId,
          name,
          type: job.kind,
          mimeType: contentType,
          fileUrl: key,
          fileType: EXT[contentType] ?? null,
          fileSize: bytes.byteLength,
          uploadedById: job.userId,
          // Draft until a person approves it for publishing.
          tags: ["ai-generated", "draft", `task:${job.task}`],
        },
      });
      assetIds.push(asset.id);
    }
    await db.mediaGenerationJob.update({ where: { id: jobId }, data: { status: "completed", assetIds, completedAt: new Date(), error: null } });
    return { status: "completed" };
  } catch (e) {
    await failJob(jobId, `Could not store the result: ${(e as Error).message}`);
    return { status: "failed" };
  }
}

/** Jobs whose webhook never arrived: poll those idle for over two minutes. */
export async function settleStaleMediaJobs(limit = 20) {
  const stale = await db.mediaGenerationJob.findMany({
    where: { status: "processing", updatedAt: { lt: new Date(Date.now() - 2 * 60 * 1000) } },
    orderBy: { updatedAt: "asc" },
    take: limit,
    select: { id: true },
  });
  const results = [];
  for (const j of stale) results.push((await settleMediaJob(j.id)).status);
  return { checked: stale.length, completed: results.filter((s) => s === "completed").length };
}

/** Task availability for the UI: label, price and whether it is enabled. */
export function mediaTaskCatalogue(kind: "image" | "video") {
  return Object.values(FAL_TASKS)
    .filter((t) => t.kind === kind)
    .map((t) => {
      const r = falTask(t.code);
      return { code: t.code, label: t.label, description: t.description, needsPrompt: t.needsPrompt, needsImage: t.needsImage, credits: r?.credits ?? null, available: Boolean(r) && isStorageConfigured() };
    });
}
