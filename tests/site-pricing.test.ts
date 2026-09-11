import { describe, expect, it } from "vitest";
import { annualMonthlyPrice, annualTotal, monthlyPrice, PLANS } from "@/lib/site-pricing";

// Figures copied from the approved pricing reference. If a discount or list
// price changes, this test fails until the reference and the page agree.
const REFERENCE: Record<string, { monthly: number; annualMonthly: number; total: number; save: number }> = {
  starter: { monthly: 36.75, annualMonthly: 33.08, total: 396.9, save: 191.1 },
  growth: { monthly: 74.25, annualMonthly: 66.83, total: 801.9, save: 386.1 },
  professional: { monthly: 186.75, annualMonthly: 168.08, total: 2016.9, save: 971.1 },
};

describe("published pricing", () => {
  for (const [id, want] of Object.entries(REFERENCE)) {
    const plan = PLANS.find((p) => p.id === id)!;
    const list = plan.listMonthly!;

    it(`${plan.name} matches the reference`, () => {
      expect(monthlyPrice(list)).toBe(want.monthly);
      expect(annualMonthlyPrice(list)).toBe(want.annualMonthly);
      expect(annualTotal(list)).toBe(want.total);
      expect(Math.round((list * 12 - annualTotal(list)) * 100) / 100).toBe(want.save);
    });
  }

  it("rounds half-cent boundaries up, not by floating-point accident", () => {
    // 49 × 0.675 = 33.075 exactly; must not become 33.07.
    expect(annualMonthlyPrice(49)).toBe(33.08);
    expect(annualMonthlyPrice(99)).toBe(66.83);
  });

  it("marks exactly one plan as recommended", () => {
    expect(PLANS.filter((p) => p.recommended).map((p) => p.id)).toEqual(["growth"]);
  });

  it("never publishes a price for Enterprise", () => {
    expect(PLANS.find((p) => p.id === "enterprise")!.listMonthly).toBeNull();
  });
});
