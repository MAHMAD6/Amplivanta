import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, Sparkles, Square } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { EmptyState, ScreenHeader, fmtDate } from "@/components/amplivanta/screen-kit";
import { Chips, FilterBar, PanelTitle, Select, giPanel, headerPrimary, outlineSm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { addEvent, deleteEvent, eventToIdea } from "@/app/(app)/app/strategy/actions";
import { connectedProviders, growthContext, monthGrid } from "@/lib/server/growth-screens";
import { EVENT_TYPES, label } from "@/lib/growth/options";

export const metadata: Metadata = { title: "Events & Holidays" };
export const dynamic = "force-dynamic";

type SP = { type?: string; country?: string; goal?: string; days?: string; month?: string; event?: string };
type Ev = { id: string; title: string; date: Date; type: string; country: string | null; goal: string | null; location: string | null; description: string | null };

export default async function EventsHolidaysPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await growthContext();
  const grid = monthGrid(sp.month);
  let monthEvents: Ev[] = [];
  let upcoming: Ev[] = [];
  let facets = { countries: [] as string[], goals: [] as string[] };
  let typeCounts = new Map<string, number>();
  let calendarConnected = false;
  if (c) {
    try {
      const w = c.workspaceId;
      const filter = { ...(sp.type ? { type: sp.type } : {}), ...(sp.country ? { country: sp.country } : {}), ...(sp.goal ? { goal: sp.goal } : {}) };
      const today = new Date(new Date().toISOString().slice(0, 10));
      const horizon = [30, 90, 180, 365].includes(Number(sp.days)) ? new Date(today.getTime() + Number(sp.days) * 86400000) : new Date(today.getTime() + 365 * 86400000);
      const sel = { id: true, title: true, date: true, type: true, country: true, goal: true, location: true, description: true } as const;
      const [m, u, all, providers] = await Promise.all([
        db.eventItem.findMany({ where: { workspaceId: w, ...filter, date: { gte: grid.start, lt: grid.end } }, orderBy: { date: "asc" }, select: sel }),
        db.eventItem.findMany({ where: { workspaceId: w, ...filter, date: { gte: today, lte: horizon } }, orderBy: { date: "asc" }, take: 12, select: sel }),
        db.eventItem.findMany({ where: { workspaceId: w }, select: { country: true, goal: true, type: true } }),
        connectedProviders(w),
      ]);
      monthEvents = m;
      upcoming = u;
      const uniq = (xs: (string | null)[]) => [...new Set(xs.filter((x): x is string => Boolean(x)))].sort();
      facets = { countries: uniq(all.map((a) => a.country)), goals: uniq(all.map((a) => a.goal)) };
      typeCounts = all.reduce((acc, a) => acc.set(a.type, (acc.get(a.type) ?? 0) + 1), new Map<string, number>());
      calendarConnected = providers.some((p) => p.provider === "google-calendar" || p.provider === "google_calendar");
    } catch {
      monthEvents = [];
    }
  }
  const selected = [...monthEvents, ...upcoming].find((e) => e.id === sp.event) ?? upcoming[0];
  const canEdit = Boolean(c?.canEdit);
  const base = Object.fromEntries(Object.entries({ type: sp.type, country: sp.country, goal: sp.goal, days: sp.days, month: sp.month }).filter(([, v]) => v)) as Record<string, string>;
  const href = (patch: Record<string, string | undefined>) => {
    const u = new URLSearchParams(base);
    for (const [k, v] of Object.entries(patch)) v ? u.set(k, v) : u.delete(k);
    return u.size ? `?${u}` : "?";
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        title="Events & Holidays"
        subtitle="Plan timely content around holidays, events, launches, and awareness dates."
        actions={
          <FormDialog
            title="Add to Calendar"
            label="Add to Calendar"
            className={headerPrimary}
            action={addEvent}
            disabled={!canEdit}
            submitLabel="Add event"
            fields={[
              { name: "title", label: "Event", kind: "text", required: true },
              { name: "date", label: "Date", kind: "date", required: true },
              { name: "type", label: "Type", kind: "select", options: EVENT_TYPES, defaultValue: "custom" },
              { name: "country", label: "Country / locale", kind: "text" },
              { name: "goal", label: "Related goal", kind: "text" },
              { name: "location", label: "Location", kind: "text" },
              { name: "description", label: "Notes", kind: "textarea", rows: 3 },
            ]}
          />
        }
      />
      <FilterBar>
        <Select name="type" value={sp.type} all="All Event Types" options={EVENT_TYPES} label="Event type" />
        <Select name="country" value={sp.country} all="Country / Locale" options={facets.countries.map((x) => [x, x])} label="Country" />
        <Select name="goal" value={sp.goal} all="All Goals" options={facets.goals.map((x) => [x, x])} label="Goal" />
        <Select name="days" value={sp.days} all="Date Range" options={[["30", "Next 30 days"], ["90", "Next 90 days"], ["180", "Next 6 months"], ["365", "Next 12 months"]]} label="Date range" />
      </FilterBar>
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className={giPanel}>
          <PanelTitle hint="Events in the selected month">Event Calendar</PanelTitle>
          <div className="rounded-lg border border-line p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[14px] font-semibold text-deep-navy">{grid.title}</span>
              <span className="flex items-center gap-2 text-[12.5px]">
                <Link href={href({ month: grid.prev, event: undefined })} className="rounded border border-line px-2 py-0.5 hover:bg-bg-soft" aria-label="Previous month">‹</Link>
                <span className="text-deep-navy">Month view</span>
                <Link href={href({ month: grid.next, event: undefined })} className="rounded border border-line px-2 py-0.5 hover:bg-bg-soft" aria-label="Next month">›</Link>
              </span>
            </div>
            <div className="overflow-x-auto">
              <div className="grid min-w-[520px] grid-cols-7 gap-1.5">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="text-[11px] text-ink-muted">{d}</div>)}
                {grid.cells.map((day) => {
                  const k = day.toISOString().slice(0, 10);
                  const evs = monthEvents.filter((e) => e.date.toISOString().slice(0, 10) === k);
                  const out = day.getUTCMonth() !== grid.month.getUTCMonth();
                  return (
                    <div key={k} className={cn("min-h-[56px] rounded-md border border-line p-1", out && "bg-bg-soft/50")}>
                      <div className="text-[10.5px] text-ink-muted">{day.getUTCDate()}</div>
                      {evs.slice(0, 2).map((e) => <Link key={e.id} href={href({ event: e.id })} title={e.title} className="block truncate rounded bg-royal-tint px-1 text-[10.5px] text-[#0B5CFF]">{e.title}</Link>)}
                      {evs.length > 2 && <div className="text-[10px] text-ink-muted">+{evs.length - 2}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Next events matching filters">Upcoming Events</PanelTitle>
          {upcoming.length ? (
            <ul className="divide-y divide-line">
              {upcoming.map((e) => (
                <li key={e.id} className={cn("flex items-center justify-between gap-2 px-2 py-2.5", selected?.id === e.id && "bg-royal-tint/40")}>
                  <Link href={href({ event: e.id })} className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-deep-navy">{e.title}</div>
                    <div className="text-[11.5px] text-ink-muted">{label(EVENT_TYPES, e.type)}{e.country ? ` · ${e.country}` : ""}{e.location ? ` · ${e.location}` : ""}</div>
                  </Link>
                  <span className="shrink-0 text-[12px] text-ink-soft">{fmtDate(e.date)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Square} title="No events available" body="Events matching your locale and filters will appear here." />
          )}
        </section>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className={giPanel}>
          <PanelTitle hint="Plan content for the selected event">Content Opportunities</PanelTitle>
          {selected ? (
            <div>
              <div className="text-[14px] font-semibold text-deep-navy">{selected.title}</div>
              <div className="text-[12px] text-ink-soft">{fmtDate(selected.date)} · {label(EVENT_TYPES, selected.type)}</div>
              {selected.description && <p className="mt-2 text-[12.5px] text-ink-soft">{selected.description}</p>}
              {canEdit && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <ActButton action={eventToIdea.bind(null, selected.id)} className="text-[#0B5CFF]">Save as content idea</ActButton>
                  <Link href="/app/content-intelligence#generator" className="inline-flex items-center rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-deep-navy hover:bg-bg-soft">Generate ideas</Link>
                  <ActButton action={deleteEvent.bind(null, selected.id)} confirm="Remove this event?">Remove</ActButton>
                </div>
              )}
            </div>
          ) : (
            <EmptyState icon={Sparkles} title="No opportunities yet" body="Select an event to plan context-aware content ideas." />
          )}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Two-way calendar sync">Calendar Sync</PanelTitle>
          {calendarConnected ? (
            <EmptyState icon={RefreshCw} title="Calendar connected" body="Syncing selected events to the connected calendar is not available yet." />
          ) : (
            <EmptyState icon={RefreshCw} title="Calendar not connected" body="Connect a supported calendar to sync selected events." action={<Link href="/app/integrations#catalog" className={outlineSm}>Connect Calendar</Link>} />
          )}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Filter by category">Event Categories</PanelTitle>
          <Chips items={EVENT_TYPES.filter(([v]) => v !== "custom" || typeCounts.has("custom")).map(([v, l]) => ({ label: l, href: href({ type: sp.type === v ? undefined : v, event: undefined }), active: sp.type === v, count: typeCounts.get(v) }))} />
        </section>
      </div>
    </div>
  );
}
