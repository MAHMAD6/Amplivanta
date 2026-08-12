"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles, Layers, Eye, CheckCircle2 } from "lucide-react";
import slugify from "slugify";
import { TagInput } from "@/components/admin/TagInput";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { toast } from "@/lib/toast";
import type { Service } from "@/types";

const inputCls =
  "w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-2.5 text-xs text-[#14121f] focus:border-[#6D3BF5] focus:bg-white focus:outline-none transition";

const POPULAR_ICONS = ["🚀", "⚡", "🎨", "💻", "📱", "🔍", "🛡️", "📊", "🤖", "🌐"];

export function ServiceForm({ initial }: { initial?: Service }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    longDesc: initial?.longDesc ?? "",
    icon: initial?.icon ?? "🚀",
    features: initial?.features ?? [],
    order: initial?.order ?? 0,
    isActive: initial?.isActive ?? true,
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
    const url = initial ? `/api/services/${initial.id}` : "/api/services";
    const method = initial ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(initial ? "Service Updated Successfully" : "Service Created Successfully", {
        description: `"${form.title}" is now ${form.isActive ? "active" : "inactive"}.`,
      });
      router.push("/admin/services");
      router.refresh();
    } else {
      toast.error("Failed to Save Service", {
        description: "An error occurred while saving the service package.",
      });
    }
  };

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-6">
      {/* Header Bar */}
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
              {initial ? `Edit Service: ${initial.title}` : "Add Digital Service Offering"}
            </h2>
            <p className="text-[11px] text-[#767287]">
              Define agency capability, key features list, and display priority.
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
            {initial ? "Update Service" : "Create Service"}
          </button>
        </div>
      </div>

      {activeTab === "edit" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5 rounded-2xl border border-[#e9e7f0] bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  Service Title
                </label>
                <input
                  className={inputCls}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Custom Web Application Development"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  Icon Symbol
                </label>
                <div className="flex items-center gap-2">
                  <input
                    className={`${inputCls} font-mono text-center text-base`}
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    required
                  />
                </div>
                {/* Icon quick presets */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {POPULAR_ICONS.map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setForm({ ...form, icon: ico })}
                      className="rounded bg-[#f8f7fb] p-1 text-xs hover:bg-[#6D3BF5]"
                    >
                      {ico}
                    </button>
                  ))}
                </div>
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
                placeholder="web-application-development"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                Short Description
              </label>
              <textarea
                className={inputCls}
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="High-impact web apps engineered with React & Next.js..."
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                Full Capability Details
              </label>
              <RichTextEditor value={form.longDesc} onChange={(v) => setForm({ ...form, longDesc: v })} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                Key Service Features & Deliverables
              </label>
              <TagInput
                value={form.features}
                onChange={(v) => setForm({ ...form, features: v })}
                placeholder="Press Enter to add feature point (e.g. Next.js App Router)"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5 rounded-2xl border border-[#e9e7f0] bg-white p-6 shadow-sm">
            <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#14121f] border-b border-[#e9e7f0] pb-3">
              Display & Status
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  Sort Priority Order
                </label>
                <input
                  type="number"
                  className={inputCls}
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                />
                <p className="mt-1 text-[10px] text-[#767287]">Lower number appears first.</p>
              </div>

              <div className="border-t border-[#e9e7f0] pt-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-[#14121f]">Active Service</span>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Live Card Preview */
        <div className="max-w-md mx-auto rounded-3xl border border-[#e9e7f0] bg-white p-6 shadow-xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#767287]">
            Public Service Card Preview
          </p>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#14121f] text-2xl font-bold text-[#6D3BF5]">
            {form.icon}
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-[#14121f]">
              {form.title || "Service Title"}
            </h3>
            <p className="text-xs text-[#4a4756]">{form.description || "Service description..."}</p>

            {form.features.length > 0 && (
              <div className="pt-3 border-t border-[#e9e7f0] space-y-1.5">
                {form.features.map((f, i) => (
                  <p key={i} className="flex items-center gap-2 text-xs text-[#14121f]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-lime-ink" /> {f}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
