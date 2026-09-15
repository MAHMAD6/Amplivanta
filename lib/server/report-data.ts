import "server-only";
import { db } from "@/lib/db";
import { campaignPerformance, parseRange, providerMetric } from "@/lib/server/analytics-screens";

/** Report types the builder can run, each backed by a real data source. */
export const REPORT_TYPES: { value: string; label: string; dimensions: string; metrics: string }[] = [
  { value: "pipeline", label: "Pipeline", dimensions: "Deal stage", metrics: "Deals, pipeline value" },
  { value: "deals", label: "Deals", dimensions: "Deal status", metrics: "Deals, value" },
  { value: "contacts", label: "Contacts", dimensions: "Contact status", metrics: "Contacts" },
  { value: "activities", label: "Activities", dimensions: "Activity type", metrics: "Activities" },
  { value: "tasks", label: "Tasks", dimensions: "Task status", metrics: "Tasks" },
  { value: "traffic", label: "Traffic", dimensions: "Channel (GA4)", metrics: "Sessions" },
  { value: "campaigns", label: "Campaigns", dimensions: "Campaign", metrics: "Impressions, clicks, conversions, spend" },
];

export type ReportTable = { columns: string[]; rows: (string | number)[][] };

export async function runReport(workspaceId: string, type: string, days = 30): Promise<ReportTable> {
  const range = parseRange(String(days));
  const created = { gte: range.since };
  switch (type) {
    case "pipeline": {
      const g = await db.deal.groupBy({ by: ["stageId"], where: { workspaceId, status: "open" }, _count: true, _sum: { value: true } });
      const stages = await db.stage.findMany({ where: { id: { in: g.map((x) => x.stageId).filter((x): x is string => Boolean(x)) } }, select: { id: true, name: true, order: true } });
      return {
        columns: ["Stage", "Open deals", "Pipeline value"],
        rows: g
          .map((x) => ({ s: stages.find((s) => s.id === x.stageId), x }))
          .sort((a, b) => (a.s?.order ?? 99) - (b.s?.order ?? 99))
          .map(({ s, x }) => [s?.name ?? "No stage", x._count, Math.round(x._sum.value ?? 0)]),
      };
    }
    case "deals": {
      const g = await db.deal.groupBy({ by: ["status"], where: { workspaceId, createdAt: created }, _count: true, _sum: { value: true } });
      return { columns: ["Status", "Deals", "Value"], rows: g.map((x) => [x.status, x._count, Math.round(x._sum.value ?? 0)]) };
    }
    case "contacts": {
      const g = await db.contact.groupBy({ by: ["status"], where: { workspaceId, createdAt: created }, _count: true });
      return { columns: ["Status", "Contacts"], rows: g.map((x) => [x.status, x._count]) };
    }
    case "activities": {
      const g = await db.activity.groupBy({ by: ["type"], where: { workspaceId, createdAt: created }, _count: true });
      return { columns: ["Type", "Activities"], rows: g.map((x) => [x.type, x._count]) };
    }
    case "tasks": {
      const g = await db.task.groupBy({ by: ["status"], where: { workspaceId, createdAt: created }, _count: true });
      return { columns: ["Status", "Tasks"], rows: g.map((x) => [x.status, x._count]) };
    }
    case "traffic": {
      const m = await providerMetric(workspaceId, "google_analytics", "sessions", range);
      return { columns: ["Channel", "Sessions"], rows: m.byDimension.map(([k, v]) => [k, Math.round(v)]) };
    }
    case "campaigns": {
      const rows = await campaignPerformance(workspaceId, range);
      return { columns: ["Campaign", "Channel", "Impressions", "Clicks", "Conversions", "Spend"], rows: rows.map((r) => [r.name, r.channel, Math.round(r.impressions), Math.round(r.clicks), Math.round(r.conversions), Number(r.spend.toFixed(2))]) };
    }
    default:
      return { columns: [], rows: [] };
  }
}
