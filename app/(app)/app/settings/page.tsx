import type { Metadata } from "next";
import { Building2, Upload } from "lucide-react";
import { WORKSPACE_PROFILE } from "@/lib/settings-data";

export const metadata: Metadata = { title: "General Settings — Amplivanta" };

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-5">
      <Section title="Workspace Profile" desc="Basic identity and locale for this workspace.">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-grad-brand-2 text-lg font-bold text-white">{WORKSPACE_PROFILE.logo}</div>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[12.5px] font-semibold text-ink"><Upload className="h-3.5 w-3.5" />Upload Logo</button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Workspace name" value={WORKSPACE_PROFILE.name} />
          <Field label="Slug" value={WORKSPACE_PROFILE.slug} mono />
          <Field label="Industry" value={WORKSPACE_PROFILE.industry} />
          <Field label="Team size" value={WORKSPACE_PROFILE.size} />
        </div>
      </Section>

      <Section title="Locale & Formatting" desc="Applied across dashboards, exports, notifications.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Timezone" value={WORKSPACE_PROFILE.timezone} />
          <Field label="Language" value={WORKSPACE_PROFILE.language} />
          <Field label="Date format" value={WORKSPACE_PROFILE.dateFormat} />
          <Field label="Currency" value={WORKSPACE_PROFILE.currency} />
        </div>
      </Section>

      <Section title="Contact" desc="Where Amplivanta reaches you for account matters.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary contact email" value="alex@amplivanta.com" />
          <Field label="Support phone" value="+1 (555) 000-0000" />
        </div>
      </Section>

      <div className="flex justify-end gap-2">
        <button className="rounded-xl border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink">Cancel</button>
        <button className="rounded-xl bg-grad-cta px-4 py-2 text-[13px] font-bold text-white shadow-violet">Save Changes</button>
      </div>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="mb-4">
        <div className="text-[14px] font-bold text-ink">{title}</div>
        <div className="text-[11.5px] text-ink-muted">{desc}</div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-ink-muted">{label}</label>
      <input defaultValue={value} className={`w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] focus:border-violet focus:outline-none ${mono ? "font-mono" : ""}`} />
    </div>
  );
}
