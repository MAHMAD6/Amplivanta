import "server-only";
import { cache } from "react";
import { SellerStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
  flags: Record<string, boolean>;
  /** True when the platform database could not be reached. */
  degraded: boolean;
};

/** Resolves module state from ModuleControl, defaulting to disabled when unset. */
async function resolveModuleEnabled(): Promise<{ enabled: boolean; degraded: boolean }> {
  try {
    const row = await prisma.moduleControl.findUnique({ where: { key: MARKETPLACE_MODULE_ID } });
    // Absent row means the operator has not turned Marketplace on yet. The
    // approved default is configuration-driven, so we do not assume "on".
    return { enabled: row?.status === "ENABLED", degraded: false };
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

function permissionsFor(role: string | null, sellerStatus: SellerStatus | null): Set<MarketplacePermission> {
  const grants: MarketplacePermission[] = [];
  if (role === "SUPER_ADMIN") grants.push(...MARKETPLACE_ROLE_GRANTS.super_admin);
  else if (role === "ADMIN" || role === "OWNER") grants.push(...MARKETPLACE_ROLE_GRANTS.marketplace_operations_admin);

  if (sellerStatus === SellerStatus.APPROVED) grants.push(...MARKETPLACE_ROLE_GRANTS.approved_seller);
  else if (sellerStatus === SellerStatus.APPLICANT || sellerStatus === SellerStatus.UNDER_REVIEW) {
    grants.push(...MARKETPLACE_ROLE_GRANTS.seller_applicant);
  } else {
    grants.push(...MARKETPLACE_ROLE_GRANTS.authenticated_buyer);
  }
  return new Set(grants);
}

/** Cached per request so a page and its children resolve access once. */
export const getMarketplaceViewer = cache(async (): Promise<MarketplaceViewer> => {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; name?: string; role?: string } | undefined;

  const [{ enabled, degraded }, flags] = await Promise.all([resolveModuleEnabled(), resolveFlags()]);

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
    permissions: permissionsFor(user?.role ?? null, seller?.status ?? null),
    flags,
    degraded,
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
