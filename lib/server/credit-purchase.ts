import "server-only";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { creditPacks } from "@/lib/server/credits";
import type { CreditPackOption, PurchaseOutcome } from "@/components/amplivanta/buy-credits-drawer";

/**
 * Purchasable credit packages with their live prices. A package whose Stripe
 * price cannot be read, is inactive, or is not one-time is left out, so the
 * drawer never offers something checkout would refuse.
 */
export async function loadCreditPackOptions(): Promise<CreditPackOption[]> {
  if (!isStripeConfigured()) return [];
  const packs = creditPacks();
  if (packs.length === 0) return [];
  const stripe = getStripe();
  const priced = await Promise.all(
    packs.map(async (p) => {
      try {
        const price = await stripe.prices.retrieve(p.priceId);
        if (!price.active || price.type !== "one_time" || typeof price.unit_amount !== "number") return null;
        return { code: p.code, label: p.label, credits: p.credits, priceCents: price.unit_amount, currency: price.currency };
      } catch {
        return null;
      }
    }),
  );
  return priced.filter((p): p is CreditPackOption => p !== null);
}

/**
 * The outcome of a returning checkout, read from our own records for this
 * workspace. The redirect only carries a session id; whether credits were
 * added is decided by the verified webhook, not by the browser.
 */
export async function loadPurchaseOutcome(sessionId: string | undefined, returned: string | undefined): Promise<PurchaseOutcome> {
  if (returned === "cancelled") return null;
  if (!sessionId || !/^cs_[A-Za-z0-9_]{8,200}$/.test(sessionId)) return null;
  try {
    const ctx = await getSessionContext();
    const purchase = await db.creditPurchase.findFirst({
      where: { stripeSessionId: sessionId, workspaceId: ctx.workspaceId },
      select: { status: true, credits: true },
    });
    if (!purchase) return null;
    if (purchase.status === "fulfilled") {
      const wallet = await db.creditWallet.findUnique({ where: { workspaceId: ctx.workspaceId } });
      return { state: "success", credits: purchase.credits, balance: wallet ? wallet.planCredits + wallet.purchasedCredits : null };
    }
    if (purchase.status === "failed" || purchase.status === "amount_mismatch") return { state: "payment_failed" };
    return { state: "processing" };
  } catch {
    return null;
  }
}
