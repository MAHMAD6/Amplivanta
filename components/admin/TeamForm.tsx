"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { TeamMember } from "@/types";

const inputCls =
  "w-full rounded-xl border border-[#E3E3E3] bg-[#F4F4F4] px-4 py-3 text-sm focus:border-[#B5FF2D] focus:outline-none";

export function TeamForm({ initial }: { initial?: TeamMember }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    role: initial?.role ?? "",
    bio: initial?.bio ?? "",
    image: initial?.image ?? null,
    linkedin: initial?.linkedin ?? "",
    twitter: initial?.twitter ?? "",
    order: initial?.order ?? 0,
    isActive: initial?.isActive ?? true,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = initial ? `/api/team/${initial.id}` : "/api/team";
    const res = await fetch(url, {
      method: initial ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(initial ? "Member updated" : "Member created");
      router.push("/admin/team");
      router.refresh();
    } else toast.error("Save failed");
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Name</label>
          <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Role</label>
          <input className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Bio</label>
        <textarea className={inputCls} rows={3} value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Photo</label>
        <ImageUpload value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">LinkedIn URL</label>
          <input className={inputCls} value={form.linkedin ?? ""} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Twitter URL</label>
          <input className={inputCls} value={form.twitter ?? ""} onChange={(e) => setForm({ ...form, twitter: e.target.value })} />
        </div>
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
        {initial ? "Update Member" : "Create Member"}
      </button>
    </form>
  );
}
