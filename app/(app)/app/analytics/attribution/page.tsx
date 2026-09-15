import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftRight, BarChart3, DollarSign, Filter, PieChart, Plug, Route, Scale, Split, TrendingUp, Users, Crosshair } from "lucide-react";
import { EmptyState, Panel, ScreenHeader, StatGrid, fmtMoney, kitPrimary } from "@/components/amplivanta/screen-kit";
import { analyticsContext, campaignPerformance, crmFunnel, parseRange, sum } from "@/lib/server/analytics-screens";

export const metadata: Metadata = { title: "Revenue Attribution" };
export const dynamic = "force-dynamic";

/**
 * Attribution needs touchpoint-level journeys joined to revenue, which no
 * connected source provides yet. The screen shows campaign ROI/ROAS where
 * recorded, and says so plainly for everything that would require a model.
 */
export default async function RevenueAttributionPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days } = await searchParams;
  const range = parseRange(days);
  const c = await analyticsContext();
  let spend = 0;
  let revenue = 0;
  let won: number | null = null;
  if (c) {
    try {
      const [rows, crm] = await Promise.all([campaignPerformance(c.workspaceId, range), crmFunnel(c.workspaceId, range)]);
      spend = sum(rows, "spend");
      revenue = sum(rows, "revenue");
      won = crm.revenue;
    } catch {
      spend = 0;
    }
  }
  const body = "Configure your data sources and attribution model to see insights here.";

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Analytics & Reports", "/app/analytics"], ["Revenue Attribution"]]}
        title="Revenue Attribution"
        subtitle="Understand channel and campaign attribution once data sources and models are configured."
        actions={
          <>
            <span className="inline-flex h-11 items-center gap-2 rounded-md border border-line bg-white px-5 text-[13.5px] font-semibold text-ink-muted" title="Attribution models become available once touchpoint data is tracked"><Split className="h-4 w-4" /> Attribution Model: Not configured</span>
            <Link href="/app/integrations#catalog" className={`${kitPrimary} h-11`}><Plug className="h-4 w-4" /> Connect Data Sources</Link>
          </>
        }
      />
      <StatGrid
        stats={[
          { label: "Attributed Revenue", icon: DollarSign, value: null },
          { label: "Influenced Revenue", icon: Users, value: null, hint: won != null ? `${fmtMoney(won)} won in CRM, not yet attributed` : undefined },
          { label: "ROI", icon: TrendingUp, value: spend > 0 && revenue > 0 ? `${Math.round(((revenue - spend) / spend) * 100)}%` : null },
          { label: "ROAS", icon: Crosshair, value: spend > 0 && revenue > 0 ? `${(revenue / spend).toFixed(2)}x` : null },
          { label: "Average Touchpoints", icon: Route, value: null },
        ]}
      />
      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Attribution Overview"><EmptyState icon={BarChart3} title="No attribution data yet" body={body} /></Panel>
        <Panel title="Channel Contribution"><EmptyState icon={PieChart} title="No attribution data yet" body="Channel contribution insights will appear here once data is available." /></Panel>
        <Panel title="Campaign Contribution"><EmptyState icon={Filter} title="No attribution data yet" body="Campaign contribution insights will appear here once data is available." /></Panel>
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Top Touchpoints"><EmptyState icon={Route} title="No attribution data yet" body="Top touchpoints across the customer journey will appear here once data is available." /></Panel>
        <Panel title="Assisted Conversions"><EmptyState icon={ArrowLeftRight} title="No attribution data yet" body="Assisted conversion insights will appear here once data is available." /></Panel>
        <Panel title="Model Comparison"><EmptyState icon={Scale} title="No attribution data yet" body="Compare attribution models side by side once data is available." /></Panel>
      </div>
    </div>
  );
}
