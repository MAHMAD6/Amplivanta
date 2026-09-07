import type { Metadata } from "next";
import { CalendarDays, ChevronRight, Download, Filter, MoreVertical, Search, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { AdvisorTabs } from "@/components/amplivanta/advisor-tabs";
import { AdvisorIcon } from "@/components/amplivanta/advisor-icon";
import { HISTORY_ACTIVITY, HISTORY_IMPACT, HISTORY_ROWS, HISTORY_STATS } from "@/lib/advisor-data";

export const metadata: Metadata = { title: "Recommendation History" };

export default function RecommendationHistoryPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-violet">AI Advisor</div>
      <PageHeader
        title="Recommendation History"
        subtitle="Review AI recommendations, insights, and actions you've explored."
        actions={
          <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink">
            <Download className="h-4 w-4" /> Export History
          </button>
        }
      />

      <AdvisorTabs />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HISTORY_STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line bg-white p-4 shadow-card">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.tone}`}>
                  <AdvisorIcon name={s.icon} className="h-4 w-4" />
                </div>
                <div className="mt-3 text-[24px] font-extrabold text-ink">{s.value}</div>
                <div className="text-[12px] font-semibold text-ink">{s.label}</div>
                <div className="text-[11px] text-ink-muted">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5">
              <Search className="h-4 w-4 text-ink-muted" />
              <input placeholder="Search recommendations…" className="min-w-0 flex-1 bg-transparent text-[12.5px] focus:outline-none" />
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2.5 text-[12.5px] font-semibold text-ink-soft">All Types <ChevronRight className="h-3.5 w-3.5 rotate-90" /></button>
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2.5 text-[12.5px] font-semibold text-ink-soft">All Status <ChevronRight className="h-3.5 w-3.5 rotate-90" /></button>
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2.5 text-[12.5px] font-semibold text-ink-soft"><CalendarDays className="h-3.5 w-3.5" /> May 1 – May 30, 2026</button>
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2.5 text-[12.5px] font-semibold text-ink-soft"><Filter className="h-3.5 w-3.5" /> Filters</button>
          </div>

          {/* Table */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <div className="grid grid-cols-[1fr_120px_130px_140px_40px] gap-3 border-b border-line bg-bg-soft px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
              <span>Recommendation</span>
              <span>Type</span>
              <span>Date</span>
              <span>Status</span>
              <span />
            </div>
            {HISTORY_ROWS.map((r) => (
              <div key={r.title} className="grid grid-cols-[1fr_120px_130px_140px_40px] items-center gap-3 border-b border-line px-5 py-4 last:border-0 hover:bg-bg-soft">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet/10 text-violet">
                    <AdvisorIcon name={r.icon} className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold text-ink">{r.title}</div>
                    <div className="text-[11.5px] leading-relaxed text-ink-soft">{r.desc}</div>
                  </div>
                </div>
                <span className={`w-fit rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${r.typeTone}`}>{r.type}</span>
                <div className="text-[11.5px] text-ink-soft">{r.date}<br /><span className="text-ink-muted">{r.time}</span></div>
                <span className={`text-[12px] font-semibold ${r.statusTone}`}>{r.status}</span>
                <MoreVertical className="h-4 w-4 text-ink-muted" />
              </div>
            ))}
            <div className="flex items-center justify-between px-5 py-3 text-[12px] text-ink-muted">
              <span>1–5 of 24</span>
              <div className="flex items-center gap-1">
                {["‹", "1", "2", "3", "…", "5", "›"].map((p, i) => (
                  <button key={i} className={`h-7 w-7 rounded-lg text-[12px] font-semibold ${p === "1" ? "bg-violet text-white" : "text-ink-soft hover:bg-bg-soft"}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <h2 className="mb-4 text-[14px] font-bold text-ink">Activity Summary</h2>
            <div className="flex items-center gap-4">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[conic-gradient(#0F9D77_0%_33%,#F5731A_33%_83%,#C9C7D2_83%_100%)]">
                <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-[18px] font-extrabold text-ink">{HISTORY_ACTIVITY.total}</span>
                  <span className="text-[9px] text-ink-muted">Total</span>
                </div>
              </div>
              <ul className="space-y-1.5 text-[11.5px]">
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Implemented <b className="ml-auto">{HISTORY_ACTIVITY.implemented} (33%)</b></li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-brand" /> Saved for Later <b className="ml-auto">{HISTORY_ACTIVITY.saved} (50%)</b></li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-line" /> Dismissed <b className="ml-auto">{HISTORY_ACTIVITY.dismissed} (17%)</b></li>
              </ul>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <h2 className="mb-4 text-[14px] font-bold text-ink">Recent Impact <span className="text-[11px] font-normal text-ink-muted">(from Implemented)</span></h2>
            <ul className="space-y-3">
              {HISTORY_IMPACT.map((i) => (
                <li key={i.label} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold text-ink">{i.label}</span>
                    <span className="block text-[10.5px] text-ink-muted">{i.sub}</span>
                  </span>
                  <span className="text-[15px] font-extrabold text-emerald-600">{i.value}</span>
                </li>
              ))}
            </ul>
            <button className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet">
              View Analytics <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
