"use server";

import { revalidatePath } from "next/cache";
import {
  MarketplaceOrderStatus,
  MarketplacePayoutStatus,
  MarketplaceProductStatus,
  Prisma,
  SellerStatus,
} from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { MarketplacePermission } from "@/lib/marketplace/config";
import { MARKETPLACE_ROLE_GRANTS } from "@/lib/marketplace/config";

export type AdminActionResult = { ok: true; message: string } | { ok: false; error: string };

/**
 * Marketplace administration.
 *
 * Every action re-resolves the actor's permissions server-side, validates the
 * state-machine transition, and appends an audit event. Admin UI visibility is
 * never treated as authorization.
 */
async function requireMarketplaceAdmin(permission: MarketplacePermission) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!user) return null;

  const grants =
    user.role === "SUPER_ADMIN"
      ? MARKETPLACE_ROLE_GRANTS.super_admin
      : user.role === "ADMIN" || user.role === "OWNER"
        ? MARKETPLACE_ROLE_GRANTS.marketplace_operations_admin
        : [];
  return grants.includes(permission) ? user : null;
}

async function audit(
  actorUserId: string | null,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: Prisma.InputJsonValue,
  reason?: string,
) {
  try {
    await prisma.platformAuditLog.create({
      data: { actorUserId, action, resourceType, resourceId, metadata: metadata ?? {}, reason },
    });
  } catch {
    /* never roll back an authorized change because auditing failed */
  }
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "store";

/* ------------------------------------------------------------ seller review */

/** Approve a seller application, creating the seller record atomically. */
export async function decideSellerApplication(
  applicationId: string,
  decision: "APPROVED" | "REJECTED",
  reason: string,
): Promise<AdminActionResult> {
  const user = await requireMarketplaceAdmin("marketplace.admin.seller_applications.review");
  if (!user) return { ok: false, error: "You are not authorized to review seller applications." };
  if (!reason.trim()) return { ok: false, error: "A reason is required for this decision." };

  try {
    const app = await prisma.marketplaceSellerApplication.findUnique({ where: { id: applicationId } });
    if (!app) return { ok: false, error: "Application not found." };
    if (app.status === SellerStatus.APPROVED || app.status === SellerStatus.REJECTED) {
      return { ok: false, error: "That application has already been decided." };
    }

    if (decision === "REJECTED") {
      await prisma.marketplaceSellerApplication.update({
        where: { id: applicationId },
        data: {
          status: SellerStatus.REJECTED,
          reviewNotes: reason,
          reviewedByUserId: user.id ?? null,
          reviewedAt: new Date(),
        },
      });
      await audit(user.id ?? null, "marketplace.seller_application.rejected", "MarketplaceSellerApplication", applicationId, {}, reason);
    } else {
      await prisma.$transaction(async (tx) => {
        const existing = await tx.marketplaceSeller.findUnique({ where: { userId: app.userId } });
        let slug = slugify(app.storeName);
        if (!existing) {
          // Guarantee a unique public store slug.
          let n = 1;
          while (await tx.marketplaceSeller.findUnique({ where: { slug } })) {
            n += 1;
            slug = `${slugify(app.storeName)}-${n}`;
          }
        }
        const seller = existing
          ? await tx.marketplaceSeller.update({
              where: { id: existing.id },
              data: { status: SellerStatus.APPROVED, approvedAt: new Date(), storeName: app.storeName },
            })
          : await tx.marketplaceSeller.create({
              data: {
                userId: app.userId,
                storeName: app.storeName,
                slug,
                status: SellerStatus.APPROVED,
                approvedAt: new Date(),
              },
            });
        await tx.marketplaceSellerApplication.update({
          where: { id: applicationId },
          data: {
            status: SellerStatus.APPROVED,
            sellerId: seller.id,
            reviewNotes: reason,
            reviewedByUserId: user.id ?? null,
            reviewedAt: new Date(),
          },
        });
      });
      await audit(user.id ?? null, "marketplace.seller_application.approved", "MarketplaceSellerApplication", applicationId, {}, reason);
    }

    revalidatePath("/admin/marketplace-management/seller-applications");
    revalidatePath("/admin/marketplace-management/seller-management");
    return { ok: true, message: `Application ${decision === "APPROVED" ? "approved" : "rejected"}.` };
  } catch {
    return { ok: false, error: "Could not record the decision — the platform database was unreachable." };
  }
}

/** Suspend or reinstate a seller. Never deletes their products or payout records. */
export async function setSellerStatus(
  sellerId: string,
  status: "APPROVED" | "SUSPENDED" | "CLOSED",
  reason: string,
): Promise<AdminActionResult> {
  const user = await requireMarketplaceAdmin("marketplace.admin.sellers.manage");
  if (!user) return { ok: false, error: "You are not authorized to manage sellers." };
  if (!reason.trim()) return { ok: false, error: "A reason is required." };

  try {
    const seller = await prisma.marketplaceSeller.update({
      where: { id: sellerId },
      data: {
        status: status as SellerStatus,
        suspendedAt: status === "SUSPENDED" ? new Date() : null,
      },
    });
    await audit(user.id ?? null, `marketplace.seller.${status.toLowerCase()}`, "MarketplaceSeller", sellerId, {}, reason);
    revalidatePath("/admin/marketplace-management/seller-management");
    return { ok: true, message: `${seller.storeName} is now ${status.toLowerCase()}.` };
  } catch {
    return { ok: false, error: "Could not update the seller — the platform database was unreachable." };
  }
}

/* -------------------------------------------------------------- moderation */

/** Legal transitions from the approved product state machine. */
const PRODUCT_TRANSITIONS: Record<string, MarketplaceProductStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW", "CHANGES_REQUESTED", "REJECTED"],
  UNDER_REVIEW: ["APPROVED", "CHANGES_REQUESTED", "REJECTED"],
  CHANGES_REQUESTED: ["SUBMITTED", "DRAFT"],
  APPROVED: ["PUBLISHED", "REJECTED"],
  PUBLISHED: ["UNPUBLISHED", "SUSPENDED", "ARCHIVED"],
  UNPUBLISHED: ["PUBLISHED", "ARCHIVED"],
  SUSPENDED: ["PUBLISHED", "ARCHIVED"],
} as unknown as Record<string, MarketplaceProductStatus[]>;

export async function moderateProduct(
  productId: string,
  toStatus: MarketplaceProductStatus,
  reason: string,
): Promise<AdminActionResult> {
  const user = await requireMarketplaceAdmin("marketplace.admin.products.moderate");
  if (!user) return { ok: false, error: "You are not authorized to moderate products." };
  if (!reason.trim()) return { ok: false, error: "A moderation reason is required." };

  try {
    const product = await prisma.marketplaceProduct.findUnique({ where: { id: productId } });
    if (!product) return { ok: false, error: "Product not found." };

    const allowed = PRODUCT_TRANSITIONS[product.status] ?? [];
    if (!allowed.includes(toStatus)) {
      return { ok: false, error: `A ${product.status.toLowerCase()} product cannot move to ${toStatus.toLowerCase()}.` };
    }

    await prisma.$transaction(async (tx) => {
      await tx.marketplaceProduct.update({
        where: { id: productId },
        data: {
          status: toStatus,
          publishedAt: toStatus === "PUBLISHED" ? (product.publishedAt ?? new Date()) : product.publishedAt,
        },
      });
      await tx.marketplaceModerationEvent.create({
        data: {
          productId,
          fromStatus: product.status,
          toStatus,
          reason,
          actorUserId: user.id ?? null,
        },
      });
    });

    await audit(user.id ?? null, "marketplace.product.moderated", "MarketplaceProduct", productId, {
      from: product.status,
      to: toStatus,
    }, reason);

    revalidatePath("/admin/marketplace-management/product-review-and-moderation");
    revalidatePath("/admin/marketplace-management/categories-and-products");
    return { ok: true, message: `"${product.title}" moved to ${toStatus.toLowerCase()}.` };
  } catch {
    return { ok: false, error: "Could not moderate the product — the platform database was unreachable." };
  }
}

/* ----------------------------------------------------------------- refunds */

/**
 * Record a refund and revoke the matching entitlements.
 * The money movement itself belongs to the payment provider, which is not yet
 * configured — this records the decision and access consequence only.
 */
export async function refundOrder(orderId: string, reason: string, full = true): Promise<AdminActionResult> {
  const user = await requireMarketplaceAdmin("marketplace.admin.refunds.manage");
  if (!user) return { ok: false, error: "You are not authorized to manage refunds." };
  if (!reason.trim()) return { ok: false, error: "A refund reason is required." };

  try {
    const order = await prisma.marketplaceOrder.findUnique({
      where: { id: orderId },
      include: { items: { select: { id: true } } },
    });
    if (!order) return { ok: false, error: "Order not found." };
    if (!["PAID", "ACCESS_READY", "PARTIALLY_REFUNDED"].includes(order.status)) {
      return { ok: false, error: `An order in ${order.status.toLowerCase()} cannot be refunded.` };
    }

    await prisma.$transaction(async (tx) => {
      await tx.marketplaceRefund.create({
        data: {
          orderId,
          amountCents: order.totalCents,
          currency: order.currency,
          reason,
          status: "pending_provider",
          decidedByUserId: user.id ?? null,
          decidedAt: new Date(),
        },
      });
      await tx.marketplaceOrder.update({
        where: { id: orderId },
        data: { status: full ? MarketplaceOrderStatus.REFUND_PENDING : MarketplaceOrderStatus.PARTIALLY_REFUNDED },
      });
      if (full) {
        // Revocation follows a full refund.
        await tx.marketplaceEntitlement.updateMany({
          where: { orderItemId: { in: order.items.map((i) => i.id) } },
          data: { status: "REVOKED", revokedAt: new Date(), revokedReason: reason },
        });
      }
    });

    await audit(user.id ?? null, "marketplace.order.refunded", "MarketplaceOrder", orderId, { full }, reason);
    revalidatePath("/admin/marketplace-management/orders-refunds-and-disputes");
    return {
      ok: true,
      message: "Refund recorded and access revoked. The money movement completes once a payment provider is connected.",
    };
  } catch {
    return { ok: false, error: "Could not record the refund — the platform database was unreachable." };
  }
}

/* ------------------------------------------------------------------ payouts */

const PAYOUT_TRANSITIONS: Record<string, MarketplacePayoutStatus[]> = {
  REQUESTED: ["PENDING", "HELD", "CANCELLED"],
  PENDING: ["PROCESSING", "HELD", "CANCELLED"],
  PROCESSING: ["PAID", "FAILED", "HELD"],
  HELD: ["PENDING", "CANCELLED"],
  FAILED: ["PENDING", "CANCELLED"],
} as unknown as Record<string, MarketplacePayoutStatus[]>;

export async function decidePayout(
  payoutId: string,
  toStatus: MarketplacePayoutStatus,
  reason: string,
): Promise<AdminActionResult> {
  const user = await requireMarketplaceAdmin("marketplace.admin.payouts.manage");
  if (!user) return { ok: false, error: "You are not authorized to manage payouts." };
  if (!reason.trim()) return { ok: false, error: "A reason is required for payout decisions." };

  try {
    const payout = await prisma.marketplacePayout.findUnique({ where: { id: payoutId } });
    if (!payout) return { ok: false, error: "Payout not found." };

    const allowed = PAYOUT_TRANSITIONS[payout.status] ?? [];
    if (!allowed.includes(toStatus)) {
      return { ok: false, error: `A ${payout.status.toLowerCase()} payout cannot move to ${toStatus.toLowerCase()}.` };
    }

    await prisma.$transaction(async (tx) => {
      await tx.marketplacePayout.update({
        where: { id: payoutId },
        data: {
          status: toStatus,
          processedAt: toStatus === "PAID" ? new Date() : payout.processedAt,
          failureNote: toStatus === "FAILED" ? reason : payout.failureNote,
        },
      });
      if (toStatus === "PAID") {
        // Settle the ledger entries this payout covers.
        await tx.marketplaceLedgerEntry.updateMany({
          where: { sellerId: payout.sellerId, payoutId: null, availableAt: { lte: new Date() } },
          data: { payoutId },
        });
      }
      if (toStatus === "CANCELLED" || toStatus === "FAILED") {
        // Release entries back to the available balance.
        await tx.marketplaceLedgerEntry.updateMany({ where: { payoutId }, data: { payoutId: null } });
      }
    });

    await audit(user.id ?? null, "marketplace.payout.decided", "MarketplacePayout", payoutId, {
      from: payout.status,
      to: toStatus,
    }, reason);

    revalidatePath("/admin/marketplace-management/commissions-and-payouts");
    return { ok: true, message: `Payout moved to ${toStatus.toLowerCase()}.` };
  } catch {
    return { ok: false, error: "Could not update the payout — the platform database was unreachable." };
  }
}

/* --------------------------------------------------------------- categories */

export async function upsertCategory(formData: FormData): Promise<AdminActionResult> {
  const user = await requireMarketplaceAdmin("marketplace.admin.products.manage");
  if (!user) return { ok: false, error: "You are not authorized to manage the catalogue." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "A category name is required." };
  const id = String(formData.get("id") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);

  try {
    const data = {
      name,
      slug,
      description: String(formData.get("description") ?? "").trim() || null,
      order: Number(String(formData.get("order") ?? "0")) || 0,
      isActive: String(formData.get("isActive") ?? "on") === "on",
    };
    const cat = id
      ? await prisma.marketplaceCategory.update({ where: { id }, data })
      : await prisma.marketplaceCategory.create({ data });
    await audit(user.id ?? null, id ? "marketplace.category.updated" : "marketplace.category.created", "MarketplaceCategory", cat.id, { name });
    revalidatePath("/admin/marketplace-management/categories-and-products");
    return { ok: true, message: `Category "${name}" saved.` };
  } catch (e) {
    const dup = e instanceof Error && e.message.includes("Unique constraint");
    return { ok: false, error: dup ? "A category with that slug already exists." : "Could not save the category." };
  }
}

export async function loadCategories() {
  try {
    const rows = await prisma.marketplaceCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: true } } },
    });
    return {
      connected: true,
      categories: rows.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        order: c.order,
        isActive: c.isActive,
        products: c._count.products,
      })),
    };
  } catch {
    return { connected: false, categories: [] };
  }
}
