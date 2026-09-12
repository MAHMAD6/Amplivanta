"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectiveAccess, hasPermission } from "@/lib/server/rbac";
import { parseCouponForm } from "@/app/(app)/app/marketplace/extension-actions";

export type PromoResult = { ok: true; message: string } | { ok: false; error: string };

const SETTINGS_PATH = "/admin/marketplace-management/marketplace-settings";

/** Promotions are a commercial setting: same permission as Marketplace settings. */
async function requireSettingsAdmin() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user) return null;
  const access = await getEffectiveAccess(user.id ?? null, user.role ?? null);
  return hasPermission(access, "marketplace.admin.settings.manage") ? user : null;
}

async function audit(actorUserId: string | null, action: string, resourceType: string, resourceId: string, metadata?: Prisma.InputJsonValue, reason?: string) {
  try {
    await prisma.platformAuditLog.create({ data: { actorUserId, action, resourceType, resourceId, metadata: metadata ?? {}, reason } });
  } catch {
    /* auditing never rolls back an authorized change */
  }
}

export async function createPlatformCoupon(fd: FormData): Promise<PromoResult> {
  const user = await requireSettingsAdmin();
  if (!user) return { ok: false, error: "You are not authorized to manage promotions." };
  const parsed = await parseCouponForm(fd);
  if (!parsed.ok) return parsed;
  try {
    const c = await prisma.marketplaceCoupon.create({ data: { ...parsed.data, sellerId: null, createdByUserId: user.id ?? null } });
    await audit(user.id ?? null, "marketplace.coupon.created", "MarketplaceCoupon", c.id, { code: c.code, platform: true });
    revalidatePath(SETTINGS_PATH);
    return { ok: true, message: `Platform coupon ${c.code} created.` };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { ok: false, error: "That code is already in use." };
    return { ok: false, error: "Could not create the coupon — the platform database was unreachable." };
  }
}

export async function setCouponActive(id: string, isActive: boolean): Promise<PromoResult> {
  const user = await requireSettingsAdmin();
  if (!user) return { ok: false, error: "You are not authorized to manage promotions." };
  try {
    await prisma.marketplaceCoupon.update({ where: { id }, data: { isActive } });
    await audit(user.id ?? null, isActive ? "marketplace.coupon.activated" : "marketplace.coupon.deactivated", "MarketplaceCoupon", id);
    revalidatePath(SETTINGS_PATH);
    return { ok: true, message: isActive ? "Coupon activated." : "Coupon deactivated." };
  } catch {
    return { ok: false, error: "Could not update the coupon." };
  }
}

export async function createSponsoredPlacement(fd: FormData): Promise<PromoResult> {
  const user = await requireSettingsAdmin();
  if (!user) return { ok: false, error: "You are not authorized to manage promotions." };
  const slug = String(fd.get("productSlug") ?? "").trim();
  const reason = String(fd.get("reason") ?? "").trim();
  const label = String(fd.get("label") ?? "Sponsored").trim() || "Sponsored";
  const endsRaw = String(fd.get("endsAt") ?? "");
  const endsAt = endsRaw ? new Date(endsRaw) : null;
  if (!reason) return { ok: false, error: "A reason is required and is recorded in the audit log." };
  if (endsAt && Number.isNaN(endsAt.getTime())) return { ok: false, error: "Enter a valid end date." };
  try {
    const product = await prisma.marketplaceProduct.findFirst({ where: { slug, status: "PUBLISHED" }, select: { id: true, title: true } });
    if (!product) return { ok: false, error: "No published product has that slug." };
    const p = await prisma.marketplaceSponsoredPlacement.create({
      data: { productId: product.id, label, endsAt, createdByUserId: user.id ?? null },
    });
    await audit(user.id ?? null, "marketplace.sponsored.created", "MarketplaceSponsoredPlacement", p.id, { productId: product.id }, reason);
    revalidatePath(SETTINGS_PATH);
    revalidatePath("/marketplace");
    return { ok: true, message: `"${product.title}" is now a labeled placement.` };
  } catch {
    return { ok: false, error: "Could not create the placement — the platform database was unreachable." };
  }
}

export async function endSponsoredPlacement(id: string): Promise<PromoResult> {
  const user = await requireSettingsAdmin();
  if (!user) return { ok: false, error: "You are not authorized to manage promotions." };
  try {
    await prisma.marketplaceSponsoredPlacement.update({ where: { id }, data: { isActive: false, endsAt: new Date() } });
    await audit(user.id ?? null, "marketplace.sponsored.ended", "MarketplaceSponsoredPlacement", id);
    revalidatePath(SETTINGS_PATH);
    revalidatePath("/marketplace");
    return { ok: true, message: "Placement ended." };
  } catch {
    return { ok: false, error: "Could not end the placement." };
  }
}

export async function loadPromotions() {
  try {
    const now = new Date();
    const [coupons, placements] = await Promise.all([
      prisma.marketplaceCoupon.findMany({ where: { sellerId: null }, orderBy: { createdAt: "desc" }, take: 100 }),
      prisma.marketplaceSponsoredPlacement.findMany({
        where: { isActive: true, OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);
    const products = await prisma.marketplaceProduct.findMany({
      where: { id: { in: placements.map((p) => p.productId) } },
      select: { id: true, title: true, slug: true },
    });
    return {
      connected: true,
      coupons,
      placements: placements.map((p) => ({ ...p, product: products.find((x) => x.id === p.productId) ?? null })),
    };
  } catch {
    return { connected: false, coupons: [], placements: [] };
  }
}
