import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, listParams, requireRole } from "@/lib/tenant";

const createSchema = z.object({
  name: z.string().min(1).max(160),
  value: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  pipelineId: z.string().optional(),
  stageId: z.string().optional(),
  closeDate: z.coerce.date().optional(),
  ownerId: z.string().optional(),
});

export const GET = route(async (ctx, req) => {
  const url = new URL(req.url);
  const stageId = url.searchParams.get("stageId") ?? undefined;
  const pipelineId = url.searchParams.get("pipelineId") ?? undefined;
  const { take, skip, page, q } = listParams(req);
  const where = {
    workspaceId: ctx.workspaceId,
    ...(stageId ? { stageId } : {}),
    ...(pipelineId ? { pipelineId } : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };
  const [items, total] = await Promise.all([
    db.deal.findMany({
      where,
      include: { stage: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    db.deal.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize: take });
});

export const POST = route(async (ctx, req) => {
  requireRole(ctx, "EDITOR");
  const data = await parseBody(req, createSchema);
  const deal = await db.deal.create({ data: { ...data, workspaceId: ctx.workspaceId } });
  return NextResponse.json(deal, { status: 201 });
});
