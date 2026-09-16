import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BarChart3, ChevronRight, Crosshair, DollarSign, FileText, Megaphone, PieChart, Plug, Share2, SlidersHorizontal, TrendingUp, Users, Filter } from "lucide-react";
import { db } from "@/lib/db";
import { BarList, DataTable, EmptyState, Panel, RangeSelect, ScreenHeader, StatGrid, TrendColumns, fmtDate, fmtInt, fmtMoney, kitPrimary } from "@/components/amplivanta/screen-kit";
import { analyticsContext, campaignPerformance, crmFunnel, parseRange, providerMetric, sum } from "@/lib/server/analytics-screens";

export const metadata: Metadata = { title: "Analytics Dashboard" };
export const dynamic = "force-dynamic";

export default async function AnalyticsDashboardPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days } = await searchParams;
  const range = parseRange(days);
  const c = await analyticsContext();
  let d = null as null | {
    sessions: Awaited<ReturnType<typeof providerMetric>>;
    users: Awaited<ReturnType<typeof providerMetric>>;
    conversions: Awaited<ReturnType<typeof providerMetric>>;
    campaigns: Awaited<ReturnType<typeof campaignPerformance>>;
    crm: Awaited<ReturnType<typeof crmFunnel>>;
    reports: { id: string; name: string; type: string; createdAt: Date }[];
  };
  if (c) {
    try {
      const [sessions, users, conversions, campaigns, crm, reports] = await Promise.all([
        providerMetric(c.workspaceId, "google_analytics", "sessions", range),
        providerMetric(c.workspaceId, "google_analytics", "totalUsers", range),
        providerMetric(c.workspaceId, "google_analytics", "conversions", range),
        campaignPerformance(c.workspaceId, range),
        crmFunnel(c.workspaceId, range),
        db.report.findMany({ where: { workspaceId: c.workspaceId, NOT: { type: { startsWith: "strategy_" } } }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, type: true, createdAt: true } }),
      ]);
      d = { sessions, users, conversions, campaigns, crm, reports };
    } catch {
      d = null;
    }
  }
  const spend = d ? sum(d.campaigns, "spend") : 0;
  const campaignRevenue = d ? sum(d.campaigns, "revenue") : 0;
  const conversions = d ? (d.conversions.total ?? 0) + sum(d.campaigns, "conversions") : 0;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Analytics & Reports", "/app/analytics"], ["Performance Overview"]]}
        title="Analytics Dashboard"
        subtitle="Platform-wide performance overview for your workspace."
        actions={<><RangeSelect days={range.days} /><Link href="/app/integrations#catalog" className={`${kitPrimary} h-11`}><Plug className="h-4 w-4" /> Connect Data Sources</Link></>}
      />
      <StatGrid
        stats={[
          { label: "Traffic", icon: Users, value: fmtInt(d?.sessions.total != null ? Math.round(d.sessions.total) : null), hint: d?.sessions.total != null ? "GA4 sessions" : undefined },
          { label: "Engagement", icon: Activity, value: fmtInt(d?.users.total != null ? Math.round(d.users.total) : null), hint: d?.users.total != null ? "GA4 users" : undefined },
          { label: "Conversions", icon: Crosshair, value: conversions ? fmtInt(Math.round(conversions)) : null },
          { label: "Revenue", icon: DollarSign, value: d?.crm.revenue != null ? fmtMoney(d.crm.revenue) : null, hint: d?.crm.revenue != null ? "Won deals" : undefined },
          { label: "ROI", icon: TrendingUp, value: spend > 0 && campaignRevenue > 0 ? `${Math.round(((campaignRevenue - spend) / spend) * 100)}%` : null, hint: spend > 0 && campaignRevenue > 0 ? "Recorded campaign revenue vs spend" : undefined },
        ]}
      />
      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_1fr_1fr]">
        <Panel title="Performance Trend">
          {d?.sessions.byDay.length ? <TrendColumns points={d.sessions.byDay} label="Sessions" /> : <EmptyState icon={BarChart3} compact title="No performance data yet" body="Connect data sources to view performance trends over time." />}
        </Panel>
        <Panel title="Traffic Summary" subtitle={d?.sessions.byDimension.length ? "Sessions by channel" : undefined}>
          {d?.sessions.byDimension.length ? <BarList rows={d.sessions.byDimension} /> : <EmptyState icon={PieChart} compact title="No traffic data yet" body="Traffic distribution appears here once data is available." />}
        </Panel>
        <Panel title="Conversion Summary" subtitle={d?.conversions.byDimension.length ? "Conversions by channel" : undefined}>
          {d?.conversions.byDimension.length ? <BarList rows={d.conversions.byDimension} /> : <EmptyState icon={Filter} compact title="No conversion data yet" body="Conversion breakdown will appear here once data is available." />}
        </Panel>
      </div>
      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_1fr_1fr]">
        <Panel title="Attribution Overview">
          <EmptyState icon={Share2} compact title="No attribution data yet" body="Set up attribution and connect data sources to see channel impact." action={<Link href="/app/analytics/attribution" className="text-[13px] font-semibold text-[#0B5CFF]">Open Revenue Attribution</Link>} />
        </Panel>
        <Panel title="Top Campaigns">
          {d?.campaigns.length ? (
            <DataTable minWidth={360} columns={["Campaign", "Clicks", "Conv."]} rows={d.campaigns.slice(0, 5).map((r) => [r.name, fmtInt(Math.round(r.clicks)), fmtInt(Math.round(r.conversions))])} />
          ) : (
            <EmptyState icon={Megaphone} compact title="No campaigns yet" body="Campaign performance will appear here once data is available." />
          )}
        </Panel>
        <Panel title="Saved Reports">
          {d?.reports.length ? (
            <ul className="divide-y divide-line">
              {d.reports.map((r) => (
                <li key={r.id} className="py-2.5"><Link href={`/app/analytics/report-builder?report=${r.id}`} className="text-[13.5px] font-semibold text-deep-navy hover:text-[#0B5CFF]">{r.name}</Link><div className="text-[12px] capitalize text-ink-muted">{r.type} · {fmtDate(r.createdAt)}</div></li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={FileText} compact title="No saved reports yet" body="Create and save reports to access them here." action={<Link href="/app/analytics/report-builder" className="text-[13px] font-semibold text-[#0B5CFF]">Open Report Builder</Link>} />
          )}
        </Panel>
      </div>
      <Panel title="Recommended Next Steps">
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {([
            [Plug, "1. Connect Data Sources", "Integrate your platforms to unlock analytics and reporting.", "/app/integrations#catalog"],
            [SlidersHorizontal, "2. Configure Tracking", "Choose which property, site or ad account each connection syncs.", "/app/integrations/connected"],
            [BarChart3, "3. Explore Dashboards", "Review dashboards and insights as data becomes available.", "/app/analytics/traffic"],
            [FileText, "4. Create Custom Reports", "Build and save reports tailored to your goals.", "/app/analytics/report-builder"],
          ] as const).map(([Icon, title, body, href], i) => (
            <li key={title}>
              <Link href={href} className="flex items-center gap-4 rounded-lg p-2 hover:bg-bg-soft/60">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Icon className="h-6 w-6" /></span>
                <span className="flex-1"><span className="block text-[13.5px] font-semibold text-deep-navy">{title}</span><span className="block text-[12.5px] text-ink-soft">{body}</span></span>
                {i < 3 && <ChevronRight className="hidden h-5 w-5 text-ink-muted xl:block" />}
              </Link>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
