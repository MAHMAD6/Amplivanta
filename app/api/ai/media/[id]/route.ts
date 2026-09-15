import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, route } from "@/lib/tenant";
import { settleMediaJob } from "@/lib/server/media-jobs";

type Params = { id: string };

/** Job status for the requesting workspace; nudges settlement if the webhook is late. */
export const GET = route<Params>(async (ctx, _req, { id }) => {
  let job = await db.mediaGenerationJob.findFirst({ where: { id, workspaceId: ctx.workspaceId } });
  if (!job) throw new ApiError(404, "Job not found");
  if (job.status === "processing" && Date.now() - job.updatedAt.getTime() > 15000) {
    await settleMediaJob(job.id);
    job = (await db.mediaGenerationJob.findUnique({ where: { id } })) ?? job;
  }
  return NextResponse.json({ id: job.id, status: job.status, task: job.task, assetIds: job.assetIds, error: job.status === "failed" ? "Generation failed. Any credits charged were refunded." : null });
});
