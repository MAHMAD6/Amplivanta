// Standalone BullMQ worker. Run alongside the app:  node scripts/worker.mjs
// Processes workflow runs from Redis. Self-contained (own Prisma + step logic) so
// it doesn't depend on the app's TS path aliases.
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6390";
const db = new PrismaClient();
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

function posOf(position) {
  if (position && typeof position === "object" && "order" in position) return Number(position.order) || 0;
  return 0;
}

async function runWorkflowExecution(executionId) {
  const execution = await db.workflowExecution.findUnique({ where: { id: executionId } });
  if (!execution) return;
  const nodes = await db.workflowNode.findMany({ where: { workflowId: execution.workflowId } });
  const ordered = nodes.sort((a, b) => posOf(a.position) - posOf(b.position));
  for (const node of ordered) {
    const step = await db.workflowExecutionStep.create({
      data: { executionId, nodeId: node.id, status: "running", startedAt: new Date() },
    });
    await db.workflowExecutionStep.update({
      where: { id: step.id },
      data: { status: "completed", completedAt: new Date(), metadata: { type: node.type } },
    });
  }
  await db.workflowExecution.update({ where: { id: executionId }, data: { status: "completed", completedAt: new Date() } });
}

const worker = new Worker(
  "workflow-runs",
  async (job) => {
    await runWorkflowExecution(job.data.executionId);
  },
  { connection },
);

worker.on("completed", (job) => console.log(`✓ workflow run ${job.data.executionId} completed`));
worker.on("failed", (job, err) => console.error(`✗ workflow run ${job?.data?.executionId} failed:`, err?.message));

console.log("🛠  Amplivanta worker listening on 'workflow-runs' via", REDIS_URL);
