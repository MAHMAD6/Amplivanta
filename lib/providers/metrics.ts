import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Normalized daily provider metrics.
 *
 * Every growth-data connector maps its own response into these rows, so the
 * product reads one shape regardless of provider. Writes are idempotent on
 * (workspace, provider, metric, date, dimension) so a re-sync of the same
 * window corrects values instead of duplicating them.
 */

export type MetricRow = {
  provider: string;
  metric: string;
  date: Date;
  value: number;
  /** e.g. campaign or channel; "" when the metric is workspace-wide. */
  dimension?: string;
  currency?: string | null;
  meta?: Prisma.InputJsonValue;
};

export async function saveMetrics(workspaceId: string, rows: MetricRow[]): Promise<number> {
  let written = 0;
  for (const r of rows) {
    const date = new Date(r.date);
    date.setUTCHours(0, 0, 0, 0);
    const key = {
      workspaceId_provider_metric_date_dimension: {
        workspaceId,
        provider: r.provider,
        metric: r.metric,
        date,
        dimension: r.dimension ?? "",
      },
    };
    await db.providerMetricDaily.upsert({
      where: key,
      create: {
        workspaceId,
        provider: r.provider,
        metric: r.metric,
        date,
        dimension: r.dimension ?? "",
        value: r.value,
        currency: r.currency ?? null,
        meta: r.meta ?? {},
      },
      update: { value: r.value, currency: r.currency ?? null, meta: r.meta ?? {} },
    });
    written++;
  }
  return written;
}

/** Normalised metrics for a window, newest first. */
export async function loadMetrics(workspaceId: string, opts: { provider?: string; days?: number } = {}) {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (opts.days ?? 30));
  try {
    return await db.providerMetricDaily.findMany({
      where: { workspaceId, ...(opts.provider ? { provider: opts.provider } : {}), date: { gte: since } },
      orderBy: [{ date: "desc" }, { value: "desc" }],
      take: 1000,
    });
  } catch {
    return [];
  }
}

/** The UTC date window a sync should request, inclusive. */
export function syncWindow(days = 28): { start: Date; end: Date; startISO: string; endISO: string } {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start, end, startISO: iso(start), endISO: iso(end) };
}
