import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serviceSchema } from "@/lib/validations/service";
import { requireAdmin } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";

export async function GET() {
  const services = await db.service.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }
  const { slug, ...rest } = parsed.data;
  const service = await db.service.create({
    data: { ...rest, slug: slug || slugify(rest.title) },
  });
  return NextResponse.json(service, { status: 201 });
}
