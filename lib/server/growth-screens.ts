import "server-only";
import { db } from "@/lib/db";
import { integrationView } from "@/lib/server/integration-view";

export { workspaceContext as growthContext, memberNames } from "@/lib/server/workspace-screens";

/** Providers with a real OAuth connection (tokens stored) in this workspace. */
export async function connectedProviders(workspaceId: string) {
  const rows = await db.integration.findMany({ where: { workspaceId } });
  return rows.map(integrationView).filter((i) => i.hasCredentials);
}

export const since = (days?: string) => {
  const n = Number(days);
  return [7, 30, 90, 180, 365].includes(n) ? new Date(Date.now() - n * 86400000) : null;
};

/** Month grid (Mon-first) covering the month of `ym` ("YYYY-MM") or now. */
export function monthGrid(ym?: string) {
  const m = /^(\d{4})-(\d{2})$/.exec(ym ?? "");
  const now = new Date();
  const month = m ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1)) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const lead = (month.getUTCDay() + 6) % 7;
  const start = new Date(month.getTime() - lead * 86400000);
  const days = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
  const cells = Math.ceil((days + lead) / 7) * 7;
  const key = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  return {
    month,
    start,
    end: new Date(start.getTime() + cells * 86400000),
    cells: Array.from({ length: cells }, (_, i) => new Date(start.getTime() + i * 86400000)),
    prev: key(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() - 1, 1))),
    next: key(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1))),
    title: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(month),
  };
}

export const money = (n: number | null | undefined) => (n == null ? null : n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }));
export const count = (n: number) => (n ? n.toLocaleString("en-US") : null);
