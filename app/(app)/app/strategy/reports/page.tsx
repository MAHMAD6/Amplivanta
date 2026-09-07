import type { Metadata } from "next";
import { Plus, Calendar, Share2, Download, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { StrategySubnav } from "@/components/amplivanta/strategy-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { STRATEGY_REPORTS, STRATEGY_REPORT_TONE } from "@/lib/strategy-data";

export const metadata: Metadata = { title: "Strategy Reports" };

export default function StrategyReportsPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Strategy Reports"
        subtitle="Executive strategy reports combining goals, audiences, channel plans, performance."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <Plus className="h-3.5 w-3.5" /> New Report
          </button>
        }
      />
      <StrategySubnav />

      <div className="grid gap-4 md:grid-cols-2">
        {STRATEGY_REPORTS.map((r) => (
          <div key={r.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="text-[14px] font-bold text-ink">{r.name}</div>
                <div className="mt-0.5 text-[11.5px] text-ink-muted">{r.period} · Audience: {r.audience}</div>
              </div>
              <StatusPill tone={STRATEGY_REPORT_TONE[r.status]}>{r.status}</StatusPill>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-y border-line py-3 text-center text-[11px]">
              <div><div className="text-ink-muted">Metrics</div><div className="font-bold text-ink">{r.metrics}</div></div>
              <div><div className="text-ink-muted">Last run</div><div className="font-bold text-ink">{r.lastRun}</div></div>
              <div><div className="text-ink-muted">Format</div><div className="font-bold text-ink">PDF / Deck</div></div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="rounded-lg border border-line px-3 py-1.5 text-[11.5px] font-semibold text-ink"><Calendar className="mr-1 inline h-3 w-3" />Schedule</button>
              <button className="rounded-lg border border-line px-3 py-1.5 text-[11.5px] font-semibold text-ink"><Share2 className="mr-1 inline h-3 w-3" />Share</button>
              <button className="rounded-lg bg-grad-cta px-3 py-1.5 text-[11.5px] font-bold text-white shadow-violet"><Download className="mr-1 inline h-3 w-3" />Export</button>
              <button className="ml-auto rounded-lg p-1.5 text-ink-muted"><MoreHorizontal className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
