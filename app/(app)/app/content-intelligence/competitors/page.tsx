import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  FileText,
  Lightbulb,
  Link2,
  List,
  Lock,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { cn } from "@/lib/utils";
import { AddCompetitorButton, CompetitorRowActions, FindCompetitorsButton } from "@/components/amplivanta/competitor-watch-ui";
import { isDataForSeoConfigured } from "@/lib/providers/dataforseo";
import { MAX_TRACKED } from "@/lib/server/competitor-intel";

export const metadata: Metadata = { title: "Competitor Watch" };
export const dynamic = "force-dynamic";

const BASE = "/app/content-intelligence/competitors";

const TABS = [
  ["overview", "Overview"],
  ["competitors", "Competitors"],
  ["keywords", "Keywords"],
  ["content", "Content"],
  ["ads", "Ads"],
  ["social", "Social"],
  ["opportunities", "Opportunities"],
  ["alerts", "Alerts"],
  ["settings", "Settings"],
] as const;

/** What each data tab needs before it can show anything real. */
const TAB_SOURCES: Record<string, [string, string]> = {
  ads: ["No ad activity yet", "Competitor ad activity appears once an advertising data source is connected."],
  social: ["No social activity yet", "Posting cadence and themes appear once social monitoring is connected for tracked competitors."],
  settings: ["Tracking settings", "Choose which competitors are tracked from the Competitors tab. Search data refreshes weekly; ads and social channels appear here once those monitoring sources are connected."],
};

const FIND_POINTS = [
  "Discover competitors from your website, industry and keywords",
  "See why each competitor was identified",
  "Track content, SEO, ads and social activity",
  "Find gaps and growth opportunities",
  "Turn insights into content, campaigns and strategy",
];

const HOW: [LucideIcon, string, string, string][] = [
  [Link2, "Tell us about your business", "Use your website, industry, location and keywords.", "bg-royal-tint text-royal-blue"],
  [Search, "We find relevant competitors", "Powered by search, content, ads and market data.", "bg-royal-tint text-royal-blue"],
  [CircleCheck, "You review and select", "Choose which competitors to track.", "bg-emerald-50 text-emerald-600"],
  [BarChart3, "Get insights and opportunities", "Monitor activity and take action across Amplivanta.", "bg-violet/10 text-violet"],
];

type Row = { id: string; name: string; website: string | null; type: string; source: string; trackingEnabled: boolean; updatedAt: Date; lastRefreshedAt: Date | null; reason: string | null };
type Kw = { id: string; competitorId: string; keyword: string; position: number | null; searchVolume: number | null; url: string | null; capturedAt: Date };
type Gap = { id: string; competitorId: string; keyword: string; ourPosition: number | null; theirPosition: number | null; kind: string; searchVolume: number | null };
type PageRow = { id: string; competitorId: string; url: string; organicCount: number | null; etv: number | null; capturedAt: Date };
type Signal = { id: string; competitorId: string | null; kind: string; title: string; severity: string; createdAt: Date };

const num = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("en-US"));
const shortDate = (d: Date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
const SEVERITY_TONE: Record<string, string> = { high: "bg-red-50 text-red-600", medium: "bg-orange-50 text-orange-600", low: "bg-bg-soft text-ink-soft" };

function DataTable({ head, rows, empty }: { head: string[]; rows: React.ReactNode[][]; empty: React.ReactNode }) {
  if (rows.length === 0) return <>{empty}</>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-y border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            {head.map((h, i) => <th key={h} className={cn("px-4 py-3", i > 1 && "text-right")}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, r) => (
            <tr key={r} className="border-b border-line last:border-0">
              {cells.map((c, i) => <td key={i} className={cn("px-4 py-3 text-[12.5px] text-ink-soft", i === 0 && "font-bold text-deep-navy", i > 1 && "text-right tabular-nums")}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SignalList({ signals, names }: { signals: Signal[]; names: Map<string, string> }) {
  return (
    <ul className="divide-y divide-line">
      {signals.map((s) => (
        <li key={s.id} className="flex items-start gap-3 py-3">
          <span className={cn("mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase", SEVERITY_TONE[s.severity] ?? SEVERITY_TONE.low)}>{s.severity}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] text-deep-navy">{s.title}</div>
            <div className="mt-0.5 text-[11.5px] text-ink-muted">{s.competitorId ? names.get(s.competitorId) ?? "Removed competitor" : "Workspace"} · {shortDate(s.createdAt)}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-line bg-white shadow-card", className)}>{children}</div>;
}

function Empty({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-bg-soft/70 px-6 py-8 text-center">
      <Icon className="h-7 w-7 text-deep-navy/70" />
      <div className="mt-2 text-[14px] font-bold text-deep-navy">{title}</div>
      <p className="mt-1 max-w-[420px] text-[12.5px] text-ink-soft">{body}</p>
    </div>
  );
}

function CompetitorTable({ rows, reachable, canRefresh }: { rows: Row[]; reachable: boolean; canRefresh: boolean }) {
  const date = (d: Date) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-y border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            <th className="px-4 py-3">Competitor</th>
            <th className="px-4 py-3">Website</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Tracking</th>
            <th className="px-4 py-3">Search data</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3">
                <div className="text-[13px] font-bold text-deep-navy">{r.name}</div>
                {r.source === "discovered" && r.reason && <div className="mt-0.5 max-w-[280px] text-[11px] text-ink-muted">{r.reason}</div>}
              </td>
              <td className="px-4 py-3 text-[12.5px] text-ink-soft">{r.website ?? "—"}</td>
              <td className="px-4 py-3 text-[12.5px] capitalize text-ink-soft">{r.type}</td>
              <td className="px-4 py-3">
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", r.trackingEnabled ? "bg-emerald-50 text-emerald-700" : "bg-bg-soft text-ink-muted")}>
                  {r.trackingEnabled ? "Active" : "Paused"}
                </span>
              </td>
              <td className="px-4 py-3 text-[12.5px] text-ink-soft">{r.lastRefreshedAt ? date(r.lastRefreshedAt) : "Not collected yet"}</td>
              <td className="px-4 py-3"><CompetitorRowActions id={r.id} tracking={r.trackingEnabled} canRefresh={canRefresh && Boolean(r.website)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="px-4 py-8">
          <Empty
            icon={Users}
            title={reachable ? "No competitors yet" : "Competitors unavailable"}
            body={reachable ? "Find competitors or add one manually to get started." : "The database could not be reached, so tracked competitors cannot be shown."}
          />
        </div>
      )}
    </div>
  );
}

export default async function CompetitorWatchPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: rawTab = "overview" } = await searchParams;
  const tab = TABS.some(([k]) => k === rawTab) ? rawTab : "overview";

  let rows: Row[] = [];
  let keywords: Kw[] = [];
  let gaps: Gap[] = [];
  let pages: PageRow[] = [];
  let signals: Signal[] = [];
  let reachable = true;
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  try {
    const ctx = await getSessionContext();
    const ws = ctx.workspaceId;
    [rows, keywords, gaps, pages, signals] = await Promise.all([
      db.competitor.findMany({
        where: { workspaceId: ws },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { id: true, name: true, website: true, type: true, source: true, trackingEnabled: true, updatedAt: true, lastRefreshedAt: true, reason: true },
      }),
      db.competitorKeyword.findMany({ where: { workspaceId: ws }, orderBy: [{ searchVolume: { sort: "desc", nulls: "last" } }], take: 200 }),
      db.competitorKeywordGap.findMany({ where: { workspaceId: ws }, orderBy: [{ searchVolume: { sort: "desc", nulls: "last" } }], take: 300 }),
      db.competitorPage.findMany({ where: { workspaceId: ws }, orderBy: [{ etv: { sort: "desc", nulls: "last" } }], take: 100 }),
      db.competitorSignal.findMany({ where: { workspaceId: ws, createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 100 }),
    ]);
  } catch {
    reachable = false;
  }
  const tracked = rows.filter((r) => r.trackingEnabled).length;
  const names = new Map(rows.map((r) => [r.id, r.name]));
  const configured = isDataForSeoConfigured();
  const collected = rows.some((r) => r.lastRefreshedAt);
  const opportunities = gaps.filter((g) => g.kind === "missing" || g.kind === "disadvantage");
  const significant = signals.filter((s) => s.severity === "high");

  // Figures appear only once search data has actually been collected.
  const STATS: [LucideIcon, string, string | null, string, string][] = [
    [Users, "Competitors Tracked", reachable ? `${tracked}/${MAX_TRACKED()}` : null, "Add or discover competitors", "bg-royal-tint text-royal-blue"],
    [FileText, "New Signals", collected ? String(signals.length) : null, "Ranking and page changes, last 30 days", "bg-emerald-50 text-emerald-600"],
    [Lightbulb, "Priority Opportunities", collected && gaps.length ? String(opportunities.length) : null, "Keywords competitors win and you don't", "bg-orange-50 text-orange-500"],
    [Bell, "Significant Changes", collected ? String(significant.length) : null, "High-impact movements, last 30 days", "bg-red-50 text-red-500"],
  ];

  const notReady = (what: string) =>
    !configured
      ? `${what} appears once the search-data provider is configured for this workspace.`
      : rows.length === 0
        ? `Add competitors to collect ${what.toLowerCase()}.`
        : `${what} appears after the first refresh of your tracked competitors (weekly, or use refresh on the Competitors tab).`;

  // Weekly signal counts for the trend card (last 8 weeks of stored signals).
  const weeks = Array.from({ length: 5 }, (_, i) => {
    const end = Date.now() - i * 7 * 24 * 60 * 60 * 1000;
    const start = end - 7 * 24 * 60 * 60 * 1000;
    return { label: shortDate(new Date(start)), count: signals.filter((s) => s.createdAt.getTime() > start && s.createdAt.getTime() <= end).length };
  }).reverse();
  const weekMax = Math.max(1, ...weeks.map((w) => w.count));

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12.5px] text-ink-soft">
            <Link href="/app/strategy" className="hover:text-royal-blue">Growth Intelligence</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-deep-navy">Competitor Watch</span>
          </nav>
          <h1 className="mt-1 font-display text-[30px] font-extrabold text-deep-navy">Competitor Watch</h1>
          <p className="mt-1 text-[14px] text-ink-soft">Discover, monitor and learn from your competitors to find opportunities and grow faster.</p>
        </div>
        <div
          className="flex h-11 items-center gap-2.5 rounded-xl border border-line bg-white px-4 text-[13px] font-bold text-deep-navy"
          title="Other ranges become available once tracked activity exists"
        >
          <CalendarDays className="h-4 w-4" /> Last 30 days <ChevronDown className="h-4 w-4 text-ink-muted" />
        </div>
      </div>

      <nav aria-label="Competitor Watch sections" className="no-scrollbar mb-5 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map(([key, label]) => (
          <Link
            key={key}
            href={key === "overview" ? BASE : `${BASE}?tab=${key}`}
            className={cn(
              "shrink-0 px-3.5 py-2.5 text-[13.5px] font-semibold",
              key === tab ? "-mb-px border-b-2 border-royal-blue text-royal-blue" : "text-ink-soft hover:text-deep-navy",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      {tab === "overview" && (
        <>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STATS.map(([Icon, label, value, hint, tone]) => (
              <Card key={label} className="flex items-center gap-4 p-5">
                <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl", tone)}>
                  <Icon className="h-7 w-7" />
                </span>
                <div>
                  <div className="text-[13px] font-bold text-deep-navy">{label}</div>
                  <div className="mt-1 text-[22px] font-extrabold leading-none text-deep-navy">{value ?? "—"}</div>
                  <div className="mt-1.5 text-[12px] text-ink-soft">{hint}</div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <Card className="p-6">
              <h2 className="text-[20px] font-extrabold text-deep-navy">Find Your Competitors</h2>
              <p className="mt-1 text-[13.5px] text-ink-soft">Let Amplivanta discover businesses competing for your market — or add one manually.</p>
              <div className="mt-5 grid grid-cols-1 items-center gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
                {/* Decorative illustration */}
                <div aria-hidden className="relative mx-auto hidden h-[170px] w-[240px] md:block">
                  <div className="absolute left-10 top-2 h-[140px] w-[150px] rounded-xl border border-line bg-white shadow-card">
                    <div className="flex gap-1 rounded-t-xl bg-royal-blue/90 px-3 py-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" /><span className="h-1.5 w-1.5 rounded-full bg-white" /><span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                    <Search className="mx-auto mt-3 h-20 w-20 text-deep-navy" strokeWidth={2.5} />
                  </div>
                  <span className="absolute left-0 top-10 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white shadow-card"><List className="h-5 w-5 text-royal-blue" /></span>
                  <span className="absolute bottom-2 left-0 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white shadow-card"><Building2 className="h-5 w-5 text-royal-blue" /></span>
                  <span className="absolute right-0 top-12 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white shadow-card"><TrendingUp className="h-5 w-5 text-royal-blue" /></span>
                  <span className="absolute bottom-4 right-6 flex h-11 w-11 items-center justify-center rounded-xl bg-violet/80"><BarChart3 className="h-5 w-5 text-white" /></span>
                </div>
                <div>
                  <ul className="space-y-2">
                    {FIND_POINTS.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-[13px] text-ink-soft">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-royal-blue" /> {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FindCompetitorsButton />
                    <AddCompetitorButton />
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-[12px] text-ink-muted">
                    <Lock className="h-3.5 w-3.5" /> No competitors are added without your confirmation.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-[20px] font-extrabold text-deep-navy">How Competitor Discovery Works</h2>
              <ol className="mt-4 space-y-3">
                {HOW.map(([Icon, title, body, tone], i) => (
                  <li key={title} className="flex items-start gap-3 border-b border-line pb-3 last:border-0">
                    <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-royal-blue text-[11.5px] font-bold text-white">{i + 1}</span>
                    <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", tone)}><Icon className="h-5 w-5" /></span>
                    <div>
                      <div className="text-[13.5px] font-bold text-deep-navy">{title}</div>
                      <div className="text-[12.5px] text-ink-soft">{body}</div>
                    </div>
                  </li>
                ))}
              </ol>
              <Link href="/resources/help-center" className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-bold text-royal-blue hover:underline">
                Learn more about Competitor Watch <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <Card className="p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[18px] font-extrabold text-deep-navy">Competitive Activity Trend</h2>
                  <p className="text-[12.5px] text-ink-soft">Track content, social, ad and search activity across your competitors.</p>
                </div>
              </div>
              {signals.length === 0 ? (
                <Empty icon={BarChart3} title="No data yet" body={notReady("Search activity")} />
              ) : (
                <div className="flex h-[170px] items-end gap-4 px-2" role="img" aria-label="Signals per week">
                  {weeks.map((w) => (
                    <div key={w.label} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="text-[11.5px] font-bold text-deep-navy">{w.count}</span>
                      <div className="w-full max-w-[48px] rounded-t-lg bg-royal-blue/80" style={{ height: `${Math.max(4, (w.count / weekMax) * 120)}px` }} />
                      <span className="text-[11px] text-ink-muted">{w.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card className="p-5">
              <h2 className="text-[18px] font-extrabold text-deep-navy">Priority Opportunities</h2>
              <p className="mb-3 text-[12.5px] text-ink-soft">Areas where you can gain an advantage.</p>
              {opportunities.length === 0 ? (
                <Empty icon={Lightbulb} title="No opportunities yet" body={notReady("Keyword opportunities")} />
              ) : (
                <ul className="divide-y divide-line">
                  {opportunities.slice(0, 5).map((g) => (
                    <li key={g.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-bold text-deep-navy">{g.keyword}</div>
                        <div className="text-[11.5px] text-ink-muted">{names.get(g.competitorId) ?? "Competitor"} ranks #{g.theirPosition ?? "—"} · you {g.ourPosition ? `#${g.ourPosition}` : "not in top 20"}</div>
                      </div>
                      <span className="shrink-0 text-[11.5px] text-ink-soft">{num(g.searchVolume)} / mo</span>
                    </li>
                  ))}
                  <li className="pt-2.5"><Link href={`${BASE}?tab=opportunities`} className="inline-flex items-center gap-1 text-[12.5px] font-bold text-royal-blue hover:underline">All opportunities <ArrowRight className="h-3.5 w-3.5" /></Link></li>
                </ul>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <Card className="p-5">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[18px] font-extrabold text-deep-navy">Tracked Competitors</h2>
                  <p className="text-[12.5px] text-ink-soft">Monitor and compare your competitors&apos; activity.</p>
                </div>
                <AddCompetitorButton variant="solid" label="Add Competitor" />
              </div>
              <CompetitorTable rows={rows.slice(0, 5)} reachable={reachable} canRefresh={configured} />
              {rows.length > 5 && (
                <Link href={`${BASE}?tab=competitors`} className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-bold text-royal-blue hover:underline">
                  View all {rows.length} competitors <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </Card>
            <Card className="p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[18px] font-extrabold text-deep-navy">Recent Significant Changes</h2>
                  <p className="text-[12.5px] text-ink-soft">Important updates from your tracked competitors.</p>
                </div>
                <Link href={`${BASE}?tab=alerts`} className="inline-flex items-center gap-1 text-[13px] font-bold text-royal-blue hover:underline">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {signals.length === 0 ? (
                <Empty icon={Bell} title="No updates yet" body={notReady("Competitor changes")} />
              ) : (
                <SignalList signals={(significant.length ? significant : signals).slice(0, 5)} names={names} />
              )}
            </Card>
          </div>
        </>
      )}

      {tab === "competitors" && (
        <Card className="p-5">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-extrabold text-deep-navy">Tracked Competitors</h2>
              <p className="text-[12.5px] text-ink-soft">{rows.length} in this workspace · {tracked} of {MAX_TRACKED()} actively tracked</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AddCompetitorButton variant="solid" label="Add Competitor" />
            </div>
          </div>
          <CompetitorTable rows={rows} reachable={reachable} canRefresh={configured} />
        </Card>
      )}

      {tab === "keywords" && (
        <Card className="p-5">
          <h2 className="text-[18px] font-extrabold text-deep-navy">Competitor Keywords</h2>
          <p className="mb-3 text-[12.5px] text-ink-soft">Keywords your tracked competitors rank for in the top 20, by search volume.</p>
          <DataTable
            head={["Keyword", "Competitor", "Position", "Search volume", "Updated"]}
            rows={keywords.map((k) => [k.keyword, names.get(k.competitorId) ?? "—", k.position ? `#${k.position}` : "—", num(k.searchVolume), shortDate(k.capturedAt)])}
            empty={<Empty icon={Search} title="No keyword data yet" body={notReady("Keyword data")} />}
          />
        </Card>
      )}

      {tab === "content" && (
        <Card className="p-5">
          <h2 className="text-[18px] font-extrabold text-deep-navy">Top Competitor Pages</h2>
          <p className="mb-3 text-[12.5px] text-ink-soft">Pages bringing competitors the most organic visibility.</p>
          <DataTable
            head={["Page", "Competitor", "Ranking keywords", "Est. traffic value", "Updated"]}
            rows={pages.map((pg) => [
              <a key="u" href={pg.url} target="_blank" rel="noopener noreferrer nofollow" className="block max-w-[420px] truncate text-royal-blue hover:underline">{pg.url.replace(/^https?:\/\//, "")}</a>,
              names.get(pg.competitorId) ?? "—",
              num(pg.organicCount),
              pg.etv == null ? "—" : `$${Math.round(pg.etv).toLocaleString("en-US")}`,
              shortDate(pg.capturedAt),
            ])}
            empty={<Empty icon={FileText} title="No content activity yet" body={notReady("Content data")} />}
          />
        </Card>
      )}

      {tab === "opportunities" && (
        <Card className="p-5">
          <h2 className="text-[18px] font-extrabold text-deep-navy">Keyword Opportunities</h2>
          <p className="mb-3 text-[12.5px] text-ink-soft">Where a competitor ranks in the top 20 and you are missing or behind.</p>
          <DataTable
            head={["Keyword", "Competitor", "Their position", "Your position", "Search volume"]}
            rows={opportunities.map((g) => [
              g.keyword,
              names.get(g.competitorId) ?? "—",
              g.theirPosition ? `#${g.theirPosition}` : "—",
              g.ourPosition ? `#${g.ourPosition}` : "Not ranking",
              num(g.searchVolume),
            ])}
            empty={
              <Empty
                icon={Lightbulb}
                title="No opportunities yet"
                body={collected && gaps.length === 0 ? "Run competitor discovery with your website so we can compare your rankings." : notReady("Keyword opportunities")}
              />
            }
          />
        </Card>
      )}

      {tab === "alerts" && (
        <Card className="p-5">
          <h2 className="text-[18px] font-extrabold text-deep-navy">Alerts</h2>
          <p className="mb-2 text-[12.5px] text-ink-soft">Ranking movements of 5+ places, new top-20 rankings and newly visible pages, last 30 days.</p>
          {signals.length === 0 ? <Empty icon={Bell} title="No alerts yet" body={notReady("Alerts")} /> : <SignalList signals={signals} names={names} />}
        </Card>
      )}

      {tab !== "overview" && tab !== "competitors" && TAB_SOURCES[tab] && (
        <Card className="p-8">
          <Empty
            icon={tab === "alerts" ? Bell : tab === "opportunities" ? Lightbulb : tab === "settings" ? Users : BarChart3}
            title={TAB_SOURCES[tab][0]}
            body={TAB_SOURCES[tab][1]}
          />
          {rows.length === 0 && tab !== "settings" && (
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <FindCompetitorsButton />
              <AddCompetitorButton />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
