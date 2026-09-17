import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emailProvider } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { requestIp } from "@/lib/turnstile";
import { sendPasswordResetEmail } from "@/lib/server/auth-tokens";

const schema = z.object({ email: z.string().email() });

/**
 * POST /api/auth/password/forgot — sends a reset link. The response never says
 * whether the address exists, so the endpoint cannot be used to enumerate
 * accounts. `delivered` only reports whether an email provider is configured.
 */
export async function POST(req: Request) {
  let email: string;
  try {
    email = schema.parse(await req.json()).email.toLowerCase();
  } catch {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const rl = await rateLimit(`pwreset:${requestIp(req) ?? email}`, 5, 900);
  if (!rl.ok) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });

  try {
    const user = await db.user.findUnique({ where: { email }, select: { id: true, email: true, name: true } });
    if (user) await sendPasswordResetEmail(user);
  } catch {
    /* fall through to the same neutral answer */
  }
  return NextResponse.json({ ok: true, delivered: Boolean(emailProvider()) });
}
