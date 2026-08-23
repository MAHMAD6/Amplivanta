import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, requireRole, ApiError } from "@/lib/tenant";
import { isStripeConfigured, getStripe } from "@/lib/stripe";

const schema = z.object({ planId: z.string() });

const APP_URL = () => process.env.NEXTAUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";

// POST /api/billing/checkout — starts a Stripe Checkout session, or activates the
// plan locally when Stripe isn't configured (dev). Returns { url } or { activated }.
export const POST = route(async (ctx, req) => {
  requireRole(ctx, "OWNER");
  const { planId } = await parseBody(req, schema);
  const plan = await db.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new ApiError(404, "Plan not found");

  if (!isStripeConfigured() || !plan.stripePriceId) {
    // Local fallback: activate the subscription immediately.
    const now = new Date();
    const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const existing = await db.subscription.findFirst({ where: { workspaceId: ctx.workspaceId } });
    const sub = existing
      ? await db.subscription.update({ where: { id: existing.id }, data: { planId, status: "active", currentPeriodStart: now, currentPeriodEnd: end } })
      : await db.subscription.create({ data: { workspaceId: ctx.workspaceId, planId, status: "active", currentPeriodStart: now, currentPeriodEnd: end } });
    return NextResponse.json({ activated: true, subscription: sub, live: false });
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${APP_URL()}/app/settings/billing?checkout=success`,
    cancel_url: `${APP_URL()}/app/settings/billing?checkout=cancel`,
    client_reference_id: ctx.workspaceId,
    metadata: { workspaceId: ctx.workspaceId, planId },
  });
  return NextResponse.json({ url: session.url, live: true });
});
