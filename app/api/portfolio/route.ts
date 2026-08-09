import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { portfolioSchema } from "@/lib/validations/portfolio";
import { requireAdmin } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";

export async function GET() {
  const items = await db.portfolio.findMany({ orderBy: { publishedAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  const parsed = portfolioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }
  const { slug, results, serviceId, ...rest } = parsed.data;
  const item = await db.portfolio.create({
    data: {
      ...rest,
      slug: slug || slugify(rest.title),
      results: results ?? [],
      serviceId: serviceId || null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
