import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, route } from "@/lib/tenant";
import { auditWhere, csvCell } from "@/lib/audit-filters";

// GET /api/audit-logs/export — CSV of the filtered audit log (admins only).
export const GET = route(
  async (ctx, req) => {
    requireRole(ctx, "ADMIN");
    const url = new URL(req.url);
    const f = { q: url.searchParams.get("q") ?? undefined, category: url.searchParams.get("category") ?? undefined, user: url.searchParams.get("user") ?? undefined, range: url.searchParams.get("range") ?? undefined };
    const rows = await db.auditLog.findMany({ where: auditWhere(ctx.workspaceId, f), orderBy: { createdAt: "desc" }, take: 10000, include: { user: { select: { email: true } } } });
    const header = ["time_utc", "actor", "action", "resource_type", "resource_id", "ip_address", "metadata"];
    const body = rows.map((r) => [r.createdAt.toISOString(), r.user?.email ?? "system", r.action, r.resourceType, r.resourceId, r.ipAddress, r.metadata ? JSON.stringify(r.metadata) : ""].map(csvCell).join(","));
    await db.auditLog.create({ data: { workspaceId: ctx.workspaceId, actorUserId: ctx.userId, action: "audit.exported", resourceType: "AuditLog", metadata: { ...f, rows: rows.length } } }).catch(() => null);
    return new NextResponse([header.join(","), ...body].join("\r\n"), {
      headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.csv"`, "cache-control": "no-store" },
    });
  },
  { limit: 10, windowSec: 600 },
);
