import { db } from "@/lib/db";

/** Notification Center tabs, in design order. */
export const NOTIFICATION_TABS = [
  ["campaigns", "Campaigns"],
  ["approvals", "Approvals"],
  ["billing", "Billing"],
  ["security", "Security"],
  ["integrations", "Integrations"],
  ["publishing", "Publishing"],
  ["system", "System"],
] as const;

export type NotificationCategory = (typeof NOTIFICATION_TABS)[number][0];
export type NotificationSeverity = "info" | "success" | "warning" | "critical";

export const SEVERITIES: [NotificationSeverity, string][] = [
  ["critical", "Critical"],
  ["warning", "Warning"],
  ["success", "Success"],
  ["info", "Info"],
];

/**
 * Notification Settings rows (lib/preferences NOTIFICATION_CATEGORIES) that
 * govern each alert. Security is policy-controlled and always delivered.
 */
const PREFERENCE_KEY: Record<string, string> = {
  campaigns: "campaigns",
  publishing: "campaigns",
  automation: "automation",
  approvals: "approvals",
  billing: "billing",
  integrations: "automation",
  system: "product",
};

export type NotifyInput = {
  workspaceId: string;
  category: NotificationCategory;
  severity?: NotificationSeverity;
  title: string;
  body?: string;
  link?: string;
  /** Deliver to one member only; omitted means every member of the workspace. */
  userId?: string | null;
  resourceType?: string;
  resourceId?: string;
  /** Same key within 24 hours is not repeated. */
  dedupeKey?: string;
  /** Preference row to honour when it differs from the category (e.g. "automation"). */
  preference?: string;
};

/**
 * Records an in-app alert. Never throws: a notification must not break the
 * action that caused it. Returns the id, or null when skipped.
 */
export async function notify(input: NotifyInput): Promise<string | null> {
  try {
    const pref = input.preference ?? PREFERENCE_KEY[input.category];
    if (input.category !== "security" && pref) {
      const row = await db.workspacePreference.findUnique({ where: { workspaceId_scope: { workspaceId: input.workspaceId, scope: "workspace.notifications" } }, select: { values: true } });
      const values = (row?.values ?? {}) as Record<string, unknown>;
      if (values[`${pref}.inApp`] === "off") return null;
    }
    if (input.dedupeKey) {
      const recent = await db.notification.findFirst({ where: { workspaceId: input.workspaceId, dedupeKey: input.dedupeKey, createdAt: { gte: new Date(Date.now() - 86400000) } }, select: { id: true } });
      if (recent) return null;
    }
    const n = await db.notification.create({
      data: {
        workspaceId: input.workspaceId,
        userId: input.userId ?? null,
        category: input.category,
        severity: input.severity ?? "info",
        type: input.severity ?? "info",
        title: input.title.slice(0, 200),
        body: input.body?.slice(0, 2000),
        link: safeLink(input.link),
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        dedupeKey: input.dedupeKey,
      },
      select: { id: true },
    });
    return n.id;
  } catch {
    return null;
  }
}

/** Fire-and-forget form for hot paths. */
export function notifyLater(input: NotifyInput) {
  void notify(input);
}

/** Only in-app relative links are stored, so an alert can never send a user off-site. */
export function safeLink(link?: string | null): string | null {
  if (!link) return null;
  return link.startsWith("/") && !link.startsWith("//") ? link.slice(0, 500) : null;
}

/** Notifications visible to a member: addressed to them or to the whole workspace, not cleared by them. */
export function visibleWhere(workspaceId: string, userId: string) {
  return {
    workspaceId,
    OR: [{ userId }, { userId: null }],
    NOT: { states: { some: { userId, clearedAt: { not: null } } } },
  };
}

export function unreadWhere(workspaceId: string, userId: string) {
  return {
    workspaceId,
    OR: [{ userId }, { userId: null }],
    NOT: { states: { some: { userId, OR: [{ clearedAt: { not: null } }, { readAt: { not: null } }] } } },
  };
}
