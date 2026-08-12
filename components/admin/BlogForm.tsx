"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Save, Sparkles, BookOpen, Eye } from "lucide-react";
import slugify from "slugify";
import { TagInput } from "@/components/admin/TagInput";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { toast } from "@/lib/toast";
import type { BlogPost } from "@/types";

const inputCls =
  "w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-2.5 text-xs text-[#14121f] focus:border-[#6D3BF5] focus:bg-white focus:outline-none transition";

export function BlogForm({ initial }: { initial?: BlogPost }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    coverImage: initial?.coverImage ?? null,
    tags: initial?.tags ?? [],
    author: initial?.author ?? "Impressa Team",
    authorImage: initial?.authorImage ?? null,
    isFeatured: initial?.isFeatured ?? false,
    isPublished: initial?.isPublished ?? false,
  });

  const generateSlug = () => {
    if (!form.title) return;
    const generated = slugify(form.title, { lower: true, strict: true });
    setForm((prev) => ({ ...prev, slug: generated }));
    toast.info("Slug Auto-Generated", { description: `/${generated}` });
  };

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
      toast.success(initial ? "Article Updated Successfully" : "Article Published Successfully", {
        description: `"${form.title}" is now ${form.isPublished ? "live on the public site" : "saved as draft"}.`,
      });
      router.push("/admin/blog");
      router.refresh();
    } else {
      toast.error("Failed to Save Article", {
        description: "An error occurred while saving the post to the database.",
      });
    }
  };

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-6">
      {/* Header Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#e9e7f0] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8f7fb] text-[#14121f] hover:bg-[#e9e7f0] transition"
            title="Back to Blog List"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="font-display text-base font-bold text-[#14121f]">
              {initial ? `Edit Article: ${initial.title}` : "Write New Blog Article"}
            </h2>
            <p className="text-[11px] text-[#767287]">
              Draft, edit rich content, add media, and set publication controls.
            </p>
          </div>
        </div>

        {/* Tab Switch & Save Button */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-[#f8f7fb] p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`rounded-lg px-3 py-1.5 font-bold transition ${
                activeTab === "edit" ? "bg-white text-[#14121f] shadow-xs" : "text-[#4a4756]"
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 font-bold transition ${
                activeTab === "preview" ? "bg-white text-[#14121f] shadow-xs" : "text-[#4a4756]"
              }`}
            >
              <Eye className="h-3.5 w-3.5" /> Preview
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6D3BF5] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#5B2FE0] disabled:opacity-60 transition shadow-sm"
          >
            {saving ? <LoadingSpinner className="text-black" /> : <Save className="h-4 w-4" />}
            {initial ? "Update Post" : "Publish Article"}
          </button>
        </div>
      </div>

      {activeTab === "edit" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-5 rounded-2xl border border-[#e9e7f0] bg-white p-6 shadow-sm">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                Article Title
              </label>
              <input
                className={inputCls}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 10 Strategies to Scale Digital Product Development in 2026"
                required
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  URL Slug
                </label>
                <button
                  type="button"
                  onClick={generateSlug}
                  className="flex items-center gap-1 text-[11px] font-semibold text-lime-ink hover:underline"
                >
                  <Sparkles className="h-3 w-3" /> Auto Slug
                </button>
              </div>
              <input
                className={inputCls}
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g. 10-strategies-scale-digital-product-development"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                Excerpt / Brief Summary
              </label>
              <textarea
                className={inputCls}
                rows={3}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="A compelling 2-sentence summary displayed on blog cards..."
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                Cover Image
              </label>
              <ImageUpload value={form.coverImage} onChange={(v) => setForm({ ...form, coverImage: v })} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                Main Article Content
              </label>
              <RichTextEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
            </div>
          </div>

          {/* Right Sidebar Metadata Column */}
          <div className="space-y-5 rounded-2xl border border-[#e9e7f0] bg-white p-6 shadow-sm">
            <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#14121f] border-b border-[#e9e7f0] pb-3">
              Publishing Options
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  Author Name
                </label>
                <input
                  className={inputCls}
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  Article Tags
                </label>
                <TagInput value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} />
              </div>

              <div className="border-t border-[#e9e7f0] pt-4 space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-[#14121f]">Publish Immediately</span>
                  <Switch
                    checked={form.isPublished}
                    onCheckedChange={(v) => setForm({ ...form, isPublished: v })}
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-[#14121f]">Mark as Featured</span>
                  <Switch
                    checked={form.isFeatured}
                    onCheckedChange={(v) => setForm({ ...form, isFeatured: v })}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Live Card Preview */
        <div className="max-w-xl mx-auto rounded-3xl border border-[#e9e7f0] bg-white p-6 shadow-xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#767287]">
            Public Card Preview
          </p>

          <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-[#14121f]">
            {form.coverImage ? (
              <Image src={form.coverImage} alt={form.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/40">
                <BookOpen className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {form.tags.map((t, i) => (
                <span
                  key={i}
                  className="rounded-full bg-[#6D3BF5] px-2.5 py-0.5 font-mono text-[10px] font-bold text-white"
                >
                  {t}
                </span>
              ))}
            </div>
            <h3 className="font-display text-lg font-bold text-[#14121f]">
              {form.title || "Untitled Article"}
            </h3>
            <p className="text-xs text-[#4a4756] line-clamp-2">
              {form.excerpt || "No excerpt provided yet."}
            </p>
            <p className="pt-2 text-[11px] font-semibold text-[#767287]">By {form.author}</p>
          </div>
        </div>
      )}
    </form>
  );
}
