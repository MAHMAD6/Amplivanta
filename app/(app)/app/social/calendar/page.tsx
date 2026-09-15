import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, FileText, Info, ListChecks, Send, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState, fmtDateTime, kitField, kitOutline, kitPrimary } from "@/components/amplivanta/screen-kit";
import { excerpt, loadPosts, socialContext, socialCounts } from "@/lib/server/social-screens";
import { POST_STATUSES, SOCIAL_PLATFORMS, platformLabel, statusTone } from "@/lib/social/platforms";

export const metadata: Metadata = { title: "Content Calendar" };
export const dynamic = "force-dynamic";

type SP = { view?: string; month?: string; date?: string; status?: string; platform?: string };

const DAY = 86400000;
const dot = { gray: "bg-ink-muted", green: "bg-emerald-500", blue: "bg-[#0B5CFF]", amber: "bg-amber-500", red: "bg-red-500", violet: "bg-violet" };

function parseMonth(raw?: string) {
  const m = /^(\d{4})-(\d{2})$/.exec(raw ?? "");
  const now = new Date();
  return m ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1)) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}
const ym = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
const ymd = (d: Date) => d.toISOString().slice(0, 10);

export default async function CalendarPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const view = sp.view === "week" || sp.view === "day" ? sp.view : "month";
  const month = parseMonth(sp.month);
  const focus = /^\d{4}-\d{2}-\d{2}$/.test(sp.date ?? "") ? new Date(`${sp.date}T00:00:00Z`) : new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));

  // Visible range per view.
  let start: Date;
  let days: number;
  if (view === "month") {
    start = new Date(month.getTime() - month.getUTCDay() * DAY);
    const inMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
    days = Math.ceil((inMonth + month.getUTCDay()) / 7) * 7;
  } else if (view === "week") {
    start = new Date(focus.getTime() - focus.getUTCDay() * DAY);
    days = 7;
  } else {
    start = focus;
    days = 1;
  }
  const end = new Date(start.getTime() + days * DAY);

  const c = await socialContext();
  const filter = {
    ...(sp.status ? { status: sp.status } : { status: { not: "archived" } }),
    ...(sp.platform ? { platforms: { has: sp.platform } } : {}),
  };
  let posts: Awaited<ReturnType<typeof loadPosts>> = [];
  let upcoming: typeof posts = [];
  let drafts: typeof posts = [];
  let queue = 0;
  let reachable = Boolean(c);
  if (c) {
    try {
      const [inRange, up, dr, counts] = await Promise.all([
        loadPosts(c.workspaceId, { ...filter, scheduledAt: { gte: start, lt: end } }, 500),
        loadPosts(c.workspaceId, { status: { in: ["scheduled", "approved", "pending_approval"] }, scheduledAt: { gte: new Date() } }, 4),
        loadPosts(c.workspaceId, { status: "draft", scheduledAt: null }, 4),
        socialCounts(c.workspaceId),
      ]);
      posts = inRange;
      upcoming = up;
      drafts = dr;
      queue = counts.scheduled + counts.approved;
    } catch {
      reachable = false;
    }
  }

  const byDay = new Map<string, typeof posts>();
  for (const p of posts) {
    if (!p.scheduledAt) continue;
    const k = ymd(p.scheduledAt);
    byDay.set(k, [...(byDay.get(k) ?? []), p]);
  }

  const qs = (patch: Partial<SP>) => {
    const merged = { ...sp, view, ...patch };
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) u.set(k, String(v));
    return `/app/social/calendar?${u.toString()}`;
  };
  const prev = view === "month" ? qs({ month: ym(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() - 1, 1))) }) : qs({ date: ymd(new Date(focus.getTime() - (view === "week" ? 7 : 1) * DAY)) });
  const next = view === "month" ? qs({ month: ym(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1))) }) : qs({ date: ymd(new Date(focus.getTime() + (view === "week" ? 7 : 1) * DAY)) });
  const title =
    view === "month"
      ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(month)
      : view === "week"
        ? `Week of ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(start)}`
        : new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeZone: "UTC" }).format(focus);
  const todayKey = ymd(new Date());

  const rail = (Icon: typeof CalendarDays, heading: string, body: React.ReactNode) => (
    <section className="rounded-xl border border-line bg-white p-5">
      <h2 className="mb-3 flex items-center gap-2.5 text-[15px] font-semibold text-deep-navy">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Icon className="h-4 w-4" /></span> {heading}
      </h2>
      {body}
    </section>
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[30px] font-bold text-deep-navy">Content Calendar</h1>
      <p className="mb-5 mt-1 text-[14.5px] text-ink-soft">Plan and organize your drafts, scheduled posts, and published content.</p>

      <form method="get" className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white px-5 py-3.5">
        <div className="flex overflow-hidden rounded-md border border-line">
          {(["month", "week", "day"] as const).map((v) => (
            <Link key={v} href={qs({ view: v })} className={cn("px-5 py-2 text-[13.5px] font-semibold capitalize", view === v ? "bg-[#0B5CFF] text-white" : "text-deep-navy hover:bg-bg-soft")}>{v}</Link>
          ))}
        </div>
        <Link href={prev} aria-label="Previous" className="rounded-md border border-line p-2 hover:bg-bg-soft"><ChevronLeft className="h-4 w-4" /></Link>
        <span className="min-w-[180px] text-center text-[14px] font-semibold text-deep-navy">{title}</span>
        <Link href={next} aria-label="Next" className="rounded-md border border-line p-2 hover:bg-bg-soft"><ChevronRight className="h-4 w-4" /></Link>
        <Link href={qs({ month: undefined, date: undefined })} className={kitOutline}>Today</Link>
        <input type="hidden" name="view" value={view} />
        {sp.month && <input type="hidden" name="month" value={sp.month} />}
        {sp.date && <input type="hidden" name="date" value={sp.date} />}
        <select name="status" defaultValue={sp.status ?? ""} aria-label="Status" className={cn(kitField, "ml-auto w-[160px]")}>
          <option value="">All Statuses</option>
          {POST_STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select name="platform" defaultValue={sp.platform ?? ""} aria-label="Platform" className={cn(kitField, "w-[170px]")}>
          <option value="">All Accounts</option>
          {SOCIAL_PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <button type="submit" className={kitOutline}>Apply</button>
        <Link href="/app/social/compose" className={kitPrimary}><SquarePen className="h-4 w-4" /> Compose Post</Link>
      </form>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_500px]">
        <section className="relative min-w-0 overflow-x-auto rounded-xl border border-line bg-white p-2">
          <div className={cn("grid min-w-[700px]", view === "day" ? "grid-cols-1" : "grid-cols-7")}>
            {(view === "day" ? [focus] : Array.from({ length: 7 }, (_, i) => new Date(start.getTime() + i * DAY))).map((d) => (
              <div key={d.getUTCDay()} className="border-b border-line py-3 text-center text-[14px] font-semibold text-deep-navy">
                {new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(d)}
              </div>
            ))}
            {Array.from({ length: days }, (_, i) => {
              const d = new Date(start.getTime() + i * DAY);
              const key = ymd(d);
              const list = byDay.get(key) ?? [];
              const outside = view === "month" && d.getUTCMonth() !== month.getUTCMonth();
              return (
                <div key={key} className={cn("border-b border-r border-line p-1.5", view === "month" ? "min-h-[112px]" : "min-h-[420px]", outside && "bg-bg-soft/40")}>
                  <div className={cn("mb-1 text-right text-[12px]", key === todayKey ? "font-bold text-[#0B5CFF]" : outside ? "text-ink-muted" : "text-deep-navy")}>{d.getUTCDate()}</div>
                  <ul className="space-y-1">
                    {list.slice(0, view === "month" ? 3 : 20).map((p) => (
                      <li key={p.id} className="rounded bg-royal-tint/50 px-1.5 py-1 text-[11px] text-deep-navy" title={p.content}>
                        <span className={cn("mr-1 inline-block h-1.5 w-1.5 rounded-full", dot[statusTone(p.status)])} />
                        {p.scheduledAt && new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(p.scheduledAt)} {excerpt(p.content, view === "month" ? 22 : 80)}
                      </li>
                    ))}
                    {list.length > 3 && view === "month" && <li className="text-[11px] text-ink-muted">+{list.length - 3} more</li>}
                  </ul>
                </div>
              );
            })}
          </div>
          {posts.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="pointer-events-auto rounded-xl bg-white/90 px-6">
                <EmptyState
                  icon={CalendarDays}
                  title={reachable ? "No scheduled content" : "Calendar unavailable"}
                  body={reachable ? "Your calendar is clear. Start by creating a post or scheduling content." : "Scheduled content could not be loaded right now."}
                  action={reachable ? <Link href="/app/social/compose" className={kitOutline}>Compose Your First Post</Link> : undefined}
                />
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          {rail(CalendarDays, "Upcoming Schedule", upcoming.length ? (
            <ul className="divide-y divide-line">{upcoming.map((p) => <li key={p.id} className="py-2 text-[13px]"><div className="truncate font-semibold text-deep-navy">{excerpt(p.content, 60)}</div><div className="text-[12px] text-ink-muted">{fmtDateTime(p.scheduledAt)} · {p.platforms.map(platformLabel).join(", ")}</div></li>)}</ul>
          ) : <p className="text-[13px] text-ink-soft">No upcoming content. Schedule posts to see them here.</p>)}
          {rail(FileText, "Unscheduled Drafts", drafts.length ? (
            <ul className="divide-y divide-line">{drafts.map((p) => <li key={p.id} className="truncate py-2 text-[13px] text-deep-navy">{excerpt(p.content, 70)}</li>)}<li className="pt-2"><Link href="/app/social/posts?status=draft" className="text-[12.5px] font-semibold text-[#0B5CFF]">All drafts</Link></li></ul>
          ) : <p className="text-[13px] text-ink-soft">No drafts yet. Create a draft to get started.</p>)}
          {rail(Send, "Queue Health", queue ? (
            <p className="text-[13px] text-ink-soft"><span className="font-semibold text-deep-navy">{queue}</span> post{queue === 1 ? "" : "s"} waiting to publish. <Link href="/app/social/queue" className="font-semibold text-[#0B5CFF]">Open queue</Link></p>
          ) : <p className="text-[13px] text-ink-soft">Your publishing queue is empty. Schedule content to see queue health.</p>)}
          {rail(Info, "How It Works", (
            <ul className="space-y-3 text-[13px]">
              <li><div className="font-semibold text-deep-navy">Schedule from the composer</div><div className="text-ink-soft">Pick a date and time when composing a post.</div></li>
              <li><div className="flex items-center gap-1.5 font-semibold text-deep-navy"><ListChecks className="h-4 w-4" /> Synced with the queue</div><div className="text-ink-soft">Scheduled posts appear in the Publishing Queue.</div></li>
              <li><div className="font-semibold text-deep-navy">Stay organized</div><div className="text-ink-soft">Filter by status or platform to plan ahead.</div></li>
            </ul>
          ))}
        </aside>
      </div>
    </div>
  );
}
