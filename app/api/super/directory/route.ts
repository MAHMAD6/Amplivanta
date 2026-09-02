import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type DirectoryEntry = { id: string; label: string; sublabel: string | null };

/**
 * Type-ahead lookup for the Grant Access / Credit recipient picker.
 * Restricted to Super Admins; returns ids so the grant is bound to a real record.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "SUPER_ADMIN") return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") === "organization" ? "organization" : "user";
  const q = (sp.get("q") ?? "").trim();

  try {
    if (type === "organization") {
      const rows = await prisma.organization.findMany({
        where: q ? { name: { contains: q, mode: "insensitive" } } : {},
        orderBy: { name: "asc" },
        take: 20,
      });
      const results: DirectoryEntry[] = rows.map((r) => ({
        id: r.id,
        label: r.name,
        sublabel: `${r.plan} · ${r.status}`,
      }));
      return NextResponse.json({ results });
    }

    const rows = await prisma.user.findMany({
      where: q
        ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
        : {},
      orderBy: { name: "asc" },
      take: 20,
    });
    const results: DirectoryEntry[] = rows.map((r) => ({ id: r.id, label: r.name, sublabel: r.email }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Data source unavailable", results: [] }, { status: 503 });
  }
}
