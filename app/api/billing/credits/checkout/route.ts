import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, requireRole, ApiError } from "@/lib/tenant";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { creditPacks } from "@/lib/server/credits";

const schema = z.object({ packCode: z.string().min(1).max(64) });

const APP_URL = () => process.env.NEXTAUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";

/**
 * POST /api/billing/credits/checkout — one-time credit purchase.
 *
 * The browser sends only a pack code. Quantity comes from server config and
 * the amount from the Stripe Price, both recorded before redirecting, so the
 * webhook fulfils exactly what was sold. Success redirects grant nothing.
 */
export const POST = route(async (ctx, req) => {
  requireRole(ctx, "ADMIN");
  const { packCode } = await parseBody(req, schema);

  if (!isStripeConfigured()) throw new ApiError(503, "Credit purchases are not available yet");
  const pack = creditPacks().find((p) => p.code === packCode);
  if (!pack) throw new ApiError(404, "Credit pack not found");

  const stripe = getStripe();
  const price = await stripe.prices.retrieve(pack.priceId);
  if (!price.active || price.type !== "one_time" || typeof price.unit_amount !== "number") {
    throw new ApiError(503, "This credit pack is not available");
  }

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: [{ price: pack.priceId, quantity: 1 }],
      success_url: `${APP_URL()}/app/usage-credits?purchase=processing`,
      cancel_url: `${APP_URL()}/app/usage-credits?purchase=cancelled`,
      client_reference_id: ctx.workspaceId,
      metadata: { kind: "credit_pack", workspaceId: ctx.workspaceId, packCode: pack.code },
    },
    // One open checkout per user, pack and minute: a double click reuses it.
    { idempotencyKey: `credits:${ctx.workspaceId}:${ctx.userId}:${pack.code}:${Math.floor(Date.now() / 60000)}` },
  );

  await db.creditPurchase.upsert({
    where: { stripeSessionId: session.id },
    create: {
      workspaceId: ctx.workspaceId,
      userId: ctx.userId,
      packCode: pack.code,
      credits: pack.credits,
      amountCents: price.unit_amount,
      currency: price.currency,
      stripeSessionId: session.id,
    },
    update: {},
  });

  return NextResponse.json({ url: session.url });
});

/** GET — the packs on offer, for the Usage & Credits page. Empty when unconfigured. */
export const GET = route(async () => {
  const packs = isStripeConfigured() ? creditPacks().map(({ code, label, credits }) => ({ code, label, credits })) : [];
  return NextResponse.json({ packs });
});
