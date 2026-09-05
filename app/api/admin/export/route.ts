import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ADMIN_PAGE_BY_KEY } from "@/lib/admin/registry";
import { loadAdminPageForExport } from "@/lib/server/admin-queries";

/** RFC 4180 escaping, with a guard against spreadsheet formula injection. */
function csvCell(value: string | null) {
  const v = value ?? "";
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const sp = req.nextUrl.searchParams;
  const key = sp.get("key") ?? "";
  const page = ADMIN_PAGE_BY_KEY.get(key);
  if (!page) return NextResponse.json({ error: "Unknown page" }, { status: 404 });

  const filters: Record<string, string | undefined> = {};
  for (const f of page.filters) {
    const v = sp.get(f.key);
    if (v) filters[f.key] = v;
  }

  const result = await loadAdminPageForExport(page.canonical, { q: sp.get("q") ?? "", filters });
  if (!result.connected) {
    return NextResponse.json({ error: "Data source unavailable" }, { status: 503 });
  }

  const lines = [
    page.columns.map(csvCell).join(","),
    ...result.rows.map((r) => r.cells.map(csvCell).join(",")),
  ];
  // Exporting platform data is itself an administrative action worth recording.
  try {
    await prisma.platformAuditLog.create({
      data: {
        actorUserId: user.id ?? null,
        action: "export.csv",
        resourceType: "SuperAdminPage",
        resourceId: page.key,
        metadata: { rows: result.rows.length, filters, q: sp.get("q") ?? "" },
      },
    });
  } catch {
    // Never block a read-only export because the audit write failed.
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${page.key}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
