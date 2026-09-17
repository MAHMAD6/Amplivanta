import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { emailProvider } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { requestIp } from "@/lib/turnstile";
import { consumeAuthToken, sendVerificationEmail } from "@/lib/server/auth-tokens";

const schema = z.object({ token: z.string().min(10).max(200) });

/** POST /api/auth/verify-email — confirms an address from its emailed token. */
export async function POST(req: Request) {
  const rl = await rateLimit(`verify:${requestIp(req) ?? "anon"}`, 20, 900);
  if (!rl.ok) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  let token: string;
  try {
    token = schema.parse(await req.json()).token;
  } catch {
    return NextResponse.json({ error: "That link is not valid." }, { status: 400 });
  }
  const userId = await consumeAuthToken(token, "email_verify");
  if (!userId) return NextResponse.json({ error: "That confirmation link has expired or was already used." }, { status: 400 });
  const user = await db.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() }, select: { email: true } });
  return NextResponse.json({ ok: true, email: user.email });
}

/** PUT /api/auth/verify-email — resends the link to the signed-in user. */
export async function PUT(req: Request) {
  const session = await auth();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const rl = await rateLimit(`verify-send:${id}`, 3, 900);
  if (!rl.ok) return NextResponse.json({ error: "A link was just sent. Check your inbox, then try again later." }, { status: 429 });
  const user = await db.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, emailVerifiedAt: true } });
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (user.emailVerifiedAt) return NextResponse.json({ ok: true, alreadyVerified: true });
  await sendVerificationEmail(user);
  return NextResponse.json({ ok: true, delivered: Boolean(emailProvider()) });
}
