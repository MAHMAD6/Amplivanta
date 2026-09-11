/**
 * Cloudflare Turnstile server-side verification (External API Master
 * Revision: abuse protection for signup and public forms).
 *
 * Off until TURNSTILE_SECRET_KEY is set; then every protected request must
 * carry a token that Cloudflare's Siteverify accepts. Turnstile supplements
 * backend validation and rate limits — it never replaces them.
 */

export const TURNSTILE_FIELD = "cf-turnstile-response";

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export type TurnstileResult = { ok: true; skipped?: boolean } | { ok: false; error: string };

export async function verifyTurnstile(token: unknown, ip?: string | null): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, skipped: true };
  if (typeof token !== "string" || !token || token.length > 2048) {
    return { ok: false, error: "Please complete the verification check." };
  }
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success ? { ok: true } : { ok: false, error: "Verification failed. Please try again." };
  } catch {
    // Fail closed: when protection is on and Cloudflare is unreachable, refuse.
    return { ok: false, error: "Verification is temporarily unavailable. Please try again." };
  }
}

/** Client IP as forwarded by Cloudflare or the reverse proxy. */
export function requestIp(req: Request): string | null {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  );
}
