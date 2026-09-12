import "server-only";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";

/**
 * Totals per provider and metric for the current workspace, for the connected
 * apps page. Empty when nothing has been synced — never a placeholder figure.
 */
export async function loadWorkspaceMetricSummary(days = 30) {
  try {
    const ctx = await getSessionContext();
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - days);
    const grouped = await db.providerMetricDaily.groupBy({
      by: ["provider", "metric"],
      where: { workspaceId: ctx.workspaceId, date: { gte: since } },
      _sum: { value: true },
      orderBy: { _sum: { value: "desc" } },
      take: 12,
    });
    return {
      rows: grouped.map((g) => ({ provider: g.provider, metric: g.metric, total: g._sum.value ?? 0 })),
    };
  } catch {
    return { rows: [] as { provider: string; metric: string; total: number }[] };
  }
}
