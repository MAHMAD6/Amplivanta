import type { Metadata } from "next";
import { Download, DollarSign, TrendingUp, Zap, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { AnalyticsSubnav } from "@/components/amplivanta/analytics-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { ATTRIBUTION_MODELS, ATTRIBUTION_CHANNELS } from "@/lib/analytics-data";

export const metadata: Metadata = { title: "Revenue Attribution — Amplivanta" };

export default function AttributionPage() {
  const totalRev = ATTRIBUTION_CHANNELS.reduce((s, c) => s + c.revenue, 0);
  const totalSpend = ATTRIBUTION_CHANNELS.reduce((s, c) => s + c.spend, 0);
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Revenue Attribution"
        subtitle="Attribute revenue and conversions to campaigns, channels, touchpoints."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        }
      />
      <AnalyticsSubnav />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={DollarSign} label="Attributed Revenue" value={`$${(totalRev / 1000).toFixed(0)}K`} delta="22%" tone="green" />
        <KpiCard icon={DollarSign} label="Total Spend" value={`$${(totalSpend / 1000).toFixed(0)}K`} tone="pink" />
        <KpiCard icon={TrendingUp} label="Blended ROAS" value={`${(totalRev / totalSpend).toFixed(1)}×`} tone="violet" />
        <KpiCard icon={Zap} label="Assisted Conv." value="11.9K" tone="blue" />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[14px] font-bold text-ink">Attribution Model</div>
          <span className="text-[11px] text-ink-muted">Compare models to see channel contribution shift</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ATTRIBUTION_MODELS.map((m, i) => (
            <button key={m} className={`rounded-xl border px-3 py-2 text-[12px] font-semibold ${i === 5 ? "border-violet/40 bg-violet/10 text-violet" : "border-line bg-white text-ink-soft"}`}>{m}{i === 5 && <Sparkles className="ml-1 inline h-3 w-3" />}</button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3 text-right">Spend</th>
              <th className="px-4 py-3 text-right">ROAS</th>
              <th className="px-4 py-3 text-right">Assisted</th>
              <th className="px-4 py-3">Share of Revenue</th>
            </tr>
          </thead>
          <tbody>
            {ATTRIBUTION_CHANNELS.map((c) => {
              const share = Math.round((c.revenue / totalRev) * 100);
              return (
                <tr key={c.channel} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-[13px] font-semibold text-ink">{c.channel}</td>
                  <td className="px-4 py-3 text-right text-[12.5px] font-bold text-emerald-600">${(c.revenue / 1000).toFixed(0)}K</td>
                  <td className="px-4 py-3 text-right text-[12.5px]">${(c.spend / 1000).toFixed(0)}K</td>
                  <td className="px-4 py-3 text-right text-[12.5px] font-bold text-violet">{c.roas > 0 ? `${c.roas}×` : "—"}</td>
                  <td className="px-4 py-3 text-right text-[12.5px]">{c.assisted.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-bg-soft"><div className="h-full rounded-full bg-grad-brand" style={{ width: `${share}%` }} /></div>
                      <span className="text-[11.5px] font-bold text-ink">{share}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
