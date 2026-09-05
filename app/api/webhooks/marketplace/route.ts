import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/marketplace/providers";
import { failOrder, fulfilOrder, openDispute } from "@/lib/server/marketplace-fulfilment";

/**
 * Marketplace payment webhook.
 *
 * This is the ONLY path that can turn a paid order into ACCESS_READY. It is
 * provider-agnostic: the provider id and signing secret come from the
 * `payment.provider` MarketplaceSetting, so no specific processor is assumed.
 *
 * Expected body:
 *   { "type": "payment.succeeded" | "payment.failed" | "chargeback.opened",
 *     "orderId": "...", "reference": "...", "amountCents": 1234 }
 *
 * Requests must carry an HMAC-SHA256 signature of the raw body in
 * `x-marketplace-signature`, keyed with the configured `webhookSecret`.
 */

export async function POST(req: NextRequest) {
  const provider = await getPaymentProvider();
  if (!provider) {
    // Nothing is configured, so nothing may be confirmed.
    return NextResponse.json({ error: "No payment provider configured" }, { status: 503 });
  }

  const secret = String(provider.config.webhookSecret ?? "");
  if (!secret) {
    return NextResponse.json({ error: "Payment provider has no webhook secret configured" }, { status: 503 });
  }

  const raw = await req.text();
  const sent = req.headers.get("x-marketplace-signature") ?? "";
  const expected = createHmac("sha256", secret).update(raw).digest("hex");

  const a = Buffer.from(sent, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { type?: string; orderId?: string; reference?: string; amountCents?: number };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Malformed body" }, { status: 400 });
  }

  const { type, orderId, reference, amountCents } = event;
  if (!type || !orderId) return NextResponse.json({ error: "Missing type or orderId" }, { status: 400 });

  // Replay guard: a reference is processed at most once.
  if (reference) {
    const seen = await prisma.platformAuditLog.findFirst({
      where: { action: "marketplace.webhook.received", resourceId: orderId, reason: reference },
      select: { id: true },
    });
    if (seen) return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    await prisma.platformAuditLog.create({
      data: {
        action: "marketplace.webhook.received",
        resourceType: "MarketplaceOrder",
        resourceId: orderId,
        reason: reference ?? null,
        metadata: { type, provider: provider.id, amountCents: amountCents ?? null },
      },
    });
  } catch {
    return NextResponse.json({ error: "Database unreachable" }, { status: 503 });
  }

  switch (type) {
    case "payment.succeeded": {
      // Amount is verified against the order before access is granted.
      const order = await prisma.marketplaceOrder.findUnique({
        where: { id: orderId },
        select: { totalCents: true },
      });
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      if (typeof amountCents === "number" && amountCents < order.totalCents) {
        return NextResponse.json({ error: "Amount is less than the order total" }, { status: 409 });
      }
      const res = await fulfilOrder(orderId, "provider_confirmed", reference);
      if (!res.ok) return NextResponse.json({ error: res.error }, { status: 409 });
      return NextResponse.json({ ok: true, alreadyFulfilled: res.alreadyFulfilled });
    }
    case "payment.failed": {
      const res = await failOrder(orderId, reference);
      return res.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: res.error }, { status: 409 });
    }
    case "chargeback.opened": {
      const res = await openDispute(orderId, reference ?? "unknown", amountCents);
      return res.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: res.error }, { status: 409 });
    }
    default:
      return NextResponse.json({ ok: true, ignored: type });
  }
}
