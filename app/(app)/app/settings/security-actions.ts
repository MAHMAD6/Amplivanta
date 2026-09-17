"use server";

import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { generateRecoveryCodes, generateTotpSecret, otpauthUri, verifyTotp } from "@/lib/totp";
import { getSessionContext } from "@/lib/tenant";

/**
 * Two-factor enrolment for the signed-in account. The TOTP secret is stored
 * encrypted, recovery codes only as hashes, and every change is audited.
 */

type Result = { ok: true; message: string; secret?: string; uri?: string; codes?: string[] } | { ok: false; error: string };

const hash = (code: string) => createHash("sha256").update(code.toLowerCase().replace(/\s+/g, "")).digest("hex");

async function me() {
  const session = await auth();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (id) return db.user.findUnique({ where: { id }, select: { id: true, email: true, password: true, twoFactorSecret: true, twoFactorEnabledAt: true } });
  if (process.env.NODE_ENV === "development") {
    try {
      const ctx = await getSessionContext();
      return db.user.findUnique({ where: { id: ctx.userId }, select: { id: true, email: true, password: true, twoFactorSecret: true, twoFactorEnabledAt: true } });
    } catch {
      return null;
    }
  }
  return null;
}

async function audit(userId: string, action: string) {
  await db.platformAuditLog.create({ data: { actorUserId: userId, action, resourceType: "User", resourceId: userId } }).catch(() => null);
}

const refresh = () => revalidatePath("/app/settings/security");

/** Step 1: creates a pending secret and returns it with its otpauth URI. */
export async function startTwoFactor(): Promise<Result> {
  const user = await me();
  if (!user) return { ok: false, error: "Sign in to change two-factor settings." };
  if (user.twoFactorEnabledAt) return { ok: false, error: "Two-factor is already on. Turn it off first to re-enrol." };
  const secret = generateTotpSecret();
  await db.user.update({ where: { id: user.id }, data: { twoFactorSecret: encryptSecret(secret), twoFactorEnabledAt: null } });
  return { ok: true, message: "Scan the key in your authenticator app", secret, uri: otpauthUri(secret, user.email) };
}

/** Step 2: confirms a code, switches two-factor on and returns the recovery codes once. */
export async function confirmTwoFactor(fd: FormData): Promise<Result> {
  const user = await me();
  if (!user) return { ok: false, error: "Sign in to change two-factor settings." };
  if (!user.twoFactorSecret) return { ok: false, error: "Start the setup again." };
  if (user.twoFactorEnabledAt) return { ok: false, error: "Two-factor is already on." };
  const code = String(fd.get("code") ?? "").trim();
  let secret: string;
  try {
    secret = decryptSecret(user.twoFactorSecret);
  } catch {
    return { ok: false, error: "Start the setup again." };
  }
  if (!verifyTotp(secret, code)) return { ok: false, error: "That code did not match. Check the app's current code and try again." };
  const codes = generateRecoveryCodes();
  await db.user.update({ where: { id: user.id }, data: { twoFactorEnabledAt: new Date(), twoFactorRecoveryCodes: codes.map(hash) } });
  await audit(user.id, "security.two_factor.enabled");
  refresh();
  return { ok: true, message: "Two-factor authentication is on", codes };
}

/** Turns two-factor off; the account password is required. */
export async function disableTwoFactor(fd: FormData): Promise<Result> {
  const user = await me();
  if (!user) return { ok: false, error: "Sign in to change two-factor settings." };
  if (!user.twoFactorEnabledAt) return { ok: false, error: "Two-factor is not on." };
  const password = String(fd.get("password") ?? "");
  if (!password || !(await bcrypt.compare(password, user.password))) return { ok: false, error: "That password is not correct." };
  await db.user.update({ where: { id: user.id }, data: { twoFactorSecret: null, twoFactorEnabledAt: null, twoFactorRecoveryCodes: [] } });
  await audit(user.id, "security.two_factor.disabled");
  refresh();
  return { ok: true, message: "Two-factor authentication is off" };
}

/** Replaces the recovery codes; the account password is required. */
export async function regenerateRecoveryCodes(fd: FormData): Promise<Result> {
  const user = await me();
  if (!user) return { ok: false, error: "Sign in to change two-factor settings." };
  if (!user.twoFactorEnabledAt) return { ok: false, error: "Turn on two-factor first." };
  const password = String(fd.get("password") ?? "");
  if (!password || !(await bcrypt.compare(password, user.password))) return { ok: false, error: "That password is not correct." };
  const codes = generateRecoveryCodes();
  await db.user.update({ where: { id: user.id }, data: { twoFactorRecoveryCodes: codes.map(hash) } });
  await audit(user.id, "security.recovery_codes.regenerated");
  refresh();
  return { ok: true, message: "New recovery codes generated", codes };
}

/** Ends one recorded session for a member of this workspace (admins only). */
export async function revokeSession(sessionId: string): Promise<Result> {
  let ctx;
  try {
    ctx = await getSessionContext();
  } catch {
    return { ok: false, error: "Sign in to manage sessions." };
  }
  if (!["ADMIN", "OWNER", "SUPER_ADMIN"].includes(ctx.workspaceRole)) return { ok: false, error: "Only workspace admins can end sessions." };
  const members = await db.membership.findMany({ where: { workspaceId: ctx.workspaceId }, select: { userId: true } });
  const row = await db.userSession.findFirst({ where: { id: sessionId, userId: { in: members.map((m) => m.userId) }, revokedAt: null }, select: { id: true, userId: true } });
  if (!row) return { ok: false, error: "That session is no longer active." };
  await db.userSession.update({ where: { id: row.id }, data: { revokedAt: new Date() } });
  await db.auditLog.create({ data: { workspaceId: ctx.workspaceId, actorUserId: ctx.userId, action: "security.session.revoked", resourceType: "UserSession", resourceId: row.id } }).catch(() => null);
  refresh();
  return { ok: true, message: "Session ended" };
}
