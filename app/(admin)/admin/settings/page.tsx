"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  Save,
  Shield,
  Eye,
} from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { toast } from "@/lib/toast";

const TABS = [
  { id: "general", label: "General & Branding", icon: Globe },
  { id: "contact", label: "Contact Details", icon: Mail },
  { id: "social", label: "Social Media Links", icon: Linkedin },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => setValues(data || {}))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Studio Settings Saved", {
        description: "All agency configuration metadata updated live across the site.",
      });
    } else {
      toast.error("Failed to Save Settings", {
        description: "Database update error while saving site configuration.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-[#767287]">Loading studio settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#e9e7f0] bg-white p-6 shadow-sm">
        <div>
          <h2 className="font-display text-xl font-extrabold text-[#14121f]">
            Studio Configuration & Settings
          </h2>
          <p className="text-xs text-[#767287]">
            Manage site details, contact information, and social connectivity.
          </p>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#6D3BF5] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#5B2FE0] disabled:opacity-60 transition shadow-sm"
        >
          {saving ? <LoadingSpinner className="text-black" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-[#e9e7f0]">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 border-b-2 px-6 py-3 text-xs font-bold transition ${
                isActive
                  ? "border-[#14121f] text-[#14121f]"
                  : "border-transparent text-[#767287] hover:text-[#14121f]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={save} className="grid gap-6 lg:grid-cols-3">
        {/* Left Form Area */}
        <div className="lg:col-span-2 space-y-5 rounded-2xl border border-[#e9e7f0] bg-white p-6 shadow-sm">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  <Globe className="h-3.5 w-3.5" /> Site Title / Name
                </label>
                <input
                  value={values.siteName ?? ""}
                  onChange={(e) => handleChange("siteName", e.target.value)}
                  placeholder="Impressa Digital Studio"
                  className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-2.5 text-xs text-[#14121f] focus:border-[#6D3BF5] focus:bg-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  <Shield className="h-3.5 w-3.5" /> Meta Tag Description
                </label>
                <textarea
                  rows={3}
                  value={values.siteDescription ?? ""}
                  onChange={(e) => handleChange("siteDescription", e.target.value)}
                  placeholder="Premier Digital Agency Crafting High-Performance Web & Brand Experiences..."
                  className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-2.5 text-xs text-[#14121f] focus:border-[#6D3BF5] focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  <Mail className="h-3.5 w-3.5" /> Support Email
                </label>
                <input
                  type="email"
                  value={values.contactEmail ?? ""}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                  placeholder="hello@impressadigital.com"
                  className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-2.5 text-xs text-[#14121f] focus:border-[#6D3BF5] focus:bg-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  <Phone className="h-3.5 w-3.5" /> Phone Number
                </label>
                <input
                  value={values.phone ?? ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-2.5 text-xs text-[#14121f] focus:border-[#6D3BF5] focus:bg-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  <MapPin className="h-3.5 w-3.5" /> Physical Headquarters Address
                </label>
                <input
                  value={values.address ?? ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="100 Innovation Blvd, Suite 400, San Francisco, CA"
                  className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-2.5 text-xs text-[#14121f] focus:border-[#6D3BF5] focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === "social" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  <Instagram className="h-3.5 w-3.5 text-pink-600" /> Instagram Profile
                </label>
                <input
                  value={values.instagram ?? ""}
                  onChange={(e) => handleChange("instagram", e.target.value)}
                  placeholder="https://instagram.com/impressadigital"
                  className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-2.5 text-xs text-[#14121f] focus:border-[#6D3BF5] focus:bg-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  <Linkedin className="h-3.5 w-3.5 text-blue-600" /> LinkedIn Page
                </label>
                <input
                  value={values.linkedin ?? ""}
                  onChange={(e) => handleChange("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/company/impressadigital"
                  className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-2.5 text-xs text-[#14121f] focus:border-[#6D3BF5] focus:bg-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  <Twitter className="h-3.5 w-3.5 text-sky-500" /> Twitter / X Profile
                </label>
                <input
                  value={values.twitter ?? ""}
                  onChange={(e) => handleChange("twitter", e.target.value)}
                  placeholder="https://x.com/impressadigital"
                  className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-2.5 text-xs text-[#14121f] focus:border-[#6D3BF5] focus:bg-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  <Facebook className="h-3.5 w-3.5 text-blue-700" /> Facebook Page
                </label>
                <input
                  value={values.facebook ?? ""}
                  onChange={(e) => handleChange("facebook", e.target.value)}
                  placeholder="https://facebook.com/impressadigital"
                  className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-2.5 text-xs text-[#14121f] focus:border-[#6D3BF5] focus:bg-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4a4756]">
                  <Youtube className="h-3.5 w-3.5 text-red-600" /> YouTube Channel
                </label>
                <input
                  value={values.youtube ?? ""}
                  onChange={(e) => handleChange("youtube", e.target.value)}
                  placeholder="https://youtube.com/@impressadigital"
                  className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-2.5 text-xs text-[#14121f] focus:border-[#6D3BF5] focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Live Preview Card */}
        <div className="space-y-4 rounded-2xl border border-[#e9e7f0] bg-[#14121f] p-6 text-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Eye className="h-4 w-4 text-[#6D3BF5]" />
            <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#6D3BF5]">
              Live Footer Preview
            </h3>
          </div>

          <div className="space-y-3 text-xs text-white/80">
            <p className="font-bold text-base text-white">{values.siteName || "Studio Name"}</p>
            <p className="text-[11px] text-white/60 line-clamp-2">
              {values.siteDescription || "No site description set."}
            </p>

            <div className="space-y-1.5 pt-2 text-[11px]">
              <p className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-[#6D3BF5]" /> {values.contactEmail || "No email"}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-[#6D3BF5]" /> {values.phone || "No phone"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-[#6D3BF5]" /> {values.address || "No address"}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
