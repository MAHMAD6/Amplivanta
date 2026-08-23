import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, listParams } from "@/lib/tenant";

const createSchema = z.object({
  category: z.string().min(1).max(60),
  title: z.string().min(1).max(200),
  body: z.string().max(2000).optional(),
  userId: z.string().optional(),
});

// GET /api/notifications — for the signed-in user in the active workspace.
export const GET = route(async (ctx, req) => {
  const url = new URL(req.url);
  const unread = url.searchParams.get("unread") === "true";
  const { take, skip, page } = listParams(req);
  const where = {
    workspaceId: ctx.workspaceId,
    OR: [{ userId: ctx.userId }, { userId: null }],
    ...(unread ? { readAt: null } : {}),
  };
  const [items, total, unreadCount] = await Promise.all([
    db.notification.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }),
    db.notification.count({ where }),
    db.notification.count({
      where: { workspaceId: ctx.workspaceId, OR: [{ userId: ctx.userId }, { userId: null }], readAt: null },
    }),
  ]);
  return NextResponse.json({ items, total, unreadCount, page, pageSize: take });
});

export const POST = route(async (ctx, req) => {
  const data = await parseBody(req, createSchema);
  const notification = await db.notification.create({
    data: { ...data, workspaceId: ctx.workspaceId },
  });
  return NextResponse.json(notification, { status: 201 });
});

// PATCH /api/notifications  { markAllRead: true }
const patchSchema = z.object({ markAllRead: z.literal(true) });
export const PATCH = route(async (ctx, req) => {
  await parseBody(req, patchSchema);
  await db.notification.updateMany({
    where: { workspaceId: ctx.workspaceId, OR: [{ userId: ctx.userId }, { userId: null }], readAt: null },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ ok: true });
});
