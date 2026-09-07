import type { Metadata } from "next";
import { Download, TrendingUp, Zap, Target, DollarSign, Sparkles, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { ChartPlaceholder } from "@/components/amplivanta/chart-placeholder";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { WORKFLOWS } from "@/lib/marketing-auto-data";

export const metadata: Metadata = { title: "Automation Analytics" };

export default function AutomationAnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Automation Analytics"
        subtitle="Workflow performance, efficiency, anomalies and revenue impact."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink">📅 Last 30 Days</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Download className="h-3.5 w-3.5" /> Export</button>
          </>
        }
      />
      <MarketingSubnav />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard icon={Zap} label="Runs" value={null} tone="violet" />
        <KpiCard icon={Target} label="Completion" value={null} tone="green" />
        <KpiCard icon={TrendingUp} label="Contacts Enrolled" value={null} tone="blue" />
        <KpiCard icon={DollarSign} label="Revenue Influenced" value={null} tone="pink" />
        <KpiCard icon={AlertTriangle} label="Failures" value={null} tone="teal" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card lg:col-span-2">
          <div className="mb-3 text-[14px] font-bold text-ink">Performance Over Time</div>
          <ChartPlaceholder />
          <div className="mt-2 flex gap-3 text-[11px] text-ink-muted">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet" /> Enrollments</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-pink-brand" /> Completions</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-brand" /> Conversions</span>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Conversion Funnel</div>
          <div className="space-y-2">
            {[
              { label: "Enrolled", value: "4,280", pct: 100 },
              { label: "Reached Step 2", value: "3,820", pct: 89 },
              { label: "Reached Step 3", value: "2,940", pct: 68 },
              { label: "Converted", value: "1,240", pct: 29 },
            ].map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex items-center justify-between text-[11.5px]">
                  <span className="text-ink-soft">{s.label}</span>
                  <span className="font-bold text-ink">{s.value} · {s.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-bg-soft">
                  <div className="h-full rounded-full bg-grad-brand" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Top Workflows</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  <th className="pb-2">Workflow</th>
                  <th className="pb-2 text-right">Enroll</th>
                  <th className="pb-2 text-right">CVR</th>
                  <th className="pb-2 text-right">$ Rev</th>
                </tr>
              </thead>
              <tbody>
                {WORKFLOWS.slice(0, 5).map((w) => (
                  <tr key={w.id} className="border-b border-line last:border-0">
                    <td className="py-2.5 text-[12.5px] font-semibold text-ink">{w.name}</td>
                    <td className="py-2.5 text-right text-[12px]">{w.enrolled.toLocaleString()}</td>
                    <td className="py-2.5 text-right text-[12px] font-bold text-emerald-600">{w.conversionRate}%</td>
                    <td className="py-2.5 text-right text-[12px] font-bold">${(w.revenue / 1000).toFixed(0)}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-5">
          <div className="mb-3 flex items-center gap-1.5 text-[14px] font-bold text-ink"><Sparkles className="h-4 w-4 text-violet" /> AI Insights & Anomalies</div>
          <div className="space-y-2 text-[12px]">
            <div className="rounded-xl border border-line bg-white p-3">
              <StatusPill tone="red">Drop-off</StatusPill>
              <div className="mt-1.5 font-semibold text-ink">&ldquo;Winback&rdquo; workflow drops 62% at Step 3</div>
              <div className="text-[11px] text-ink-muted">Consider shortening delay or personalizing subject.</div>
            </div>
            <div className="rounded-xl border border-line bg-white p-3">
              <StatusPill tone="green">Top performer</StatusPill>
              <div className="mt-1.5 font-semibold text-ink">&ldquo;PQL → Sales&rdquo; up 42% MoM</div>
              <div className="text-[11px] text-ink-muted">Sales acting within 12 min average.</div>
            </div>
            <div className="rounded-xl border border-line bg-white p-3">
              <StatusPill tone="amber">Opportunity</StatusPill>
              <div className="mt-1.5 font-semibold text-ink">Add wait node to Welcome Series</div>
              <div className="text-[11px] text-ink-muted">Estimated +8% completion.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
