import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, parseBody, requireRole, route } from "@/lib/tenant";
import { FAL_TASKS, type FalTaskCode } from "@/lib/media/fal-tasks";
import { createMediaJob, mediaTaskCatalogue } from "@/lib/server/media-jobs";

/**
 * Creative Studio generation. The browser sends an Amplivanta task and its
 * inputs; the model, price and provider stay on the server.
 */

const TASKS = Object.keys(FAL_TASKS) as [FalTaskCode, ...FalTaskCode[]];

const schema = z.object({
  task: z.enum(TASKS),
  prompt: z.string().max(2000).optional(),
  imageAssetId: z.string().max(40).optional(),
  aspectRatio: z.string().max(8).optional(),
  duration: z.number().int().optional(),
  platform: z.string().max(40).optional(),
  tone: z.string().max(40).optional(),
  brandKitId: z.string().max(40).optional(),
});

export const GET = route(async (_ctx, req) => {
  const kind = new URL(req.url).searchParams.get("kind") === "video" ? "video" : "image";
  return NextResponse.json({ tasks: mediaTaskCatalogue(kind) });
});

export const POST = route(
  async (ctx, req) => {
    requireRole(ctx, "EDITOR");
    const { task, ...input } = await parseBody(req, schema);
    const res = await createMediaJob(ctx, task, input);
    if (!res.ok) throw new ApiError(res.status, res.error);
    return NextResponse.json(res, { status: 202 });
  },
  { limit: 30, windowSec: 3600 },
);
