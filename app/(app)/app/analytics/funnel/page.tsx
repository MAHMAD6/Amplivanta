import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Crosshair, Filter, GitBranch, Hand, PieChart, Plug, TrendingDown, TrendingUp, UserCheck, UserPlus, Users } from "lucide-react";
import { BarList, DataTable, EmptyState, Panel, RangeSelect, ScreenHeader, StatGrid, fmtInt, kitPrimary } from "@/components/amplivanta/screen-kit";
import { analyticsContext, crmFunnel, parseRange, providerMetric } from "@/lib/server/analytics-screens";

export const metadata: Metadata = { title: "Conversion Funnel" };
export const dynamic = "force-dynamic";

export default async function ConversionFunnelPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days } = await searchParams;
  const range = parseRange(days);
  const c = await analyticsContext();
  let visitors: number | null = null;
  let funnel: Awaited<ReturnType<typeof crmFunnel>> | null = null;
  if (c) {
    try {
      const [users, crm] = await Promise.all([providerMetric(c.workspaceId, "google_analytics", "totalUsers", range), crmFunnel(c.workspaceId, range)]);
      visitors = users.total != null ? Math.round(users.total) : null;
      funnel = crm;
    } catch {
      funnel = null;
    }
  }
  const stages: [string, number | null][] = [
    ["Visitors", visitors],
    ["Leads", funnel?.leads ?? null],
    ["Opportunities", funnel?.opportunities ?? null],
    ["Customers", funnel?.customers ?? null],
  ];
  const hasCrm = Boolean(funnel && funnel.leads + funnel.opportunities + funnel.customers > 0);
  const known = stages.filter((s): s is [string, number] => s[1] != null && s[1] > 0);
  const drops = known.slice(1).map(([label, v], i) => [`${known[i][0]} → ${label}`, known[i][1] ? `${((v / known[i][1]) * 100).toFixed(1)}% continue` : "—", known[i][1] - v] as const);
  const top = visitors ?? funnel?.leads ?? 0;
  const overall = funnel && top > 0 && funnel.customers > 0 ? `${((funnel.customers / top) * 100).toFixed(2)}%` : null;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Analytics & Reports", "/app/analytics"], ["Conversion Funnel"]]}
        title="Conversion Funnel"
        subtitle="Visualize conversion flow and identify drop-off points once tracking is connected."
        actions={<><RangeSelect days={range.days} /><Link href="/app/integrations#catalog" className={`${kitPrimary} h-11`}><Plug className="h-4 w-4" /> Connect Data Sources</Link></>}
      />
      <StatGrid
        stats={[
          { label: "Visitors", icon: Users, value: visitors ? fmtInt(visitors) : null, hint: visitors ? "GA4 users" : undefined },
          { label: "Leads", icon: UserPlus, value: hasCrm ? fmtInt(funnel!.leads) : null, hint: hasCrm ? "New contacts" : undefined },
          { label: "Opportunities", icon: Crosshair, value: hasCrm ? fmtInt(funnel!.opportunities) : null, hint: hasCrm ? "New deals" : undefined },
          { label: "Customers", icon: UserCheck, value: hasCrm ? fmtInt(funnel!.customers) : null, hint: hasCrm ? "Deals won" : undefined },
          { label: "Overall Conversion Rate", icon: TrendingUp, value: overall, hint: overall ? (visitors ? "Customers ÷ visitors" : "Customers ÷ leads") : undefined },
        ]}
      />
      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Funnel Stages">
          {known.length ? <BarList rows={known} /> : <EmptyState icon={Filter} title="No funnel data yet" body="Connect data sources to build and visualize your conversion funnel." />}
        </Panel>
        <Panel title="Drop-off Analysis">
          {drops.length ? (
            <DataTable minWidth={320} columns={["Step", "Continue", "Drop-off"]} rows={drops.map(([step, rate, lost]) => [step, rate, fmtInt(Math.max(0, lost))])} />
          ) : (
            <EmptyState icon={TrendingDown} title="No drop-off data yet" body="Identify where prospects drop off in your funnel once data is available." />
          )}
        </Panel>
        <Panel title="Source Contribution">
          <EmptyState icon={PieChart} title="No source data yet" body="See which sources contribute to conversions once lead sources are tracked." />
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Conversion Paths">
          <EmptyState icon={GitBranch} title="No conversion paths yet" body="Visualize how users move through your funnel once tracking is connected." />
        </Panel>
        <Panel title="Assisted Touchpoints">
          <EmptyState icon={Hand} title="No touchpoint data yet" body="Discover assisted interactions that influence conversions once data is available." />
        </Panel>
        <Panel title="Recommended Next Steps">
          <EmptyState icon={Compass} title="No recommendations yet" body="Recommendations will appear when sufficient conversion data is available." />
        </Panel>
      </div>
    </div>
  );
}
