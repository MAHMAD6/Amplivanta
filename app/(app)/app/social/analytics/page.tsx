import type { Metadata } from "next";
import { AlertTriangle, BarChart3, ClipboardList, Crosshair, Filter, MessageCircle, MousePointerClick, TrendingUp, Users } from "lucide-react";
import { EmptyState, KeyList, Panel, ScreenHeader, StatGrid, fmtInt } from "@/components/amplivanta/screen-kit";
import { db } from "@/lib/db";
import { socialContext, socialCounts } from "@/lib/server/social-screens";

export const metadata: Metadata = { title: "Social Analytics" };
export const dynamic = "force-dynamic";

/**
 * Reach, engagement, clicks and conversions come only from connected platform
 * metrics (ProviderMetricDaily). Without them the figures read "Unavailable",
 * never zero.
 */
const METRICS: Record<string, string[]> = {
  reach: ["reach", "impressions", "views"],
  engagement: ["engagement", "likes", "comments", "shares"],
  clicks: ["clicks", "link_clicks"],
  conversions: ["conversions"],
};
const SOCIAL_PROVIDERS = ["meta", "linkedin", "youtube", "tiktok"];

export default async function SocialAnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days: rawDays } = await searchParams;
  const days = [7, 30, 90].includes(Number(rawDays)) ? Number(rawDays) : 7;
  const c = await socialContext();
  const totals: Record<string, number | null> = { reach: null, engagement: null, clicks: null, conversions: null };
  let byProvider: [string, number][] = [];
  let published = 0;
  if (c) {
    try {
      const since = new Date(Date.now() - days * 86400000);
      const [rows, counts] = await Promise.all([
        db.providerMetricDaily.groupBy({ by: ["provider", "metric"], where: { workspaceId: c.workspaceId, provider: { in: SOCIAL_PROVIDERS }, date: { gte: since } }, _sum: { value: true } }),
        socialCounts(c.workspaceId),
      ]);
      for (const [k, names] of Object.entries(METRICS)) {
        const hit = rows.filter((r) => names.includes(r.metric));
        totals[k] = hit.length ? hit.reduce((n, r) => n + (r._sum.value ?? 0), 0) : null;
      }
      const map = new Map<string, number>();
      for (const r of rows.filter((r) => METRICS.reach.includes(r.metric))) map.set(r.provider, (map.get(r.provider) ?? 0) + (r._sum.value ?? 0));
      byProvider = [...map.entries()].sort((a, b) => b[1] - a[1]);
      published = counts.published;
    } catch {
      /* unavailable, not zero */
    }
  }
  const stat = (v: number | null) => (v == null ? null : fmtInt(Math.round(v)));
  const hint = "Metrics appear here when connected platforms provide data.";

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        title="Social Analytics"
        subtitle="Measure channel, content, and campaign performance across your connected platforms."
        actions={
          <form method="get" className="flex items-center gap-2">
            <select name="days" defaultValue={String(days)} aria-label="Date range" className="h-10 rounded-md border border-line bg-white px-3 text-[13px] font-semibold text-deep-navy">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button type="submit" className="inline-flex h-10 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-[13px] font-semibold text-deep-navy"><Filter className="h-4 w-4" /> Apply</button>
          </form>
        }
      />
      <StatGrid
        stats={[
          { label: "Reach", icon: Users, value: stat(totals.reach), hint: totals.reach == null ? `Unavailable · ${hint}` : undefined },
          { label: "Engagement", icon: MessageCircle, value: stat(totals.engagement), hint: totals.engagement == null ? `Unavailable · ${hint}` : undefined },
          { label: "Clicks", icon: MousePointerClick, value: stat(totals.clicks), hint: totals.clicks == null ? `Unavailable · ${hint}` : undefined },
          { label: "Conversions", icon: Filter, value: stat(totals.conversions), hint: totals.conversions == null ? `Unavailable · ${hint}` : undefined },
        ]}
      />
      <Panel title="Performance Trend" className="mb-5">
        <EmptyState icon={TrendingUp} title="No analytics data yet" body="Connect social accounts and start publishing to see performance trends here." />
      </Panel>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Platform Comparison">
          {byProvider.length ? <KeyList rows={byProvider.map(([p, v]) => [p, fmtInt(Math.round(v))])} /> : <EmptyState icon={BarChart3} compact title="No performance data yet" body="Connect your social accounts and start publishing to see platform performance here." />}
        </Panel>
        <Panel title="Top Content">
          <EmptyState icon={ClipboardList} compact title="No content data yet" body={published ? "Post-level metrics appear once connected platforms report them." : "Publish content to see your top performing posts here."} />
        </Panel>
        <Panel title="Campaign & Content Drill-Down">
          <EmptyState icon={Crosshair} compact title="No campaign data yet" body="Create campaigns and publish content to explore detail performance here." />
        </Panel>
      </div>
      <div className="mt-5 flex items-center gap-4 rounded-xl border border-line bg-white p-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><AlertTriangle className="h-5 w-5" /></span>
        <div>
          <div className="text-[15px] font-semibold text-deep-navy">Unavailable metrics are shown as unavailable, not zero.</div>
          <div className="text-[13px] text-ink-soft">Metrics are unavailable until connected platforms provide data for the selected date range.</div>
        </div>
      </div>
    </div>
  );
}
