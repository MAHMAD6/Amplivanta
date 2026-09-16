import "server-only";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";

export async function workspaceContext() {
  try {
    const ctx = await getSessionContext();
    return { workspaceId: ctx.workspaceId, userId: ctx.userId, role: ctx.workspaceRole, canEdit: ctx.workspaceRole !== "VIEWER", isAdmin: ["ADMIN", "OWNER", "SUPER_ADMIN"].includes(ctx.workspaceRole) };
  } catch {
    return null;
  }
}

export async function memberNames(workspaceId: string) {
  const rows = await db.membership.findMany({ where: { workspaceId }, include: { user: { select: { id: true, name: true, email: true } } } });
  return rows.map((m) => ({ id: m.user.id, name: m.user.name || m.user.email }));
}

/** Audit action prefix → module label, for cross-module activity and approvals. */
export const MODULES: [prefix: string, label: string][] = [
  ["social.", "Social Publishing"],
  ["campaign.", "Campaigns"],
  ["task.", "Tasks"],
  ["note.", "Notes"],
  ["automation.", "Automations"],
  ["competitor.", "Competitor Watch"],
  ["integration.", "Integrations"],
  ["member.", "Team"],
  ["domain.", "Domains"],
  ["settings.", "Settings"],
  ["report.", "Reports"],
  ["apikey.", "API Keys"],
  ["webhook.", "Webhooks"],
];
export const moduleOf = (action: string) => MODULES.find(([p]) => action.startsWith(p))?.[1] ?? "Workspace";
export const actionLabel = (action: string) => action.split(".").slice(1).join(" ").replace(/_/g, " ") || action;
