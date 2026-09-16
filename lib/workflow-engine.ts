import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { assertPublicEndpoint } from "@/lib/webhook-delivery";
import { esc, mergeTags } from "@/lib/marketing/blocks";
import { unsubscribeUrl } from "@/lib/marketing/tokens";
import { evaluateCondition, parseNodes, type WorkflowNodeSpec } from "@/lib/marketing/workflow";

/**
 * Runs a workflow execution from its cursor. Nodes run in order; a failed
 * condition ends the run, a delay parks it (`waiting` + `resumeAt`) for the
 * marketing cron to resume, and an error fails it and schedules a retry from
 * the failed node while attempts remain. Test runs simulate outbound effects
 * (email, webhook, tag) and skip waits, so nothing reaches real contacts.
 */
export async function runWorkflowExecution(executionId: string): Promise<void> {
  const execution = await db.workflowExecution.findUnique({ where: { id: executionId }, include: { workflow: true } });
  if (!execution) return;
  const wf = execution.workflow;
  const test = execution.environment === "test";
  const nodes = await nodesFor(wf.id, test ? null : execution.version);
  const contact = execution.contactId ? await db.contact.findFirst({ where: { id: execution.contactId, workspaceId: wf.workspaceId } }) : null;

  // Claim the run atomically so the queue worker and the scheduler never run it twice.
  const claimed = await db.workflowExecution.updateMany({ where: { id: executionId, status: { in: ["pending", "waiting"] } }, data: { status: "running", resumeAt: null } });
  if (!claimed.count) return;

  for (let i = execution.cursor; i < nodes.length; i++) {
    const node = nodes[i];
    const step = await db.workflowExecutionStep.create({ data: { executionId, nodeId: node.id, status: "running" } });
    const done = (status: string, metadata: Record<string, unknown>) =>
      db.workflowExecutionStep.update({ where: { id: step.id }, data: { status, completedAt: new Date(), metadata: { type: node.type, name: node.name, ...metadata } as never } });
    try {
      const c = node.config;
      switch (node.type) {
        case "trigger":
          await done("completed", { event: c.event });
          break;
        case "condition": {
          const passed = evaluateCondition(c, contact ? { ...contact, tags: contact.tags } : null);
          await done("completed", { passed });
          if (!passed) {
            await finish(executionId, { status: "completed", cursor: i + 1 });
            return;
          }
          break;
        }
        case "delay": {
          const minutes = Math.max(0, Number(c.minutes) || 0);
          if (test || minutes === 0) {
            await done("completed", { waitedMinutes: 0, skipped: test });
            break;
          }
          await done("completed", { waitMinutes: minutes });
          await db.workflowExecution.update({ where: { id: executionId }, data: { status: "waiting", cursor: i + 1, resumeAt: new Date(Date.now() + minutes * 60000) } });
          return;
        }
        case "email": {
          if (!contact?.email) {
            await done("skipped", { reason: "Contact has no email address" });
            break;
          }
          if (test) {
            await done("completed", { simulated: true, to: contact.email });
            break;
          }
          const vars = { firstName: contact.firstName || contact.name?.split(" ")[0] || "there", email: contact.email };
          const body = mergeTags(esc(c.body ?? "").replace(/\n/g, "<br>"), vars, true);
          const r = await sendEmail({
            to: contact.email,
            subject: mergeTags(c.subject ?? "", vars, false),
            html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#23324D">${body}<p style="margin-top:24px;font-size:12px;color:#8A94A8"><a href="${unsubscribeUrl(contact.email)}">Unsubscribe</a></p></div>`,
            category: "marketing",
          });
          await done(r.sent ? "completed" : "skipped", r.sent ? { to: contact.email } : { reason: r.reason === "suppressed" ? "Recipient is suppressed" : "Email sending is not configured" });
          break;
        }
        case "tag": {
          const tag = (c.tag ?? "").trim().toLowerCase();
          if (!contact || !tag) {
            await done("skipped", { reason: "No contact on this run" });
            break;
          }
          if (!test && !contact.tags.includes(tag)) await db.contact.update({ where: { id: contact.id }, data: { tags: { push: tag } } });
          await done("completed", { tag, simulated: test });
          break;
        }
        case "webhook": {
          if (test) {
            await done("completed", { simulated: true, url: c.url });
            break;
          }
          await assertPublicEndpoint(c.url);
          const res = await fetch(c.url, {
            method: "POST",
            headers: { "content-type": "application/json", "user-agent": "Amplivanta-Workflows/1.0" },
            body: JSON.stringify({ workflowId: wf.id, executionId, contact: contact ? { id: contact.id, email: contact.email } : null, payload: execution.triggerPayload }),
            signal: AbortSignal.timeout(8000),
            redirect: "manual",
          });
          if (!res.ok) throw new Error(`Webhook responded with HTTP ${res.status}`);
          await done("completed", { status: res.status });
          break;
        }
        case "goal":
          await db.workflowExecution.update({ where: { id: executionId }, data: { goalReached: true } });
          await done("completed", { goal: c.name });
          break;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message.slice(0, 500) : "Step failed";
      await done("failed", { error: message });
      await finish(executionId, { status: "failed", cursor: i, error: `${node.name}: ${message}` });
      if (!test && execution.attempt <= wf.maxRetries) {
        // Retries resume at the failed node so earlier steps (emails) are not repeated.
        await db.workflowExecution.create({
          data: { workflowId: wf.id, environment: execution.environment, version: execution.version, contactId: execution.contactId, triggerPayload: execution.triggerPayload ?? undefined, attempt: execution.attempt + 1, retryOfId: executionId, cursor: i, status: "waiting", resumeAt: new Date(Date.now() + 5 * 60000 * execution.attempt) },
        });
      }
      return;
    }
  }
  await finish(executionId, { status: "completed", cursor: nodes.length });
}

function finish(id: string, data: { status: string; cursor: number; error?: string }) {
  return db.workflowExecution.update({ where: { id }, data: { ...data, completedAt: new Date(), resumeAt: null } });
}

/** Live runs use the published snapshot; tests and never-published workflows use the draft nodes. */
export async function nodesFor(workflowId: string, version: number | null | undefined): Promise<WorkflowNodeSpec[]> {
  if (version) {
    const v = await db.workflowVersion.findUnique({ where: { workflowId_version: { workflowId, version } } });
    if (v) return parseNodes(v.nodes);
  }
  const rows = await db.workflowNode.findMany({ where: { workflowId } });
  return parseNodes(rows.sort((a, b) => posOf(a.position) - posOf(b.position)).map((r) => ({ id: r.id, type: r.type, name: r.name, config: r.config })));
}

function posOf(position: unknown): number {
  if (position && typeof position === "object" && "order" in position) return Number((position as { order: unknown }).order) || 0;
  return 0;
}
