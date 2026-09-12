import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, parseBody, route } from "@/lib/tenant";
import { falCreditCost, falModels, getVideoJob, isFalConfigured, submitVideoJob } from "@/lib/providers/fal";
import { consumeCredits } from "@/lib/server/credits";

/**
 * AI video generation through the fal.ai gateway.
 *
 * The browser sends a prompt and a model code only; the model must be on the
 * server-side allowlist. When a credit cost is configured, credits are debited
 * before the job is submitted, and refunded is not attempted — the ledger entry
 * records the attempt, which is why the debit is keyed to the job.
 */

const submitSchema = z.object({
  model: z.string().min(3).max(120),
  prompt: z.string().min(3).max(2000),
  imageUrl: z.string().url().max(2000).optional(),
});

export const GET = route(async (_ctx, req) => {
  const url = new URL(req.url);
  const model = url.searchParams.get("model") ?? "";
  const jobId = url.searchParams.get("jobId") ?? "";
  if (!isFalConfigured()) {
    return NextResponse.json({ available: false, models: [], creditCost: null });
  }
  if (!model || !jobId) {
    return NextResponse.json({ available: true, models: falModels(), creditCost: falCreditCost() });
  }
  const status = await getVideoJob(model, jobId);
  if (!status.ok) throw new ApiError(502, status.error);
  return NextResponse.json(status);
});

export const POST = route(
  async (ctx, req) => {
    if (!isFalConfigured()) throw new ApiError(503, "AI video generation is not available yet.");
    const { model, prompt, imageUrl } = await parseBody(req, submitSchema);

    const cost = falCreditCost();
    const jobKey = `${ctx.workspaceId}:${Date.now()}`;
    if (cost) {
      const debit = await consumeCredits(ctx.workspaceId, cost, {
        type: "ai_video",
        id: jobKey,
        note: model,
        actorUserId: ctx.userId,
      });
      if (!debit.ok) {
        throw new ApiError(
          402,
          debit.error === "insufficient_credits"
            ? "Not enough credits for a video generation. Buy credits or upgrade your plan."
            : "Credits could not be debited, so the job was not submitted.",
        );
      }
    }

    const job = await submitVideoJob({ model, prompt, imageUrl });
    if (!job.ok) throw new ApiError(502, job.error);
    return NextResponse.json({ ...job, creditsCharged: cost ?? 0 });
  },
  { limit: 20, windowSec: 3600 },
);
