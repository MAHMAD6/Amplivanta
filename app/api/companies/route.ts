import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, listParams, requireRole } from "@/lib/tenant";

const createSchema = z.object({
  name: z.string().min(1).max(160),
  domain: z.string().max(160).optional(),
  industry: z.string().max(120).optional(),
  size: z.string().max(60).optional(),
  ownerId: z.string().optional(),
});

export const GET = route(async (ctx, req) => {
  const { take, skip, page, q } = listParams(req);
  const where = {
    workspaceId: ctx.workspaceId,
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };
  const [items, total] = await Promise.all([
    db.company.findMany({
      where,
      include: { _count: { select: { contacts: true } } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    db.company.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize: take });
});

export const POST = route(async (ctx, req) => {
  requireRole(ctx, "EDITOR");
  const data = await parseBody(req, createSchema);
  const company = await db.company.create({ data: { ...data, workspaceId: ctx.workspaceId } });
  return NextResponse.json(company, { status: 201 });
});
