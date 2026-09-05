import { describe, expect, it } from "vitest";
import { requiresPaymentProvider } from "@/lib/marketplace/providers.policy";
import { canFulfil, nextOrderStatusOnPlace } from "@/lib/marketplace/order-policy";

describe("requiresPaymentProvider", () => {
  it("does not require a provider for a free order", () => {
    expect(requiresPaymentProvider(0)).toBe(false);
  });
  it("requires a provider for any balance due", () => {
    expect(requiresPaymentProvider(1)).toBe(true);
    expect(requiresPaymentProvider(4900)).toBe(true);
  });
});

describe("nextOrderStatusOnPlace", () => {
  it("places a free order as INITIATED so fulfilment can complete it", () => {
    expect(nextOrderStatusOnPlace(0)).toBe("INITIATED");
  });
  it("places a paid order as PAYMENT_PENDING, never PAID", () => {
    expect(nextOrderStatusOnPlace(4900)).toBe("PAYMENT_PENDING");
  });
});

describe("canFulfil — the guard that protects revenue", () => {
  it("fulfils a zero-total order without any payment", () => {
    expect(canFulfil({ status: "INITIATED", totalCents: 0 }, "zero_total").ok).toBe(true);
  });

  it("REFUSES to fulfil a paid order without a confirmed payment", () => {
    const res = canFulfil({ status: "PAYMENT_PENDING", totalCents: 4900 }, "zero_total");
    expect(res.ok).toBe(false);
  });

  it("fulfils a paid order once the provider confirms", () => {
    expect(canFulfil({ status: "PAYMENT_PENDING", totalCents: 4900 }, "provider_confirmed").ok).toBe(true);
  });

  it("is idempotent: an already-fulfilled order is a no-op, not an error", () => {
    const res = canFulfil({ status: "ACCESS_READY", totalCents: 4900 }, "provider_confirmed");
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.alreadyFulfilled).toBe(true);
  });

  it("refuses to fulfil a refunded order", () => {
    expect(canFulfil({ status: "REFUNDED", totalCents: 4900 }, "provider_confirmed").ok).toBe(false);
  });

  it("refuses to fulfil an order in chargeback", () => {
    expect(canFulfil({ status: "CHARGEBACK_OPEN", totalCents: 4900 }, "provider_confirmed").ok).toBe(false);
  });

  it("refuses to fulfil a failed payment without a new confirmation", () => {
    expect(canFulfil({ status: "PAYMENT_FAILED", totalCents: 4900 }, "provider_confirmed").ok).toBe(false);
  });
});
