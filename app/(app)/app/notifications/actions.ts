"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { visibleWhere } from "@/lib/notifications";

/**
 * Notification Center writes. Read and cleared state belongs to the signed-in
 * member only; a shared workspace alert is never changed for anyone else.
 */

type Result = { ok: true; message: string } | { ok: false; error: string };

async function member() {
  try {
    const c = await getSessionContext();
    return { workspaceId: c.workspaceId, userId: c.userId };
  } catch {
    return null;
  }
}

const unavailable = { ok: false as const, error: "Sign in to a workspace to manage notifications." };

async function setState(ids: string[], userId: string, data: { readAt?: Date | null; clearedAt?: Date | null }) {
  for (const notificationId of ids) {
    await db.notificationState.upsert({
      where: { notificationId_userId: { notificationId, userId } },
      create: { notificationId, userId, readAt: data.readAt ?? null, clearedAt: data.clearedAt ?? null },
      update: data,
    });
  }
}

/** Resolves only ids this member can see, optionally narrowed by category and severity. */
async function scopedIds(c: { workspaceId: string; userId: string }, filter: { ids?: string[]; category?: string; severity?: string; onlyUnread?: boolean }) {
  const rows = await db.notification.findMany({
    where: {
      AND: [
        visibleWhere(c.workspaceId, c.userId),
        filter.ids ? { id: { in: filter.ids.slice(0, 500) } } : {},
        filter.category ? { category: filter.category } : {},
        filter.severity ? { severity: filter.severity } : {},
        filter.onlyUnread ? { NOT: { states: { some: { userId: c.userId, readAt: { not: null } } } } } : {},
      ],
    },
    select: { id: true },
    take: 500,
  });
  return rows.map((r) => r.id);
}

const refresh = () => revalidatePath("/app", "layout");

export async function markNotificationRead(id: string, read: boolean): Promise<Result> {
  const c = await member();
  if (!c) return unavailable;
  const ids = await scopedIds(c, { ids: [id] });
  if (!ids.length) return { ok: false, error: "That notification is no longer available." };
  await setState(ids, c.userId, { readAt: read ? new Date() : null });
  refresh();
  return { ok: true, message: read ? "Marked as read" : "Marked as unread" };
}

export async function markAllNotificationsRead(fd: FormData): Promise<Result> {
  const c = await member();
  if (!c) return unavailable;
  const ids = await scopedIds(c, { category: String(fd.get("category") ?? "") || undefined, severity: String(fd.get("severity") ?? "") || undefined, onlyUnread: true });
  if (!ids.length) return { ok: true, message: "Nothing unread" };
  await setState(ids, c.userId, { readAt: new Date() });
  refresh();
  return { ok: true, message: `Marked ${ids.length} as read` };
}

/** Clears read notifications in the current view; unread alerts are kept so nothing is missed. */
export async function clearReadNotifications(fd: FormData): Promise<Result> {
  const c = await member();
  if (!c) return unavailable;
  const ids = await db.notification.findMany({
    where: {
      AND: [
        visibleWhere(c.workspaceId, c.userId),
        fd.get("category") ? { category: String(fd.get("category")) } : {},
        fd.get("severity") ? { severity: String(fd.get("severity")) } : {},
        { states: { some: { userId: c.userId, readAt: { not: null } } } },
      ],
    },
    select: { id: true },
    take: 500,
  });
  if (!ids.length) return { ok: true, message: "No read notifications to clear" };
  await setState(ids.map((r) => r.id), c.userId, { clearedAt: new Date() });
  refresh();
  return { ok: true, message: `Cleared ${ids.length} read notification${ids.length === 1 ? "" : "s"}` };
}

export async function clearNotification(id: string): Promise<Result> {
  const c = await member();
  if (!c) return unavailable;
  const ids = await scopedIds(c, { ids: [id] });
  if (!ids.length) return { ok: false, error: "That notification is no longer available." };
  await setState(ids, c.userId, { clearedAt: new Date(), readAt: new Date() });
  refresh();
  return { ok: true, message: "Notification cleared" };
}
