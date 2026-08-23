import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, listParams, requireRole } from "@/lib/tenant";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["open", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.coerce.date().optional(),
  contactId: z.string().optional(),
  assigneeId: z.string().optional(),
});

// GET /api/tasks — workspace-scoped, searchable, paginated.
export const GET = route(async (ctx, req) => {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;
  const { take, skip, page, q } = listParams(req);
  const where = {
    workspaceId: ctx.workspaceId,
    ...(status ? { status } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
  };
  const [items, total] = await Promise.all([
    db.task.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }),
    db.task.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize: take });
});

// POST /api/tasks
export const POST = route(async (ctx, req) => {
  requireRole(ctx, "EDITOR");
  const data = await parseBody(req, createSchema);
  const task = await db.task.create({
    data: { ...data, isCompleted: data.status === "done", workspaceId: ctx.workspaceId },
  });
  return NextResponse.json(task, { status: 201 });
});
