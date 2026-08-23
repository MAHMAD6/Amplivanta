import type { Metadata } from "next";
import { Plus, DollarSign, Target, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { StrategySubnav } from "@/components/amplivanta/strategy-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { CHANNELS, CHANNEL_TONE } from "@/lib/strategy-data";

export const metadata: Metadata = { title: "Channel Plan & Budget — Amplivanta" };

export default function ChannelPlanPage() {
  const totalBudget = CHANNELS.reduce((s, c) => s + c.plannedBudget, 0);
  const totalSpend = CHANNELS.reduce((s, c) => s + c.actualSpend, 0);
  const totalLeads = CHANNELS.reduce((s, c) => s + c.actualLeads, 0);
  const avgRoas = CHANNELS.reduce((s, c) => s + c.roasActual, 0) / CHANNELS.length;

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Channel Plan & Budget"
        subtitle="Channel mix, allocation, targets, expected returns."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <Plus className="h-3.5 w-3.5" /> Add Channel
          </button>
        }
      />
      <StrategySubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={DollarSign} label="Planned Budget" value={`$${(totalBudget / 1000).toFixed(0)}K`} tone="violet" />
        <KpiCard icon={DollarSign} label="Actual Spend" value={`$${(totalSpend / 1000).toFixed(0)}K`} delta={`${Math.round((totalSpend / totalBudget) * 100)}% used`} tone="pink" />
        <KpiCard icon={Target} label="Leads" value={totalLeads.toLocaleString()} delta="14%" tone="blue" />
        <KpiCard icon={TrendingUp} label="Avg. ROAS" value={`${avgRoas.toFixed(1)}×`} delta="Target 3×+" tone="green" />
      </div>

      <div className="mb-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 text-[14px] font-bold text-ink">Budget Distribution</div>
        <div className="flex h-8 overflow-hidden rounded-full border border-line">
          {CHANNELS.map((c, i) => {
            const pct = Math.round((c.plannedBudget / totalBudget) * 100);
            const colors = ["bg-violet", "bg-pink-brand", "bg-blue-500", "bg-emerald-500", "bg-orange-brand", "bg-amber-500"];
            return <div key={c.id} className={`${colors[i % colors.length]} flex items-center justify-center text-[10px] font-bold text-white`} style={{ width: `${pct}%` }}>{pct >= 8 && `${pct}%`}</div>;
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
          {CHANNELS.map((c, i) => {
            const colors = ["bg-violet", "bg-pink-brand", "bg-blue-500", "bg-emerald-500", "bg-orange-brand", "bg-amber-500"];
            return (
              <span key={c.id} className="flex items-center gap-1 text-ink-soft">
                <span className={`h-2 w-2 rounded-full ${colors[i % colors.length]}`} />
                {c.name}
              </span>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Planned</th>
              <th className="px-4 py-3 text-right">Actual</th>
              <th className="px-4 py-3 text-right">Exp. Leads</th>
              <th className="px-4 py-3 text-right">Actual Leads</th>
              <th className="px-4 py-3 text-right">ROAS (act)</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {CHANNELS.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-[13px] font-semibold text-ink">{c.name}</td>
                <td className="px-4 py-3"><StatusPill tone={c.category === "Paid" ? "pink" : c.category === "Owned" ? "violet" : "green"}>{c.category}</StatusPill></td>
                <td className="px-4 py-3 text-right text-[12.5px]">${(c.plannedBudget / 1000).toFixed(0)}K</td>
                <td className="px-4 py-3 text-right text-[12.5px]">${(c.actualSpend / 1000).toFixed(0)}K</td>
                <td className="px-4 py-3 text-right text-[12.5px]">{c.expectedLeads}</td>
                <td className="px-4 py-3 text-right text-[12.5px] font-bold">{c.actualLeads}</td>
                <td className={`px-4 py-3 text-right text-[12.5px] font-bold ${c.roasActual >= c.roasTarget ? "text-emerald-600" : "text-red-600"}`}>{c.roasActual}×</td>
                <td className="px-4 py-3"><StatusPill tone={CHANNEL_TONE[c.status]}>{c.status}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
