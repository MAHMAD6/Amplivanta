import "server-only";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";

/**
 * Analytics & Reports reads. Figures come only from synced provider metrics
 * (ProviderMetricDaily), recorded campaign metrics and CRM records. Anything
 * without a source returns null so the screen shows "Not available yet".
 */

export type Range = { days: number; since: Date };

export function parseRange(raw?: string): Range {
  const days = [7, 30, 90].includes(Number(raw)) ? Number(raw) : 30;
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - days);
  return { days, since };
}

export async function analyticsContext() {
  try {
    const ctx = await getSessionContext();
    return { workspaceId: ctx.workspaceId };
  } catch {
    return null;
  }
}

type MetricAgg = { total: number | null; byDimension: [string, number][]; byDay: [string, number][] };

/** Sums one provider metric across the range, with dimension and daily breakdowns. */
export async function providerMetric(workspaceId: string, provider: string, metric: string | string[], range: Range): Promise<MetricAgg> {
  const metrics = Array.isArray(metric) ? metric : [metric];
  const rows = await db.providerMetricDaily.findMany({
    where: { workspaceId, provider, metric: { in: metrics }, date: { gte: range.since } },
    select: { date: true, dimension: true, value: true },
    take: 20000,
  });
  if (rows.length === 0) return { total: null, byDimension: [], byDay: [] };
  const dim = new Map<string, number>();
  const day = new Map<string, number>();
  let total = 0;
  for (const r of rows) {
    total += r.value;
    const d = r.dimension || "Unattributed";
    dim.set(d, (dim.get(d) ?? 0) + r.value);
    const k = r.date.toISOString().slice(0, 10);
    day.set(k, (day.get(k) ?? 0) + r.value);
  }
  return {
    total,
    byDimension: [...dim.entries()].sort((a, b) => b[1] - a[1]),
    byDay: [...day.entries()].sort((a, b) => a[0].localeCompare(b[0])),
  };
}

/** Average of a rate-style metric (e.g. CTR, position) rather than a sum. */
export async function providerAverage(workspaceId: string, provider: string, metric: string, range: Range): Promise<number | null> {
  const agg = await db.providerMetricDaily.aggregate({ where: { workspaceId, provider, metric, date: { gte: range.since } }, _avg: { value: true }, _count: true });
  return agg._count ? agg._avg.value : null;
}

export type CampaignRow = { id: string; name: string; channel: string; impressions: number; clicks: number; conversions: number; spend: number; revenue: number };

/** Campaign performance from recorded campaign metrics and synced ad platforms. */
export async function campaignPerformance(workspaceId: string, range: Range): Promise<CampaignRow[]> {
  const [recorded, ads] = await Promise.all([
    db.campaignMetric.groupBy({
      by: ["campaignId"],
      where: { campaign: { workspaceId }, date: { gte: range.since } },
      _sum: { impressions: true, clicks: true, conversions: true, spend: true, revenue: true },
    }),
    db.providerMetricDaily.groupBy({
      by: ["provider", "dimension", "metric"],
      where: { workspaceId, provider: { in: ["google_ads", "meta"] }, date: { gte: range.since } },
      _sum: { value: true },
    }),
  ]);
  const names = recorded.length ? await db.campaign.findMany({ where: { id: { in: recorded.map((r) => r.campaignId) } }, select: { id: true, name: true } }) : [];
  const rows: CampaignRow[] = recorded.map((r) => ({
    id: r.campaignId,
    name: names.find((n) => n.id === r.campaignId)?.name ?? "Campaign",
    channel: "Amplivanta",
    impressions: r._sum.impressions ?? 0,
    clicks: r._sum.clicks ?? 0,
    conversions: r._sum.conversions ?? 0,
    spend: r._sum.spend ?? 0,
    revenue: r._sum.revenue ?? 0,
  }));
  const adMap = new Map<string, CampaignRow>();
  for (const a of ads) {
    const key = `${a.provider}:${a.dimension}`;
    const row = adMap.get(key) ?? { id: key, name: a.dimension || "Unnamed campaign", channel: a.provider === "google_ads" ? "Google Ads" : "Meta", impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 };
    const v = a._sum.value ?? 0;
    if (a.metric === "impressions") row.impressions += v;
    else if (a.metric === "clicks") row.clicks += v;
    else if (a.metric === "conversions") row.conversions += v;
    else if (a.metric === "cost" || a.metric === "spend") row.spend += v;
    adMap.set(key, row);
  }
  return [...rows, ...adMap.values()].sort((a, b) => b.conversions - a.conversions || b.clicks - a.clicks);
}

/** CRM funnel counts for the range. */
export async function crmFunnel(workspaceId: string, range: Range) {
  const [leads, opportunities, won] = await Promise.all([
    db.contact.count({ where: { workspaceId, createdAt: { gte: range.since } } }),
    db.deal.count({ where: { workspaceId, createdAt: { gte: range.since } } }),
    db.deal.aggregate({ where: { workspaceId, status: "won", updatedAt: { gte: range.since } }, _count: true, _sum: { value: true } }),
  ]);
  return { leads, opportunities, customers: won._count, revenue: won._count ? won._sum.value ?? 0 : null };
}

export const sum = (rows: CampaignRow[], k: keyof Omit<CampaignRow, "id" | "name" | "channel">) => rows.reduce((n, r) => n + r[k], 0);
