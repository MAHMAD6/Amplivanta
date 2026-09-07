import type { Metadata } from "next";
import { Plus, Copy, MoreHorizontal, Key, Activity, AlertTriangle, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { IntegrationsSubnav } from "@/components/amplivanta/integrations-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { API_KEYS, API_KEY_TONE } from "@/lib/integrations-data";
import { ApiKeyDialog } from "@/components/amplivanta/settings/api-key-dialog";

export const metadata: Metadata = { title: "API Keys" };

export default function ApiKeysPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="API Keys & Developer Access"
        subtitle="Named-scope API keys, usage attribution, rate-limit visibility."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><BookOpen className="h-3.5 w-3.5" /> Docs</button>
            <ApiKeyDialog />
          </>
        }
      />
      <IntegrationsSubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Key} label="Active Keys" value={String(API_KEYS.filter((k) => k.status === "Active").length)} tone="violet" />
        <KpiCard icon={Activity} label="Calls (7d)" value={null} tone="blue" />
        <KpiCard icon={Activity} label="Rate Limit Used" value={null} tone="green" />
        <KpiCard icon={AlertTriangle} label="Revoked" value={String(API_KEYS.filter((k) => k.status === "Revoked").length)} tone="pink" />
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-card">
        <div className="border-b border-line p-4"><div className="text-[14px] font-bold text-ink">Keys</div></div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Prefix</th>
              <th className="px-4 py-3">Scopes</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Last Used</th>
              <th className="px-4 py-3 text-right">Usage (7d)</th>
              <th className="px-4 py-3">Status</th>
              <th className="w-16 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {API_KEYS.map((k) => (
              <tr key={k.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-[13px] font-semibold text-ink">{k.label}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11.5px] text-ink">{k.prefix}</span>
                    <button className="text-ink-muted"><Copy className="h-3 w-3" /></button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {k.scopes.map((s) => <span key={s} className="rounded bg-violet/10 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-violet">{s}</span>)}
                  </div>
                </td>
                <td className="px-4 py-3 text-[11.5px] text-ink-muted">{k.createdAt}</td>
                <td className="px-4 py-3 text-[11.5px] text-ink-muted">{k.lastUsed}</td>
                <td className="px-4 py-3 text-right text-[12.5px] font-bold text-ink">{k.usage7d.toLocaleString()}</td>
                <td className="px-4 py-3"><StatusPill tone={API_KEY_TONE[k.status]}>{k.status}</StatusPill></td>
                <td className="px-2 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    {k.status === "Active" && <button className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10.5px] font-bold text-red-600">Revoke</button>}
                    <button className="rounded-lg p-1 text-ink-muted"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-5">
        <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink"><BookOpen className="h-3.5 w-3.5 text-violet" /> Developer Resources</div>
        <div className="grid gap-2 md:grid-cols-3 text-[12px]">
          <a href="#" className="rounded-xl border border-line bg-white p-3 hover:border-violet/30"><div className="font-bold text-ink">REST API Reference</div><div className="text-[11px] text-ink-muted">Every endpoint · versioned</div></a>
          <a href="#" className="rounded-xl border border-line bg-white p-3 hover:border-violet/30"><div className="font-bold text-ink">SDKs</div><div className="text-[11px] text-ink-muted">TypeScript · Python · Go</div></a>
          <a href="#" className="rounded-xl border border-line bg-white p-3 hover:border-violet/30"><div className="font-bold text-ink">Rate limits</div><div className="text-[11px] text-ink-muted">5K req/min · burst 10K</div></a>
        </div>
      </div>
    </div>
  );
}
