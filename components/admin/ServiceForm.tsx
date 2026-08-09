"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TagInput } from "@/components/admin/TagInput";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { Service } from "@/types";

const inputCls =
  "w-full rounded-xl border border-[#E3E3E3] bg-[#F4F4F4] px-4 py-3 text-sm focus:border-[#B5FF2D] focus:outline-none";

export function ServiceForm({ initial }: { initial?: Service }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    longDesc: initial?.longDesc ?? "",
    icon: initial?.icon ?? "",
    features: initial?.features ?? [],
    order: initial?.order ?? 0,
    isActive: initial?.isActive ?? true,
  });

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
      toast.success(initial ? "Service updated" : "Service created");
      router.push("/admin/services");
      router.refresh();
    } else {
      toast.error("Save failed");
    }
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Title</label>
          <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Icon (emoji)</label>
          <input className={inputCls} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="📱" required />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Short Description</label>
        <input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Long Description</label>
        <RichTextEditor value={form.longDesc} onChange={(v) => setForm({ ...form, longDesc: v })} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Features</label>
        <TagInput value={form.features} onChange={(v) => setForm({ ...form, features: v })} placeholder="Add a feature..." />
      </div>

      <div className="flex items-center gap-8">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Order</label>
          <input type="number" className={inputCls} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
          <span className="text-sm">Active</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-full bg-[#B5FF2D] px-6 py-3 font-semibold text-black transition hover:bg-[#a0e828] disabled:opacity-60"
      >
        {saving && <LoadingSpinner className="text-black" />}
        {initial ? "Update Service" : "Create Service"}
      </button>
    </form>
  );
}
