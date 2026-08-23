import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, listParams, requireRole } from "@/lib/tenant";

const createSchema = z.object({
  content: z.string().min(1).max(5000),
  mediaUrl: z.string().url().optional(),
  status: z.string().max(40).optional(),
  accountId: z.string().optional(),
  scheduledAt: z.coerce.date().optional(),
});

export const GET = route(async (ctx, req) => {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;
  const { take, skip, page } = listParams(req);
  const where = { workspaceId: ctx.workspaceId, ...(status ? { status } : {}) };
  const [items, total] = await Promise.all([
    db.socialPost.findMany({
      where,
      include: { account: { select: { id: true, platform: true, accountName: true } } },
      orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
      take,
      skip,
    }),
    db.socialPost.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize: take });
});

export const POST = route(async (ctx, req) => {
  requireRole(ctx, "EDITOR");
  const data = await parseBody(req, createSchema);
  const post = await db.socialPost.create({ data: { ...data, workspaceId: ctx.workspaceId } });
  return NextResponse.json(post, { status: 201 });
});
