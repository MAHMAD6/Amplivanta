import "server-only";
import { cache } from "react";
import { AdminScopeLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MARKETPLACE_ROLE_GRANTS, type MarketplacePermission } from "@/lib/marketplace/config";

/**
 * Scoped RBAC.
 *
 * Effective permissions are the union of:
 *   1. the base grant implied by the account role (User.role), and
 *   2. every non-expired AdminAssignment, whose RoleDefinition contributes its
 *      allowed permission keys at the assignment's scope.
 *
 * This is what makes sub-admins and the moderator / finance-admin roles real:
 * they are granted through AdminAssignment rather than by changing User.role.
 */

export type Scope = {
  level: AdminScopeLevel;
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

const EMPTY: EffectiveAccess = { global: new Set(), scoped: [], degraded: false };

/** Base grants implied by the account-level role. */
function baseGrants(role: string | null): MarketplacePermission[] {
  if (role === "SUPER_ADMIN") return [...MARKETPLACE_ROLE_GRANTS.super_admin];
  if (role === "ADMIN" || role === "OWNER") return [...MARKETPLACE_ROLE_GRANTS.marketplace_operations_admin];
  return [];
}

/**
 * Resolves a user's effective permissions, including everything granted through
 * AdminAssignment. Cached per request.
 */
export const getEffectiveAccess = cache(async (userId: string | null, role: string | null): Promise<EffectiveAccess> => {
  const global = new Set<string>(baseGrants(role));
  const scoped: EffectiveAccess["scoped"] = [];
  if (!userId) return { global, scoped, degraded: false };

  try {
    const now = new Date();
    const assignments = await prisma.adminAssignment.findMany({
      where: { userId, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
      include: { roleDefinition: { include: { permissions: true } } },
    });

    for (const a of assignments) {
      const keys = (a.roleDefinition?.permissions ?? []).filter((p) => p.allowed).map((p) => p.permissionKey);
      if (keys.length === 0) continue;

      if (a.scopeLevel === AdminScopeLevel.GLOBAL) {
        for (const k of keys) global.add(k);
      } else {
        for (const k of keys) {
          scoped.push({
            permission: k,
            scope: {
              level: a.scopeLevel,
              organizationId: a.organizationId,
              workspaceId: a.workspaceId,
              moduleKey: a.moduleKey,
            },
          });
        }
      }
    }
    return { global, scoped, degraded: false };
  } catch {
    // Never widen access on failure: fall back to the role-implied grants only.
    return { global, scoped, degraded: true };
  }
});

/** Does the user hold `permission`, optionally within a specific scope? */
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
 * Guards against privilege escalation: a granter may only assign permissions
 * they themselves hold globally. Super admins are exempt.
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
