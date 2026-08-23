import IORedis from "ioredis";

/**
 * Fixed-window rate limiter. Uses Redis when REDIS_URL is set (works across
 * multiple app instances); otherwise falls back to an in-memory map (fine for a
 * single instance / local dev). Fail-open on Redis errors so a Redis outage
 * never takes the app down.
 */

const REDIS_URL = process.env.REDIS_URL || "";
let redis: IORedis | null = null;
function conn(): IORedis | null {
  if (!REDIS_URL) return null;
  if (!redis) {
    // enableOfflineQueue:false + short timeouts => commands reject immediately
    // when Redis is unreachable, so the limiter fails OPEN fast instead of
    // hanging the request. maxRetriesPerRequest:1 avoids indefinite retries.
    redis = new IORedis(REDIS_URL, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 500,
      commandTimeout: 500,
    });
    redis.on("error", () => { /* swallow — limiter fails open */ });
  }
  return redis;
}

/** Reject a promise after `ms` so a stalled Redis call can't hang the request. */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
}

// In-memory fallback: key -> { count, resetAt (ms) }
const mem = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
}

/**
 * @param key       unique bucket (e.g. `contact:1.2.3.4` or `api:user:<id>`)
 * @param limit     max requests per window
 * @param windowSec window length in seconds
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
  const bucket = `rl:${key}`;
  const c = conn();
  if (c) {
    try {
      const count = await withTimeout(c.incr(bucket), 600);
      if (count === 1) await withTimeout(c.expire(bucket, windowSec), 600).catch(() => {});
      const ttl = await withTimeout(c.ttl(bucket), 600).catch(() => windowSec);
      const retryAfter = ttl > 0 ? ttl : windowSec;
      return { ok: count <= limit, limit, remaining: Math.max(0, limit - count), retryAfter };
    } catch {
      // fall through to in-memory on any Redis error/timeout (fail open)
    }
  }

  const now = Date.now();
  const entry = mem.get(bucket);
  if (!entry || entry.resetAt <= now) {
    mem.set(bucket, { count: 1, resetAt: now + windowSec * 1000 });
    return { ok: true, limit, remaining: limit - 1, retryAfter: windowSec };
  }
  entry.count += 1;
  const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
  return { ok: entry.count <= limit, limit, remaining: Math.max(0, limit - entry.count), retryAfter };
}

/** Best-effort client IP from proxy headers. */
export function clientIp(req: Request): string {
  const h = req.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") || h.get("cf-connecting-ip") || "unknown";
}

/** 429 JSON response with a Retry-After header. */
export function tooMany(result: RateLimitResult) {
  return Response.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    { status: 429, headers: { "Retry-After": String(result.retryAfter), "X-RateLimit-Limit": String(result.limit), "X-RateLimit-Remaining": String(result.remaining) } },
  );
}
