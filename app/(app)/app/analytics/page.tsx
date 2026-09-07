import type { Metadata } from "next";
import Link from "next/link";
import { Download, Eye, Users, DollarSign, TrendingUp, Target, Sparkles, Share2 } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { ChartPlaceholder } from "@/components/amplivanta/chart-placeholder";
import { AnalyticsSubnav } from "@/components/amplivanta/analytics-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { TRAFFIC_GEO, ATTRIBUTION_CHANNELS, AI_ANALYTICS_INSIGHTS, CAMPAIGN_ANALYTICS } from "@/lib/analytics-data";
import { StatusPill } from "@/components/amplivanta/status-pill";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsDashboardPage() {
  const totalRev = ATTRIBUTION_CHANNELS.reduce((s, c) => s + c.revenue, 0);
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Analytics & Reports"
        subtitle="Traffic, conversions, campaign performance, attribution and revenue analysis."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink">📅 Last 30 Days · vs prev</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Share2 className="h-3.5 w-3.5" /> Share</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Download className="h-3.5 w-3.5" /> Export Report</button>
          </>
        }
      />
      <AnalyticsSubnav />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard icon={Eye} label="Sessions" value={null} tone="violet" />
        <KpiCard icon={Users} label="Leads" value={null} tone="blue" />
        <KpiCard icon={Target} label="Conv. Rate" value={null} tone="pink" />
        <KpiCard icon={DollarSign} label="Revenue" value={`$${(totalRev / 1000).toFixed(0)}K`} tone="green" />
        <KpiCard icon={TrendingUp} label="ROAS" value={null} tone="orange" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card lg:col-span-2">
          <div className="mb-3 text-[14px] font-bold text-ink">Traffic Over Time</div>
          <ChartPlaceholder />
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Channel Attribution</div>
          <div className="space-y-2">
            {ATTRIBUTION_CHANNELS.slice(0, 5).map((c) => {
              const pct = Math.round((c.revenue / totalRev) * 100);
              return (
                <div key={c.channel}>
                  <div className="mb-1 flex justify-between text-[11.5px]"><span className="text-ink-soft">{c.channel}</span><span className="font-bold text-ink">${(c.revenue / 1000).toFixed(0)}K</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft"><div className="h-full rounded-full bg-grad-brand" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Top Campaigns</div>
            <Link href="/app/analytics/campaigns" className="text-[12px] font-semibold text-violet">Details →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-line text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">
                  <th className="pb-2">Campaign</th>
                  <th className="pb-2 text-right">Conv.</th>
                  <th className="pb-2 text-right">Revenue</th>
                  <th className="pb-2 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {CAMPAIGN_ANALYTICS.slice(0, 5).map((c) => (
                  <tr key={c.name} className="border-b border-line last:border-0">
                    <td className="py-2.5 text-[12.5px] font-semibold text-ink">{c.name}</td>
                    <td className="py-2.5 text-right text-[12px]">{c.conversions}</td>
                    <td className="py-2.5 text-right text-[12px] font-bold">${(c.revenue / 1000).toFixed(0)}K</td>
                    <td className="py-2.5 text-right text-[12px] font-bold text-emerald-600">{c.roas}×</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Geographic Breakdown</div>
            <Link href="/app/analytics/traffic" className="text-[12px] font-semibold text-violet">Details →</Link>
          </div>
          <div className="space-y-2">
            {TRAFFIC_GEO.map((g) => (
              <div key={g.country}>
                <div className="mb-1 flex justify-between text-[11.5px]"><span className="text-ink-soft">{g.country}</span><span><span className="font-bold text-ink">{g.sessions.toLocaleString()}</span> <span className="ml-1 text-ink-muted">({g.share}%)</span></span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft"><div className="h-full rounded-full bg-orange-brand" style={{ width: `${g.share}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-5">
        <div className="mb-3 flex items-center gap-1.5 text-[14px] font-bold text-ink"><Sparkles className="h-4 w-4 text-violet" /> AI Insights & Recommendations</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {AI_ANALYTICS_INSIGHTS.map((i) => {
            const tone = { green: "bg-emerald-500/10 text-emerald-600", amber: "bg-amber-500/10 text-amber-700", violet: "bg-violet/10 text-violet", red: "bg-red-500/10 text-red-600" }[i.tone as string];
            return (
              <div key={i.title} className="rounded-xl border border-line bg-white p-3">
                <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${tone}`}>{i.tag}</span>
                <div className="mt-1.5 text-[12.5px] font-semibold text-ink">{i.title}</div>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{i.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
