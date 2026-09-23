import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Circle, FileSpreadsheet, FileText, Filter, LineChart, Monitor, PieChart, TrendingUp, UserRound } from "lucide-react";
import { db } from "@/lib/db";
import { BarList, EmptyState, Panel, ScreenHeader, StatGrid, TrendColumns, figure } from "@/components/amplivanta/screen-kit";
import { headerOutline } from "@/components/amplivanta/growth-kit";
import { dailySeries, daysAgo, marketingContext, pct, rangeDays } from "@/lib/server/marketing-screens";

export const metadata: Metadata = { title: "Landing Page Analytics" };
export const dynamic = "force-dynamic";

const SOURCE: Record<string, string> = { direct: "Direct", search: "Search", social: "Social", email: "Email", referral: "Referral", paid: "Paid" };

export default async function LandingPageAnalyticsPage({ searchParams }: { searchParams: Promise<{ page?: string; days?: string }> }) {
  const sp = await searchParams;
  const days = rangeDays(sp.days ?? "7");
  const c = await marketingContext();
  let pages: { id: string; title: string; status: string; analyticsEnabled: boolean }[] = [];
  let visits: { landingPageId: string; source: string | null; device: string | null; formStarted: boolean; converted: boolean; createdAt: Date }[] = [];
  if (c) {
    try {
      const w = c.workspaceId;
      pages = await db.landingPage.findMany({ where: { workspaceId: w }, select: { id: true, title: true, status: true, analyticsEnabled: true }, orderBy: { title: "asc" } });
      visits = await db.landingPageVisit.findMany({ where: { workspaceId: w, createdAt: { gte: daysAgo(days) }, ...(sp.page ? { landingPageId: sp.page } : {}) }, select: { landingPageId: true, source: true, device: true, formStarted: true, converted: true, createdAt: true }, take: 100000 });
    } catch {
      visits = [];
    }
  }
  const starts = visits.filter((v) => v.formStarted).length;
  const conv = visits.filter((v) => v.converted).length;
  const group = (key: "source" | "device", labels: Record<string, string>) => [...new Set(visits.map((v) => v[key] ?? "unknown"))].map((k): [string, number] => [labels[k] ?? k, visits.filter((v) => (v[key] ?? "unknown") === k).length]).sort((a, b) => b[1] - a[1]);
  const top = pages.map((p) => ({ ...p, n: visits.filter((v) => v.landingPageId === p.id).length, c: visits.filter((v) => v.landingPageId === p.id && v.converted).length })).filter((p) => p.n > 0).sort((a, b) => b.n - a.n);
  const published = pages.filter((p) => p.status === "published");
  const steps: [string, boolean][] = [["Create and publish your landing page", published.length > 0], ["Configure tracking and data sources", published.some((p) => p.analyticsEnabled)], ["Analytics will appear when tracking is configured and data becomes available", visits.length > 0]];

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Landing Page Analytics"]]}
        title="Landing Page Analytics"
        subtitle="Review page performance when published pages begin receiving visits."
        actions={<a href={`/api/marketing/export?kind=landing&days=${days}`} className={headerOutline}><FileSpreadsheet className="h-4 w-4" /> Export CSV</a>}
      />
      <form method="get" className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-2">
        <select name="page" defaultValue={sp.page ?? ""} aria-label="Landing page" className="h-10 min-w-[280px] flex-1 rounded-md border border-line bg-white px-3 text-[13px] sm:flex-none">
          <option value="">All Landing Pages</option>
          {pages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <select name="days" defaultValue={String(days)} aria-label="Date range" className="h-10 rounded-md border border-line bg-white px-3 text-[13px] sm:ml-auto">
          <option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option>
        </select>
        <button className="h-10 rounded-md border border-line px-4 text-[13px] font-semibold">Apply</button>
      </form>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <StatGrid
            cols={4}
            stats={[
              { label: "Visits", icon: UserRound, value: figure(visits.length), hint: visits.length ? `Last ${days} days` : "No data yet", tone: "violet" },
              { label: "Conversion Rate", icon: TrendingUp, value: pct(conv, visits.length), hint: visits.length ? "Form submissions per visit" : "No data yet", tone: "green" },
              { label: "Form Starts", icon: FileText, value: figure(starts), hint: starts ? pct(starts, visits.length) + " of visits" : "No data yet", tone: "orange" },
              { label: "Conversions", icon: CheckCircle2, value: figure(conv), hint: conv ? "Submitted a form" : "No data yet" },
            ]}
          />
          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Panel title="Traffic Trend" subtitle="Daily visits">
              {visits.length ? <TrendColumns points={dailySeries(visits.map((v) => v.createdAt), days)} label="Visits" /> : <EmptyState icon={LineChart} tone="violet" title="No traffic data yet" body="Published landing pages will appear here once they start receiving visits." />}
            </Panel>
            <Panel title="Conversion Funnel">
              {visits.length ? <BarList rows={[["Visits", visits.length], ["Form starts", starts], ["Conversions", conv]]} /> : <EmptyState icon={Filter} tone="violet" title="No conversion data yet" body="Form submissions and conversions will appear here once available." />}
            </Panel>
            <Panel title="Traffic Sources">
              {visits.length ? <BarList rows={group("source", SOURCE)} /> : <EmptyState icon={PieChart} tone="violet" title="No source data yet" body="Traffic source breakdown will appear once data is available." />}
            </Panel>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <Panel title="Device Breakdown">
              {visits.length ? <BarList rows={group("device", { desktop: "Desktop", tablet: "Tablet", mobile: "Mobile" })} /> : <EmptyState icon={Monitor} tone="violet" title="No device data yet" body="Visitor device breakdown will appear once data is available." />}
            </Panel>
            <Panel title="Top Landing Pages">
              {top.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left text-[12.5px]">
                    <thead><tr className="border-b border-line bg-bg-soft/70 text-deep-navy">{["Landing Page", "Visits", "Conversions", "Rate"].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
                    <tbody>{top.slice(0, 10).map((p) => <tr key={p.id} className="border-b border-line last:border-0"><td className="px-3 py-2.5"><Link href={`?page=${p.id}&days=${days}`} className="font-semibold text-deep-navy hover:text-[#0B5CFF]">{p.title}</Link></td><td className="px-3 py-2.5">{p.n}</td><td className="px-3 py-2.5">{p.c}</td><td className="px-3 py-2.5">{pct(p.c, p.n)}</td></tr>)}</tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={FileText} title="No landing page data yet" body="Published landing pages with visits will appear here." />
              )}
            </Panel>
          </div>
        </div>
        <Panel className="h-fit">
          <div className="py-4 text-center">
            <LineChart className="mx-auto mb-3 h-12 w-12 text-[#0B5CFF]/60" />
            <h2 className="text-[17px] font-semibold text-deep-navy">{visits.length ? "Analytics are live" : "Analytics will appear here"}</h2>
            <p className="mt-1 text-[13px] text-ink-soft">Visits are recorded when a published page loads with tracking on. No cookies or IP addresses are stored for analytics.</p>
          </div>
          <h3 className="mb-2 text-[13px] font-semibold text-deep-navy">Before analytics can appear:</h3>
          <ul className="space-y-2">{steps.map(([t, done]) => <li key={t} className="flex gap-2 text-[12.5px] text-ink-soft">{done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <Circle className="h-4 w-4 shrink-0 text-ink-muted" />}{t}</li>)}</ul>
        </Panel>
      </div>
    </div>
  );
}
