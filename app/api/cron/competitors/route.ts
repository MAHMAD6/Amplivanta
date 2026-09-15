import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { refreshStaleCompetitors } from "@/lib/server/competitor-intel";
import { isDataForSeoConfigured } from "@/lib/providers/dataforseo";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Weekly Competitor Watch refresh. Call from the server crontab with
 * `Authorization: Bearer $CRON_SECRET`. Refreshes tracked competitors whose
 * data is older than seven days, bounded per run.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const ok = Boolean(secret) && given.length === secret!.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret!));
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDataForSeoConfigured()) return NextResponse.json({ skipped: "dataforseo not configured" });
  const result = await refreshStaleCompetitors();
  return NextResponse.json(result);
}
