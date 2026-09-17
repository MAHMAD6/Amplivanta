import { NextResponse } from "next/server";
import { route, requireRole, ApiError } from "@/lib/tenant";
import { runImport } from "@/lib/server/data-transfer";
import { importEntity, readUpload } from "../shared";

// POST /api/data-transfer/import — validates against the chosen mapping and writes CRM records.
export const POST = route(async (ctx, req) => {
  requireRole(ctx, "EDITOR");
  const form = await req.formData();
  const entity = importEntity(form.get("entity"));
  const { text, fileName } = await readUpload(form);
  let mapping: (string | null)[];
  try {
    const m = JSON.parse(String(form.get("mapping") ?? "[]"));
    if (!Array.isArray(m)) throw new Error("not an array");
    mapping = m.map((x) => (typeof x === "string" && x ? x : null));
  } catch {
    throw new ApiError(400, "The column mapping is invalid.");
  }
  const duplicates = form.get("duplicates") === "update" ? "update" : "skip";
  try {
    const job = await runImport({ workspaceId: ctx.workspaceId, userId: ctx.userId }, { entity, text, fileName, mapping, duplicates });
    return NextResponse.json({ job: { id: job.id, status: job.status, totalRows: job.totalRows, created: job.createdCount, updated: job.updatedCount, skipped: job.skippedCount, errors: job.errorCount } }, { status: 201 });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(400, e instanceof Error ? e.message : "Import failed.");
  }
}, { limit: 10, windowSec: 60 });
