import "server-only";
import { cache } from "react";
import { SellerStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectiveAccess } from "@/lib/server/rbac";
import {
  MARKETPLACE_FLAGS,
  MARKETPLACE_MODULE_ID,
  MARKETPLACE_ROLE_GRANTS,
  type MarketplaceFlag,
  type MarketplacePermission,
} from "@/lib/marketplace/config";

/**
 * Marketplace authorization.
 *
 * Enforces the approved evaluation order:
 *   module kill switch -> plan/entitlement -> org/workspace override ->
 *   auth & tenancy -> RBAC -> ownership/eligibility -> feature flag
 *
 * UI visibility is never authorization: every server action and route handler
 * calls into here before touching business data.
 */

export type MarketplaceViewer = {
  userId: string | null;
  email: string | null;
  name: string | null;
  role: string | null;
  /** Platform module enabled (global kill switch + org override resolved). */
  moduleEnabled: boolean;
  /** Seller record, when the signed-in user has one. */
  seller: { id: string; status: SellerStatus; storeName: string; slug: string } | null;
  isApprovedSeller: boolean;
  permissions: Set<MarketplacePermission>;
  /** Permissions granted only within an organization / workspace / module. */
  scopedPermissions: { permission: string; scope: { level: string; organizationId?: string | null; workspaceId?: string | null; moduleKey?: string | null } }[];
  flags: Record<string, boolean>;
  /** True when the platform database could not be reached. */
  degraded: boolean;
};

/**
 * Resolves module availability in the approved evaluation order:
 *   global kill switch -> plan/entitlement -> organization/workspace override.
 * Each step can only narrow access, never widen it.
 */
async function resolveModuleEnabled(
  organizationId: string | null,
  planId: string | null,
): Promise<{ enabled: boolean; degraded: boolean }> {
  try {
    // 1. global kill switch — absent row means the operator has not enabled it.
    const globalRow = await prisma.moduleControl.findUnique({
      where: { key: MARKETPLACE_MODULE_ID },
    });
    if (globalRow?.status !== "ENABLED") return { enabled: false, degraded: false };

    // 2. plan / entitlement — when the plan declares the feature, it must be on.
    if (planId) {
      const ent = await prisma.featureEntitlement.findUnique({
        where: { planId_featureKey: { planId, featureKey: MARKETPLACE_MODULE_ID } },
      });
      if (ent && !ent.enabled) return { enabled: false, degraded: false };
    }

    // 3. organization / workspace override.
    if (organizationId) {
      const orgRow = await prisma.moduleControl.findFirst({
        where: { key: MARKETPLACE_MODULE_ID, organizationId },
      });
      if (orgRow && orgRow.status !== "ENABLED") return { enabled: false, degraded: false };
    }

    return { enabled: true, degraded: false };
  } catch {
    return { enabled: false, degraded: true };
  }
}

async function resolveFlags(): Promise<Record<string, boolean>> {
  const keys = Object.values(MARKETPLACE_FLAGS) as string[];
  const out: Record<string, boolean> = Object.fromEntries(keys.map((k) => [k, false]));
  try {
    const rows = await prisma.featureFlag.findMany({ where: { key: { in: keys } } });
    for (const r of rows) out[r.key] = r.enabled;
  } catch {
    // Unreachable database leaves every optional feature off.
  }
  return out;
}

function sellerGrants(sellerStatus: SellerStatus | null): MarketplacePermission[] {
  if (sellerStatus === SellerStatus.APPROVED) return [...MARKETPLACE_ROLE_GRANTS.approved_seller];
  if (sellerStatus === SellerStatus.APPLICANT || sellerStatus === SellerStatus.UNDER_REVIEW) {
    return [...MARKETPLACE_ROLE_GRANTS.seller_applicant];
  }
  return [...MARKETPLACE_ROLE_GRANTS.authenticated_buyer];
}

/** Cached per request so a page and its children resolve access once. */
export const getMarketplaceViewer = cache(async (): Promise<MarketplaceViewer> => {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; name?: string; role?: string } | undefined;

  // Tenant context drives the plan/entitlement and org-override steps.
  let organizationId: string | null = null;
  let planId: string | null = null;
  if (user?.id) {
    try {
      const membership = await prisma.membership.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
        select: { workspace: { select: { subscriptions: { select: { planId: true }, take: 1 } } } },
      });
      planId = membership?.workspace.subscriptions[0]?.planId ?? null;
    } catch {
      planId = null;
    }
  }

  const [{ enabled, degraded }, flags] = await Promise.all([
    resolveModuleEnabled(organizationId, planId),
    resolveFlags(),
  ]);

  // Scoped RBAC: assignment-derived permissions, not just the account role.
  const access = await getEffectiveAccess(user?.id ?? null, user?.role ?? null);

  let seller: MarketplaceViewer["seller"] = null;
  if (user?.id) {
    try {
      const row = await prisma.marketplaceSeller.findUnique({ where: { userId: user.id } });
      if (row) seller = { id: row.id, status: row.status, storeName: row.storeName, slug: row.slug };
    } catch {
      // Leave seller null; callers treat this as "not a seller".
    }
  }

  return {
    userId: user?.id ?? null,
    email: user?.email ?? null,
    name: user?.name ?? null,
    role: user?.role ?? null,
    moduleEnabled: enabled,
    seller,
    isApprovedSeller: seller?.status === SellerStatus.APPROVED,
    permissions: new Set([
      ...access.global,
      ...sellerGrants(seller?.status ?? null),
    ] as MarketplacePermission[]),
    scopedPermissions: access.scoped,
    flags,
    degraded: degraded || access.degraded,
  };
});

export function can(viewer: MarketplaceViewer, permission: MarketplacePermission) {
  return viewer.permissions.has(permission);
}

export function flagEnabled(viewer: MarketplaceViewer, flag: MarketplaceFlag) {
  return viewer.flags[flag] === true;
}

/**
 * Navigation visibility rules from the approved handoff:
 *  - Marketplace / Browse Products / My Purchases: while the module is enabled
 *  - Sell on Amplivanta: not an approved seller AND applications enabled
 *  - Seller Dashboard: approved sellers only
 */
export function marketplaceNavVisibility(viewer: MarketplaceViewer) {
  const base = viewer.moduleEnabled;
  return {
    marketplace: base,
    browseProducts: base,
    myPurchases: base,
    sellOnAmplivanta:
      base && !viewer.isApprovedSeller && flagEnabled(viewer, MARKETPLACE_FLAGS.sellerApplications),
    sellerDashboard: base && viewer.isApprovedSeller,
  };
}

export type AccessDenial =
  | { ok: true }
  | { ok: false; reason: "module_disabled" | "unauthenticated" | "forbidden" | "not_seller" | "flag_disabled" | "degraded" };

/** Single entry point for guarding a marketplace route or action. */
export function guardMarketplace(
  viewer: MarketplaceViewer,
  opts: { permission?: MarketplacePermission; flag?: MarketplaceFlag; requireApprovedSeller?: boolean } = {},
): AccessDenial {
  if (viewer.degraded) return { ok: false, reason: "degraded" };
  if (!viewer.moduleEnabled) return { ok: false, reason: "module_disabled" };
  if (!viewer.userId) return { ok: false, reason: "unauthenticated" };
  if (opts.permission && !can(viewer, opts.permission)) return { ok: false, reason: "forbidden" };
  if (opts.requireApprovedSeller && !viewer.isApprovedSeller) return { ok: false, reason: "not_seller" };
  if (opts.flag && !flagEnabled(viewer, opts.flag)) return { ok: false, reason: "flag_disabled" };
  return { ok: true };
}
