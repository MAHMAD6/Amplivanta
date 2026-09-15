import "server-only";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";

/** Workspace context for CRM screens; null when the database or session is unavailable. */
export async function crmContext(): Promise<{ workspaceId: string } | null> {
  try {
    const ctx = await getSessionContext();
    return { workspaceId: ctx.workspaceId };
  } catch {
    return null;
  }
}

/** Workspace members as owner filter options, keyed by user id. */
export async function ownerOptions(workspaceId: string): Promise<[string, string][]> {
  try {
    const members = await db.membership.findMany({
      where: { workspaceId },
      select: { user: { select: { id: true, name: true, email: true } } },
      take: 100,
    });
    return members.map((m) => [m.user.id, m.user.name ?? m.user.email]);
  } catch {
    return [];
  }
}

/** Resolves owner ids to display names for table cells. */
export async function ownerNames(ids: (string | null | undefined)[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter((x): x is string => Boolean(x)))];
  if (unique.length === 0) return new Map();
  try {
    const users = await db.user.findMany({ where: { id: { in: unique } }, select: { id: true, name: true, email: true } });
    return new Map(users.map((u) => [u.id, u.name ?? u.email]));
  } catch {
    return new Map();
  }
}

export const CREATED_WINDOWS: [string, string][] = [
  ["7", "Created: last 7 days"],
  ["30", "Created: last 30 days"],
  ["90", "Created: last 90 days"],
];

export const since = (days: string | undefined) => {
  const n = Number(days);
  return Number.isInteger(n) && n > 0 && n <= 365 ? new Date(Date.now() - n * 86_400_000) : null;
};
