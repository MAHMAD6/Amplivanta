import "server-only";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

/**
 * Stripe Connect for third-party sellers (External API Master Revision,
 * sections 4.3 and 10). A Phase 2 dependency: external sellers must not take
 * payouts until Connect onboarding, payout reconciliation and dispute policy
 * are production-ready, so this is off unless explicitly enabled.
 *
 * Only the connected-account id is stored (MarketplaceSeller.payoutAccountRef);
 * bank and identity details stay with Stripe.
 */

export const CONNECT_PROVIDER = "stripe_connect";

export function isConnectEnabled(): boolean {
  return isStripeConfigured() && process.env.STRIPE_CONNECT_ENABLED === "true";
}

const APP_URL = () => process.env.NEXTAUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";

/** Creates the seller's Express account if needed and returns an onboarding link. */
export async function createOnboardingLink(seller: {
  id: string;
  email: string;
  payoutProvider: string | null;
  payoutAccountRef: string | null;
}): Promise<{ accountId: string; url: string; created: boolean }> {
  const stripe = getStripe();
  let accountId = seller.payoutProvider === CONNECT_PROVIDER ? seller.payoutAccountRef : null;
  let created = false;
  if (!accountId) {
    const account = await stripe.accounts.create(
      { type: "express", email: seller.email, metadata: { sellerId: seller.id } },
      { idempotencyKey: `connect-account:${seller.id}` },
    );
    accountId = account.id;
    created = true;
  }
  const link = await stripe.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${APP_URL()}/app/marketplace/seller/settings?payouts=refresh`,
    return_url: `${APP_URL()}/app/marketplace/seller/settings?payouts=returned`,
  });
  return { accountId, url: link.url, created };
}

/** Current onboarding state for display; null when Connect is off or unset. */
export async function payoutAccountStatus(accountId: string | null) {
  if (!accountId || !isConnectEnabled()) return null;
  try {
    const a = await getStripe().accounts.retrieve(accountId);
    return { detailsSubmitted: a.details_submitted, payoutsEnabled: a.payouts_enabled, chargesEnabled: a.charges_enabled };
  } catch {
    return null;
  }
}
