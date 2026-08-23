import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, requireRole } from "@/lib/tenant";

// GET /api/subscriptions — the workspace's active subscription + available plans.
export const GET = route(async (ctx) => {
  const [subscription, plans] = await Promise.all([
    db.subscription.findFirst({
      where: { workspaceId: ctx.workspaceId },
      include: { plan: true, items: true, invoices: { orderBy: { createdAt: "desc" }, take: 12 } },
      orderBy: { createdAt: "desc" },
    }),
    db.plan.findMany({ include: { priceTiers: true }, orderBy: { price: "asc" } }),
  ]);
  return NextResponse.json({ subscription, plans });
});

const createSchema = z.object({ planId: z.string() });

// POST /api/subscriptions — subscribe/switch the workspace to a plan.
export const POST = route(async (ctx, req) => {
  requireRole(ctx, "OWNER");
  const { planId } = await parseBody(req, createSchema);
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const existing = await db.subscription.findFirst({ where: { workspaceId: ctx.workspaceId } });
  const sub = existing
    ? await db.subscription.update({
        where: { id: existing.id },
        data: { planId, status: "active", currentPeriodStart: now, currentPeriodEnd: periodEnd, cancelAtPeriodEnd: false },
      })
    : await db.subscription.create({
        data: { workspaceId: ctx.workspaceId, planId, status: "active", currentPeriodStart: now, currentPeriodEnd: periodEnd },
      });
  return NextResponse.json(sub, { status: existing ? 200 : 201 });
});
