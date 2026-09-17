import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowRight, ArrowUpRight, BarChart3, DollarSign, Diamond, FileText, Megaphone, ServerCrash, Star, Store, TrendingUp, Triangle, Users2 } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { BarList, EmptyState, Pill, ScreenHeader, TrendColumns, fmtDateTime, fmtMoney, kitOutline, type Stat } from "@/components/amplivanta/screen-kit";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { createCampaign } from "@/app/(app)/app/marketing/actions";
import { CAMPAIGN_CHANNELS, CAMPAIGN_GOALS } from "@/lib/marketing/options";
import { rangeDays } from "@/lib/server/marketing-screens";
import { actionLabel, workspaceContext } from "@/lib/server/workspace-screens";
import { change, loadPlatformHome, type PlatformHome } from "@/lib/server/platform-home";
import { RecalculateScoreButton } from "@/components/amplivanta/growth-score-ui";
import { OpportunityActions } from "@/components/amplivanta/growth-ui";
import { fmtDateTime as fmtWhen } from "@/components/amplivanta/screen-kit";

export const metadata: Metadata = { title: "Platform Home" };
export const dynamic = "force-dynamic";

const VIEWS: [string, string][] = [
  ["all", "All modules"],
  ["revenue", "Revenue & pipeline"],
  ["marketing", "Marketing & campaigns"],
];

type SP = { days?: string; compare?: string; view?: string };

const HEALTH_TONE = { ok: "green", warn: "amber", down: "red", off: "gray" } as const;
const HEALTH_LABEL = { ok: "Healthy", warn: "Attention", down: "Failing", off: "Not set up" } as const;

export default async function PlatformHomePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const days = rangeDays(sp.days ?? "30");
  const compare = sp.compare === "1";
  const view = VIEWS.some(([v]) => v === sp.view) ? sp.view! : "all";
  const c = await workspaceContext();

  let d: PlatformHome | null = null;
  let entry = { competitors: null as number | null, products: null as number | null };
  if (c) {
    try {
      const [home, competitors, products] = await Promise.all([
        loadPlatformHome(c.workspaceId, days),
        db.competitor.count({ where: { workspaceId: c.workspaceId, trackingEnabled: true } }).catch(() => null),
        db.marketplaceProduct.count({ where: { status: "PUBLISHED" } }).catch(() => null),
      ]);
      d = home;
      entry = { competitors, products };
    } catch {
      d = null;
    }
  }

  const withChange = (hint: string | undefined, cur: number | null, prev: number | null) => {
    if (!compare) return hint;
    const ch = change(cur, prev);
    return ch ? `${ch} vs previous ${days} days` : cur == null ? hint : "No previous period to compare";
  };
  const k = d?.kpis;
  const stats: Stat[] = [
    { label: "Revenue Influenced", icon: DollarSign, value: k?.revenue.value != null ? fmtMoney(k.revenue.value) : null, hint: withChange(k?.revenue.hint, k?.revenue.value ?? null, k?.revenue.previous ?? null) },
    { label: "Pipeline Value", icon: Diamond, value: k?.pipeline.value != null ? fmtMoney(k.pipeline.value, k.pipeline.currency) : null, hint: k?.pipeline.hint },
    { label: "Conversion Rate", icon: ArrowUpRight, value: k?.conversion.value != null ? `${k.conversion.value.toFixed(1)}%` : null, hint: withChange(k?.conversion.hint, k?.conversion.value ?? null, k?.conversion.previous ?? null) },
    { label: "Active Campaigns", icon: Megaphone, value: k?.campaigns.value != null ? String(k.campaigns.value) : null, hint: k?.campaigns.hint },
    { label: "Published Pages", icon: FileText, value: k?.pages.value != null ? String(k.pages.value) : null, hint: withChange(k?.pages.hint, k?.pages.value ?? null, k?.pages.previous ?? null) },
    { label: "Marketing ROI", icon: TrendingUp, value: k?.roi.value != null ? `${k.roi.value.toFixed(0)}%` : null, hint: withChange(k?.roi.hint, k?.roi.value ?? null, k?.roi.previous ?? null) },
  ];
  const showRevenue = view !== "marketing";
  const showMarketing = view !== "revenue";

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Platform Experience"], ["Executive Dashboard"]]}
        title="Platform Home"
        subtitle="Executive command center for cross-platform performance, execution, and next actions."
        actions={
          <form method="get" action="/app" className="flex flex-wrap items-center gap-2.5">
            {view !== "all" && <input type="hidden" name="view" value={view} />}
            <label className="sr-only" htmlFor="ph-days">Date Range</label>
            <select id="ph-days" name="days" defaultValue={String(days)} className="h-10 rounded-md border border-line bg-white px-3 text-[13.5px] font-semibold text-deep-navy">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <label className={cn(kitOutline, "cursor-pointer gap-2")}>
              <input type="checkbox" name="compare" value="1" defaultChecked={compare} className="h-4 w-4 rounded border-line" /> Compare
            </label>
            <label className="sr-only" htmlFor="ph-view">View</label>
            <select id="ph-view" name="view" defaultValue={view} className="h-10 rounded-md border border-line bg-white px-3 text-[13.5px] font-semibold text-deep-navy">
              {VIEWS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <button type="submit" className={kitOutline}>Apply</button>
          </form>
        }
      />

      {!c || !d ? (
        <section className="rounded-xl border border-line bg-white p-5">
          <EmptyState icon={ServerCrash} tone="orange" title={c ? "Dashboard data is unavailable" : "Sign in to a workspace"} body={c ? "Workspace data could not be loaded. Try again shortly." : "Platform Home shows data for the workspace you are signed in to."} />
        </section>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {stats.map((s) => (
              <div key={s.label} className="flex gap-4 rounded-xl border border-line bg-white px-5 py-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><s.icon className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-deep-navy">{s.label}</div>
                  <div className="mt-1.5 text-[21px] font-bold leading-tight text-deep-navy">{s.value ?? "—"}</div>
                  <div className="mt-1.5 text-[12px] text-ink-muted">{s.value == null && !s.hint?.startsWith("No ") ? "Not available yet" : s.hint}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section className="min-w-0 rounded-xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[16.5px] font-semibold text-deep-navy">Growth Score</h2>
                  <p className="mt-0.5 text-[12px] text-ink-soft">Measured over the last 30 days{d.growth.lastRun ? ` · last run ${fmtWhen(d.growth.lastRun)}` : ""}</p>
                </div>
                <RecalculateScoreButton />
              </div>
              {d.growth.status === "scored" ? (
                <>
                  <div className="mt-4 flex items-end gap-3">
                    <span className="text-[38px] font-bold leading-none text-deep-navy">{d.growth.score}</span>
                    <span className="pb-1 text-[13px] font-semibold text-ink-soft">{d.growth.band}</span>
                    {d.growth.previous != null && d.growth.score != null && d.growth.previous !== d.growth.score && (
                      <span className={cn("pb-1 text-[12.5px] font-semibold", d.growth.score > d.growth.previous ? "text-emerald-600" : "text-amber-600")}>
                        {d.growth.score > d.growth.previous ? "+" : ""}{d.growth.score - d.growth.previous} since last run
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] text-ink-muted">Average of the dimensions with enough data ({Math.round(d.growth.coverage * 100)}% coverage).</p>
                </>
              ) : (
                <div className="mt-4">
                  <div className="text-[20px] font-bold text-ink-soft">Not enough data to score</div>
                  <p className="mt-1 text-[12.5px] text-ink-soft">At least two of the four dimensions need data. A score is never estimated.</p>
                </div>
              )}
              <ul className="mt-4 space-y-3">
                {d.growth.dimensions.map((dim) => (
                  <li key={dim.key}>
                    <div className="flex items-baseline justify-between gap-2 text-[12.5px]">
                      <span className="font-semibold text-deep-navy">{dim.label}</span>
                      <span className={dim.covered ? "font-semibold text-deep-navy" : "text-ink-muted"}>{dim.covered ? dim.score : "No data"}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-bg-soft">
                      <div className="h-1.5 rounded-full bg-[#0B5CFF]" style={{ width: `${dim.covered ? dim.score ?? 0 : 0}%` }} />
                    </div>
                    {!dim.covered && <p className="mt-1 text-[11px] text-ink-muted">Needs: {dim.requirement}</p>}
                    {dim.covered && (
                      <ul className="mt-1.5 space-y-0.5 text-[11px] text-ink-soft">
                        {dim.signals.map((sig) => <li key={sig.label}>{sig.label}: <span className="font-medium text-deep-navy">{sig.value}</span> <span className="text-ink-muted">(target {sig.target})</span></li>)}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section className="min-w-0 rounded-xl border border-line bg-white p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-[16.5px] font-semibold text-deep-navy">Top Opportunities</h2>
                <Link href="/app/ai-advisor" className="text-[12.5px] font-semibold text-[#0B5CFF]">AI Advisor</Link>
              </div>
              {d.opportunities.length ? (
                <ul className="mt-3 divide-y divide-line">
                  {d.opportunities.slice(0, 3).map((o) => (
                    <li key={o.id} className="py-3">
                      <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-ink-muted">
                        <Pill tone={o.impact === "high" ? "red" : o.impact === "medium" ? "amber" : "gray"}>{o.impact} impact</Pill>
                        <span>{o.effort} effort</span>
                        {o.confidence != null && <span>· {Math.round(o.confidence * 100)}% confidence</span>}
                        <span>· {o.source === "rules" ? "Detected from your data" : "AI Advisor"}</span>
                      </div>
                      <div className="mt-1 text-[14px] font-semibold text-deep-navy">{o.title}</div>
                      {o.metric && <div className="text-[12px] text-ink-soft">Affects {o.metric}</div>}
                      {o.evidence && <p className="mt-1 text-[12.5px] text-ink-soft">{o.evidence}</p>}
                      {o.action && <p className="mt-1 text-[12.5px] text-deep-navy">{o.action}</p>}
                      <div className="mt-2"><OpportunityActions id={o.id} href={o.href} canEdit={c.canEdit} /></div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={Star} title="No opportunities detected" body={d.growth.status === "scored" ? "Nothing is below target in the measured period. New findings appear after each recalculation." : "Connect data so acquisition and conversion can be measured, then recalculate."} />
              )}
            </section>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)]">
            {showMarketing && (
              <section className="min-w-0 rounded-xl border border-line bg-white p-5">
                <h2 className="text-[16.5px] font-semibold text-deep-navy">Performance Overview</h2>
                {d.performance ? (
                  <>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {([["Leads", d.performance.totals.leads], ["Page visits", d.performance.totals.visits], ["Conversions", d.performance.totals.conversions], ["Form submissions", d.performance.totals.submissions]] as const).map(([l, v]) => (
                        <div key={l}><div className="text-[18px] font-bold text-deep-navy">{v.toLocaleString("en-US")}</div><div className="text-[11.5px] text-ink-soft">{l}</div></div>
                      ))}
                    </div>
                    <div className="mt-4"><TrendColumns points={d.performance.totals.leads ? d.performance.leads : d.performance.visits} label={d.performance.totals.leads ? "New leads" : "Page visits"} /></div>
                  </>
                ) : (
                  <EmptyState icon={BarChart3} title="No performance data yet" body="Connected analytics and campaign data will appear here for the selected date range." />
                )}
              </section>
            )}
            {showRevenue && (
              <section className="min-w-0 rounded-xl border border-line bg-white p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-[16.5px] font-semibold text-deep-navy">Pipeline Summary</h2>
                  <Link href="/app/crm/deals" className="text-[12.5px] font-semibold text-[#0B5CFF]">Open deals</Link>
                </div>
                {d.pipeline ? (
                  <>
                    <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
                      <Pill tone="blue">{d.pipeline.open} open</Pill>
                      <Pill tone="green">{d.pipeline.won} won in range</Pill>
                      <Pill tone="gray">{d.pipeline.lost} lost in range</Pill>
                    </div>
                    <div className="mt-4">
                      {d.pipeline.stages.length ? <BarList rows={d.pipeline.stages.map((s) => [`${s.name} (${s.count})`, s.value])} format={(n) => fmtMoney(n, d!.pipeline!.currency) ?? ""} /> : <p className="text-[12.5px] text-ink-soft">No open deals right now.</p>}
                    </div>
                  </>
                ) : (
                  <EmptyState icon={Triangle} title="No pipeline data yet" body="CRM pipeline values will appear only when accessible data exists." />
                )}
              </section>
            )}
            {showMarketing && (
              <section className="min-w-0 rounded-xl border border-line bg-white p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-[16.5px] font-semibold text-deep-navy">Top Campaigns</h2>
                  <Link href="/app/analytics/campaigns" className="text-[12.5px] font-semibold text-[#0B5CFF]">Campaign analytics</Link>
                </div>
                {d.campaigns.length ? (
                  <ul className="mt-3 divide-y divide-line">
                    {d.campaigns.map((cp) => (
                      <li key={cp.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <Link href={`/app/marketing/campaigns?c=${cp.id}`} className="block truncate text-[13.5px] font-semibold text-deep-navy hover:text-[#0B5CFF]">{cp.name}</Link>
                          <div className="text-[11.5px] text-ink-soft">{cp.conversions.toLocaleString("en-US")} conversions · {cp.clicks.toLocaleString("en-US")} clicks · spend {fmtMoney(cp.spend)}</div>
                        </div>
                        <div className="shrink-0 text-right text-[13.5px] font-semibold text-deep-navy">{fmtMoney(cp.revenue)}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState icon={Megaphone} title="No campaign data yet" body="Campaign performance will appear when campaign and analytics data are available." />
                )}
              </section>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.65fr)]">
            <section className="min-w-0 rounded-xl border border-line bg-white p-5">
              <h2 className="text-[16.5px] font-semibold text-deep-navy">Platform Health</h2>
              <ul className="mt-3 divide-y divide-line">
                {d.health.map((h) => (
                  <li key={h.label} className="py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={h.href} className="text-[13.5px] font-semibold text-deep-navy hover:text-[#0B5CFF]">{h.label}</Link>
                      <Pill tone={HEALTH_TONE[h.status]}>{HEALTH_LABEL[h.status]}</Pill>
                    </div>
                    <p className="mt-0.5 text-[12px] text-ink-soft">{h.detail}</p>
                  </li>
                ))}
              </ul>
            </section>
            <section className="min-w-0 rounded-xl border border-line bg-white p-5">
              <h2 className="text-[16.5px] font-semibold text-deep-navy">Recommendations</h2>
              {d.recommendations.length ? (
                <>
                  <ul className="mt-3 space-y-2.5">
                    {d.recommendations.map((r) => (
                      <li key={r.title}>
                        <Link href={r.href} className="group flex items-start justify-between gap-3 rounded-lg border border-line px-3.5 py-3 hover:border-[#0B5CFF]/40">
                          <div><div className="text-[13.5px] font-semibold text-deep-navy">{r.title}</div><div className="text-[12px] text-ink-soft">{r.detail}</div></div>
                          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink-muted group-hover:text-[#0B5CFF]" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[11.5px] text-ink-muted">Rule-based checks on your workspace data.</p>
                </>
              ) : (
                <EmptyState icon={Star} title="No recommendations yet" body="Recommendations will appear when sufficient source data is available." />
              )}
            </section>
            <section className="min-w-0 rounded-xl border border-line bg-white p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-[16.5px] font-semibold text-deep-navy">Recent Activity</h2>
                {d.activity.length > 0 && <Link href="/app/settings/audit" className="text-[12.5px] font-semibold text-[#0B5CFF]">View all</Link>}
              </div>
              {d.activity.length ? (
                <ul className="mt-3 divide-y divide-line">
                  {d.activity.map((a) => (
                    <li key={a.id} className="py-2.5">
                      <div className="text-[13px] font-semibold capitalize text-deep-navy">{actionLabel(a.action)}</div>
                      <div className="text-[11.5px] text-ink-soft">{[a.resourceType, a.actor, fmtDateTime(a.createdAt)].filter(Boolean).join(" · ")}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={Activity} title="No recent activity" body="Cross-module activity will appear as workspace events occur." />
              )}
            </section>
            <section className="min-w-0 rounded-xl border border-line bg-white p-5">
              <h2 className="text-[16.5px] font-semibold text-deep-navy">Quick Actions</h2>
              <div className="mt-4 space-y-3">
                <FormDialog title="Create Campaign" label="Create Campaign" className={cn(kitOutline, "w-full")} action={createCampaign} disabled={!c.canEdit} goTo="/app/marketing/campaigns?c=" submitLabel="Create campaign" fields={[{ name: "name", label: "Campaign name", kind: "text", required: true }, { name: "channel", label: "Channel", kind: "select", options: CAMPAIGN_CHANNELS, placeholder: "Select" }, { name: "goal", label: "Goal", kind: "select", options: CAMPAIGN_GOALS, placeholder: "Select" }, { name: "startDate", label: "Start date", kind: "date" }, { name: "endDate", label: "End date", kind: "date" }]} />
                <Link href="/app/crm/deals" className={cn(kitOutline, "w-full")}>Add Deal</Link>
                <Link href="/app/analytics" className={cn(kitOutline, "w-full")}>Open Analytics</Link>
                <Link href="/app/integrations" className={cn(kitOutline, "w-full")}>Connect Data</Link>
              </div>
            </section>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Link href="/app/content-intelligence/competitors" className="group flex items-center gap-4 rounded-xl border border-line bg-white p-4 transition hover:border-[#0B5CFF]/40">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Users2 className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-deep-navy">Competitor Watch</div>
                <p className="text-[12px] text-ink-soft">{entry.competitors == null ? "Discover and monitor competitors." : entry.competitors === 0 ? "No competitors tracked yet." : `${entry.competitors} competitor${entry.competitors === 1 ? "" : "s"} tracked.`}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-ink-muted group-hover:text-[#0B5CFF]" />
            </Link>
            <Link href="/app/marketplace" className="group flex items-center gap-4 rounded-xl border border-line bg-white p-4 transition hover:border-[#0B5CFF]/40">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet/10 text-violet"><Store className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-deep-navy">Marketplace</div>
                <p className="text-[12px] text-ink-soft">{entry.products == null ? "Templates, playbooks and tools from sellers." : entry.products === 0 ? "No products are published yet." : `${entry.products} published product${entry.products === 1 ? "" : "s"} to browse.`}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-ink-muted group-hover:text-[#0B5CFF]" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
