/**
 * Pure order-state policy.
 *
 * Kept free of server-only imports so the rules that protect revenue can be
 * unit-tested directly. `lib/server/marketplace-fulfilment.ts` applies them.
 */

export type FulfilReason = "zero_total" | "provider_confirmed";

export type OrderFacts = { status: string; totalCents: number };

/** Status an order is created with. Placing an order never means "paid". */
export function nextOrderStatusOnPlace(totalCents: number): "INITIATED" | "PAYMENT_PENDING" {
  return totalCents > 0 ? "PAYMENT_PENDING" : "INITIATED";
}

export type FulfilDecision =
  | { ok: true; alreadyFulfilled: boolean }
  | { ok: false; error: string };

/**
 * May this order be fulfilled (marked paid, entitlements activated, seller
 * credited)? A non-zero order requires a confirmed payment - this is the guard
 * that stops a configured provider from silently granting free access.
 */
export function canFulfil(order: OrderFacts, reason: FulfilReason): FulfilDecision {
  if (order.status === "ACCESS_READY" || order.status === "PAID") {
    return { ok: true, alreadyFulfilled: true };
  }
  if (!["INITIATED", "PAYMENT_PENDING"].includes(order.status)) {
    return { ok: false, error: `An order in ${order.status.toLowerCase()} cannot be fulfilled.` };
  }
  if (order.totalCents > 0 && reason !== "provider_confirmed") {
    return { ok: false, error: "A paid order cannot be fulfilled without a confirmed payment." };
  }
  return { ok: true, alreadyFulfilled: false };
}
