import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verify } from "@/lib/marketing/tokens";

export const dynamic = "force-dynamic";

async function unsubscribe(req: Request) {
  const u = new URL(req.url);
  const email = (u.searchParams.get("e") ?? "").toLowerCase();
  if (!email || !verify(`unsub:${email}`, u.searchParams.get("t"))) return null;
  await db.suppressionEntry.upsert({ where: { email_reason: { email, reason: "unsubscribe" } }, create: { email, reason: "unsubscribe", source: "email_link" }, update: {} });
  return email;
}

const page = (title: string, body: string, status = 200) =>
  new NextResponse(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><body style="font-family:system-ui,sans-serif;max-width:480px;margin:80px auto;padding:0 16px;color:#0B1B3F"><h1 style="font-size:22px">${title}</h1><p style="color:#44516C">${body}</p></body>`, { status, headers: { "content-type": "text/html; charset=utf-8" } });

/** Signed one-click unsubscribe from marketing email. Transactional mail is unaffected. */
export async function GET(req: Request) {
  return (await unsubscribe(req)) ? page("You're unsubscribed", "You will no longer receive marketing emails at this address.") : page("Link not valid", "This unsubscribe link is invalid or incomplete.", 400);
}

/** RFC 8058 List-Unsubscribe-Post support. */
export async function POST(req: Request) {
  return (await unsubscribe(req)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Invalid link." }, { status: 400 });
}
