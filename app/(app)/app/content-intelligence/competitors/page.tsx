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
  keywords: ["No keyword data yet", "Keyword overlap appears once a search-data source is connected and competitors are tracked."],
  content: ["No content activity yet", "New pages and articles from tracked competitors appear once content monitoring is connected."],
  ads: ["No ad activity yet", "Competitor ad activity appears once an advertising data source is connected."],
  social: ["No social activity yet", "Posting cadence and themes appear once social monitoring is connected for tracked competitors."],
  opportunities: ["No opportunities yet", "Add competitors to discover content gaps, keyword opportunities and emerging topics."],
  alerts: ["No alerts yet", "You'll be alerted to significant changes once tracking has activity to compare."],
  settings: ["Tracking settings", "Choose which competitors are tracked from the Competitors tab. Channel preferences appear here once monitoring sources are connected."],
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

type Row = { id: string; name: string; website: string | null; type: string; source: string; trackingEnabled: boolean; updatedAt: Date; reason: string | null };

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

function CompetitorTable({ rows, reachable }: { rows: Row[]; reachable: boolean }) {
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
            <th className="px-4 py-3">Last updated</th>
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
              <td className="px-4 py-3 text-[12.5px] text-ink-soft">{date(r.updatedAt)}</td>
              <td className="px-4 py-3"><CompetitorRowActions id={r.id} tracking={r.trackingEnabled} /></td>
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
  let reachable = true;
  try {
    const ctx = await getSessionContext();
    rows = await db.competitor.findMany({
      where: { workspaceId: ctx.workspaceId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, name: true, website: true, type: true, source: true, trackingEnabled: true, updatedAt: true, reason: true },
    });
  } catch {
    reachable = false;
  }
  const tracked = rows.filter((r) => r.trackingEnabled).length;

  // Only the tracked count has a real source today; the rest stay neutral.
  const STATS: [LucideIcon, string, string | null, string, string][] = [
    [Users, "Competitors Tracked", reachable ? String(tracked) : null, "Add or discover competitors", "bg-royal-tint text-royal-blue"],
    [FileText, "New Signals", null, "Recent changes across channels", "bg-emerald-50 text-emerald-600"],
    [Lightbulb, "Priority Opportunities", null, "Actionable growth opportunities", "bg-orange-50 text-orange-500"],
    [Bell, "Significant Changes", null, "Track important updates", "bg-red-50 text-red-500"],
  ];

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
              <Empty icon={BarChart3} title="No data yet" body="Add competitors to see activity trends across channels." />
            </Card>
            <Card className="p-5">
              <h2 className="text-[18px] font-extrabold text-deep-navy">Priority Opportunities</h2>
              <p className="mb-3 text-[12.5px] text-ink-soft">Areas where you can gain an advantage.</p>
              <Empty icon={Lightbulb} title="No opportunities yet" body="Add competitors to discover content gaps, keyword opportunities and emerging topics." />
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
              <CompetitorTable rows={rows.slice(0, 5)} reachable={reachable} />
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
              <Empty icon={Bell} title="No updates yet" body="We'll show important changes here once you start tracking competitors." />
            </Card>
          </div>
        </>
      )}

      {tab === "competitors" && (
        <Card className="p-5">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-extrabold text-deep-navy">Tracked Competitors</h2>
              <p className="text-[12.5px] text-ink-soft">{rows.length} in this workspace · {tracked} actively tracked</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AddCompetitorButton variant="solid" label="Add Competitor" />
            </div>
          </div>
          <CompetitorTable rows={rows} reachable={reachable} />
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
