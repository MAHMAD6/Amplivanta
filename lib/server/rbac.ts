import "server-only";
import { cache } from "react";
import { AdminScopeLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MARKETPLACE_ROLE_GRANTS, type MarketplacePermission } from "@/lib/marketplace/config";
import type { EffectiveAccess, Scope } from "@/lib/rbac-policy";

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

export { hasPermission, canGrant } from "@/lib/rbac-policy";

export type { EffectiveAccess, Scope } from "@/lib/rbac-policy";
