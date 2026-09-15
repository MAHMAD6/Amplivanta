import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyFalWebhook } from "@/lib/providers/fal";
import { settleMediaJob, webhookTokenValid } from "@/lib/server/media-jobs";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * fal.ai completion webhook. Requires both the per-job URL token and fal's
 * ED25519 signature, then settles the job by re-reading the result from fal —
 * the webhook body itself is never trusted as output. Idempotent.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("job") ?? "";
  const token = url.searchParams.get("t") ?? "";
  const raw = await req.text();
  if (!jobId || !webhookTokenValid(jobId, token) || !(await verifyFalWebhook(req.headers, raw))) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 401 });
  }
  let requestId: string | null = null;
  try {
    requestId = (JSON.parse(raw) as { request_id?: string }).request_id ?? null;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const job = await db.mediaGenerationJob.findUnique({ where: { id: jobId }, select: { requestId: true } });
  if (!job || !requestId || job.requestId !== requestId) return NextResponse.json({ error: "Unknown job" }, { status: 404 });
  const { status } = await settleMediaJob(jobId);
  return NextResponse.json({ status });
}
