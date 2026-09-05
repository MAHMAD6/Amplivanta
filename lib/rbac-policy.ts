/**
 * Pure RBAC policy.
 *
 * Deliberately free of server-only imports and database access so the rules can
 * be unit-tested directly. `lib/server/rbac.ts` supplies the data and re-exports
 * these helpers.
 */

export type ScopeLevel = "GLOBAL" | "ORGANIZATION" | "WORKSPACE" | "MODULE";

export type Scope = {
  level: ScopeLevel | string;
  organizationId?: string | null;
  workspaceId?: string | null;
  moduleKey?: string | null;
};

export type EffectiveAccess = {
  /** Permissions valid platform-wide. */
  global: Set<string>;
  /** Permissions valid only within a specific organization / workspace / module. */
  scoped: { permission: string; scope: Scope }[];
  /** True when the platform database could not be reached. */
  degraded: boolean;
};

/**
 * Does the user hold `permission`? A scoped grant only satisfies a check that
 * names the same scope — asking without a scope means "anywhere", which a
 * single-organization grant must never satisfy.
 */
export function hasPermission(access: EffectiveAccess, permission: string, scope?: Scope) {
  if (access.global.has(permission)) return true;
  if (!scope) return false;
  return access.scoped.some((s) => {
    if (s.permission !== permission) return false;
    if (s.scope.level !== scope.level) return false;
    if (scope.organizationId && s.scope.organizationId !== scope.organizationId) return false;
    if (scope.workspaceId && s.scope.workspaceId !== scope.workspaceId) return false;
    if (scope.moduleKey && s.scope.moduleKey !== scope.moduleKey) return false;
    return true;
  });
}

/**
 * Privilege-escalation guard: a granter may only hand out permissions they hold
 * globally. Super admins are exempt.
 */
export function canGrant(access: EffectiveAccess, role: string | null, permissions: string[]) {
  if (role === "SUPER_ADMIN") return { ok: true as const };
  const missing = permissions.filter((p) => !access.global.has(p));
  if (missing.length > 0) {
    return {
      ok: false as const,
      error: `You cannot grant permissions you do not hold: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}`,
    };
  }
  return { ok: true as const };
}
