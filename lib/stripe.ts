import Stripe from "stripe";

/**
 * Stripe client. When STRIPE_SECRET_KEY is unset, billing falls back to a local
 * "activate immediately" flow (no real charge), so the billing UI works in dev.
 */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!isStripeConfigured()) throw new Error("Stripe is not configured");
  if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return stripe;
}

export const STRIPE_WEBHOOK_SECRET = () => process.env.STRIPE_WEBHOOK_SECRET || "";
