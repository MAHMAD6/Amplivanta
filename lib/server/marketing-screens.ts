import "server-only";
import { db } from "@/lib/db";
import { WORKFLOW_TRIGGERS } from "@/lib/marketing/options";

export { workspaceContext as marketingContext, memberNames } from "@/lib/server/workspace-screens";

/** Trigger choices: built-in events plus this workspace's custom event definitions. */
export async function triggerOptions(workspaceId: string): Promise<[string, string][]> {
  const events = await db.eventDefinition.findMany({ where: { workspaceId }, select: { name: true }, orderBy: { name: "asc" } });
  return [...WORKFLOW_TRIGGERS.filter(([k]) => k !== "event"), ...events.map((e): [string, string] => [`event:${e.name}`, `Event: ${e.name}`])];
}

export const triggerLabel = (v: string | null | undefined) => (v?.startsWith("event:") ? `Event: ${v.slice(6)}` : WORKFLOW_TRIGGERS.find(([k]) => k === v)?.[1] ?? (v || "No trigger"));

export function rangeDays(v?: string) {
  const n = Number(v);
  return [7, 30, 90].includes(n) ? n : 30;
}
export const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

/** Zero-filled daily series between `from` and today (UTC dates). */
export function dailySeries(dates: Date[], days: number): [string, number][] {
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) map.set(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10), 0);
  for (const d of dates) {
    const k = d.toISOString().slice(0, 10);
    if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()];
}

export const pct = (n: number, d: number) => (d > 0 ? `${((n / d) * 100).toFixed(1)}%` : null);
export const hostedPageUrl = (workspaceSlug: string, slug: string) => `/lp/${workspaceSlug}/${slug}`;
