import { createHmac, timingSafeEqual } from "node:crypto";

/** HMAC tokens for public marketing links (unsubscribe, click tracking). Keyed from AUTH_SECRET. */
function secret() {
  return createHmac("sha256", process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-insecure-secret").update("marketing-links").digest();
}

export const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url").slice(0, 32);

export function verify(value: string, token: string | null | undefined) {
  if (!token) return false;
  const a = Buffer.from(sign(value));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const appUrl = () => (process.env.NEXTAUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/$/, "");

export function unsubscribeUrl(email: string) {
  const e = email.toLowerCase();
  return `${appUrl()}/api/public/unsubscribe?e=${encodeURIComponent(e)}&t=${sign(`unsub:${e}`)}`;
}

/** Rewrites absolute links through the click tracker and appends the open pixel. */
export function trackEmailHtml(html: string, sendId: string) {
  const base = appUrl();
  const linked = html.replace(/href="(https?:\/\/[^"]+)"/g, (_, url: string) => {
    const u = url.replace(/&amp;/g, "&");
    if (u.startsWith(`${base}/api/public/unsubscribe`)) return `href="${url}"`;
    return `href="${base}/api/public/email/click?s=${sendId}&u=${encodeURIComponent(u)}&t=${sign(`click:${sendId}:${u}`)}"`;
  });
  return linked.replace("</body>", `<img src="${base}/api/public/email/open?s=${sendId}&t=${sign(`open:${sendId}`)}" width="1" height="1" alt="" style="display:none"></body>`);
}
