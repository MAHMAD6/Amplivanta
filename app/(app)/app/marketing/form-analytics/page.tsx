import type { Metadata } from "next";
import { Download, ClipboardList, TrendingUp, Users, Globe } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { FORMS } from "@/lib/marketing-auto-data";

export const metadata: Metadata = { title: "Form Analytics — Amplivanta" };

const SOURCES = [
  { name: "Organic Search", pct: 42, submissions: 2280 },
  { name: "Paid Ads", pct: 28, submissions: 1512 },
  { name: "Direct", pct: 15, submissions: 810 },
  { name: "Email", pct: 10, submissions: 540 },
  { name: "Social", pct: 5, submissions: 270 },
];

const GEO = [
  { country: "United States", submissions: 3240, pct: 60 },
  { country: "United Kingdom", submissions: 648, pct: 12 },
  { country: "Germany", submissions: 432, pct: 8 },
  { country: "India", submissions: 378, pct: 7 },
  { country: "Australia", submissions: 270, pct: 5 },
];

export default function FormAnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Form Submissions Analytics"
        subtitle="Submissions, conversion, source, quality, follow-up outcomes."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Download className="h-3.5 w-3.5" /> Export</button>
        }
      />
      <MarketingSubnav />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={ClipboardList} label="Submissions (30d)" value="5,410" delta="18%" tone="violet" />
        <KpiCard icon={TrendingUp} label="Conv. Rate" value="12.6%" delta="1.4 pts" tone="green" />
        <KpiCard icon={Users} label="Qualified" value="2,180" delta="24%" tone="pink" />
        <KpiCard icon={Globe} label="Countries" value="42" tone="blue" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">By Source</div>
          <div className="space-y-3">
            {SOURCES.map((s) => (
              <div key={s.name}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="text-ink-soft">{s.name}</span>
                  <span className="font-bold text-ink">{s.submissions.toLocaleString()} · {s.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft">
                  <div className="h-full rounded-full bg-grad-brand" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">By Country</div>
          <div className="space-y-3">
            {GEO.map((g) => (
              <div key={g.country}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="text-ink-soft">{g.country}</span>
                  <span className="font-bold text-ink">{g.submissions.toLocaleString()} · {g.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft">
                  <div className="h-full rounded-full bg-orange-brand" style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="border-b border-line p-4"><div className="text-[14px] font-bold text-ink">By Form</div></div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Form</th>
              <th className="px-4 py-3 text-right">Views</th>
              <th className="px-4 py-3 text-right">Submissions</th>
              <th className="px-4 py-3 text-right">Conv. Rate</th>
              <th className="px-4 py-3 text-right">Qualified</th>
            </tr>
          </thead>
          <tbody>
            {FORMS.filter((f) => f.status === "Live").map((f) => (
              <tr key={f.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-[13px] font-semibold text-ink">{f.name}</td>
                <td className="px-4 py-3 text-right text-[12.5px]">{Math.round(f.submissions / (f.conversionRate / 100)).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-[12.5px] font-bold">{f.submissions.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-[12.5px] font-bold text-emerald-600">{f.conversionRate}%</td>
                <td className="px-4 py-3 text-right text-[12.5px]">{Math.round(f.submissions * 0.4).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
