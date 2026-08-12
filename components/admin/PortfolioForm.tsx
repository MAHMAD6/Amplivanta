"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Save, Plus, X, Sparkles, Briefcase, Eye } from "lucide-react";
import slugify from "slugify";
import { TagInput } from "@/components/admin/TagInput";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { toast } from "@/lib/toast";
import type { Portfolio, Service, PortfolioResult } from "@/types";

const inputCls =
  "w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-2.5 text-xs text-[#14121f] focus:border-[#6D3BF5] focus:bg-white focus:outline-none transition";

export function PortfolioForm({ initial }: { initial?: Portfolio }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
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
      .then((r) => (r.ok ? r.json() : []))
      .then(setServices)
      .catch(() => setServices([]));
  }, []);

  const generateSlug = () => {
    if (!form.title) return;
    const generated = slugify(form.title, { lower: true, strict: true });
    setForm((prev) => ({ ...prev, slug: generated }));
    toast.info("Slug Auto-Generated", { description: `/${generated}` });
  };

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
      toast.success(initial ? "Case Study Updated Successfully" : "Case Study Created Successfully", {
        description: `"${form.title}" for ${form.client} has been saved.`,
      });
      router.push("/admin/portfolio");
      router.refresh();
    } else {
      toast.error("Failed to Save Case Study", {
        description: "An error occurred while saving the project to the database.",
      });
    }
  };

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-6">
      {/* Action Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#e9e7f0] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8f7fb] text-[#14121f] hover:bg-[#e9e7f0] transition"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="font-display text-base font-bold text-[#14121f]">
              {initial ? `Edit Case Study: ${initial.title}` : "Add Portfolio Case Study"}
            </h2>
            <p className="text-[11px] text-[#767287]">
              Manage project showcases, key client results, and technical tags.
            </p>
          </div>
        </div>

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
            {initial ? "Update Case Study" : "Create Case Study"}
          </button>
        </div>
      </div>

      {activeTab === "edit" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form Fields */}
          <div className="lg:col-span-2 space-y-5 rounded-2xl border border-[#e9e7f0] bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  Project Title
                </label>
                <input
                  className={inputCls}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. NextGen FinTech Platform Design"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  Client Name
                </label>
                <input
                  className={inputCls}
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  placeholder="e.g. Apex Global Payments"
                  required
                />
              </div>
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
                placeholder="e.g. nextgen-fintech-platform-design"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                Short Card Summary
              </label>
              <input
                className={inputCls}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="High-converting digital product overhaul..."
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                Project Cover Image
              </label>
              <ImageUpload
                value={form.coverImage || null}
                onChange={(v) => setForm({ ...form, coverImage: v ?? "" })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                Detailed Case Study Story
              </label>
              <RichTextEditor value={form.longDesc} onChange={(v) => setForm({ ...form, longDesc: v })} />
            </div>

            {/* Measurable Results Grid */}
            <div className="border-t border-[#e9e7f0] pt-4">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  Measurable Client Results
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, results: [...form.results, { metric: "", value: "" }] })
                  }
                  className="inline-flex items-center gap-1 text-xs font-bold text-black hover:text-lime-ink"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Result Metric
                </button>
              </div>
              <div className="space-y-2">
                {form.results.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className={inputCls}
                      placeholder="e.g. Conversion Lift"
                      value={r.metric}
                      onChange={(e) => setResult(i, "metric", e.target.value)}
                    />
                    <input
                      className={inputCls}
                      placeholder="e.g. +145%"
                      value={r.value}
                      onChange={(e) => setResult(i, "value", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, results: form.results.filter((_, j) => j !== i) })
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Metadata */}
          <div className="space-y-5 rounded-2xl border border-[#e9e7f0] bg-white p-6 shadow-sm">
            <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#14121f] border-b border-[#e9e7f0] pb-3">
              Case Study Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  Tags & Technologies
                </label>
                <TagInput value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  Related Digital Service
                </label>
                <select
                  className={inputCls}
                  value={form.serviceId ?? ""}
                  onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                >
                  <option value="">None (Standalone Case Study)</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-[#e9e7f0] pt-4 space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-[#14121f]">Published</span>
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
        /* Live Preview */
        <div className="max-w-xl mx-auto rounded-3xl border border-[#e9e7f0] bg-white p-6 shadow-xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#767287]">
            Portfolio Showcase Card Preview
          </p>

          <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-[#14121f]">
            {form.coverImage ? (
              <Image src={form.coverImage} alt={form.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/40">
                <Briefcase className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-[#6D3BF5] uppercase tracking-wider">
              {form.client || "Client Name"}
            </p>
            <h3 className="font-display text-xl font-bold text-[#14121f]">
              {form.title || "Untitled Project"}
            </h3>
            <p className="text-xs text-[#4a4756]">{form.description}</p>
          </div>
        </div>
      )}
    </form>
  );
}
