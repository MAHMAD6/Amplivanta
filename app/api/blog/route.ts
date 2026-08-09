import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogSchema } from "@/lib/validations/blog";
import { requireAdmin } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";

export async function GET() {
  const posts = await db.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  const parsed = blogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }
  const { slug, isPublished, ...rest } = parsed.data;
  const post = await db.blogPost.create({
    data: {
      ...rest,
      slug: slug || slugify(rest.title),
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    },
  });
  return NextResponse.json(post, { status: 201 });
}
