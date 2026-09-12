import { describe, expect, it } from "vitest";
import { allocate, applyBundles, applyCoupon, couponUsable, type CouponRule, type PricedLine } from "@/lib/marketplace/pricing";

const line = (key: string, cents: number, sellerId = "s1", bundleId: string | null = null): PricedLine => ({
  key,
  productId: `p-${key}`,
  sellerId,
  unitPriceCents: cents,
  currency: "USD",
  bundleId,
});

const coupon = (over: Partial<CouponRule> = {}): CouponRule => ({
  code: "SAVE",
  sellerId: null,
  percentOff: 10,
  amountOffCents: null,
  currency: null,
  startsAt: null,
  endsAt: null,
  maxRedemptions: null,
  redemptions: 0,
  isActive: true,
  ...over,
});

const sum = (ls: PricedLine[]) => ls.reduce((s, l) => s + l.unitPriceCents, 0);

describe("allocate", () => {
  it("splits proportionally and sums exactly to the discount", () => {
    const shares = allocate([1000, 2000, 3001], 1000);
    expect(shares.reduce((a, b) => a + b, 0)).toBe(1000);
    expect(shares.every((s, i) => s <= [1000, 2000, 3001][i])).toBe(true);
  });

  it("never discounts more than the total", () => {
    expect(allocate([100, 50], 999).reduce((a, b) => a + b, 0)).toBe(150);
  });
});

describe("bundles", () => {
  const bundle = { id: "b1", priceCents: 2500, currency: "USD", productIds: ["p-a", "p-b"] };

  it("reprices a complete bundle to exactly the bundle price", () => {
    const out = applyBundles([line("a", 2000, "s1", "b1"), line("b", 1333, "s1", "b1"), line("c", 500)], [bundle]);
    expect(out[0].unitPriceCents + out[1].unitPriceCents).toBe(2500);
    expect(out[2].unitPriceCents).toBe(500);
  });

  it("leaves an incomplete bundle at list price", () => {
    const out = applyBundles([line("a", 2000, "s1", "b1")], [bundle]);
    expect(out[0].unitPriceCents).toBe(2000);
  });

  it("never makes a bundle cost more than its parts", () => {
    const out = applyBundles([line("a", 1000, "s1", "b1"), line("b", 1000, "s1", "b1")], [bundle]);
    expect(sum(out)).toBe(2000);
  });
});

describe("coupons", () => {
  it("applies a platform percent coupon across the cart", () => {
    const r = applyCoupon([line("a", 1000), line("b", 2999)], coupon());
    expect(r.ok && r.discountCents).toBe(399);
    expect(sum(r.lines)).toBe(3999 - 399);
  });

  it("limits a seller coupon to that seller's items", () => {
    const r = applyCoupon([line("a", 1000, "s1"), line("b", 1000, "s2")], coupon({ sellerId: "s2", percentOff: 50 }));
    expect(r.ok).toBe(true);
    expect(r.lines[0].unitPriceCents).toBe(1000);
    expect(r.lines[1].unitPriceCents).toBe(500);
  });

  it("caps a fixed amount at the eligible total and checks currency", () => {
    const r = applyCoupon([line("a", 300)], coupon({ percentOff: null, amountOffCents: 1000, currency: "usd" }));
    expect(r.ok && r.discountCents).toBe(300);
    const wrong = applyCoupon([line("a", 300)], coupon({ percentOff: null, amountOffCents: 100, currency: "EUR" }));
    expect(wrong.ok).toBe(false);
  });

  it("rejects inactive, expired, not-yet-started and exhausted coupons", () => {
    const now = new Date("2026-09-11T00:00:00Z");
    expect(couponUsable(coupon({ isActive: false }), now).ok).toBe(false);
    expect(couponUsable(coupon({ endsAt: new Date("2026-09-10T00:00:00Z") }), now).ok).toBe(false);
    expect(couponUsable(coupon({ startsAt: new Date("2026-09-12T00:00:00Z") }), now).ok).toBe(false);
    expect(couponUsable(coupon({ maxRedemptions: 5, redemptions: 5 }), now).ok).toBe(false);
  });

  it("refuses a coupon that matches nothing in the cart", () => {
    expect(applyCoupon([line("a", 1000, "s1")], coupon({ sellerId: "s9" })).ok).toBe(false);
  });
});
