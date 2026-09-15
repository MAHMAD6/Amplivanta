import { createHmac } from "crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { db } from "@/lib/db";

/** Events Amplivanta currently emits. Subscriptions are limited to these. */
export const WEBHOOK_EVENTS = ["contact.created", "contact.updated", "deal.created", "deal.won", "deal.lost", "webhook.test"] as const;

/** True for loopback, private, link-local, CGNAT and unique-local addresses. */
export function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v = ip.toLowerCase();
  if (v.startsWith("::ffff:")) return isPrivateAddress(v.slice(7));
  return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80");
}

/** Rejects non-https endpoints and hosts that resolve to internal addresses (SSRF guard). */
export async function assertPublicEndpoint(url: string): Promise<void> {
  const u = new URL(url);
  if (u.protocol !== "https:") throw new Error("Webhook endpoints must use https.");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (addrs.length === 0 || addrs.some((a) => isPrivateAddress(a.address))) throw new Error("Webhook endpoints must be publicly reachable.");
}

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

  try {
    await assertPublicEndpoint(webhook.url);
  } catch {
    await db.webhookDelivery.create({ data: { webhookId: webhook.id, event, responseCode: 0, latencyMs: 0, attempts: 0 } }).catch(() => null);
    return;
  }

  while (attempts < maxAttempts) {
    attempts += 1;
    try {
      const res = await fetch(webhook.url, {
        redirect: "manual",
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

/** Dispatch an event to all matching webhooks in a workspace. Call with `void` to avoid blocking a request. */
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

/** Sends a signed test event to one endpoint and returns the recorded result. */
export async function sendTestDelivery(webhook: { id: string; url: string; signingSecret: string; workspaceId: string }) {
  const body = JSON.stringify({ event: "webhook.test", workspaceId: webhook.workspaceId, data: { message: "Test delivery from Amplivanta" }, at: new Date().toISOString() });
  await deliverOne(webhook, "webhook.test", body);
  return db.webhookDelivery.findFirst({ where: { webhookId: webhook.id }, orderBy: { createdAt: "desc" } });
}

/** Fire-and-forget wrapper that never throws into the caller. */
export function emitWebhookEvent(workspaceId: string, event: (typeof WEBHOOK_EVENTS)[number], payload: Record<string, unknown>) {
  void dispatchWebhooks(workspaceId, event, payload).catch(() => null);
}
