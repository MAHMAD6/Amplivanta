import "server-only";
import { createHash, createPublicKey, verify as verifySignature } from "node:crypto";
import { resolveTask, type FalTaskCode } from "@/lib/media/fal-tasks";

/**
 * fal.ai media-generation provider (fal.ai Integration Guidelines).
 *
 * FAL_KEY stays on the server. Callers pass an Amplivanta task; the model is
 * resolved from server configuration. Jobs go through the fal queue with a
 * webhook, and results are always re-read from fal by request id rather than
 * trusted from a webhook body.
 */

const QUEUE = "https://queue.fal.run";
const JWKS_URL = "https://rest.alpha.fal.ai/.well-known/jwks.json";

export const isFalKeySet = () => Boolean(process.env.FAL_KEY);

/** The task's approved model and price, or null when the task is not enabled. */
export function falTask(code: FalTaskCode) {
  if (!isFalKeySet()) return null;
  return resolveTask(code, process.env);
}

const headers = () => ({ authorization: `Key ${process.env.FAL_KEY}`, "content-type": "application/json" });

export type FalSubmit = { ok: true; requestId: string; statusUrl: string; responseUrl: string } | { ok: false; error: string };

export async function submitFalJob(model: string, body: Record<string, unknown>, webhookUrl: string | null): Promise<FalSubmit> {
  if (!isFalKeySet()) return { ok: false, error: "Media generation is not configured." };
  const qs = webhookUrl ? `?fal_webhook=${encodeURIComponent(webhookUrl)}` : "";
  try {
    const res = await fetch(`${QUEUE}/${model}${qs}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(Number(process.env.FAL_TIMEOUT_MS ?? 20000)),
    });
    if (!res.ok) return { ok: false, error: `The media provider refused the job (${res.status}).` };
    const data = (await res.json()) as { request_id?: string; status_url?: string; response_url?: string };
    if (!data.request_id) return { ok: false, error: "The media provider did not return a job id." };
    return {
      ok: true,
      requestId: data.request_id,
      statusUrl: data.status_url ?? `${QUEUE}/${model}/requests/${data.request_id}/status`,
      responseUrl: data.response_url ?? `${QUEUE}/${model}/requests/${data.request_id}`,
    };
  } catch {
    return { ok: false, error: "The media provider did not respond. Please try again." };
  }
}

const QUEUE_URL = /^https:\/\/queue\.fal\.run\//;

export type FalPoll =
  | { ok: true; state: "IN_QUEUE" | "IN_PROGRESS" }
  | { ok: true; state: "COMPLETED"; payload: unknown }
  | { ok: true; state: "FAILED"; error: string }
  | { ok: false; error: string };

/** Reads job status and, when complete, the result — only from fal's own queue URLs. */
export async function pollFalJob(statusUrl: string, responseUrl: string): Promise<FalPoll> {
  if (!isFalKeySet()) return { ok: false, error: "Media generation is not configured." };
  if (!QUEUE_URL.test(statusUrl) || !QUEUE_URL.test(responseUrl)) return { ok: false, error: "Invalid job reference." };
  try {
    const s = await fetch(statusUrl, { headers: headers(), signal: AbortSignal.timeout(15000) });
    if (!s.ok) return { ok: false, error: `Could not read job status (${s.status}).` };
    const status = ((await s.json()) as { status?: string }).status;
    if (status === "IN_QUEUE" || status === "IN_PROGRESS") return { ok: true, state: status };
    if (status !== "COMPLETED") return { ok: false, error: `Unknown job status ${status ?? ""}`.trim() };
    const r = await fetch(responseUrl, { headers: headers(), signal: AbortSignal.timeout(20000) });
    if (!r.ok) {
      // fal returns 4xx/5xx with a detail body for failed generations.
      const detail = await r.text().catch(() => "");
      return { ok: true, state: "FAILED", error: detail.slice(0, 300) || `Generation failed (${r.status}).` };
    }
    return { ok: true, state: "COMPLETED", payload: await r.json() };
  } catch {
    return { ok: false, error: "The media provider did not respond." };
  }
}

/* ---------------------------------------------------------- webhooks */

let jwksCache: { keys: { x: string }[]; at: number } | null = null;

async function falPublicKeys(): Promise<{ x: string }[]> {
  if (jwksCache && Date.now() - jwksCache.at < 24 * 60 * 60 * 1000) return jwksCache.keys;
  const res = await fetch(JWKS_URL, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`JWKS fetch failed (${res.status})`);
  const keys = (((await res.json()) as { keys?: { x?: string }[] }).keys ?? []).filter((k): k is { x: string } => typeof k.x === "string");
  jwksCache = { keys, at: Date.now() };
  return keys;
}

/**
 * Verifies fal's ED25519 webhook signature over
 * request-id, user-id, timestamp and the SHA-256 of the raw body.
 */
export async function verifyFalWebhook(h: Headers, rawBody: string): Promise<boolean> {
  const requestId = h.get("x-fal-webhook-request-id");
  const userId = h.get("x-fal-webhook-user-id");
  const timestamp = h.get("x-fal-webhook-timestamp");
  const signature = h.get("x-fal-webhook-signature");
  if (!requestId || !userId || !timestamp || !signature || !/^[0-9a-f]+$/i.test(signature)) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const message = Buffer.from([requestId, userId, timestamp, createHash("sha256").update(rawBody).digest("hex")].join("\n"), "utf8");
  const sig = Buffer.from(signature, "hex");
  try {
    for (const k of await falPublicKeys()) {
      const key = createPublicKey({ key: { kty: "OKP", crv: "Ed25519", x: k.x }, format: "jwk" });
      if (verifySignature(null, message, key, sig)) return true;
    }
  } catch {
    return false;
  }
  return false;
}
