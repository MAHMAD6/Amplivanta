import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Plus, Zap, Play, Pause, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { WorkspaceSubnav } from "@/components/amplivanta/workspace-subnav";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { WS_AUTOMATIONS } from "@/lib/workspace-data";

export const metadata: Metadata = { title: "Workspace Automations" };

export default function WSAutomationsPage() {
  const active = WS_AUTOMATIONS.filter((a) => a.status === "Active");
  const totalRev = WS_AUTOMATIONS.reduce((sum, a) => sum + a.revenue, 0);
  const totalConv = WS_AUTOMATIONS.reduce((sum, a) => sum + a.conversions, 0);
  const warn = WS_AUTOMATIONS.filter((a) => a.health === "Warn");
  const top = [...WS_AUTOMATIONS].sort((a, b) => b.revenue - a.revenue).slice(0, 3);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Automations"
        subtitle="Manage campaign-specific automations from AI Workspace."
        actions={
          <>
            <Link href="/app/marketing/templates" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink">Templates</Link>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-violet/30 bg-violet/5 px-4 text-[13px] font-bold text-violet"><Sparkles className="h-3.5 w-3.5" /> Generate Workflow</button>
            <Link href="/app/marketing/workflows" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Plus className="h-3.5 w-3.5" /> Create Automation</Link>
          </>
        }
      />
      <WorkspaceSubnav />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Zap} label="Active" value={String(active.length)} tone="violet" />
        <KpiCard icon={TrendingUp} label="Contacts Enrolled" value={String(WS_AUTOMATIONS.reduce((s, a) => s + a.contacts, 0).toLocaleString())} tone="blue" />
        <KpiCard icon={DollarSign} label="Revenue Influenced" value={`$${(totalRev / 1000).toFixed(0)}K`} tone="green" />
        <KpiCard icon={AlertTriangle} label="Health Warnings" value={String(warn.length)} deltaTone={warn.length ? "down" : "up"} delta={warn.length ? "1 needs review" : "All healthy"} tone={warn.length ? "amber" : "green"} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-3">Automation</th>
                  <th className="px-4 py-3">Trigger</th>
                  <th className="px-4 py-3">Channels</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Contacts</th>
                  <th className="px-4 py-3 text-right">Conv.</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  <th className="w-10 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {WS_AUTOMATIONS.map((a) => (
                  <tr key={a.id} className="border-b border-line last:border-0 hover:bg-bg-soft/40">
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-semibold text-ink">{a.name}</div>
                      {a.health === "Warn" && <div className="mt-0.5 text-[10.5px] font-semibold text-amber-700">⚠ Health warning</div>}
                    </td>
                    <td className="px-4 py-3 text-[11.5px] text-ink-soft">{a.trigger}</td>
                    <td className="px-4 py-3 text-[11.5px] text-ink-soft">{a.channels.join(" · ")}</td>
                    <td className="px-4 py-3"><StatusPill tone={a.status === "Active" ? "green" : "amber"}>{a.status}</StatusPill></td>
                    <td className="px-4 py-3 text-right text-[12.5px]">{a.contacts.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-[12.5px] font-bold text-emerald-600">{a.conversions}</td>
                    <td className="px-4 py-3 text-right text-[12.5px] font-bold text-ink">${(a.revenue / 1000).toFixed(0)}K</td>
                    <td className="px-2 py-3 text-right"><button className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft">{a.status === "Active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[13px] font-bold text-ink">Top Performing</div>
            <div className="space-y-2">
              {top.map((a, i) => (
                <div key={a.id} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet/10 text-[11px] font-bold text-violet">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-semibold text-ink">{a.name}</div>
                    <div className="text-[10.5px] font-bold text-emerald-600">${(a.revenue / 1000).toFixed(0)}K</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-5">
            <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink"><Sparkles className="h-3.5 w-3.5 text-violet" /> AI Workflow Ideas</div>
            <ul className="space-y-1.5 text-[11.5px] text-ink-soft">
              <li>· Add re-engagement branch to Winback (est. +12% CR).</li>
              <li>· Create post-audit nurture (missing today).</li>
              <li>· Trigger Slack alert on PQL score {">"} 80.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
