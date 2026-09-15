import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/cron";
import { settleStaleMediaJobs } from "@/lib/server/media-jobs";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Settles generation jobs whose webhook never arrived (run every few minutes). */
export async function POST(req: Request) {
  if (!isCronAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await settleStaleMediaJobs());
}
