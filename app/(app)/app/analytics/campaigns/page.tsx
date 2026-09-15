import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BarChart3, Crosshair, DollarSign, Filter, Image as ImageIcon, Lightbulb, PieChart, Plug, TrendingUp, Users } from "lucide-react";
import { BarList, DataTable, EmptyState, Panel, RangeSelect, ScreenHeader, StatGrid, fmtInt, fmtMoney, kitPrimary } from "@/components/amplivanta/screen-kit";
import { analyticsContext, campaignPerformance, parseRange, sum } from "@/lib/server/analytics-screens";

export const metadata: Metadata = { title: "Campaign Analytics" };
export const dynamic = "force-dynamic";

export default async function CampaignAnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days } = await searchParams;
  const range = parseRange(days);
  const c = await analyticsContext();
  let rows: Awaited<ReturnType<typeof campaignPerformance>> = [];
  if (c) {
    try {
      rows = await campaignPerformance(c.workspaceId, range);
    } catch {
      rows = [];
    }
  }
  const has = rows.length > 0;
  const spend = sum(rows, "spend");
  const revenue = sum(rows, "revenue");
  const int = (v: number) => (has ? fmtInt(Math.round(v)) : null);
  const byChannel = (k: "clicks" | "spend" | "conversions") => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.channel, (m.get(r.channel) ?? 0) + r[k]);
    return [...m.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Analytics & Reports", "/app/analytics"], ["Campaign Analytics"]]}
        title="Campaign Analytics"
        subtitle="Cross-channel campaign performance overview once data sources are connected."
        actions={<><RangeSelect days={range.days} /><Link href="/app/integrations#catalog" className={`${kitPrimary} h-11`}><Plug className="h-4 w-4" /> Connect Data Sources</Link></>}
      />
      <StatGrid
        cols={6}
        stats={[
          { label: "Reach", icon: Users, value: int(sum(rows, "impressions")), hint: has ? "Impressions" : undefined },
          { label: "Engagement", icon: Activity, value: int(sum(rows, "clicks")), hint: has ? "Clicks" : undefined },
          { label: "Conversions", icon: Crosshair, value: int(sum(rows, "conversions")) },
          { label: "Spend", icon: DollarSign, value: has && spend > 0 ? fmtMoney(spend) : null },
          { label: "Revenue", icon: DollarSign, value: has && revenue > 0 ? fmtMoney(revenue) : null },
          { label: "ROAS", icon: TrendingUp, value: spend > 0 && revenue > 0 ? `${(revenue / spend).toFixed(2)}x` : null },
        ]}
      />
      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Campaign Comparison">
          {has ? (
            <DataTable minWidth={420} columns={["Campaign", "Channel", "Clicks", "Conv."]} rows={rows.slice(0, 8).map((r) => [r.name, r.channel, fmtInt(Math.round(r.clicks)), fmtInt(Math.round(r.conversions))])} />
          ) : (
            <EmptyState icon={BarChart3} title="No campaign data yet" body="Connect data sources to compare campaigns and track performance over time." />
          )}
        </Panel>
        <Panel title="Channel Performance" subtitle={byChannel("clicks").length ? "Clicks by channel" : undefined}>
          {byChannel("clicks").length ? <BarList rows={byChannel("clicks")} /> : <EmptyState icon={PieChart} title="No performance data yet" body="Traffic and engagement by channel will appear here once data is available." />}
        </Panel>
        <Panel title="Conversion Impact" subtitle={byChannel("conversions").length ? "Conversions by channel" : undefined}>
          {byChannel("conversions").length ? <BarList rows={byChannel("conversions")} /> : <EmptyState icon={Filter} title="No conversion data yet" body="Conversion impact across channels will appear here once data is available." />}
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Creative Performance">
          <EmptyState icon={ImageIcon} title="No performance data yet" body="Creative performance metrics will appear here once creative-level reporting is synced." />
        </Panel>
        <Panel title="Spend Distribution" subtitle={byChannel("spend").length ? "Spend by channel" : undefined}>
          {byChannel("spend").length ? <BarList rows={byChannel("spend")} format={(v) => fmtMoney(v) ?? "—"} /> : <EmptyState icon={DollarSign} title="No spend data yet" body="Spend distribution across channels will appear here once data is available." />}
        </Panel>
        <Panel title="Optimization Notes">
          <EmptyState icon={Lightbulb} title="No optimization notes yet" body="Optimization insights will appear here once enough campaign data is available." />
        </Panel>
      </div>
    </div>
  );
}
