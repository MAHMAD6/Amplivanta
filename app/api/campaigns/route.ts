import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, listParams, requireRole } from "@/lib/tenant";

const createSchema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(2000).optional(),
  objective: z.string().max(160).optional(),
  status: z.string().max(40).optional(),
  budget: z.number().min(0).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const GET = route(async (ctx, req) => {
  const { take, skip, page, q } = listParams(req);
  const where = {
    workspaceId: ctx.workspaceId,
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };
  const [items, total] = await Promise.all([
    db.campaign.findMany({
      where,
      include: { _count: { select: { elements: true, metrics: true } } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    db.campaign.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize: take });
});

export const POST = route(async (ctx, req) => {
  requireRole(ctx, "EDITOR");
  const data = await parseBody(req, createSchema);
  const campaign = await db.campaign.create({ data: { ...data, workspaceId: ctx.workspaceId } });
  return NextResponse.json(campaign, { status: 201 });
});
