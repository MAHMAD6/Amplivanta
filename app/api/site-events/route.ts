import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";
import { cleanPath, isSiteEvent } from "@/lib/site-events";

/**
 * POST /api/site-events — anonymous public-site event counter.
 * Accepts only known event names, stores a daily count per name and path, and
 * nothing that identifies the visitor. Rate-limited per IP.
 */
export async function POST(req: Request) {
  const limited = await rateLimit(`site-events:${clientIp(req)}`, 120, 60);
  if (!limited.ok) return tooMany(limited);

  let body: { name?: unknown; path?: unknown };
  try {
    body = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ error: "Malformed body" }, { status: 400 });
  }
  if (!isSiteEvent(body.name)) return NextResponse.json({ error: "Unknown event" }, { status: 400 });

  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  try {
    await db.siteEventAggregate.upsert({
      where: { name_path_date: { name: body.name, path: cleanPath(body.path), date: day } },
      update: { count: { increment: 1 } },
      create: { name: body.name, path: cleanPath(body.path), date: day, count: 1 },
    });
  } catch {
    // Analytics must never surface an error to a visitor.
  }
  return new NextResponse(null, { status: 204 });
}
