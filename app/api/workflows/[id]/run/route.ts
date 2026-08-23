import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { route, requireRole, ApiError } from "@/lib/tenant";
import { enqueueWorkflowRun } from "@/lib/queue";

type Params = { id: string };

// POST /api/workflows/:id/run — create an execution and enqueue it (or run inline).
export const POST = route<Params>(async (ctx, _req, { id }) => {
  requireRole(ctx, "EDITOR");
  const workflow = await db.workflow.findFirst({ where: { id, workspaceId: ctx.workspaceId } });
  if (!workflow) throw new ApiError(404, "Workflow not found");

  const execution = await db.workflowExecution.create({
    data: { workflowId: id, status: "running", startedAt: new Date() },
  });
  const mode = await enqueueWorkflowRun(execution.id);

  const fresh = await db.workflowExecution.findUnique({
    where: { id: execution.id },
    include: { steps: { orderBy: { startedAt: "asc" } } },
  });
  return NextResponse.json({ execution: fresh, mode }, { status: 201 });
});
