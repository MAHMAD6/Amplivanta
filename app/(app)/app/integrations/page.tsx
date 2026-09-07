import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search, Zap, Puzzle, Activity, Key, Webhook, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { IntegrationsSubnav } from "@/components/amplivanta/integrations-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { INTEGRATIONS, INTG_CATEGORIES, INTG_TONE } from "@/lib/integrations-data";

export const metadata: Metadata = { title: "Integrations" };

export default function IntegrationsHomePage() {
  const connected = INTEGRATIONS.filter((i) => i.status === "Connected");
  const popular = INTEGRATIONS.filter((i) => i.popular);
  const attention = INTEGRATIONS.filter((i) => i.status === "Warning" || i.status === "Error");

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Integrations"
        subtitle="Connected apps, webhooks, developer resources."
        actions={
          <>
            <Link href="/app/integrations/api-keys" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Key className="h-3.5 w-3.5" /> API Keys</Link>
            <Link href="/app/integrations/webhooks" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Webhook className="h-3.5 w-3.5" /> Webhooks</Link>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Plus className="h-3.5 w-3.5" /> Add Integration</button>
          </>
        }
      />
      <IntegrationsSubnav />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Puzzle} label="Connected Apps" value={String(connected.length)} tone="violet" />
        <KpiCard icon={Zap} label="Available" value={String(INTEGRATIONS.length - connected.length)} tone="pink" />
        <KpiCard icon={Activity} label="Sync Health" value={null} tone="green" />
        <KpiCard icon={Webhook} label="Active Webhooks" value={null} tone="blue" />
      </div>

      {attention.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-300/50 bg-amber-50/40 p-4">
          <div className="flex items-center gap-2 text-[13px] font-bold text-amber-700">
            <AlertTriangle className="h-4 w-4" /> {attention.length} integration{attention.length > 1 ? "s" : ""} need{attention.length === 1 ? "s" : ""} attention
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {attention.map((i) => (
              <div key={i.id} className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-[12px]">
                <span>{i.logo}</span>
                <span className="font-semibold text-ink">{i.name}</span>
                <StatusPill tone={INTG_TONE[i.status]}>{i.status}</StatusPill>
                <button className="rounded bg-grad-cta px-2 py-0.5 text-[10px] font-bold text-white">Fix</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="h-3.5 w-3.5 text-ink-muted" />
          <input placeholder="Search 200+ integrations…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
        </div>
        {INTG_CATEGORIES.map((c, i) => (
          <button key={c} className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${i === 0 ? "border-violet/40 bg-violet/10 text-violet" : "border-line bg-white text-ink-soft hover:border-violet/30"}`}>{c}</button>
        ))}
      </div>

      {popular.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 text-[13px] font-bold text-ink">Popular</div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {popular.map((i) => <IntgCard key={i.id} i={i} />)}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 text-[13px] font-bold text-ink">All Integrations</div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {INTEGRATIONS.map((i) => <IntgCard key={i.id} i={i} />)}
        </div>
      </div>
    </div>
  );
}

function IntgCard({ i }: { i: typeof INTEGRATIONS[number] }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-soft text-[20px]">{i.logo}</div>
          <div>
            <div className="text-[13px] font-bold text-ink">{i.name}</div>
            <div className="text-[10.5px] text-ink-muted">{i.category}</div>
          </div>
        </div>
        <StatusPill tone={INTG_TONE[i.status]}>{i.status}</StatusPill>
      </div>
      {i.status === "Connected" && (
        <div className="mb-3 grid grid-cols-2 gap-2 border-y border-line py-2 text-[10.5px]">
          <div><span className="text-ink-muted">Scopes </span><span className="font-bold text-ink">{i.scopes}</span></div>
          <div><span className="text-ink-muted">Sync </span><span className="font-bold text-ink">{i.lastSync}</span></div>
        </div>
      )}
      <div className="flex gap-2">
        {i.status === "Available" ? (
          <button className="flex-1 rounded-xl bg-grad-cta py-1.5 text-[12px] font-bold text-white shadow-violet">Connect</button>
        ) : (
          <>
            <button className="flex-1 rounded-xl border border-line py-1.5 text-[12px] font-semibold text-ink">Configure</button>
            {(i.status === "Warning" || i.status === "Error") && <button className="flex-1 rounded-xl bg-amber-500 py-1.5 text-[12px] font-bold text-white">Reconnect</button>}
          </>
        )}
      </div>
    </div>
  );
}
