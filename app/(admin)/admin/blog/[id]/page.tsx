import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BlogForm } from "@/components/admin/BlogForm";
import type { BlogPost } from "@/types";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await db.blogPost.findUnique({ where: { id } }).catch(() => null);
  if (!post) notFound();
  return <BlogForm initial={post as BlogPost} />;
}
