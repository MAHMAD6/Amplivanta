import type { Metadata } from "next";
import { Download, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { ChartPlaceholder } from "@/components/amplivanta/chart-placeholder";
import { AnalyticsSubnav } from "@/components/amplivanta/analytics-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { CAMPAIGN_ANALYTICS } from "@/lib/analytics-data";
import { Target, DollarSign, MousePointer, Users } from "lucide-react";

export const metadata: Metadata = { title: "Campaign Analytics" };

export default function CampaignAnalyticsPage() {
  const totalRev = CAMPAIGN_ANALYTICS.reduce((s, c) => s + c.revenue, 0);
  const totalConv = CAMPAIGN_ANALYTICS.reduce((s, c) => s + c.conversions, 0);
  const totalReach = CAMPAIGN_ANALYTICS.reduce((s, c) => s + c.reach, 0);
  const avgRoas = CAMPAIGN_ANALYTICS.reduce((s, c) => s + c.roas, 0) / CAMPAIGN_ANALYTICS.length;

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Campaign Analytics"
        subtitle="Cross-channel campaign performance — reach, engagement, conversions, spend, revenue."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        }
      />
      <AnalyticsSubnav />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Users} label="Total Reach" value={`${(totalReach / 1000).toFixed(0)}K`} tone="violet" />
        <KpiCard icon={MousePointer} label="Total Conversions" value={totalConv.toLocaleString()} tone="blue" />
        <KpiCard icon={DollarSign} label="Total Revenue" value={`$${(totalRev / 1000).toFixed(0)}K`} tone="green" />
        <KpiCard icon={TrendingUp} label="Avg. ROAS" value={`${avgRoas.toFixed(1)}×`} tone="pink" />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 text-[14px] font-bold text-ink">Campaign Performance Trend</div>
        <ChartPlaceholder />
        <div className="mt-2 flex gap-3 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet" /> Reach</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-pink-brand" /> Conversions</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-brand" /> Revenue</span>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3 text-right">Reach</th>
              <th className="px-4 py-3 text-right">CTR</th>
              <th className="px-4 py-3 text-right">Conversions</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3 text-right">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {CAMPAIGN_ANALYTICS.map((c) => (
              <tr key={c.name} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-[13px] font-semibold text-ink">{c.name}</td>
                <td className="px-4 py-3 text-right text-[12.5px]">{(c.reach / 1000).toFixed(1)}K</td>
                <td className="px-4 py-3 text-right text-[12.5px]">{c.ctr}%</td>
                <td className="px-4 py-3 text-right text-[12.5px] font-bold">{c.conversions}</td>
                <td className="px-4 py-3 text-right text-[12.5px] font-bold text-emerald-600">${(c.revenue / 1000).toFixed(0)}K</td>
                <td className="px-4 py-3 text-right text-[12.5px] font-bold text-violet">{c.roas}×</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
