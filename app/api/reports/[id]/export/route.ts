import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, route } from "@/lib/tenant";
import { csvCell } from "@/lib/audit-filters";
import { runReport } from "@/lib/server/report-data";

// GET /api/reports/:id/export?days=30 — CSV of a saved report's current results.
export const GET = route<{ id: string }>(
  async (ctx, req, { id }) => {
    const report = await db.report.findFirst({ where: { id, workspaceId: ctx.workspaceId } });
    if (!report) throw new ApiError(404, "Report not found");
    const days = Number(new URL(req.url).searchParams.get("days")) || 30;
    const table = await runReport(ctx.workspaceId, report.type, days);
    await db.auditLog.create({ data: { workspaceId: ctx.workspaceId, actorUserId: ctx.userId, action: "report.exported", resourceType: "Report", resourceId: report.id, metadata: { rows: table.rows.length, days } } }).catch(() => null);
    const csv = [table.columns.map(csvCell).join(","), ...table.rows.map((r) => r.map(csvCell).join(","))].join("\r\n");
    const safe = report.name.replace(/[^\w-]+/g, "-").slice(0, 60) || "report";
    return new NextResponse(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${safe}.csv"`, "cache-control": "no-store" } });
  },
  { limit: 30, windowSec: 600 },
);
