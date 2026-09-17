import { NextResponse } from "next/server";
import { route, requireRole, ApiError } from "@/lib/tenant";
import { EXPORTS, buildExport, type ExportEntity } from "@/lib/server/data-transfer";

// GET /api/data-transfer/export?entity=contacts&format=csv — downloads an export and records the job.
export const GET = route(async (ctx, req) => {
  const url = new URL(req.url);
  const entity = url.searchParams.get("entity") ?? "";
  if (!(entity in EXPORTS)) throw new ApiError(400, "Unknown export.");
  const spec = EXPORTS[entity as ExportEntity];
  requireRole(ctx, spec.admin ? "ADMIN" : "EDITOR");
  const format = url.searchParams.get("format") === "json" ? "json" : "csv";
  const out = await buildExport({ workspaceId: ctx.workspaceId, userId: ctx.userId }, entity as ExportEntity, format);
  return new NextResponse(out.body, {
    headers: {
      "content-type": out.format === "json" ? "application/json; charset=utf-8" : "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${out.fileName}"`,
      "cache-control": "no-store",
    },
  });
}, { limit: 20, windowSec: 60 });
