import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { requestIp } from "@/lib/turnstile";
import { consumeAuthToken } from "@/lib/server/auth-tokens";

const schema = z.object({ token: z.string().min(10).max(200), password: z.string().min(8).max(100) });

/** POST /api/auth/password/reset — sets a new password from a single-use token. */
export async function POST(req: Request) {
  const rl = await rateLimit(`pwreset-consume:${requestIp(req) ?? "anon"}`, 10, 900);
  if (!rl.ok) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Use at least 8 characters for the new password." }, { status: 400 });
  }

  const userId = await consumeAuthToken(body.token, "password_reset");
  if (!userId) return NextResponse.json({ error: "That reset link has expired or was already used. Request a new one." }, { status: 400 });

  const password = await bcrypt.hash(body.password, 12);
  const user = await db.user.update({ where: { id: userId }, data: { password }, select: { email: true } });
  // A password reset proves control of the mailbox, so the address counts as verified.
  await db.user.updateMany({ where: { id: userId, emailVerifiedAt: null }, data: { emailVerifiedAt: new Date() } });
  // Existing sessions recorded for this user are ended.
  await db.userSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }).catch(() => null);
  return NextResponse.json({ ok: true, email: user.email });
}
