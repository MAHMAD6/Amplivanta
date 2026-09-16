import type { Metadata } from "next";
import Link from "next/link";
import { Diamond, PieChart, Share2, Sparkles, TrendingUp, Users } from "lucide-react";
import { BarList, EmptyState, Panel, RangeSelect, ScreenHeader, StatGrid, TrendColumns, fmtInt, fmtMoney } from "@/components/amplivanta/screen-kit";
import { analyticsContext, crmFunnel, parseRange, providerMetric } from "@/lib/server/analytics-screens";

export const metadata: Metadata = { title: "AI Workspace Analytics" };
export const dynamic = "force-dynamic";

export default async function WorkspaceAnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days } = await searchParams;
  const range = parseRange(days);
  const c = await analyticsContext();
  let d = null as null | { sessions: Awaited<ReturnType<typeof providerMetric>>; conversions: Awaited<ReturnType<typeof providerMetric>>; users: Awaited<ReturnType<typeof providerMetric>>; crm: Awaited<ReturnType<typeof crmFunnel>> };
  if (c) {
    try {
      const [sessions, conversions, users, crm] = await Promise.all([
        providerMetric(c.workspaceId, "google_analytics", "sessions", range),
        providerMetric(c.workspaceId, "google_analytics", "conversions", range),
        providerMetric(c.workspaceId, "google_analytics", "totalUsers", range),
        crmFunnel(c.workspaceId, range),
      ]);
      d = { sessions, conversions, users, crm };
    } catch {
      d = null;
    }
  }
  const s = d?.sessions.total ?? null;
  const conv = d?.conversions.total ?? null;
  const hint = "No connected data yet";

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={[["AI Workspace", "/app/workspace"], ["Analytics"]]} title="Analytics" subtitle="Campaign analytics inside the active AI Workspace." actions={<RangeSelect days={range.days} />} />
      <StatGrid
        stats={[
          { label: "Sessions", icon: Diamond, value: s != null ? fmtInt(Math.round(s)) : null, hint: s == null ? hint : undefined },
          { label: "Conversions", icon: Diamond, value: conv != null ? fmtInt(Math.round(conv)) : null, hint: conv == null ? hint : undefined },
          { label: "Conversion Rate", icon: Diamond, value: s && conv != null ? `${((conv / s) * 100).toFixed(2)}%` : null, hint: s && conv != null ? "Conversions ÷ sessions" : hint },
          { label: "Revenue", icon: Diamond, value: d?.crm.revenue != null ? fmtMoney(d.crm.revenue) : null, hint: d?.crm.revenue != null ? "Won deals" : hint },
        ]}
      />
      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Performance Trend">
          {d?.sessions.byDay.length ? <TrendColumns points={d.sessions.byDay} label="Sessions" /> : <EmptyState icon={TrendingUp} title="No analytics data yet" body="Connect or import campaign data to view trends." action={<Link href="/app/integrations#catalog" className="text-[13px] font-semibold text-[#0B5CFF]">Connect data sources</Link>} />}
        </Panel>
        <Panel title="Channel Mix" subtitle={d?.sessions.byDimension.length ? "Sessions by channel" : undefined}>
          {d?.sessions.byDimension.length ? <BarList rows={d.sessions.byDimension} /> : <EmptyState icon={PieChart} title="No channel data yet" body="Channel distribution appears when data is available." />}
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Audience Summary">
          {d?.users.total != null ? (
            <div className="py-6 text-center"><div className="text-[30px] font-bold text-deep-navy">{fmtInt(Math.round(d.users.total))}</div><div className="text-[13px] text-ink-soft">users in the last {range.days} days (GA4)</div></div>
          ) : (
            <EmptyState icon={Users} title="No audience data yet" body="Audience aggregates appear after tracking is configured." />
          )}
        </Panel>
        <Panel title="Attribution">
          <EmptyState icon={Share2} title="Not configured" body="Select an attribution model when measurement is ready." action={<Link href="/app/analytics/attribution" className="text-[13px] font-semibold text-[#0B5CFF]">Revenue Attribution</Link>} />
        </Panel>
        <Panel title="AI Insights">
          <EmptyState icon={Sparkles} title="No insights yet" body="Insights appear only when sufficient workspace data is available." action={<Link href="/app/ai-advisor" className="text-[13px] font-semibold text-[#0B5CFF]">Open AI Advisor</Link>} />
        </Panel>
      </div>
    </div>
  );
}
