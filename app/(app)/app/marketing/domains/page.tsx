import type { Metadata } from "next";
import { Plus, ShieldCheck, AlertTriangle, RotateCw, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { DOMAINS } from "@/lib/marketing-auto-data";

export const metadata: Metadata = { title: "Domains — Amplivanta" };

const DOMAIN_TONE = { Verified: "green", "Pending DNS": "amber", "SSL Error": "red", Available: "gray" } as const;

export default function DomainsPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Publish & Domains"
        subtitle="Publishing destinations, custom domains and deployment status."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <Plus className="h-3.5 w-3.5" /> Connect Domain
          </button>
        }
      />
      <MarketingSubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={ShieldCheck} label="Verified Domains" value={String(DOMAINS.filter((d) => d.status === "Verified").length)} tone="green" />
        <KpiCard icon={AlertTriangle} label="Need Attention" value={String(DOMAINS.filter((d) => d.status !== "Verified" && d.status !== "Available").length)} tone="amber" />
        <KpiCard icon={ShieldCheck} label="SSL Auto-Renew" value={null} tone="blue" />
        <KpiCard icon={ShieldCheck} label="Deploys (30d)" value={null} tone="violet" />
      </div>

      <div className="space-y-3">
        {DOMAINS.map((d) => (
          <div key={d.id} className="flex items-start justify-between rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="flex min-w-0 flex-1 gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet/10 text-violet"><ShieldCheck className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[14px] font-bold text-ink">{d.domain}</span>
                  <StatusPill tone={DOMAIN_TONE[d.status]}>{d.status}</StatusPill>
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-[11.5px] text-ink-muted">
                  {d.purpose.map((p) => <span key={p} className="rounded bg-bg-soft px-2 py-0.5">{p}</span>)}
                </div>
                <div className="mt-1 text-[11.5px] text-ink-muted">SSL: {d.ssl}</div>
                <div className="text-[11.5px] text-ink-muted">Added: {d.addedAt}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {d.status === "SSL Error" && <button className="rounded-lg bg-red-500 px-3 py-1.5 text-[11.5px] font-bold text-white">Renew Cert</button>}
              {d.status === "Pending DNS" && <button className="rounded-lg bg-amber-500 px-3 py-1.5 text-[11.5px] font-bold text-white"><RotateCw className="mr-1 inline h-3 w-3" />Recheck DNS</button>}
              <button className="rounded-lg border border-line px-3 py-1.5 text-[11.5px] font-semibold text-ink-soft"><ExternalLink className="mr-1 inline h-3 w-3" />DNS Records</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
