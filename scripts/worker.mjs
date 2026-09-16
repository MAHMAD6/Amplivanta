// Standalone BullMQ worker. Run alongside the app:  node scripts/worker.mjs
// Consumes queued workflow runs and hands each to the app's engine through the
// marketing cron endpoint, so step logic lives in one place (lib/workflow-engine.ts).
import { Worker } from "bullmq";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6390";
const APP_URL = (process.env.WORKER_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

async function runWorkflowExecution(executionId) {
  const res = await fetch(`${APP_URL}/api/cron/marketing?execution=${encodeURIComponent(executionId)}`, {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.CRON_SECRET ?? ""}` },
  });
  if (!res.ok) throw new Error(`engine responded ${res.status}`);
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
