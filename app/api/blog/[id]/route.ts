import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogSchema } from "@/lib/validations/blog";
import { requireAdmin } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();
  const parsed = blogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }
  const { slug, isPublished, ...rest } = parsed.data;
  const existing = await db.blogPost.findUnique({ where: { id } });
  const post = await db.blogPost.update({
    where: { id },
    data: {
      ...rest,
      slug: slug || slugify(rest.title),
      isPublished,
      publishedAt: isPublished ? existing?.publishedAt ?? new Date() : null,
    },
  });
  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  await db.blogPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
