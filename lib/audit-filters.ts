/** Shared audit-log filters for the Audit Log screen and its CSV export. */

export type AuditFilters = { q?: string; category?: string; user?: string; range?: string };

export const AUDIT_CATEGORIES: Record<string, [label: string, prefixes: string[]]> = {
  members: ["Members & roles", ["member."]],
  settings: ["Settings", ["settings.", "workspace."]],
  integrations: ["Integrations", ["integration."]],
  domains: ["Domains", ["domain."]],
  social: ["Social publishing", ["social."]],
  competitors: ["Competitor Watch", ["competitor."]],
};

export function auditWhere(workspaceId: string, f: AuditFilters) {
  const days = [1, 7, 30, 90].includes(Number(f.range)) ? Number(f.range) : null;
  const prefixes = f.category ? AUDIT_CATEGORIES[f.category]?.[1] : undefined;
  return {
    workspaceId,
    ...(f.user ? { actorUserId: f.user } : {}),
    ...(days ? { createdAt: { gte: new Date(Date.now() - days * 86400000) } } : {}),
    AND: [
      ...(prefixes ? [{ OR: prefixes.map((p) => ({ action: { startsWith: p } })) }] : []),
      ...(f.q ? [{ OR: [{ action: { contains: f.q, mode: "insensitive" as const } }, { resourceType: { contains: f.q, mode: "insensitive" as const } }] }] : []),
    ],
  };
}

/** RFC 4180 CSV cell; neutralizes spreadsheet formula injection. */
export function csvCell(v: unknown): string {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
