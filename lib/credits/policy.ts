/**
 * Pure credit rules (External API Master Revision, section 4.2). Kept free of
 * database imports so they are unit-testable.
 */

export type WalletBalance = { planCredits: number; purchasedCredits: number };

export type ConsumptionPlan =
  | { ok: true; fromPlan: number; fromPurchased: number }
  | { ok: false; error: "invalid_amount" | "insufficient_credits"; available: number };

/** V1 consumption order: plan credits first, then purchased credits. */
export function planConsumption(wallet: WalletBalance, amount: number): ConsumptionPlan {
  const available = wallet.planCredits + wallet.purchasedCredits;
  if (!Number.isInteger(amount) || amount <= 0) return { ok: false, error: "invalid_amount", available };
  if (amount > available) return { ok: false, error: "insufficient_credits", available };
  const fromPlan = Math.min(wallet.planCredits, amount);
  return { ok: true, fromPlan, fromPurchased: amount - fromPlan };
}

export type CreditPack = { code: string; label: string; credits: number; priceId: string };

/**
 * Credit packs are a commercial decision, so none are hard-coded. They come
 * from CREDIT_PACKS, a JSON array like
 *   [{"code":"credits_1000","label":"1,000 credits","credits":1000,"priceId":"price_..."}]
 * Invalid entries are dropped rather than guessed at.
 */
export function parseCreditPacks(raw: string | undefined): CreditPack[] {
  if (!raw?.trim()) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const seen = new Set<string>();
  const packs: CreditPack[] = [];
  for (const p of data) {
    if (!p || typeof p !== "object") continue;
    const { code, label, credits, priceId } = p as Record<string, unknown>;
    if (typeof code !== "string" || !/^[a-z0-9_-]{1,64}$/i.test(code) || seen.has(code)) continue;
    if (typeof credits !== "number" || !Number.isInteger(credits) || credits <= 0) continue;
    if (typeof priceId !== "string" || !priceId.startsWith("price_")) continue;
    seen.add(code);
    packs.push({ code, label: typeof label === "string" && label ? label : `${credits} credits`, credits, priceId });
  }
  return packs;
}

/**
 * Whether a paid Checkout session may fulfil a purchase recorded server-side.
 * The browser never supplies the amount; the webhook's figure must cover the
 * amount fixed at checkout creation, in the same currency.
 */
export function paymentCovers(
  expected: { amountCents: number; currency: string },
  paid: { amountCents: number | null | undefined; currency: string | null | undefined; status: string | null | undefined },
): boolean {
  if (paid.status !== "paid") return false;
  if (typeof paid.amountCents !== "number") return false;
  if ((paid.currency ?? "").toLowerCase() !== expected.currency.toLowerCase()) return false;
  return paid.amountCents >= expected.amountCents;
}
