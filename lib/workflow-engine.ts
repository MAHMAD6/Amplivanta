import { db } from "@/lib/db";

/**
 * Executes a single workflow run: walks the workflow's nodes in position order,
 * records a WorkflowExecutionStep for each, and marks the execution complete.
 * Deterministic and side-effect-light — real channel actions (send email, etc.)
 * would hook in per node type. Shared by the inline runner and the BullMQ worker
 * (the worker re-implements this against its own Prisma client to avoid path-alias
 * resolution in a standalone process).
 */
export async function runWorkflowExecution(executionId: string): Promise<void> {
  const execution = await db.workflowExecution.findUnique({ where: { id: executionId } });
  if (!execution) return;

  const nodes = await db.workflowNode.findMany({ where: { workflowId: execution.workflowId } });
  const ordered = nodes.sort((a, b) => posOf(a.position) - posOf(b.position));

  for (const node of ordered) {
    const step = await db.workflowExecutionStep.create({
      data: { executionId, nodeId: node.id, status: "running", startedAt: new Date() },
    });
    // Simulate the node's work. Real implementations dispatch by node.type here.
    await db.workflowExecutionStep.update({
      where: { id: step.id },
      data: { status: "completed", completedAt: new Date(), metadata: { type: node.type } },
    });
  }

  await db.workflowExecution.update({
    where: { id: executionId },
    data: { status: "completed", completedAt: new Date() },
  });
}

function posOf(position: unknown): number {
  if (position && typeof position === "object" && "order" in position) {
    return Number((position as { order: unknown }).order) || 0;
  }
  return 0;
}
