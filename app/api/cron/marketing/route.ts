import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/cron";
import { marketingTick } from "@/lib/server/marketing-runtime";
import { runWorkflowExecution } from "@/lib/workflow-engine";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Marketing Automation tick (run every minute): scheduled email sends, the
 * send queue, due workflow runs and scheduled page publishes. The BullMQ worker
 * also calls this with `?execution=<id>` to run a single queued workflow run.
 */
export async function POST(req: Request) {
  if (!isCronAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const execution = new URL(req.url).searchParams.get("execution");
  if (execution) {
    await runWorkflowExecution(execution);
    return NextResponse.json({ ran: execution });
  }
  return NextResponse.json(await marketingTick());
}
