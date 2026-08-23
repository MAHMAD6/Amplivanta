import { createHmac } from "crypto";
import { db } from "@/lib/db";

/**
 * Outbound webhook delivery: finds workspace endpoints subscribed to an event,
 * signs the payload (HMAC-SHA256, `x-amplivanta-signature`), POSTs it, and records
 * each attempt. Delivery runs in the background so callers never block on it.
 */
export function signPayload(secret: string, body: string): string {
  return "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
}

async function deliverOne(webhook: { id: string; url: string; signingSecret: string }, event: string, body: string) {
  const started = Date.now();
  let responseCode: number | null = null;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts += 1;
    try {
      const res = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-amplivanta-event": event,
          "x-amplivanta-signature": signPayload(webhook.signingSecret, body),
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      responseCode = res.status;
      if (res.ok) break;
    } catch {
      responseCode = 0;
    }
    if (attempts < maxAttempts) await new Promise((r) => setTimeout(r, 500 * attempts));
  }

  await db.webhookDelivery.create({
    data: {
      webhookId: webhook.id,
      event,
      responseCode,
      latencyMs: Date.now() - started,
      attempts,
    },
  });
}

/** Dispatch an event to all matching webhooks in a workspace (fire-and-forget). */
export async function dispatchWebhooks(
  workspaceId: string,
  event: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const webhooks = await db.webhook.findMany({
    where: { workspaceId, status: "active", events: { has: event } },
  });
  if (webhooks.length === 0) return;
  const body = JSON.stringify({ event, workspaceId, data: payload, at: new Date().toISOString() });
  await Promise.allSettled(webhooks.map((w) => deliverOne(w, event, body)));
}
