"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MARKETPLACE_FLAGS } from "@/lib/marketplace/config";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";
import { COUPON_COOKIE, couponUsable, normalizeCouponCode } from "@/lib/marketplace/pricing";

/**
 * Buyer and seller actions for the flagged Marketplace extensions: store
 * follows, coupons, bundles and affiliate links. Every action checks its
 * feature flag and ownership server-side.
 */

export type ExtResult = { ok: true; message: string } | { ok: false; error: string };

async function audit(actorUserId: string | null, action: string, resourceType: string, resourceId: string, metadata?: Prisma.InputJsonValue) {
  try {
    await prisma.platformAuditLog.create({ data: { actorUserId, action, resourceType, resourceId, metadata: metadata ?? {} } });
  } catch {
    /* auditing never rolls back an authorized change */
  }
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "bundle";

/* ------------------------------------------------------------------ follows */

export async function toggleFollow(sellerId: string): Promise<ExtResult & { following?: boolean }> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, { flag: MARKETPLACE_FLAGS.storeFollows });
  if (!gate.ok) return { ok: false, error: "Following stores is not available." };
  try {
    const seller = await prisma.marketplaceSeller.findFirst({ where: { id: sellerId, status: "APPROVED" }, select: { id: true, userId: true } });
    if (!seller) return { ok: false, error: "That store is not available." };
    if (seller.userId === viewer.userId) return { ok: false, error: "You cannot follow your own store." };
    const key = { sellerId_userId: { sellerId, userId: viewer.userId! } };
    const existing = await prisma.marketplaceStoreFollow.findUnique({ where: key });
    if (existing) await prisma.marketplaceStoreFollow.delete({ where: key });
    else await prisma.marketplaceStoreFollow.create({ data: { sellerId, userId: viewer.userId! } });
    revalidatePath("/app/marketplace/stores");
    return { ok: true, message: existing ? "Unfollowed store." : "Following store.", following: !existing };
  } catch {
    return { ok: false, error: "Could not update — the platform database was unreachable." };
  }
}

/* ------------------------------------------------------------------ coupons */

export async function applyCouponCode(raw: string): Promise<ExtResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, { permission: "marketplace.purchase", flag: MARKETPLACE_FLAGS.coupons });
  if (!gate.ok) return { ok: false, error: "Coupons are not available." };
  const code = normalizeCouponCode(raw);
  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) return { ok: false, error: "Enter a valid coupon code." };
  try {
    const c = await prisma.marketplaceCoupon.findUnique({ where: { code } });
    if (!c) return { ok: false, error: "That coupon code was not found." };
    const usable = couponUsable(c);
    if (!usable.ok) return { ok: false, error: usable.error };
    (await cookies()).set(COUPON_COOKIE, code, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
    revalidatePath("/app/marketplace/checkout");
    return { ok: true, message: `Coupon ${code} applied.` };
  } catch {
    return { ok: false, error: "Could not check the coupon — the platform database was unreachable." };
  }
}

export async function removeCouponCode(): Promise<ExtResult> {
  (await cookies()).delete(COUPON_COOKIE);
  revalidatePath("/app/marketplace/checkout");
  return { ok: true, message: "Coupon removed." };
}

export async function createSellerCoupon(fd: FormData): Promise<ExtResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, { requireApprovedSeller: true, flag: MARKETPLACE_FLAGS.coupons });
  if (!gate.ok) return { ok: false, error: "Coupons are not available for your store." };
  const parsed = await parseCouponForm(fd);
  if (!parsed.ok) return parsed;
  try {
    const c = await prisma.marketplaceCoupon.create({
      data: { ...parsed.data, sellerId: viewer.seller!.id, createdByUserId: viewer.userId },
    });
    await audit(viewer.userId, "marketplace.coupon.created", "MarketplaceCoupon", c.id, { code: c.code, seller: true });
    revalidatePath("/app/marketplace/seller/coupons");
    return { ok: true, message: `Coupon ${c.code} created.` };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { ok: false, error: "That code is already in use." };
    return { ok: false, error: "Could not create the coupon — the platform database was unreachable." };
  }
}

export async function setSellerCouponActive(id: string, isActive: boolean): Promise<ExtResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, { requireApprovedSeller: true, flag: MARKETPLACE_FLAGS.coupons });
  if (!gate.ok) return { ok: false, error: "Coupons are not available for your store." };
  try {
    const r = await prisma.marketplaceCoupon.updateMany({ where: { id, sellerId: viewer.seller!.id }, data: { isActive } });
    if (r.count === 0) return { ok: false, error: "That coupon does not belong to your store." };
    await audit(viewer.userId, isActive ? "marketplace.coupon.activated" : "marketplace.coupon.deactivated", "MarketplaceCoupon", id);
    revalidatePath("/app/marketplace/seller/coupons");
    return { ok: true, message: isActive ? "Coupon activated." : "Coupon deactivated." };
  } catch {
    return { ok: false, error: "Could not update the coupon — the platform database was unreachable." };
  }
}

/** Shared by seller and admin coupon forms. */
export async function parseCouponForm(fd: FormData): Promise<
  | { ok: true; data: { code: string; percentOff: number | null; amountOffCents: number | null; currency: string | null; startsAt: Date | null; endsAt: Date | null; maxRedemptions: number | null } }
  | { ok: false; error: string }
> {
  const code = normalizeCouponCode(String(fd.get("code") ?? ""));
  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) return { ok: false, error: "Codes are 3–40 letters, digits, dashes or underscores." };
  const kind = String(fd.get("kind") ?? "percent");
  const value = Number(fd.get("value"));
  if (!Number.isFinite(value) || value <= 0) return { ok: false, error: "Enter a discount greater than zero." };
  const percentOff = kind === "percent" ? Math.round(value) : null;
  if (percentOff != null && percentOff > 100) return { ok: false, error: "A percentage cannot exceed 100." };
  const amountOffCents = kind === "amount" ? Math.round(value * 100) : null;
  const currency = kind === "amount" ? String(fd.get("currency") || "USD").toUpperCase().slice(0, 3) : null;
  const date = (k: string) => {
    const v = String(fd.get(k) ?? "");
    const d = v ? new Date(v) : null;
    return d && !Number.isNaN(d.getTime()) ? d : null;
  };
  const max = Number(fd.get("maxRedemptions"));
  return {
    ok: true,
    data: {
      code,
      percentOff,
      amountOffCents,
      currency,
      startsAt: date("startsAt"),
      endsAt: date("endsAt"),
      maxRedemptions: Number.isInteger(max) && max > 0 ? max : null,
    },
  };
}

/* ------------------------------------------------------------------ bundles */

export async function createBundle(fd: FormData): Promise<ExtResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, { requireApprovedSeller: true, flag: MARKETPLACE_FLAGS.bundles });
  if (!gate.ok) return { ok: false, error: "Bundles are not available for your store." };
  const title = String(fd.get("title") ?? "").trim();
  const summary = String(fd.get("summary") ?? "").trim() || null;
  const price = Number(fd.get("price"));
  const productIds = fd.getAll("productIds").map(String);
  if (title.length < 3) return { ok: false, error: "Give the bundle a title." };
  if (!Number.isFinite(price) || price < 0) return { ok: false, error: "Enter a valid bundle price." };
  if (productIds.length < 2) return { ok: false, error: "A bundle needs at least two products." };
  try {
    // Only this seller's own published products can be bundled.
    const products = await prisma.marketplaceProduct.findMany({
      where: { id: { in: productIds }, sellerId: viewer.seller!.id, status: "PUBLISHED" },
      select: { id: true, versions: { where: { status: "PUBLISHED" }, orderBy: { version: "desc" }, take: 1, select: { priceCents: true, currency: true } } },
    });
    if (products.length !== productIds.length) return { ok: false, error: "Bundles can only include your own published products." };
    const currencies = new Set(products.map((p) => p.versions[0]?.currency ?? "USD"));
    if (currencies.size > 1) return { ok: false, error: "All products in a bundle must share one currency." };
    const listTotal = products.reduce((s, p) => s + (p.versions[0]?.priceCents ?? 0), 0);
    const priceCents = Math.round(price * 100);
    if (priceCents >= listTotal) return { ok: false, error: "A bundle must cost less than its products bought separately." };
    const base = slugify(title);
    const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const bundle = await prisma.marketplaceBundle.create({
      data: {
        sellerId: viewer.seller!.id,
        slug,
        title,
        summary,
        priceCents,
        currency: [...currencies][0],
        items: { create: products.map((p) => ({ productId: p.id })) },
      },
    });
    await audit(viewer.userId, "marketplace.bundle.created", "MarketplaceBundle", bundle.id);
    revalidatePath("/app/marketplace/seller/bundles");
    return { ok: true, message: `Bundle "${title}" saved as a draft.` };
  } catch {
    return { ok: false, error: "Could not save the bundle — the platform database was unreachable." };
  }
}

export async function setBundleStatus(id: string, status: "PUBLISHED" | "ARCHIVED" | "DRAFT"): Promise<ExtResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, { requireApprovedSeller: true, flag: MARKETPLACE_FLAGS.bundles });
  if (!gate.ok) return { ok: false, error: "Bundles are not available for your store." };
  try {
    const r = await prisma.marketplaceBundle.updateMany({ where: { id, sellerId: viewer.seller!.id }, data: { status } });
    if (r.count === 0) return { ok: false, error: "That bundle does not belong to your store." };
    await audit(viewer.userId, `marketplace.bundle.${status.toLowerCase()}`, "MarketplaceBundle", id);
    revalidatePath("/app/marketplace/seller/bundles");
    return { ok: true, message: `Bundle ${status.toLowerCase()}.` };
  } catch {
    return { ok: false, error: "Could not update the bundle — the platform database was unreachable." };
  }
}

export async function addBundleToCart(bundleId: string): Promise<ExtResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, { permission: "marketplace.purchase", flag: MARKETPLACE_FLAGS.bundles });
  if (!gate.ok) return { ok: false, error: "Bundles are not available." };
  try {
    const bundle = await prisma.marketplaceBundle.findFirst({ where: { id: bundleId, status: "PUBLISHED" }, include: { items: true } });
    if (!bundle) return { ok: false, error: "That bundle is not available." };
    const products = await prisma.marketplaceProduct.findMany({
      where: { id: { in: bundle.items.map((i) => i.productId) }, status: "PUBLISHED" },
      select: { id: true, versions: { where: { status: "PUBLISHED" }, orderBy: { version: "desc" }, take: 1, select: { id: true } } },
    });
    if (products.length !== bundle.items.length || products.some((p) => !p.versions[0])) {
      return { ok: false, error: "A product in this bundle is no longer available." };
    }
    await prisma.$transaction(
      products.map((p) =>
        prisma.marketplaceCartItem.upsert({
          where: { userId_productId: { userId: viewer.userId!, productId: p.id } },
          create: { userId: viewer.userId!, productId: p.id, versionId: p.versions[0].id, bundleId: bundle.id },
          update: { versionId: p.versions[0].id, bundleId: bundle.id },
        }),
      ),
    );
    revalidatePath("/app/marketplace/cart");
    return { ok: true, message: `"${bundle.title}" added to your cart.` };
  } catch {
    return { ok: false, error: "Could not update your cart — the platform database was unreachable." };
  }
}
