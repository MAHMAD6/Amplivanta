import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/cron";
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
  if (!isCronAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDataForSeoConfigured()) return NextResponse.json({ skipped: "dataforseo not configured" });
  return NextResponse.json(await refreshStaleCompetitors());
}
