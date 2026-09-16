import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verify } from "@/lib/marketing/tokens";

export const dynamic = "force-dynamic";

/** Signed click redirect: only URLs signed at send time are followed, so this is not an open redirect. */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const s = u.searchParams.get("s") ?? "";
  const target = u.searchParams.get("u") ?? "";
  if (!s || !/^https?:\/\//i.test(target) || !verify(`click:${s}:${target}`, u.searchParams.get("t"))) {
    return NextResponse.json({ error: "Invalid link." }, { status: 400 });
  }
  const now = new Date();
  await db.emailSend.updateMany({ where: { id: s, clickedAt: null }, data: { clickedAt: now } }).catch(() => null);
  await db.emailSend.updateMany({ where: { id: s, openedAt: null }, data: { openedAt: now } }).catch(() => null);
  return NextResponse.redirect(target, 302);
}
