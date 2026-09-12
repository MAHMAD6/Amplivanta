/**
 * Pure Marketplace pricing: bundle prices and coupon discounts.
 *
 * Every figure is integer cents. Discounts are allocated across lines in
 * proportion to their price, with the rounding remainder on the last line,
 * so the per-line snapshot prices always add up to exactly the order total —
 * the seller ledger and Stripe line items both rely on that.
 */

export type PricedLine = {
  key: string;
  productId: string;
  sellerId: string;
  unitPriceCents: number;
  currency: string;
  bundleId?: string | null;
};

export type BundleOffer = { id: string; priceCents: number; currency: string; productIds: string[] };

export type CouponRule = {
  code: string;
  sellerId: string | null;
  percentOff: number | null;
  amountOffCents: number | null;
  currency: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  maxRedemptions: number | null;
  redemptions: number;
  isActive: boolean;
};

/** Spreads `discount` over `amounts` proportionally; result sums exactly to it. */
export function allocate(amounts: number[], discount: number): number[] {
  const total = amounts.reduce((a, b) => a + b, 0);
  if (total <= 0 || discount <= 0) return amounts.map(() => 0);
  const d = Math.min(discount, total);
  const shares = amounts.map((a) => Math.floor((a * d) / total));
  let rest = d - shares.reduce((a, b) => a + b, 0);
  // Hand out the remainder to the largest lines first, one cent each.
  const order = amounts.map((a, i) => [a, i] as const).sort((x, y) => y[0] - x[0]);
  for (let k = 0; rest > 0 && k < order.length; k++, rest--) {
    const i = order[k][1];
    if (shares[i] < amounts[i]) shares[i] += 1;
    else rest++;
  }
  return shares;
}

/**
 * Applies bundle pricing: when every product of a published bundle is in the
 * cart as part of that bundle, those lines are repriced so they sum to the
 * bundle price. Incomplete bundles fall back to list prices.
 */
export function applyBundles(lines: PricedLine[], bundles: BundleOffer[]): PricedLine[] {
  const out = lines.map((l) => ({ ...l }));
  for (const b of bundles) {
    const idx = out
      .map((l, i) => [l, i] as const)
      .filter(([l]) => l.bundleId === b.id && b.productIds.includes(l.productId))
      .map(([, i]) => i);
    const complete = new Set(idx.map((i) => out[i].productId)).size === b.productIds.length;
    if (!complete || idx.some((i) => out[i].currency !== b.currency)) continue;
    const list = idx.map((i) => out[i].unitPriceCents);
    const listTotal = list.reduce((a, c) => a + c, 0);
    if (b.priceCents >= listTotal) continue; // a bundle never costs more than its parts
    const cut = allocate(list, listTotal - b.priceCents);
    idx.forEach((i, k) => (out[i].unitPriceCents = list[k] - cut[k]));
  }
  return out;
}

export type CouponCheck = { ok: true } | { ok: false; error: string };

export function couponUsable(c: CouponRule, now = new Date()): CouponCheck {
  if (!c.isActive) return { ok: false, error: "This coupon is not active." };
  if (c.startsAt && now < c.startsAt) return { ok: false, error: "This coupon is not active yet." };
  if (c.endsAt && now > c.endsAt) return { ok: false, error: "This coupon has expired." };
  if (c.maxRedemptions != null && c.redemptions >= c.maxRedemptions) {
    return { ok: false, error: "This coupon has been fully redeemed." };
  }
  if ((c.percentOff ?? 0) <= 0 && (c.amountOffCents ?? 0) <= 0) return { ok: false, error: "This coupon has no discount." };
  return { ok: true };
}

export type CouponResult =
  | { ok: true; lines: PricedLine[]; discountCents: number }
  | { ok: false; error: string; lines: PricedLine[]; discountCents: 0 };

/**
 * Applies a coupon after bundle pricing. A seller coupon only touches that
 * seller's lines; a fixed-amount coupon must match the lines' currency.
 */
export function applyCoupon(lines: PricedLine[], c: CouponRule, now = new Date()): CouponResult {
  const fail = (error: string): CouponResult => ({ ok: false, error, lines, discountCents: 0 });
  const usable = couponUsable(c, now);
  if (!usable.ok) return fail(usable.error);

  const eligible = lines.map((l, i) => [l, i] as const).filter(([l]) => !c.sellerId || l.sellerId === c.sellerId);
  if (eligible.length === 0) return fail("This coupon does not apply to anything in your cart.");
  const base = eligible.reduce((s, [l]) => s + l.unitPriceCents, 0);
  if (base <= 0) return fail("This coupon does not apply to free items.");

  let discount: number;
  if (c.percentOff) {
    const pct = Math.min(Math.max(c.percentOff, 0), 100);
    discount = Math.floor((base * pct) / 100);
  } else {
    const cur = eligible[0][0].currency;
    if (!c.currency || c.currency.toLowerCase() !== cur.toLowerCase()) {
      return fail("This coupon is in a different currency from your cart.");
    }
    discount = Math.min(c.amountOffCents ?? 0, base);
  }
  if (discount <= 0) return fail("This coupon does not reduce your total.");

  const cut = allocate(eligible.map(([l]) => l.unitPriceCents), discount);
  const out = lines.map((l) => ({ ...l }));
  eligible.forEach(([, i], k) => (out[i].unitPriceCents -= cut[k]));
  return { ok: true, lines: out, discountCents: discount };
}

export const normalizeCouponCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, "");

/** Cookie holding the buyer applied coupon code (re-validated at every quote). */
export const COUPON_COOKIE = "mp_coupon";
