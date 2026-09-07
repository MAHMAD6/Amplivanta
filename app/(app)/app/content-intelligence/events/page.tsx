import type { Metadata } from "next";
import { Sparkles, Calendar, CalendarCheck, Star, Plus } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { IntelSubnav } from "@/components/amplivanta/intel-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { EVENTS } from "@/lib/intel-data";

export const metadata: Metadata = { title: "Events & Holidays" };

const CAT_TONE = { Holiday: "amber", Awareness: "blue", Industry: "violet", Company: "pink" } as const;

export default function EventsPage() {
  const highImpact = EVENTS.filter((e) => e.opportunityScore >= 80);
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Events & Holidays"
        subtitle="Plan timely content around holidays, events, awareness dates."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><CalendarCheck className="h-3.5 w-3.5" /> Sync Calendar</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Plus className="h-3.5 w-3.5" /> Custom Event</button>
          </>
        }
      />
      <IntelSubnav />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Calendar} label="Upcoming Events" value={String(EVENTS.length)} tone="violet" />
        <KpiCard icon={Star} label="High Impact" value={String(highImpact.length)} tone="pink" />
        <KpiCard icon={CalendarCheck} label="Holidays (30d)" value={null} tone="amber" />
        <KpiCard icon={Sparkles} label="Suggestions" value={null} tone="green" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {["All", "Holiday", "Awareness", "Industry", "Company"].map((c, i) => (
          <button key={c} className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${i === 0 ? "border-violet/40 bg-violet/10 text-violet" : "border-line bg-white text-ink-soft"}`}>{c}</button>
        ))}
        <select className="ml-auto rounded-xl border border-line bg-white px-3 py-2 text-[12px]"><option>Country: US</option><option>EU</option><option>Global</option></select>
        <select className="rounded-xl border border-line bg-white px-3 py-2 text-[12px]"><option>Goal: Any</option><option>Awareness</option><option>Lead Gen</option><option>Retention</option></select>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Calendar */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card lg:col-span-2">
          <div className="mb-3 text-[14px] font-bold text-ink">September 2026</div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="p-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">{d}</div>
            ))}
            {Array.from({ length: 30 }, (_, i) => {
              const day = i + 1;
              const has = EVENTS.find((e) => e.date.includes(`Sep ${day},`));
              return (
                <div key={day} className={`min-h-[60px] rounded-lg border p-1 text-left ${has ? "border-violet/40 bg-violet/[0.04]" : "border-line"}`}>
                  <div className="text-[10.5px] font-bold text-ink">{day}</div>
                  {has && <div className="mt-0.5 truncate rounded bg-violet/15 px-1 py-0.5 text-[9px] font-semibold text-violet">{has.name.split(" ").slice(0, 2).join(" ")}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event categories */}
        <div className="space-y-3">
          {[
            { label: "Company", count: 1, tone: "bg-pink-brand/10 text-pink-brand" },
            { label: "Industry", count: 1, tone: "bg-violet/10 text-violet" },
            { label: "Awareness", count: 2, tone: "bg-blue-500/10 text-blue-600" },
            { label: "Holiday", count: 2, tone: "bg-amber-500/10 text-amber-700" },
          ].map((c) => (
            <div key={c.label} className={`rounded-2xl p-4 ${c.tone}`}>
              <div className="text-[10.5px] font-bold uppercase tracking-wider">{c.label}</div>
              <div className="text-2xl font-extrabold">{c.count}</div>
              <div className="text-[11px] opacity-70">next 90 days</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white shadow-card">
        <div className="border-b border-line p-4"><div className="text-[14px] font-bold text-ink">Event List</div></div>
        <div className="divide-y divide-line">
          {EVENTS.map((e) => (
            <div key={e.id} className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[100px_1fr_180px] lg:items-center">
              <div>
                <div className="text-[12px] font-bold text-violet">{e.date}</div>
                <StatusPill tone={CAT_TONE[e.category]} className="mt-1">{e.category}</StatusPill>
              </div>
              <div>
                <div className="text-[14px] font-bold text-ink">{e.name}</div>
                <div className="text-[11.5px] text-ink-muted">{e.country}</div>
                <div className="mt-1 text-[12px] text-ink-soft"><span className="font-semibold">Suggested: </span>{e.suggestedContent}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <div className="text-[10.5px] text-ink-muted">Opportunity</div>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${e.opportunityScore >= 80 ? "bg-emerald-500/10 text-emerald-600" : e.opportunityScore >= 60 ? "bg-amber-500/10 text-amber-700" : "bg-ink/10 text-ink-soft"}`}>{e.opportunityScore}</span>
                </div>
                <button className="inline-flex items-center gap-1 rounded-xl bg-grad-cta px-3 py-1.5 text-[11.5px] font-bold text-white shadow-violet">
                  <Sparkles className="h-3 w-3" /> Generate Ideas
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
