import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { route, ApiError } from "@/lib/tenant";

type Params = { id: string };

// PATCH /api/notifications/:id — mark a single notification read.
export const PATCH = route<Params>(async (ctx, _req, { id }) => {
  const notif = await db.notification.findFirst({ where: { id, workspaceId: ctx.workspaceId } });
  if (!notif) throw new ApiError(404, "Notification not found");
  const updated = await db.notification.update({ where: { id }, data: { readAt: new Date() } });
  return NextResponse.json(updated);
});
