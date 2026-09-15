import "server-only";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { integrationView } from "@/lib/server/integration-view";

export type IntegrationRow = ReturnType<typeof integrationView> & { ownerName: string | null };

/** Workspace connections plus developer-access counts for the Integrations screens. */
export async function loadIntegrationsScreen() {
  try {
    const ctx = await getSessionContext();
    const w = ctx.workspaceId;
    const [rows, webhooks, apiKeys] = await Promise.all([
      db.integration.findMany({ where: { workspaceId: w, status: { not: "available" } }, orderBy: { createdAt: "desc" }, take: 100 }),
      db.webhook.count({ where: { workspaceId: w } }),
      db.apiKey.count({ where: { workspaceId: w } }),
    ]);
    // Rows without stored credentials are placeholders, not live connections.
    const views = rows.map(integrationView).filter((v) => v.hasCredentials);
    const ownerIds = [...new Set(views.map((v) => v.connectedByUserId).filter((x): x is string => Boolean(x)))];
    const users = ownerIds.length ? await db.user.findMany({ where: { id: { in: ownerIds } }, select: { id: true, name: true, email: true } }) : [];
    const names = new Map(users.map((u) => [u.id, u.name || u.email]));
    const items: IntegrationRow[] = views.map((v) => ({ ...v, ownerName: v.connectedByUserId ? names.get(v.connectedByUserId) ?? null : null }));
    return { reachable: true, items, webhooks, apiKeys, owners: [...names.entries()] };
  } catch {
    return { reachable: false, items: [] as IntegrationRow[], webhooks: 0, apiKeys: 0, owners: [] as [string, string][] };
  }
}

export const syncedWithin = (items: IntegrationRow[], days: number) =>
  items.filter((i) => i.lastSyncAt && Date.now() - i.lastSyncAt.getTime() < days * 86400000).length;

export const relativeTime = (d: Date | null) => {
  if (!d) return "Never";
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d);
};
