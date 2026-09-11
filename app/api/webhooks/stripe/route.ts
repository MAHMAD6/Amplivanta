import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getStripe, isStripeConfigured, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { paymentCovers } from "@/lib/credits/policy";
import { fulfilCreditPurchase } from "@/lib/server/credits";
import { failOrder, fulfilOrder } from "@/lib/server/marketplace-fulfilment";

/**
 * POST /api/webhooks/stripe — the only path that turns a Stripe payment into
 * access, credits or a subscription. Public; authenticity is the signature.
 *
 * Every event is recorded in ProviderEvent before handling. A replay of an
 * event that already processed is acknowledged and skipped; one that failed
 * midway is handled again, which is safe because each handler is idempotent.
 */
export async function POST(req: Request) {
  if (!isStripeConfigured() || !STRIPE_WEBHOOK_SECRET()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig ?? "", STRIPE_WEBHOOK_SECRET());
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${(err as Error).message}` }, { status: 400 });
  }

  const record = await db.providerEvent.upsert({
    where: { provider_eventId: { provider: "stripe", eventId: event.id } },
    create: { provider: "stripe", eventId: event.id, type: event.type },
    update: {},
  });
  if (record.processedAt) return NextResponse.json({ received: true, duplicate: true });

  try {
    await handle(event);
    await db.providerEvent.update({ where: { id: record.id }, data: { processedAt: new Date(), error: null } });
  } catch (err) {
    await db.providerEvent.update({ where: { id: record.id }, data: { error: (err as Error).message.slice(0, 500) } });
    // Non-2xx makes Stripe retry.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}

async function handle(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      return onCheckoutPaid(event.data.object as Stripe.Checkout.Session);
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired":
      return onCheckoutFailed(event.data.object as Stripe.Checkout.Session);
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await db.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: sub.status, cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end) },
      });
      return;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      const inv = event.data.object as Stripe.Invoice & { subscription?: string | null };
      const subId =
        typeof inv.subscription === "string"
          ? inv.subscription
          : (inv.parent?.subscription_details?.subscription as string | undefined);
      if (!subId) return;
      const sub = await db.subscription.findFirst({ where: { stripeSubscriptionId: subId } });
      if (!sub) return;
      await db.invoice.create({
        data: {
          workspaceId: sub.workspaceId,
          subscriptionId: sub.id,
          amount: (inv.amount_paid ?? inv.amount_due ?? 0) / 100,
          status: event.type === "invoice.paid" ? "paid" : "failed",
          pdfUrl: inv.invoice_pdf ?? null,
        },
      });
      return;
    }
    case "account.updated": {
      // Stripe Connect: record seller onboarding progress for operators.
      const acct = event.data.object as Stripe.Account;
      const seller = await db.marketplaceSeller.findFirst({ where: { payoutAccountRef: acct.id }, select: { id: true } });
      if (!seller) return;
      await db.platformAuditLog.create({
        data: {
          action: "marketplace.seller.payout_account.updated",
          resourceType: "MarketplaceSeller",
          resourceId: seller.id,
          metadata: {
            chargesEnabled: acct.charges_enabled,
            payoutsEnabled: acct.payouts_enabled,
            detailsSubmitted: acct.details_submitted,
          } as Prisma.InputJsonValue,
        },
      });
      return;
    }
  }
}

const paymentRef = (s: Stripe.Checkout.Session) =>
  typeof s.payment_intent === "string" ? s.payment_intent : (s.payment_intent?.id ?? s.id);

async function onCheckoutPaid(s: Stripe.Checkout.Session) {
  const kind = s.metadata?.kind;

  if (kind === "credit_pack") {
    // Delayed payment methods complete later via async_payment_succeeded.
    if (s.payment_status !== "paid") return;
    const purchase = await db.creditPurchase.findUnique({ where: { stripeSessionId: s.id } });
    if (!purchase) throw new Error(`No credit purchase recorded for session ${s.id}`);
    const covered = paymentCovers(purchase, { amountCents: s.amount_total, currency: s.currency, status: s.payment_status });
    if (!covered) {
      await db.creditPurchase.update({ where: { id: purchase.id }, data: { status: "amount_mismatch" } });
      return;
    }
    const res = await fulfilCreditPurchase(s.id, paymentRef(s));
    if (!res.ok) throw new Error(res.error);
    return;
  }

  if (kind === "marketplace_order") {
    if (s.payment_status !== "paid") return;
    const orderId = s.metadata?.orderId;
    if (!orderId) throw new Error("Marketplace session without orderId");
    const order = await db.marketplaceOrder.findUnique({
      where: { id: orderId },
      select: { totalCents: true, currency: true, paymentIntentRef: true },
    });
    if (!order) throw new Error(`Order ${orderId} not found`);
    // The session must be the one this order was sent to pay.
    if (order.paymentIntentRef && order.paymentIntentRef !== s.id) throw new Error("Session does not belong to order");
    const covered = paymentCovers(
      { amountCents: order.totalCents, currency: order.currency },
      { amountCents: s.amount_total, currency: s.currency, status: s.payment_status },
    );
    if (!covered) throw new Error("Payment does not cover the order total");
    const res = await fulfilOrder(orderId, "provider_confirmed", paymentRef(s));
    if (!res.ok) throw new Error(res.error);
    return;
  }

  // Subscription checkout (the original flow, which predates `kind`).
  const workspaceId = s.metadata?.workspaceId;
  const planId = s.metadata?.planId;
  if (s.mode !== "subscription" || !workspaceId || !planId) return;
  const existing = await db.subscription.findFirst({ where: { workspaceId } });
  const data = {
    planId,
    status: "active",
    stripeCustomerId: typeof s.customer === "string" ? s.customer : null,
    stripeSubscriptionId: typeof s.subscription === "string" ? s.subscription : null,
  };
  if (existing) await db.subscription.update({ where: { id: existing.id }, data });
  else await db.subscription.create({ data: { workspaceId, ...data } });
}

async function onCheckoutFailed(s: Stripe.Checkout.Session) {
  if (s.metadata?.kind === "credit_pack") {
    await db.creditPurchase.updateMany({ where: { stripeSessionId: s.id, status: "pending" }, data: { status: "failed" } });
  } else if (s.metadata?.kind === "marketplace_order" && s.metadata.orderId) {
    await failOrder(s.metadata.orderId, s.id);
  }
}
