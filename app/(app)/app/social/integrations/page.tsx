import type { Metadata } from "next";
import { Plus, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { SocialSubnav } from "@/components/amplivanta/social-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { INTEGRATIONS } from "@/lib/social-data";

export const metadata: Metadata = { title: "Integrations — Social Publishing" };

const STATUS_TONE_LOCAL = { Connected: "green", Warning: "amber", Expired: "red", Available: "gray" } as const;

export default function SocialIntegrationsPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Integrations"
        subtitle="Third-party services used by Social Publishing."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <Plus className="h-3.5 w-3.5" /> Browse Integrations
          </button>
        }
      />
      <SocialSubnav />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="h-3.5 w-3.5 text-ink-muted" />
          <input placeholder="Search integrations…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
        </div>
        {["All Categories", "Social", "Storage", "Design", "Notifications"].map((c, i) => (
          <button key={c} className={`rounded-xl border px-3 py-2 text-[12px] font-semibold ${i === 0 ? "border-violet/40 bg-violet/5 text-violet" : "border-line text-ink-soft"}`}>{c}</button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((intg) => (
          <div key={intg.name} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bg-soft text-[20px]">{intg.logo}</div>
                <div>
                  <div className="text-[14px] font-bold text-ink">{intg.name}</div>
                  <div className="text-[11px] text-ink-muted">{intg.category}</div>
                </div>
              </div>
              <StatusPill tone={STATUS_TONE_LOCAL[intg.status as keyof typeof STATUS_TONE_LOCAL]}>{intg.status}</StatusPill>
            </div>
            <div className="grid grid-cols-2 gap-2 border-y border-line py-3 text-[11px]">
              <div><span className="text-ink-muted">Scopes: </span><span className="font-bold text-ink">{intg.scopes}</span></div>
              <div><span className="text-ink-muted">Last sync: </span><span className="font-bold text-ink">{intg.lastSync}</span></div>
            </div>
            <div className="mt-3 flex gap-2">
              {intg.status === "Available" ? (
                <button className="flex-1 rounded-xl bg-grad-cta py-2 text-[12px] font-bold text-white shadow-violet">Connect</button>
              ) : (
                <>
                  <button className="flex-1 rounded-xl border border-line py-2 text-[12px] font-semibold text-ink">Configure</button>
                  {intg.status === "Expired" && <button className="flex-1 rounded-xl bg-amber-500 py-2 text-[12px] font-bold text-white">Reconnect</button>}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
