import type { Metadata } from "next";
import Link from "next/link";
import { Clock, FileText, Globe, Heart, MonitorSmartphone, Plug, Share2, TrendingUp, UserPlus, Users, Activity } from "lucide-react";
import { BarList, EmptyState, KeyList, Panel, RangeSelect, ScreenHeader, StatGrid, TrendColumns, fmtInt, kitPrimary } from "@/components/amplivanta/screen-kit";
import { analyticsContext, parseRange, providerAverage, providerMetric } from "@/lib/server/analytics-screens";

export const metadata: Metadata = { title: "Traffic Analytics" };
export const dynamic = "force-dynamic";

export default async function TrafficAnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days } = await searchParams;
  const range = parseRange(days);
  const c = await analyticsContext();
  let d = null as null | {
    sessions: Awaited<ReturnType<typeof providerMetric>>;
    users: Awaited<ReturnType<typeof providerMetric>>;
    clicks: Awaited<ReturnType<typeof providerMetric>>;
    impressions: Awaited<ReturnType<typeof providerMetric>>;
    position: number | null;
    ctr: number | null;
  };
  if (c) {
    try {
      const [sessions, users, clicks, impressions, position, ctr] = await Promise.all([
        providerMetric(c.workspaceId, "google_analytics", "sessions", range),
        providerMetric(c.workspaceId, "google_analytics", "totalUsers", range),
        providerMetric(c.workspaceId, "google_search_console", "clicks", range),
        providerMetric(c.workspaceId, "google_search_console", "impressions", range),
        providerAverage(c.workspaceId, "google_search_console", "position", range),
        providerAverage(c.workspaceId, "google_search_console", "ctr", range),
      ]);
      d = { sessions, users, clicks, impressions, position, ctr };
    } catch {
      d = null;
    }
  }
  const n = (v: number | null | undefined) => (v == null ? null : fmtInt(Math.round(v)));
  const connect = "Connect Google Analytics 4 and choose a property to see this.";

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Analytics & Reports", "/app/analytics"], ["Traffic Analytics"]]}
        title="Traffic Analytics"
        subtitle="Review acquisition and engagement once your data sources are connected."
        actions={<><RangeSelect days={range.days} /><Link href="/app/integrations#catalog" className={`${kitPrimary} h-11`}><Plug className="h-4 w-4" /> Connect Data Sources</Link></>}
      />
      <StatGrid
        cols={6}
        stats={[
          { label: "Sessions", icon: Users, value: n(d?.sessions.total) },
          { label: "Users", icon: UserPlus, value: n(d?.users.total) },
          { label: "New Users", icon: UserPlus, value: null },
          { label: "Session Duration", icon: Clock, value: null },
          { label: "Bounce Rate", icon: Activity, value: null },
          { label: "Pages / Session", icon: FileText, value: null },
        ]}
      />
      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Traffic Over Time">
          {d?.sessions.byDay.length ? <TrendColumns points={d.sessions.byDay} label="Sessions" /> : <EmptyState icon={TrendingUp} title="No traffic data yet" body="Your traffic trends will appear here once data sources are connected." />}
        </Panel>
        <Panel title="Source / Medium" subtitle={d?.sessions.byDimension.length ? "Sessions by default channel group" : undefined}>
          {d?.sessions.byDimension.length ? <BarList rows={d.sessions.byDimension} /> : <EmptyState icon={Share2} title="No traffic data yet" body="Traffic by source and medium will appear once connected." />}
        </Panel>
        <Panel title="Device Mix">
          <EmptyState icon={MonitorSmartphone} title="No traffic data yet" body="Device breakdown will appear once device reporting is synced from your analytics source." />
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Geography">
          <EmptyState icon={Globe} title="No traffic data yet" body="Geographic distribution will appear once location reporting is synced." />
        </Panel>
        <Panel title="Entry Pages">
          <EmptyState icon={FileText} title="No traffic data yet" body="Top entry pages will appear once page reporting is synced." />
        </Panel>
        <Panel title="Engagement Summary" subtitle={d?.clicks.total != null ? "Organic search (Google Search Console)" : undefined}>
          {d?.clicks.total != null ? (
            <KeyList
              rows={[
                ["Search clicks", n(d.clicks.total)],
                ["Search impressions", n(d.impressions.total)],
                ["Average CTR", d.ctr != null ? `${(d.ctr * 100).toFixed(1)}%` : "—"],
                ["Average position", d.position != null ? d.position.toFixed(1) : "—"],
              ]}
            />
          ) : (
            <EmptyState icon={Heart} title="No traffic data yet" body={d?.sessions.total != null ? "Connect Google Search Console to add organic search engagement." : connect} />
          )}
        </Panel>
      </div>
    </div>
  );
}
