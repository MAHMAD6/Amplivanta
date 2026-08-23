import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { route, listParams } from "@/lib/tenant";

// GET /api/invoices — workspace billing history (read-only).
export const GET = route(async (ctx, req) => {
  const { take, skip, page } = listParams(req);
  const where = { workspaceId: ctx.workspaceId };
  const [items, total] = await Promise.all([
    db.invoice.findMany({ where, include: { payments: true }, orderBy: { createdAt: "desc" }, take, skip }),
    db.invoice.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize: take });
});
