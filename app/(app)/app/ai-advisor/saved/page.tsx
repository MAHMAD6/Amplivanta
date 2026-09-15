import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, Clock, Diamond, Search, Star, Target } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { crmDate, crmPrimaryBtn } from "@/components/amplivanta/crm-screen";
import { SavedInsightActions } from "@/components/amplivanta/saved-insight-actions";
import { crmContext, since } from "@/lib/server/crm-screens";

export const metadata: Metadata = { title: "Saved Insights" };
export const dynamic = "force-dynamic";

/** Recommendation statuses that mean the user deliberately kept the insight. */
const SAVED_STATUSES = ["saved", "ready", "archived"];

const TABS = [
  ["Recommendation History", "/app/ai-advisor/history"],
  ["Saved Insights", "/app/ai-advisor/saved"],
  ["Action Plans", "/app/ai-advisor/action-plans"],
] as const;

type SP = { q?: string; type?: string; priority?: string; saved?: string };

const selectCls = "h-10 rounded-lg border border-line bg-white px-3 text-[13px] text-ink-soft focus:border-[#0B5CFF] focus:outline-none";

export default async function SavedInsightsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const ctx = await crmContext();
  let reachable = Boolean(ctx);
  let rows: { id: string; title: string; category: string; impact: string; status: string; createdAt: Date }[] = [];
  let counts = { total: 0, high: 0, ready: 0, archived: 0 };
  let categories: string[] = [];

  if (ctx) {
    try {
      const w = ctx.workspaceId;
      const savedSince = since(sp.saved);
      const [list, grouped, high, cats] = await Promise.all([
        db.recommendation.findMany({
          where: {
            workspaceId: w,
            status: { in: SAVED_STATUSES },
            ...(sp.q ? { title: { contains: sp.q, mode: "insensitive" } } : {}),
            ...(sp.type ? { category: sp.type } : {}),
            ...(sp.priority ? { impact: sp.priority } : {}),
            ...(savedSince ? { createdAt: { gte: savedSince } } : {}),
          },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: { id: true, title: true, category: true, impact: true, status: true, createdAt: true },
        }),
        db.recommendation.groupBy({ by: ["status"], where: { workspaceId: w, status: { in: SAVED_STATUSES } }, _count: true }),
        db.recommendation.count({ where: { workspaceId: w, status: { in: ["saved", "ready"] }, impact: "high" } }),
        db.recommendation.groupBy({ by: ["category"], where: { workspaceId: w, status: { in: SAVED_STATUSES } } }),
      ]);
      rows = list;
      const by = (s: string) => grouped.find((g) => g.status === s)?._count ?? 0;
      counts = { total: grouped.reduce((n, g) => n + g._count, 0), high, ready: by("ready"), archived: by("archived") };
      categories = cats.map((c) => c.category);
    } catch {
      reachable = false;
    }
  }

  const has = counts.total > 0;
  const fig = (n: number) => (has ? n.toLocaleString("en-US") : null);
  const stats: [string, string | null, typeof Diamond][] = [
    ["Total Saved Insights", fig(counts.total), Diamond],
    ["High Priority", fig(counts.high), Clock],
    ["Ready for Action", fig(counts.ready), ArrowUpRight],
    ["Archived", fig(counts.archived), Target],
  ];

  return (
    <div className="mx-auto max-w-[1680px]">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-[#0B5CFF]">
            <Link href="/app/strategy" className="hover:underline">Growth</Link>
            <ChevronRight className="h-3.5 w-3.5 text-ink-muted" />
            <span>Saved Insights</span>
          </nav>
          <h1 className="mt-1 font-display text-[32px] font-extrabold leading-tight text-deep-navy">Saved Insights</h1>
          <p className="mt-0.5 text-[14.5px] text-ink-soft">Review AI insights you intentionally saved for later analysis, collaboration, or action.</p>
        </div>
        <Link href="/app/ai-advisor/action-plans" className={crmPrimaryBtn}>+ Create Action Plan</Link>
      </div>

      <nav aria-label="AI Advisor views" className="mb-4 flex gap-6 border-b border-line text-[14px]">
        {TABS.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className={cn("pb-2.5", href === "/app/ai-advisor/saved" ? "-mb-px border-b-2 border-[#0B5CFF] font-semibold text-[#0B5CFF]" : "text-ink-soft hover:text-deep-navy")}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, Icon]) => (
          <div key={label} className="rounded-xl border border-line bg-white p-4">
            <div className="flex items-center gap-2.5 text-[14px] text-deep-navy">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-royal-tint text-[#0B5CFF]"><Icon className="h-4 w-4" /></span>
              {label}
            </div>
            <div className="mt-4 text-[22px] font-extrabold leading-none text-deep-navy">{value ?? "—"}</div>
            <div className="mt-2 text-[12.5px] text-ink-muted">{value == null ? "Not available yet" : ""}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="min-w-0 rounded-xl border border-line bg-white">
          <form method="get" className="flex flex-wrap items-center gap-2.5 px-4 py-3.5">
            <label className="relative w-full max-w-[330px]">
              <span className="sr-only">Search saved insights</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
              <input name="q" defaultValue={sp.q ?? ""} placeholder="Search saved insights..." className="h-10 w-full rounded-lg border border-line pl-8 pr-3 text-[13px] focus:border-[#0B5CFF] focus:outline-none" />
            </label>
            <select name="type" defaultValue={sp.type ?? ""} className={selectCls} aria-label="Type">
              <option value="">Type</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select name="priority" defaultValue={sp.priority ?? ""} className={selectCls} aria-label="Priority">
              <option value="">Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select name="saved" defaultValue={sp.saved ?? ""} className={selectCls} aria-label="Date saved">
              <option value="">Date Saved</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button type="submit" className="h-10 rounded-lg border border-line px-4 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft">Apply</button>
          </form>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="bg-bg-soft/80 text-[12.5px] font-bold text-deep-navy">
                  {["Insight", "Source / Category", "Owner / Team", "Date Saved", "Priority", "Actions"].map((c) => <th key={c} className="px-4 py-3.5">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-line text-[13px] text-ink-soft">
                    <td className="px-4 py-3 font-semibold text-deep-navy">
                      {r.title}
                      {r.status !== "saved" && <span className="ml-2 rounded-full bg-bg-soft px-2 py-0.5 text-[10.5px] font-bold capitalize text-ink-muted">{r.status}</span>}
                    </td>
                    <td className="px-4 py-3">AI Advisor · {r.category}</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3">{crmDate(r.createdAt)}</td>
                    <td className="px-4 py-3 capitalize">{r.impact}</td>
                    <td className="px-4 py-3"><SavedInsightActions id={r.id} status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && (
            <div className="flex flex-col items-center px-6 pb-10 pt-9 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-royal-tint"><Star className="h-6 w-6 text-[#0B5CFF]/80" /></span>
              <h3 className="mt-4 text-[20px] font-bold text-deep-navy">{reachable ? "No saved insights yet" : "Saved insights unavailable"}</h3>
              <p className="mt-1 max-w-[440px] text-[13.5px] text-ink-soft">
                {reachable
                  ? "Saved AI recommendations and insights will appear here when you explicitly save them."
                  : "The database could not be reached, so saved insights cannot be shown right now."}
              </p>
              {reachable && <Link href="/app/ai-advisor" className={cn(crmPrimaryBtn, "mt-5")}>Go to AI Advisor</Link>}
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <div className="rounded-xl border border-line bg-white p-4">
            <h2 className="text-[16px] font-bold text-deep-navy">Insight Summary</h2>
            <p className="mt-2 text-[13px] text-ink-soft">Summary values will appear after saved insight records are available.</p>
            <dl className="mt-3 divide-y divide-line border-t border-line">
              {([["High Priority", stats[1][1]], ["Ready for Action", stats[2][1]], ["Archived", stats[3][1]]] as [string, string | null][]).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-3 text-[13px]"><dt className="text-deep-navy">{k}</dt><dd className="m-0 text-ink-soft">{v ?? "—"}</dd></div>
              ))}
            </dl>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <h2 className="text-[16px] font-bold text-deep-navy">Opportunity Areas</h2>
            <p className="mt-2 text-[13px] text-ink-soft">
              {categories.length ? categories.join(" · ") : "No opportunity data available yet."}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <h2 className="text-[16px] font-bold text-deep-navy">Suggested Next Steps</h2>
            <p className="mt-2 text-[13px] text-ink-soft">Recommendations will appear here when supported by production insight data.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
