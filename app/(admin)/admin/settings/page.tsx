"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const inputCls =
  "w-full rounded-xl border border-[#E3E3E3] bg-[#F4F4F4] px-4 py-3 text-sm focus:border-[#B5FF2D] focus:outline-none";

const FIELDS: { key: string; label: string }[] = [
  { key: "siteName", label: "Site Name" },
  { key: "siteDescription", label: "Site Description" },
  { key: "contactEmail", label: "Contact Email" },
  { key: "phone", label: "Phone Number" },
  { key: "address", label: "Address" },
  { key: "instagram", label: "Instagram URL" },
  { key: "linkedin", label: "LinkedIn URL" },
  { key: "twitter", label: "Twitter URL" },
  { key: "facebook", label: "Facebook URL" },
  { key: "youtube", label: "YouTube URL" },
];

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : {}))
      .then(setValues)
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) toast.success("Settings saved");
    else toast.error("Save failed");
  };

  if (loading) return <p className="text-sm text-[#9A9A9A]">Loading...</p>;

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5 rounded-2xl border border-[#E3E3E3] bg-white p-6">
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label className="mb-1.5 block text-sm font-medium">{f.label}</label>
          <input
            className={inputCls}
            value={values[f.key] ?? ""}
            onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-full bg-[#B5FF2D] px-6 py-3 font-semibold text-black transition hover:bg-[#a0e828] disabled:opacity-60"
      >
        {saving && <LoadingSpinner className="text-black" />}
        Save Settings
      </button>
    </form>
  );
}
