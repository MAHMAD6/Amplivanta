import "server-only";
import { prisma } from "@/lib/prisma";
import type { MarketplaceFlag } from "@/lib/marketplace/config";

/**
 * Reads one Marketplace feature flag without a signed-in viewer, for public
 * pages (sponsored placements, affiliate attribution). Off when no row exists
 * or the database is unreachable — optional features never default on.
 */
export async function isMarketplaceFlagOn(flag: MarketplaceFlag): Promise<boolean> {
  try {
    const row = await prisma.featureFlag.findUnique({ where: { key: flag }, select: { enabled: true } });
    return row?.enabled === true;
  } catch {
    return false;
  }
}
