import { NextResponse } from "next/server";
import { route } from "@/lib/tenant";
import { IMPORT_FIELDS, toCsv } from "@/lib/data-transfer";
import { importEntity } from "../shared";

// GET /api/data-transfer/template?entity=contacts — an empty CSV with the recognised column headers.
export const GET = route(async (_ctx, req) => {
  const entity = importEntity(new URL(req.url).searchParams.get("entity"));
  const body = toCsv(IMPORT_FIELDS[entity].map((f) => f.label), []);
  return new NextResponse(body, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="amplivanta-${entity}-template.csv"` } });
});
