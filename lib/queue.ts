import { Queue } from "bullmq";
import IORedis from "ioredis";
import { runWorkflowExecution } from "@/lib/workflow-engine";

/**
 * BullMQ queues backed by Redis. When Redis is unavailable, jobs run inline so
 * the app still works without a worker process. The standalone worker
 * (scripts/worker.mjs) consumes these queues in production.
 */
const REDIS_URL = process.env.REDIS_URL || "";

let connection: IORedis | null = null;
let workflowQueue: Queue | null = null;

function getConnection(): IORedis | null {
  if (!REDIS_URL) return null;
  if (!connection) {
    connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: true });
    connection.on("error", () => {
      /* swallow — inline fallback handles it */
    });
  }
  return connection;
}

function getWorkflowQueue(): Queue | null {
  const conn = getConnection();
  if (!conn) return null;
  if (!workflowQueue) workflowQueue = new Queue("workflow-runs", { connection: conn });
  return workflowQueue;
}

/** Enqueue a workflow run, or execute inline if no queue is available. */
export async function enqueueWorkflowRun(executionId: string): Promise<"queued" | "inline"> {
  const queue = getWorkflowQueue();
  if (queue) {
    try {
      await queue.add("run", { executionId }, { attempts: 3, backoff: { type: "exponential", delay: 1000 } });
      return "queued";
    } catch {
      /* Redis down — fall through to inline */
    }
  }
  await runWorkflowExecution(executionId);
  return "inline";
}
