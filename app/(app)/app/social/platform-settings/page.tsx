import type { Metadata } from "next";
import { PageHeader } from "@/components/amplivanta/page-header";
import { SocialSubnav } from "@/components/amplivanta/social-subnav";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = { title: "Platform Settings — Social Publishing" };

const TABS = ["General", "Publishing", "Notifications", "Content & Media", "Security & Privacy", "Integrations", "Advanced"];

export default function SocialPlatformSettingsPage() {
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader title="Platform Settings" subtitle="Global governance and defaults for the entire workspace." />
      <SocialSubnav />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-line bg-white p-2 shadow-card lg:sticky lg:top-20 lg:h-fit">
          <nav className="space-y-0.5">
            {TABS.map((t, i) => (
              <button key={t} className={`w-full rounded-lg px-3 py-2 text-left text-[13px] font-semibold ${i === 0 ? "bg-violet/10 text-violet" : "text-ink-soft hover:bg-bg-soft"}`}>
                {t}
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-5">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-4 text-[14px] font-bold text-ink">General</div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Workspace name" value="Amplivanta Workspace" />
              <Field label="Timezone" value="America/Los_Angeles (PST · UTC-8)" />
              <Field label="Language" value="English (US)" />
              <Field label="Date format" value="MMM D, YYYY" />
              <Field label="Currency" value="USD ($)" />
              <Field label="Brand default kit" value="Amplivanta Primary" />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-4 text-[14px] font-bold text-ink">Plan Usage</div>
            <div className="space-y-4">
              {[
                { label: "Social accounts", used: 6, limit: 20 },
                { label: "Scheduled posts / mo", used: 342, limit: 1000 },
                { label: "AI generations / mo", used: 2450, limit: 5000 },
                { label: "Storage", used: 42, limit: 100, unit: "GB" },
              ].map((u) => {
                const pct = Math.round((u.used / u.limit) * 100);
                return (
                  <div key={u.label}>
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className="text-ink-soft">{u.label}</span>
                      <span className="font-bold text-ink">
                        {u.used.toLocaleString()}{u.unit ? " " + u.unit : ""} / {u.limit.toLocaleString()}{u.unit ? " " + u.unit : ""}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft">
                      <div className={`h-full rounded-full ${pct > 85 ? "bg-amber-500" : "bg-grad-brand"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5">
            <div className="mb-2 flex items-center gap-2 text-[14px] font-bold text-red-700"><AlertTriangle className="h-4 w-4" /> Danger Zone</div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-3">
                <div>
                  <div className="text-[13px] font-semibold text-ink">Reset publishing defaults</div>
                  <div className="text-[11.5px] text-ink-muted">Revert timezone, defaults, and preferences to Amplivanta recommended.</div>
                </div>
                <button className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-[12px] font-bold text-red-600">Reset</button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-3">
                <div>
                  <div className="text-[13px] font-semibold text-ink">Disconnect all social accounts</div>
                  <div className="text-[11.5px] text-ink-muted">Removes OAuth tokens. Scheduled posts will fail until reconnected.</div>
                </div>
                <button className="rounded-lg bg-red-500 px-3 py-1.5 text-[12px] font-bold text-white">Disconnect All</button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button className="rounded-xl border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink">View Audit Log</button>
            <button className="rounded-xl bg-grad-cta px-4 py-2 text-[13px] font-bold text-white shadow-violet">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-ink-muted">{label}</label>
      <input defaultValue={value} className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] focus:border-violet focus:outline-none" />
    </div>
  );
}
