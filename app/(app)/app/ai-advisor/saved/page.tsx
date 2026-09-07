import type { Metadata } from "next";
import { CalendarDays, ChevronRight, MoreVertical, Plus, Search, Star } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { AdvisorTabs } from "@/components/amplivanta/advisor-tabs";
import { AdvisorIcon } from "@/components/amplivanta/advisor-icon";
import {
  SAVED_NEXT_STEPS,
  SAVED_OPPORTUNITY_AREAS,
  SAVED_ROWS,
  SAVED_STATS,
  SAVED_SUMMARY,
} from "@/lib/advisor-data";

export const metadata: Metadata = { title: "Saved Insights" };

const priorityTone: Record<string, string> = {
  High: "bg-rose-500/10 text-rose-600",
  Medium: "bg-amber-500/10 text-amber-600",
  Low: "bg-emerald-500/10 text-emerald-700",
};

export default function SavedInsightsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-violet">AI Advisor</div>
      <PageHeader
        title={<span className="inline-flex items-center gap-2">Saved Insights <Star className="h-5 w-5 text-amber-400" /></span>}
        subtitle="Revisit high-value insights you've saved for later review, collaboration, or action."
      />

      <AdvisorTabs />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SAVED_STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line bg-white p-4 shadow-card">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.tone}`}>
                  <AdvisorIcon name={s.icon} className="h-4 w-4" />
                </div>
                <div className="mt-3 text-[24px] font-extrabold text-ink">{s.value}</div>
                <div className="text-[12px] font-semibold text-ink">{s.label}</div>
                <div className="text-[11px] text-emerald-600">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5">
              <Search className="h-4 w-4 text-ink-muted" />
              <input placeholder="Search saved insights…" className="min-w-0 flex-1 bg-transparent text-[12.5px] focus:outline-none" />
            </div>
            <button className="rounded-xl border border-line bg-white px-3 py-2.5 text-[12.5px] font-semibold text-ink-soft">Type</button>
            <button className="rounded-xl border border-line bg-white px-3 py-2.5 text-[12.5px] font-semibold text-ink-soft">Team</button>
            <button className="rounded-xl border border-line bg-white px-3 py-2.5 text-[12.5px] font-semibold text-ink-soft">Priority</button>
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2.5 text-[12.5px] font-semibold text-ink-soft"><CalendarDays className="h-3.5 w-3.5" /> Date Saved</button>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-violet px-4 py-2.5 text-[12.5px] font-semibold text-white"><Plus className="h-3.5 w-3.5" /> Create Action Plan</button>
          </div>

          {/* Table */}
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
            <div className="grid grid-cols-[1fr_130px_150px_120px_90px_40px] min-w-[640px] gap-3 border-b border-line bg-bg-soft px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
              <span>Insight</span>
              <span>Source / Category</span>
              <span>Owner / Team</span>
              <span>Date Saved</span>
              <span>Priority</span>
              <span />
            </div>
            {SAVED_ROWS.map((r) => (
              <div key={r.title} className="grid grid-cols-[1fr_130px_150px_120px_90px_40px] min-w-[640px] items-center gap-3 border-b border-line px-5 py-4 last:border-0 hover:bg-bg-soft">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet/10 text-violet">
                    <AdvisorIcon name={r.icon} className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold text-ink">{r.title}</div>
                    <div className="text-[11.5px] leading-relaxed text-ink-soft">{r.desc}</div>
                  </div>
                </div>
                <span className={`w-fit rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${r.categoryTone}`}>{r.category}</span>
                <div className="text-[11.5px] text-ink-soft">{r.owner}</div>
                <div className="text-[11.5px] text-ink-soft">{r.date}<br /><span className="text-ink-muted">{r.time}</span></div>
                <span className={`w-fit rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${priorityTone[r.priority]}`}>{r.priority}</span>
                <MoreVertical className="h-4 w-4 text-ink-muted" />
              </div>
            ))}
            <div className="flex items-center justify-between px-5 py-3 text-[12px] text-ink-muted">
              <span>1–6 of 32</span>
              <div className="flex items-center gap-1">
                {["‹", "1", "2", "3", "4", "5", "6", "›"].map((p, i) => (
                  <button key={i} className={`h-7 w-7 rounded-lg text-[12px] font-semibold ${p === "1" ? "bg-violet text-white" : "text-ink-soft hover:bg-bg-soft"}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <h2 className="mb-4 text-[14px] font-bold text-ink">Insight Summary</h2>
            <div className="flex items-center gap-4">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[conic-gradient(#E11D48_0%_37%,#0F9D77_37%_75%,#C9C7D2_75%_88%,#F5731A_88%_100%)]">
                <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-[18px] font-extrabold text-ink">{SAVED_SUMMARY.total}</span>
                  <span className="text-[9px] text-ink-muted">Total</span>
                </div>
              </div>
              <ul className="space-y-1.5 text-[11px]">
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500" /> High Priority <b className="ml-auto">{SAVED_SUMMARY.high} (37%)</b></li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Ready for Action <b className="ml-auto">{SAVED_SUMMARY.ready} (56%)</b></li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-line" /> Archived <b className="ml-auto">{SAVED_SUMMARY.archived} (19%)</b></li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-brand" /> Low Priority <b className="ml-auto">{SAVED_SUMMARY.low} (13%)</b></li>
              </ul>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <h2 className="mb-4 text-[14px] font-bold text-ink">Top Opportunity Areas</h2>
            <ul className="space-y-3">
              {SAVED_OPPORTUNITY_AREAS.map((o) => (
                <li key={o.label}>
                  <div className="flex justify-between text-[11.5px]">
                    <span className="text-ink-soft">{o.label}</span>
                    <span className="font-semibold text-ink-muted">{o.count} ({o.pct}%)</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-soft">
                    <div className="h-full rounded-full bg-violet" style={{ width: `${o.pct * 3}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <button className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet">
              View all opportunity areas <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <h2 className="mb-4 text-[14px] font-bold text-ink">Suggested Next Steps</h2>
            <ul className="space-y-3">
              {SAVED_NEXT_STEPS.map((s) => (
                <li key={s.title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet/10 text-violet">
                    <AdvisorIcon name={s.icon} className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-[12.5px] font-semibold text-ink">{s.title}</span>
                    <span className="block text-[11px] text-ink-muted">{s.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
