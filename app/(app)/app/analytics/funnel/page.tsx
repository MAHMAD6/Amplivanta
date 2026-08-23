import type { Metadata } from "next";
import { Sparkles, Download, Plus, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { AnalyticsSubnav } from "@/components/amplivanta/analytics-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { CONVERSION_FUNNEL } from "@/lib/analytics-data";
import { Target, MousePointer, Users, DollarSign } from "lucide-react";

export const metadata: Metadata = { title: "Conversion Funnel — Amplivanta" };

export default function FunnelPage() {
  const top = CONVERSION_FUNNEL[0].value;
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Conversion Funnel"
        subtitle="Visualize stages and identify drop-off from visit through customer."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Plus className="h-3.5 w-3.5" /> Add Stage</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Download className="h-3.5 w-3.5" /> Export</button>
          </>
        }
      />
      <AnalyticsSubnav />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Users} label="Top of Funnel" value={top.toLocaleString()} tone="violet" />
        <KpiCard icon={MousePointer} label="Overall Conv." value="0.3%" delta="Target 0.5%" deltaTone="down" tone="pink" />
        <KpiCard icon={Target} label="Biggest Drop" value="Form → MQL" delta="65% loss" tone="red" />
        <KpiCard icon={DollarSign} label="Revenue per Customer" value="$4.2K" delta="12%" tone="green" />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-4 text-[14px] font-bold text-ink">Funnel Stages</div>
        <div className="space-y-2">
          {CONVERSION_FUNNEL.map((s, i) => {
            const pct = (s.value / top) * 100;
            const prevPct = i > 0 ? (CONVERSION_FUNNEL[i - 1].value / top) * 100 : 100;
            const drop = prevPct - pct;
            return (
              <div key={s.stage} className="rounded-xl border border-line p-3">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="font-semibold text-ink">{s.stage}</span>
                  <div className="flex items-center gap-3">
                    {i > 0 && drop > 0 && <span className="text-[10.5px] font-bold text-red-600"><TrendingDown className="mr-0.5 inline h-3 w-3" />−{drop.toFixed(1)} pts</span>}
                    <span className="font-bold text-ink">{s.value.toLocaleString()}</span>
                    <span className="text-ink-muted">{s.pct}%</span>
                  </div>
                </div>
                <div className="mt-2 h-8 overflow-hidden rounded-lg bg-bg-soft">
                  <div className="flex h-full items-center justify-end rounded-lg bg-grad-brand pr-3 text-[10.5px] font-bold text-white" style={{ width: `${Math.max(pct, 8)}%` }}>
                    {pct.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-5">
        <div className="mb-3 flex items-center gap-1.5 text-[14px] font-bold text-ink"><Sparkles className="h-4 w-4 text-violet" /> Drop-off Insights</div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { stage: "Engaged → Form Views (−38 pts)", body: "Add form CTA above the fold on top 3 landing pages." },
            { stage: "Form Views → Submits (−14 pts)", body: "Shorten form to 4 fields; test password-less signup." },
            { stage: "MQL → SQL (−1.3 pts)", body: "Update PQL scoring; route hot leads to Sales within 15 min." },
          ].map((r, i) => (
            <div key={i} className="rounded-xl border border-line bg-white p-3">
              <div className="text-[12.5px] font-semibold text-ink">{r.stage}</div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
