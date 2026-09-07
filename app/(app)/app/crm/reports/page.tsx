import type { Metadata } from "next";
import { Download, Share2, DollarSign, Target, TrendingUp, Users, Percent, Timer } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { ChartPlaceholder } from "@/components/amplivanta/chart-placeholder";
import { CrmSubnav } from "@/components/amplivanta/crm-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { PIPELINE_STAGES, STAGE_TONE } from "@/lib/crm-data";

export const metadata: Metadata = { title: "CRM Reports" };

const topOwners = [
  { name: "Alex Johnson", role: "AE", closed: 18, revenue: 342000 },
  { name: "Sarah Chen", role: "AE", closed: 14, revenue: 268000 },
  { name: "Priya Ramesh", role: "AE", closed: 12, revenue: 224000 },
  { name: "Emily Davis", role: "AE", closed: 9, revenue: 156000 },
];

export default function CrmReportsPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="CRM Reports"
        subtitle="Pipeline, revenue, sales activity, conversion, velocity, team performance — every dimension, one date range."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30">
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </>
        }
      />
      <CrmSubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <KpiCard icon={DollarSign} label="Revenue (30d)" value={null} tone="green" />
        <KpiCard icon={Target} label="Deals Won" value={null} tone="violet" />
        <KpiCard icon={Percent} label="Win Rate" value={null} tone="pink" />
        <KpiCard icon={Timer} label="Avg. Cycle" value={null} tone="blue" />
        <KpiCard icon={TrendingUp} label="Avg. Deal Size" value={null} tone="orange" />
        <KpiCard icon={Users} label="Active Reps" value={null} tone="teal" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Revenue Trend</div>
            <span className="text-[11px] text-ink-muted">Last 12 weeks</span>
          </div>
          <ChartPlaceholder />
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Stage Conversion</div>
          <div className="space-y-3">
            {PIPELINE_STAGES.map((s, i) => {
              const pct = Math.round((s.deals / PIPELINE_STAGES[0].deals) * 100);
              return (
                <div key={s.key}>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <StatusPill tone={STAGE_TONE[s.key]}>{s.label}</StatusPill>
                    <span className="font-bold text-ink">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-soft">
                    <div className="h-full rounded-full bg-grad-brand" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Top Owners (Revenue)</div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="pb-2">Owner</th>
                <th className="pb-2 text-right">Deals Won</th>
                <th className="pb-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topOwners.map((o) => (
                <tr key={o.name} className="border-b border-line last:border-0">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <Avatar name={o.name} size={26} />
                      <div>
                        <div className="text-[13px] font-semibold text-ink">{o.name}</div>
                        <div className="text-[10.5px] text-ink-muted">{o.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 text-right text-[13px] font-bold text-ink">{o.closed}</td>
                  <td className="py-2.5 text-right text-[13px] font-bold text-emerald-600">${o.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Win / Loss Breakdown</div>
          <div className="flex items-center gap-6">
            <svg viewBox="0 0 120 120" className="h-40 w-40">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e9e7f0" strokeWidth="14" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#10b981" strokeWidth="14" strokeDasharray="326.7" strokeDashoffset="215.6" strokeLinecap="round" transform="rotate(-90 60 60)" />
            </svg>
            <div className="space-y-2 text-[12.5px]">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Won <span className="font-bold text-ink">34%</span></div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500" />Lost <span className="font-bold text-ink">18%</span></div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-ink/20" />Open <span className="font-bold text-ink">48%</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
