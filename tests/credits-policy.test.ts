import { describe, expect, it } from "vitest";
import { parseCreditPacks, paymentCovers, planConsumption } from "@/lib/credits/policy";

describe("credit consumption order", () => {
  it("consumes plan credits before purchased credits", () => {
    expect(planConsumption({ planCredits: 30, purchasedCredits: 100 }, 50)).toEqual({
      ok: true,
      fromPlan: 30,
      fromPurchased: 20,
    });
  });

  it("uses only plan credits when they cover the amount", () => {
    expect(planConsumption({ planCredits: 80, purchasedCredits: 10 }, 50)).toEqual({
      ok: true,
      fromPlan: 50,
      fromPurchased: 0,
    });
  });

  it("refuses to go negative", () => {
    const r = planConsumption({ planCredits: 5, purchasedCredits: 5 }, 11);
    expect(r).toEqual({ ok: false, error: "insufficient_credits", available: 10 });
  });

  it("rejects zero, negative and fractional amounts", () => {
    for (const n of [0, -1, 1.5]) expect(planConsumption({ planCredits: 9, purchasedCredits: 9 }, n).ok).toBe(false);
  });
});

describe("credit pack configuration", () => {
  it("reads valid packs and drops invalid ones instead of guessing", () => {
    const packs = parseCreditPacks(
      JSON.stringify([
        { code: "credits_1000", label: "1,000 credits", credits: 1000, priceId: "price_abc" },
        { code: "credits_1000", credits: 5, priceId: "price_dup" },
        { code: "bad", credits: -5, priceId: "price_x" },
        { code: "noprice", credits: 10, priceId: "prod_x" },
        { code: "frac", credits: 1.5, priceId: "price_y" },
      ]),
    );
    expect(packs).toEqual([{ code: "credits_1000", label: "1,000 credits", credits: 1000, priceId: "price_abc" }]);
  });

  it("treats missing or malformed config as no packs", () => {
    expect(parseCreditPacks(undefined)).toEqual([]);
    expect(parseCreditPacks("not json")).toEqual([]);
    expect(parseCreditPacks("{}")).toEqual([]);
  });
});

describe("payment verification", () => {
  const expected = { amountCents: 1999, currency: "usd" };

  it("accepts a paid session covering the amount", () => {
    expect(paymentCovers(expected, { amountCents: 1999, currency: "USD", status: "paid" })).toBe(true);
  });

  it("rejects unpaid, short, missing or wrong-currency payments", () => {
    expect(paymentCovers(expected, { amountCents: 1999, currency: "usd", status: "unpaid" })).toBe(false);
    expect(paymentCovers(expected, { amountCents: 1000, currency: "usd", status: "paid" })).toBe(false);
    expect(paymentCovers(expected, { amountCents: null, currency: "usd", status: "paid" })).toBe(false);
    expect(paymentCovers(expected, { amountCents: 1999, currency: "eur", status: "paid" })).toBe(false);
  });
});
