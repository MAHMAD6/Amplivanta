import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, listParams, requireRole } from "@/lib/tenant";

const createSchema = z.object({
  name: z.string().min(1).max(160),
  status: z.string().max(40).optional(),
  trigger: z.any().optional(),
});

export const GET = route(async (ctx, req) => {
  const { take, skip, page, q } = listParams(req);
  const where = {
    workspaceId: ctx.workspaceId,
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };
  const [items, total] = await Promise.all([
    db.workflow.findMany({
      where,
      include: { _count: { select: { nodes: true, executions: true } } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    db.workflow.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize: take });
});

export const POST = route(async (ctx, req) => {
  requireRole(ctx, "EDITOR");
  const data = await parseBody(req, createSchema);
  const workflow = await db.workflow.create({
    data: { name: data.name, status: data.status, trigger: data.trigger, workspaceId: ctx.workspaceId },
  });
  return NextResponse.json(workflow, { status: 201 });
});
