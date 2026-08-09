import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { portfolioSchema } from "@/lib/validations/portfolio";
import { requireAdmin } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.portfolio.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();
  const parsed = portfolioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }
  const { slug, results, serviceId, ...rest } = parsed.data;
  const item = await db.portfolio.update({
    where: { id },
    data: {
      ...rest,
      slug: slug || slugify(rest.title),
      results: results ?? [],
      serviceId: serviceId || null,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  await db.portfolio.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
