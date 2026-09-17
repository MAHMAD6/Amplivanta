import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, listParams, requireRole } from "@/lib/tenant";
import { NOTIFICATION_TABS, notify, unreadWhere, visibleWhere } from "@/lib/notifications";

const CATEGORIES = NOTIFICATION_TABS.map(([k]) => k) as [string, ...string[]];

const createSchema = z.object({
  category: z.enum(CATEGORIES),
  severity: z.enum(["info", "success", "warning", "critical"]).optional(),
  title: z.string().min(1).max(200),
  body: z.string().max(2000).optional(),
  link: z.string().max(500).optional(),
  userId: z.string().optional(),
});

// GET /api/notifications — for the signed-in member in the active workspace.
export const GET = route(async (ctx, req) => {
  const url = new URL(req.url);
  const unread = url.searchParams.get("unread") === "true";
  const { take, skip, page } = listParams(req);
  const where = unread ? unreadWhere(ctx.workspaceId, ctx.userId) : visibleWhere(ctx.workspaceId, ctx.userId);
  const [rows, total, unreadCount] = await Promise.all([
    db.notification.findMany({ where, orderBy: { createdAt: "desc" }, take, skip, include: { states: { where: { userId: ctx.userId }, select: { readAt: true } } } }),
    db.notification.count({ where }),
    db.notification.count({ where: unreadWhere(ctx.workspaceId, ctx.userId) }),
  ]);
  const items = rows.map(({ states, dedupeKey: _d, ...n }) => ({ ...n, readAt: states[0]?.readAt ?? null, isRead: Boolean(states[0]?.readAt) }));
  return NextResponse.json({ items, total, unreadCount, page, pageSize: take });
});

// POST — admins raise a workspace alert (e.g. from an external system via API key).
export const POST = route(async (ctx, req) => {
  requireRole(ctx, "ADMIN");
  const data = await parseBody(req, createSchema);
  if (data.userId) {
    const m = await db.membership.findFirst({ where: { workspaceId: ctx.workspaceId, userId: data.userId }, select: { id: true } });
    if (!m) return NextResponse.json({ error: "That user is not a member of this workspace." }, { status: 400 });
  }
  const id = await notify({ workspaceId: ctx.workspaceId, ...data, category: data.category as never, preference: "none" });
  if (!id) return NextResponse.json({ error: "Notification could not be recorded." }, { status: 503 });
  return NextResponse.json({ id }, { status: 201 });
});

// PATCH /api/notifications  { markAllRead: true } — the caller's own read state only.
const patchSchema = z.object({ markAllRead: z.literal(true) });
export const PATCH = route(async (ctx, req) => {
  await parseBody(req, patchSchema);
  const ids = await db.notification.findMany({ where: unreadWhere(ctx.workspaceId, ctx.userId), select: { id: true }, take: 1000 });
  const now = new Date();
  for (const { id } of ids) {
    await db.notificationState.upsert({ where: { notificationId_userId: { notificationId: id, userId: ctx.userId } }, create: { notificationId: id, userId: ctx.userId, readAt: now }, update: { readAt: now } });
  }
  return NextResponse.json({ ok: true, updated: ids.length });
});
