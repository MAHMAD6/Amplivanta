"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TagInput } from "@/components/admin/TagInput";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { BlogPost } from "@/types";

const inputCls =
  "w-full rounded-xl border border-[#E3E3E3] bg-[#F4F4F4] px-4 py-3 text-sm focus:border-[#B5FF2D] focus:outline-none";

export function BlogForm({ initial }: { initial?: BlogPost }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    coverImage: initial?.coverImage ?? null,
    tags: initial?.tags ?? [],
    author: initial?.author ?? "",
    authorImage: initial?.authorImage ?? null,
    isFeatured: initial?.isFeatured ?? false,
    isPublished: initial?.isPublished ?? false,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = initial ? `/api/blog/${initial.id}` : "/api/blog";
    const res = await fetch(url, {
      method: initial ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(initial ? "Post updated" : "Post created");
      router.push("/admin/blog");
      router.refresh();
    } else toast.error("Save failed");
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Title</label>
        <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Excerpt</label>
        <textarea className={inputCls} rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} required />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Cover Image</label>
        <ImageUpload value={form.coverImage} onChange={(v) => setForm({ ...form, coverImage: v })} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Content</label>
        <RichTextEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Author</label>
          <input className={inputCls} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Tags</label>
          <TagInput value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} />
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <Switch checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} />
          <span className="text-sm">Published</span>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
          <span className="text-sm">Featured</span>
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-full bg-[#B5FF2D] px-6 py-3 font-semibold text-black transition hover:bg-[#a0e828] disabled:opacity-60"
      >
        {saving && <LoadingSpinner className="text-black" />}
        {initial ? "Update Post" : "Create Post"}
      </button>
    </form>
  );
}
