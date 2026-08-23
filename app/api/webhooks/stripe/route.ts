import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripe, isStripeConfigured, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";

// POST /api/webhooks/stripe — Stripe event receiver (signature-verified).
// Public route: no session; authenticity comes from the Stripe signature.
export async function POST(req: Request) {
  if (!isStripeConfigured() || !STRIPE_WEBHOOK_SECRET()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig!, STRIPE_WEBHOOK_SECRET());
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${(err as Error).message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as { metadata?: Record<string, string>; customer?: string; subscription?: string };
      const workspaceId = s.metadata?.workspaceId;
      const planId = s.metadata?.planId;
      if (workspaceId && planId) {
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
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as { id: string; status: string; cancel_at_period_end?: boolean };
      await db.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: sub.status, cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end) },
      });
      break;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      const inv = event.data.object as { id: string; amount_paid?: number; currency?: string; status?: string };
      // Best-effort record; workspace resolved via subscription mapping is left to a fuller impl.
      void inv;
      break;
    }
  }

  return NextResponse.json({ received: true });
}
