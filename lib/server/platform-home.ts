import "server-only";
import { db } from "@/lib/db";
import { emailProvider } from "@/lib/email";
import { isStripeConfigured } from "@/lib/stripe";
import { dailySeries } from "@/lib/server/marketing-screens";
import { loadGrowthScore, type GrowthScoreView } from "@/lib/server/growth-score";
import { scoreBand } from "@/lib/growth/score";

/**
 * Platform Home / Executive Dashboard data. Every figure is computed from
 * workspace records for the selected range; a metric with no source data is
 * null so the screen shows "Not available yet" instead of a zero or estimate.
 */

export type Kpi = { value: number | null; previous: number | null; hint?: string };

export type TopOpportunity = { id: string; title: string; metric: string | null; evidence: string | null; action: string | null; href: string | null; impact: string; effort: string; confidence: number | null; source: string };

export type PlatformHome = {
  /** Growth Score with its dimensions and coverage; the score is null until coverage is enough. */
  growth: { score: number | null; band: string; status: string; coverage: number; missing: string[]; dimensions: GrowthScoreView["score"]["dimensions"]; previous: number | null; lastRun: Date | null };
  /** Ranked open opportunities with their evidence. */
  opportunities: TopOpportunity[];
  kpis: { revenue: Kpi; pipeline: Kpi & { currency: string }; conversion: Kpi; campaigns: Kpi; pages: Kpi; roi: Kpi };
  performance: { leads: [string, number][]; visits: [string, number][]; totals: { leads: number; visits: number; conversions: number; submissions: number } } | null;
  pipeline: { stages: { name: string; count: number; value: number }[]; open: number; won: number; lost: number; currency: string } | null;
  campaigns: { id: string; name: string; status: string; revenue: number; conversions: number; spend: number; clicks: number }[];
  health: { label: string; status: "ok" | "warn" | "down" | "off"; detail: string; href: string }[];
  recommendations: { title: string; detail: string; href: string }[];
  activity: { id: string; action: string; resourceType: string | null; actor: string | null; createdAt: Date }[];
};

const sumBy = <T,>(rows: T[], f: (r: T) => number) => rows.reduce((a, r) => a + f(r), 0);

export async function loadPlatformHome(workspaceId: string, days: number): Promise<PlatformHome> {
  const now = Date.now();
  const from = new Date(now - days * 86400000);
  const prevFrom = new Date(now - 2 * days * 86400000);
  const day = new Date(now - 86400000);
  const w = workspaceId;

  const [
    growth, openRecommendations,
    metrics, prevMetrics, openDeals, wonDeals, lostDeals, prevWon,
    visits, conversions, prevVisits, prevConversions,
    activeCampaigns, publishedPages, pagesPublishedPrev,
    leads, submissions, stages,
    integrations, failedRuns, webhookFails, draftPages, scheduledNoProvider, idleForms, unverifiedDomains, campaignsTotal, contactsTotal,
    logs, campaignsList,
  ] = await Promise.all([
    loadGrowthScore(w).catch(() => null),
    db.recommendation.findMany({ where: { workspaceId: w, status: { in: ["pending", "ready", "in_progress"] } }, orderBy: [{ impact: "asc" }, { createdAt: "desc" }], take: 6, select: { id: true, title: true, metric: true, evidence: true, description: true, actionHref: true, impact: true, effort: true, confidence: true, source: true } }),
    db.campaignMetric.findMany({ where: { campaign: { workspaceId: w }, date: { gte: from } }, select: { campaignId: true, revenue: true, spend: true, conversions: true, clicks: true } }),
    db.campaignMetric.aggregate({ where: { campaign: { workspaceId: w }, date: { gte: prevFrom, lt: from } }, _sum: { revenue: true, spend: true }, _count: true }),
    db.deal.findMany({ where: { workspaceId: w, status: "open" }, select: { value: true, currency: true, stageId: true } }),
    db.deal.count({ where: { workspaceId: w, status: "won", updatedAt: { gte: from } } }),
    db.deal.count({ where: { workspaceId: w, status: "lost", updatedAt: { gte: from } } }),
    db.deal.count({ where: { workspaceId: w, status: "won", updatedAt: { gte: prevFrom, lt: from } } }),
    db.landingPageVisit.findMany({ where: { workspaceId: w, createdAt: { gte: from } }, select: { createdAt: true, converted: true } }),
    db.landingPageVisit.count({ where: { workspaceId: w, createdAt: { gte: from }, converted: true } }),
    db.landingPageVisit.count({ where: { workspaceId: w, createdAt: { gte: prevFrom, lt: from } } }),
    db.landingPageVisit.count({ where: { workspaceId: w, createdAt: { gte: prevFrom, lt: from }, converted: true } }),
    db.campaign.count({ where: { workspaceId: w, status: { in: ["active", "live"] } } }),
    db.landingPage.count({ where: { workspaceId: w, isPublished: true } }),
    db.landingPage.count({ where: { workspaceId: w, isPublished: true, publishedAt: { lt: from } } }),
    db.contact.findMany({ where: { workspaceId: w, createdAt: { gte: from } }, select: { createdAt: true } }),
    db.formSubmission.count({ where: { form: { workspaceId: w }, createdAt: { gte: from } } }),
    db.stage.findMany({ where: { workspaceId: w }, select: { id: true, name: true, order: true, pipeline: { select: { isDefault: true } } }, orderBy: [{ order: "asc" }] }),
    db.integration.findMany({ where: { workspaceId: w }, select: { provider: true, status: true } }),
    db.workflowExecution.count({ where: { workflow: { workspaceId: w }, status: "failed", environment: "live", startedAt: { gte: day } } }),
    db.webhookDelivery.count({ where: { webhook: { workspaceId: w }, createdAt: { gte: day }, OR: [{ responseCode: null }, { responseCode: 0 }, { responseCode: { gte: 300 } }] } }),
    db.landingPage.count({ where: { workspaceId: w, status: "draft" } }),
    emailProvider() ? Promise.resolve(0) : db.emailCampaign.count({ where: { workspaceId: w, status: "scheduled" } }),
    db.form.count({ where: { workspaceId: w, status: "active", submissions: { none: {} } } }),
    db.domain.count({ where: { workspaceId: w, isVerified: false } }),
    db.campaign.count({ where: { workspaceId: w } }),
    db.contact.count({ where: { workspaceId: w } }),
    db.auditLog.findMany({ where: { workspaceId: w }, orderBy: { createdAt: "desc" }, take: 6, select: { id: true, action: true, resourceType: true, createdAt: true, user: { select: { name: true, email: true } } } }),
    db.campaign.findMany({ where: { workspaceId: w, status: { not: "archived" } }, select: { id: true, name: true, status: true }, orderBy: { updatedAt: "desc" }, take: 50 }),
  ]);

  // Revenue and ROI come only from recorded campaign metrics.
  const revenue = metrics.length ? sumBy(metrics, (m) => m.revenue) : null;
  const spend = sumBy(metrics, (m) => m.spend);
  const prevRevenue = prevMetrics._count ? prevMetrics._sum.revenue ?? 0 : null;
  const prevSpend = prevMetrics._sum.spend ?? 0;
  const roi = revenue != null && spend > 0 ? ((revenue - spend) / spend) * 100 : null;
  const prevRoi = prevRevenue != null && prevSpend > 0 ? ((prevRevenue - prevSpend) / prevSpend) * 100 : null;

  // Pipeline in the dominant currency; other currencies are counted, not converted.
  const byCurrency = new Map<string, number>();
  for (const d of openDeals) byCurrency.set(d.currency, (byCurrency.get(d.currency) ?? 0) + 1);
  const currency = [...byCurrency.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "USD";
  const inCurrency = openDeals.filter((d) => d.currency === currency);
  const otherCurrency = openDeals.length - inCurrency.length;

  const stageRows = stages
    .map((s) => {
      const ds = inCurrency.filter((d) => d.stageId === s.id);
      return { name: s.name, count: ds.length, value: sumBy(ds, (d) => d.value) };
    })
    .filter((s) => s.count > 0);
  const unstaged = inCurrency.filter((d) => !d.stageId || !stages.some((s) => s.id === d.stageId));
  if (unstaged.length) stageRows.push({ name: "No stage", count: unstaged.length, value: sumBy(unstaged, (d) => d.value) });

  const perCampaign = new Map<string, { revenue: number; conversions: number; spend: number; clicks: number }>();
  for (const m of metrics) {
    const c = perCampaign.get(m.campaignId) ?? { revenue: 0, conversions: 0, spend: 0, clicks: 0 };
    c.revenue += m.revenue;
    c.conversions += m.conversions;
    c.spend += m.spend;
    c.clicks += m.clicks;
    perCampaign.set(m.campaignId, c);
  }
  const campaigns = campaignsList
    .filter((c) => perCampaign.has(c.id))
    .map((c) => ({ ...c, ...perCampaign.get(c.id)! }))
    .sort((a, b) => b.revenue - a.revenue || b.conversions - a.conversions)
    .slice(0, 5);

  const broken = integrations.filter((i) => ["error", "reauth_required", "expired", "needs_resource"].includes(i.status));
  const connected = integrations.filter((i) => i.status === "connected");
  const health: PlatformHome["health"] = [
    { label: "Integrations", status: integrations.length === 0 ? "off" : broken.length ? "warn" : "ok", detail: integrations.length === 0 ? "No integrations connected" : broken.length ? `${broken.length} need attention (${broken.map((b) => b.provider).slice(0, 3).join(", ")})` : `${connected.length} connected`, href: "/app/integrations" },
    { label: "Workflows", status: failedRuns ? "down" : "ok", detail: failedRuns ? `${failedRuns} failed run${failedRuns === 1 ? "" : "s"} in the last 24 hours` : "No failed runs in the last 24 hours", href: "/app/marketing/execution-logs" },
    { label: "Webhooks", status: webhookFails ? "warn" : "ok", detail: webhookFails ? `${webhookFails} failed deliver${webhookFails === 1 ? "y" : "ies"} in the last 24 hours` : "No failed deliveries in the last 24 hours", href: "/app/integrations/webhooks" },
    { label: "Email delivery", status: emailProvider() ? "ok" : "off", detail: emailProvider() ? "Email provider configured" : "No email provider configured; sends are recorded as not sent", href: "/app/marketing/deliverability" },
    { label: "Payments", status: isStripeConfigured() ? "ok" : "off", detail: isStripeConfigured() ? "Online billing connected" : "Online checkout is not connected", href: "/app/settings/billing" },
  ];

  const recommendations: PlatformHome["recommendations"] = [];
  if (broken.length) recommendations.push({ title: "Reconnect integrations", detail: `${broken.length} integration${broken.length === 1 ? " is" : "s are"} not syncing.`, href: "/app/integrations" });
  if (failedRuns) recommendations.push({ title: "Review failed workflow runs", detail: `${failedRuns} live run${failedRuns === 1 ? "" : "s"} failed in the last 24 hours.`, href: "/app/marketing/execution-logs" });
  if (scheduledNoProvider) recommendations.push({ title: "Configure email delivery", detail: `${scheduledNoProvider} scheduled email campaign${scheduledNoProvider === 1 ? "" : "s"} cannot send without a provider.`, href: "/app/marketing/deliverability" });
  if (unverifiedDomains) recommendations.push({ title: "Verify domains", detail: `${unverifiedDomains} domain${unverifiedDomains === 1 ? " is" : "s are"} not verified.`, href: "/app/marketing/domains" });
  if (draftPages && publishedPages === 0) recommendations.push({ title: "Publish a landing page", detail: `${draftPages} draft page${draftPages === 1 ? "" : "s"} ready to review.`, href: "/app/marketing/publishing" });
  if (idleForms) recommendations.push({ title: "Promote idle forms", detail: `${idleForms} active form${idleForms === 1 ? " has" : "s have"} no submissions yet.`, href: "/app/marketing/forms" });
  if (contactsTotal > 0 && campaignsTotal === 0) recommendations.push({ title: "Start a campaign", detail: `You have ${contactsTotal.toLocaleString("en-US")} contacts and no campaigns.`, href: "/app/marketing/campaigns" });
  if (openDeals.length === 0 && contactsTotal > 0) recommendations.push({ title: "Track opportunities", detail: "No open deals are in the pipeline.", href: "/app/crm/deals" });

  const hasPerformance = leads.length > 0 || visits.length > 0 || submissions > 0;

  const impactRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const opportunities: TopOpportunity[] = openRecommendations
    .map((r) => ({ id: r.id, title: r.title, metric: r.metric, evidence: r.evidence, action: r.description, href: r.actionHref, impact: r.impact, effort: r.effort, confidence: r.confidence, source: r.source }))
    .sort((a, b) => (impactRank[a.impact] ?? 3) - (impactRank[b.impact] ?? 3) || (b.confidence ?? 0) - (a.confidence ?? 0));

  return {
    growth: {
      score: growth?.score.score ?? null,
      band: scoreBand(growth?.score.score ?? null),
      status: growth?.score.status ?? "insufficient_data",
      coverage: growth?.score.coverage ?? 0,
      missing: growth?.score.missing ?? [],
      dimensions: growth?.score.dimensions ?? [],
      previous: growth?.previous?.score ?? null,
      lastRun: growth?.lastRun ?? null,
    },
    opportunities,
    kpis: {
      revenue: { value: revenue, previous: prevRevenue, hint: revenue == null ? undefined : `From recorded campaign results · ${wonDeals} deal${wonDeals === 1 ? "" : "s"} won${prevWon ? ` (${prevWon} previous)` : ""}` },
      pipeline: { value: openDeals.length ? sumBy(inCurrency, (d) => d.value) : null, previous: null, currency, hint: openDeals.length ? `${inCurrency.length} open deal${inCurrency.length === 1 ? "" : "s"}${otherCurrency ? ` · ${otherCurrency} in other currencies not included` : ""}` : undefined },
      conversion: { value: visits.length ? (conversions / visits.length) * 100 : null, previous: prevVisits ? (prevConversions / prevVisits) * 100 : null, hint: visits.length ? `${conversions} of ${visits.length} landing page visits` : undefined },
      campaigns: { value: activeCampaigns || null, previous: null, hint: activeCampaigns ? `${campaignsTotal} total` : campaignsTotal ? `${campaignsTotal} campaigns, none active` : undefined },
      pages: { value: publishedPages || null, previous: pagesPublishedPrev || null, hint: publishedPages ? (draftPages ? `${draftPages} in draft` : "All pages live") : undefined },
      roi: { value: roi, previous: prevRoi, hint: roi == null ? (revenue != null ? "No campaign spend recorded" : undefined) : `Spend ${spend.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}` },
    },
    performance: hasPerformance
      ? { leads: dailySeries(leads.map((l) => l.createdAt), days), visits: dailySeries(visits.map((v) => v.createdAt), days), totals: { leads: leads.length, visits: visits.length, conversions, submissions } }
      : null,
    pipeline: openDeals.length || wonDeals || lostDeals ? { stages: stageRows, open: openDeals.length, won: wonDeals, lost: lostDeals, currency } : null,
    campaigns,
    health,
    recommendations: recommendations.slice(0, 5),
    activity: logs.map((l) => ({ id: l.id, action: l.action, resourceType: l.resourceType, actor: l.user?.name || l.user?.email || null, createdAt: l.createdAt })),
  };
}

/** "+12.5%" style change between periods, or null when there is no comparable previous value. */
export function change(current: number | null, previous: number | null): string | null {
  if (current == null || previous == null || previous === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  if (!Number.isFinite(pct)) return null;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}
