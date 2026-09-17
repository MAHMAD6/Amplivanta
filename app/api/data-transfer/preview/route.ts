import { NextResponse } from "next/server";
import { route, requireRole } from "@/lib/tenant";
import { IMPORT_FIELDS, IMPORT_LIMITS, checkMapping, suggestMapping, validateRow } from "@/lib/data-transfer";
import { readRows } from "@/lib/server/data-transfer";
import { importEntity, readUpload } from "../shared";

// POST /api/data-transfer/preview — headers, suggested mapping, sample rows and a validation summary. Writes nothing.
export const POST = route(async (ctx, req) => {
  requireRole(ctx, "EDITOR");
  const form = await req.formData();
  const entity = importEntity(form.get("entity"));
  const { text, fileName } = await readUpload(form);
  const { headers, body } = readRows(text);
  if (!headers.length) return NextResponse.json({ error: "The file is empty." }, { status: 400 });
  const raw = form.get("mapping");
  let mapping = suggestMapping(entity, headers);
  if (typeof raw === "string" && raw) {
    try {
      const m = JSON.parse(raw);
      if (Array.isArray(m) && m.length === headers.length) mapping = m.map((x) => (typeof x === "string" && x ? x : null));
    } catch {
      /* keep the suggestion */
    }
  }
  let valid = 0;
  const errors: { row: number; message: string }[] = [];
  for (const [i, cells] of body.slice(0, IMPORT_LIMITS.rows).entries()) {
    const r = validateRow(entity, cells, mapping);
    if (r.ok) valid++;
    else if (errors.length < 10) errors.push({ row: i + 2, message: r.message });
  }
  return NextResponse.json({
    fileName,
    headers,
    mapping,
    mappingError: checkMapping(entity, headers, mapping),
    fields: IMPORT_FIELDS[entity].map((f) => ({ key: f.key, label: f.label, required: Boolean(f.required) })),
    sample: body.slice(0, 5).map((r) => headers.map((_, i) => (r[i] ?? "").slice(0, 80))),
    rows: body.length,
    tooMany: body.length > IMPORT_LIMITS.rows,
    valid,
    invalid: Math.min(body.length, IMPORT_LIMITS.rows) - valid,
    errors,
  });
}, { limit: 30, windowSec: 60 });
