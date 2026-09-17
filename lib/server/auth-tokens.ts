import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

/**
 * Email verification and password reset tokens. Only the SHA-256 hash is
 * stored, tokens are single use, and every check is constant time.
 */

export type TokenKind = "email_verify" | "password_reset";

const TTL_MS: Record<TokenKind, number> = { email_verify: 24 * 60 * 60 * 1000, password_reset: 60 * 60 * 1000 };

export const hashToken = (raw: string) => createHash("sha256").update(raw).digest("hex");

export function appUrl(): string {
  return (process.env.NEXTAUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** Issues a token, replacing any unused token of the same kind. */
export async function issueAuthToken(userId: string, kind: TokenKind): Promise<string> {
  const raw = randomBytes(32).toString("base64url");
  await db.authToken.deleteMany({ where: { userId, kind, usedAt: null } });
  await db.authToken.create({ data: { userId, kind, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + TTL_MS[kind]) } });
  return raw;
}

/** Consumes a token and returns its user id, or null when it is invalid, expired or already used. */
export async function consumeAuthToken(raw: string, kind: TokenKind): Promise<string | null> {
  if (!raw || raw.length > 200) return null;
  const row = await db.authToken.findUnique({ where: { tokenHash: hashToken(raw) }, select: { id: true, userId: true, kind: true, expiresAt: true, usedAt: true } });
  if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) return null;
  const a = Buffer.from(row.kind);
  const b = Buffer.from(kind);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const claimed = await db.authToken.updateMany({ where: { id: row.id, usedAt: null }, data: { usedAt: new Date() } });
  return claimed.count === 1 ? row.userId : null;
}

const shell = (title: string, body: string, action?: { label: string; url: string }) => `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0B2350">
  <h1 style="font-size:20px;margin:0 0 12px">${title}</h1>
  <p style="font-size:14px;line-height:1.6;margin:0 0 20px">${body}</p>
  ${action ? `<p style="margin:0 0 20px"><a href="${action.url}" style="background:#0B5CFF;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:bold">${action.label}</a></p><p style="font-size:12px;color:#6b7280;word-break:break-all">${action.url}</p>` : ""}
  <p style="font-size:12px;color:#6b7280;margin-top:24px">Amplivanta Inc.</p>
</div>`;

/** Sends the verification link. Returns whether the provider accepted it. */
export async function sendVerificationEmail(user: { id: string; email: string; name: string | null }) {
  const token = await issueAuthToken(user.id, "email_verify");
  const url = `${appUrl()}/verify-email?token=${token}`;
  const r = await sendEmail({
    to: user.email,
    subject: "Confirm your Amplivanta email address",
    category: "transactional",
    html: shell("Confirm your email address", `Hi ${user.name || "there"}, confirm this address to finish setting up your Amplivanta account. The link expires in 24 hours.`, { label: "Confirm email", url }),
    text: `Confirm your Amplivanta email address: ${url}`,
  });
  return r.sent;
}

export async function sendPasswordResetEmail(user: { id: string; email: string; name: string | null }) {
  const token = await issueAuthToken(user.id, "password_reset");
  const url = `${appUrl()}/reset-password?token=${token}`;
  const r = await sendEmail({
    to: user.email,
    subject: "Reset your Amplivanta password",
    category: "transactional",
    html: shell("Reset your password", `Hi ${user.name || "there"}, use the button below to choose a new password. The link expires in one hour and can be used once. If you did not ask for this, you can ignore this email.`, { label: "Choose a new password", url }),
    text: `Reset your Amplivanta password: ${url}`,
  });
  return r.sent;
}
