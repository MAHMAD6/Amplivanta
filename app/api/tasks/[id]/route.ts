import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, requireRole, ApiError } from "@/lib/tenant";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(["open", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  isCompleted: z.boolean().optional(),
  contactId: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
});

type Params = { id: string };

async function loadOwned(workspaceId: string, id: string) {
  const task = await db.task.findFirst({ where: { id, workspaceId } });
  if (!task) throw new ApiError(404, "Task not found");
  return task;
}

// PATCH /api/tasks/:id — also keeps isCompleted in sync when status changes.
export const PATCH = route<Params>(async (ctx, req, { id }) => {
  requireRole(ctx, "EDITOR");
  await loadOwned(ctx.workspaceId, id);
  const data = await parseBody(req, updateSchema);
  const patch = { ...data };
  if (data.status && data.isCompleted === undefined) patch.isCompleted = data.status === "done";
  const updated = await db.task.update({ where: { id }, data: patch });
  return NextResponse.json(updated);
});

// DELETE /api/tasks/:id
export const DELETE = route<Params>(async (ctx, _req, { id }) => {
  requireRole(ctx, "EDITOR");
  await loadOwned(ctx.workspaceId, id);
  await db.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
