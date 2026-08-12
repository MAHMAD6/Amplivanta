"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Save, Linkedin, Twitter, Eye, User } from "lucide-react";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { toast } from "@/lib/toast";
import type { TeamMember } from "@/types";

const inputCls =
  "w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-2.5 text-xs text-[#14121f] focus:border-[#6D3BF5] focus:bg-white focus:outline-none transition";

export function TeamForm({ initial }: { initial?: TeamMember }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
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
      toast.success(initial ? "Team Member Updated" : "Team Member Added", {
        description: `"${form.name}" (${form.role}) profile is now saved.`,
      });
      router.push("/admin/team");
      router.refresh();
    } else {
      toast.error("Failed to Save Profile", {
        description: "An error occurred while saving team member details.",
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
              {initial ? `Edit Team Member: ${initial.name}` : "Add Team Member"}
            </h2>
            <p className="text-[11px] text-[#767287]">
              Manage staff profiles, designations, and social media connectivity.
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
            {initial ? "Update Member" : "Create Member"}
          </button>
        </div>
      </div>

      {activeTab === "edit" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-5 rounded-2xl border border-[#e9e7f0] bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  Full Name
                </label>
                <input
                  className={inputCls}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  Designation / Role
                </label>
                <input
                  className={inputCls}
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Lead Product Architect"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                Biography / Summary
              </label>
              <textarea
                className={inputCls}
                rows={3}
                value={form.bio ?? ""}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Brief professional overview of achievements and focus..."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                Profile Photo
              </label>
              <ImageUpload value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  <Linkedin className="h-3.5 w-3.5 text-blue-600" /> LinkedIn URL
                </label>
                <input
                  className={inputCls}
                  value={form.linkedin ?? ""}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  <Twitter className="h-3.5 w-3.5 text-sky-500" /> Twitter / X URL
                </label>
                <input
                  className={inputCls}
                  value={form.twitter ?? ""}
                  onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                  placeholder="https://x.com/..."
                />
              </div>
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
                  <span className="text-xs font-semibold text-[#14121f]">Active Member</span>
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
        <div className="max-w-xs mx-auto rounded-3xl border border-[#e9e7f0] bg-white p-6 text-center shadow-xl space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#767287]">
            Team Profile Card Preview
          </p>

          <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full bg-[#14121f] border-2 border-[#6D3BF5]">
            {form.image ? (
              <Image src={form.image} alt={form.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-[#6D3BF5]">
                {form.name.charAt(0) || <User className="h-8 w-8" />}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[#14121f]">
              {form.name || "Member Name"}
            </h3>
            <p className="text-xs font-semibold text-lime-ink">{form.role || "Job Designation"}</p>
            <p className="mt-2 text-xs text-[#4a4756] line-clamp-3">{form.bio}</p>
          </div>
        </div>
      )}
    </form>
  );
}
