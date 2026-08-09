"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { TagInput } from "@/components/admin/TagInput";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { Portfolio, Service, PortfolioResult } from "@/types";

const inputCls =
  "w-full rounded-xl border border-[#E3E3E3] bg-[#F4F4F4] px-4 py-3 text-sm focus:border-[#B5FF2D] focus:outline-none";

export function PortfolioForm({ initial }: { initial?: Portfolio }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    client: initial?.client ?? "",
    description: initial?.description ?? "",
    longDesc: initial?.longDesc ?? "",
    coverImage: initial?.coverImage ?? "",
    tags: initial?.tags ?? [],
    results: (initial?.results ?? []) as PortfolioResult[],
    serviceId: initial?.serviceId ?? "",
    isFeatured: initial?.isFeatured ?? false,
    isPublished: initial?.isPublished ?? true,
  });

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then(setServices)
      .catch(() => setServices([]));
  }, []);

  const setResult = (i: number, key: keyof PortfolioResult, val: string) => {
    const results = [...form.results];
    results[i] = { ...results[i], [key]: val };
    setForm({ ...form, results });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = initial ? `/api/portfolio/${initial.id}` : "/api/portfolio";
    const res = await fetch(url, {
      method: initial ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, coverImage: form.coverImage || "" }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(initial ? "Case study updated" : "Case study created");
      router.push("/admin/portfolio");
      router.refresh();
    } else toast.error("Save failed");
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Title</label>
          <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Client</label>
          <input className={inputCls} value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} required />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Short Description</label>
        <input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Cover Image</label>
        <ImageUpload value={form.coverImage || null} onChange={(v) => setForm({ ...form, coverImage: v ?? "" })} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Long Description</label>
        <RichTextEditor value={form.longDesc} onChange={(v) => setForm({ ...form, longDesc: v })} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Tags</label>
          <TagInput value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Related Service</label>
          <select className={inputCls} value={form.serviceId ?? ""} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}>
            <option value="">None</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium">Results</label>
          <button
            type="button"
            onClick={() => setForm({ ...form, results: [...form.results, { metric: "", value: "" }] })}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#0A0A0A]"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {form.results.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input className={inputCls} placeholder="Metric" value={r.metric} onChange={(e) => setResult(i, "metric", e.target.value)} />
              <input className={inputCls} placeholder="Value" value={r.value} onChange={(e) => setResult(i, "value", e.target.value)} />
              <button
                type="button"
                onClick={() => setForm({ ...form, results: form.results.filter((_, j) => j !== i) })}
                className="shrink-0 text-red-500"
                aria-label="Remove result"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
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
        {initial ? "Update Case Study" : "Create Case Study"}
      </button>
    </form>
  );
}
