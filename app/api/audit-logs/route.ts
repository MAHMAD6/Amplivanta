import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { route, listParams, requireRole } from "@/lib/tenant";

// GET /api/audit-logs — searchable, read-only history (admins only).
export const GET = route(async (ctx, req) => {
  requireRole(ctx, "ADMIN");
  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? undefined;
  const { take, skip, page } = listParams(req);
  const where = {
    workspaceId: ctx.workspaceId,
    ...(action ? { action: { contains: action, mode: "insensitive" as const } } : {}),
  };
  const [items, total] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }),
    db.auditLog.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize: take });
});
