import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Order fulfilment.
 *
 * Separated from order *placement* on purpose: placing an order never grants
 * access. An order only becomes PAID / ACCESS_READY here, and only when a
 * payment has actually been confirmed — either because the order total was zero
 * (nothing to charge) or because a verified payment-provider webhook said so.
 */

export type FulfilReason = "zero_total" | "provider_confirmed";

/**
 * Marks an order paid, activates its entitlements and writes seller ledger
 * entries. Idempotent: re-running for an already-fulfilled order is a no-op, so
 * a webhook delivered twice cannot double-credit a seller.
 */
export async function fulfilOrder(orderId: string, reason: FulfilReason, providerRef?: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.marketplaceOrder.findUnique({
      where: { id: orderId },
      include: { items: { include: { entitlements: true, ledger: true } } },
    });
    if (!order) return { ok: false as const, error: "Order not found." };

    // Already fulfilled — do nothing rather than duplicating entitlements.
    if (order.status === "ACCESS_READY" || order.status === "PAID") {
      return { ok: true as const, alreadyFulfilled: true };
    }
    if (!["INITIATED", "PAYMENT_PENDING"].includes(order.status)) {
      return { ok: false as const, error: `An order in ${order.status.toLowerCase()} cannot be fulfilled.` };
    }
    // Guard: a non-zero order may only be fulfilled by a confirmed payment.
    if (order.totalCents > 0 && reason !== "provider_confirmed") {
      return { ok: false as const, error: "A paid order cannot be fulfilled without a confirmed payment." };
    }

    await tx.marketplaceOrder.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        placedAt: order.placedAt ?? new Date(),
        paymentIntentRef: providerRef ?? order.paymentIntentRef,
      },
    });

    for (const item of order.items) {
      if (item.entitlements.length === 0) {
        await tx.marketplaceEntitlement.create({
          data: {
            orderItemId: item.id,
            buyerUserId: order.buyerUserId,
            productVersionId: item.productVersionId,
            status: "ACTIVE",
            activatedAt: new Date(),
          },
        });
      } else {
        await tx.marketplaceEntitlement.updateMany({
          where: { orderItemId: item.id, status: "PENDING" },
          data: { status: "ACTIVE", activatedAt: new Date() },
        });
      }

      // Ledger entry per sold item, once.
      if (item.unitPriceCents > 0 && item.ledger.length === 0) {
        await tx.marketplaceLedgerEntry.create({
          data: {
            sellerId: item.sellerId,
            orderItemId: item.id,
            entryType: "sale",
            grossCents: item.totalCents,
            feeCents: 0,
            netCents: item.totalCents,
            currency: item.currency,
            availableAt: new Date(),
          },
        });
      }
    }

    await tx.marketplaceOrder.update({ where: { id: orderId }, data: { status: "ACCESS_READY" } });

    await tx.platformAuditLog.create({
      data: {
        actorUserId: null,
        action: "marketplace.order.fulfilled",
        resourceType: "MarketplaceOrder",
        resourceId: orderId,
        metadata: { reason, providerRef: providerRef ?? null, totalCents: order.totalCents } as Prisma.InputJsonValue,
      },
    });

    return { ok: true as const, alreadyFulfilled: false };
  });
}

/** Marks a pending order as failed after a provider reports a failed payment. */
export async function failOrder(orderId: string, providerRef?: string) {
  try {
    const order = await prisma.marketplaceOrder.findUnique({ where: { id: orderId } });
    if (!order) return { ok: false as const, error: "Order not found." };
    if (!["INITIATED", "PAYMENT_PENDING"].includes(order.status)) {
      return { ok: true as const };
    }
    await prisma.marketplaceOrder.update({
      where: { id: orderId },
      data: { status: "PAYMENT_FAILED", paymentIntentRef: providerRef ?? order.paymentIntentRef },
    });
    await prisma.platformAuditLog.create({
      data: {
        action: "marketplace.order.payment_failed",
        resourceType: "MarketplaceOrder",
        resourceId: orderId,
        metadata: { providerRef: providerRef ?? null } as Prisma.InputJsonValue,
      },
    });
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Database unreachable." };
  }
}

/** Opens a dispute/chargeback against an order and revokes access. */
export async function openDispute(orderId: string, providerRef: string, amountCents?: number) {
  try {
    const order = await prisma.marketplaceOrder.findUnique({
      where: { id: orderId },
      include: { items: { select: { id: true } } },
    });
    if (!order) return { ok: false as const, error: "Order not found." };

    await prisma.$transaction(async (tx) => {
      const existing = await tx.marketplaceDispute.findFirst({ where: { orderId, providerRef } });
      if (existing) return;
      await tx.marketplaceDispute.create({
        data: { orderId, kind: "chargeback", status: "open", amountCents: amountCents ?? order.totalCents, providerRef },
      });
      await tx.marketplaceOrder.update({ where: { id: orderId }, data: { status: "CHARGEBACK_OPEN" } });
      await tx.marketplaceEntitlement.updateMany({
        where: { orderItemId: { in: order.items.map((i) => i.id) } },
        data: { status: "REVOKED", revokedAt: new Date(), revokedReason: "chargeback opened" },
      });
    });
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Database unreachable." };
  }
}
