import { notify } from "@/lib/notifications";
import { refreshGrowthScoresDaily } from "@/lib/server/growth-score";
import { processDueCommunications } from "@/lib/server/communications";
import { publishDueContent } from "@/app/(admin)/admin/content-actions";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { enqueueWorkflowRun } from "@/lib/queue";
import { runWorkflowExecution } from "@/lib/workflow-engine";
import { mergeTags, parseBlocks, renderEmailHtml } from "@/lib/marketing/blocks";
import { parseRules, rulesToWhere } from "@/lib/marketing/logic";
import { trackEmailHtml, unsubscribeUrl } from "@/lib/marketing/tokens";

/**
 * Marketing Automation runtime: starts workflows from events, sends email
 * campaigns in batches, and advances scheduled work from the marketing cron.
 */

/** Starts every published, active workflow listening for `event` (plus an explicitly assigned one). */
export async function triggerWorkflows(workspaceId: string, event: string, opts: { contactId?: string | null; payload?: Record<string, unknown>; workflowId?: string | null } = {}) {
  try {
    const flows = await db.workflow.findMany({
      where: { workspaceId, status: "active", version: { gt: 0 }, OR: [{ trigger: event }, ...(opts.workflowId ? [{ id: opts.workflowId }] : [])] },
      select: { id: true, version: true },
      take: 20,
    });
    for (const f of flows) {
      const ex = await db.workflowExecution.create({
        data: { workflowId: f.id, environment: "live", version: f.version, contactId: opts.contactId ?? null, triggerPayload: { event, ...(opts.payload ?? {}) } as never, status: "pending" },
      });
      // Not awaited: a slow webhook step must not hold up the form submission or API call.
      void enqueueWorkflowRun(ex.id).catch(() => null);
    }
    return flows.length;
  } catch {
    return 0;
  }
}

/** Contact ids a segment currently resolves to (dynamic rules or a static list). */
export async function segmentContactWhere(workspaceId: string, segmentId: string) {
  const seg = await db.segment.findFirst({ where: { id: segmentId, workspaceId } });
  if (!seg) return null;
  return seg.type === "static" ? { workspaceId, id: { in: seg.contactIds } } : rulesToWhere(workspaceId, parseRules((seg.filterCriteria as { rules?: unknown })?.rules));
}

/** Queues one EmailSend per recipient with an email, then sends the first batch. */
export async function startCampaignSend(emailCampaignId: string) {
  const ec = await db.emailCampaign.findUnique({ where: { id: emailCampaignId } });
  if (!ec?.segmentId) return { queued: 0 };
  const where = await segmentContactWhere(ec.workspaceId, ec.segmentId);
  if (!where) return { queued: 0 };
  const contacts = await db.contact.findMany({ where: { ...where, email: { not: null } } as never, select: { id: true, email: true }, take: 10000 });
  const seen = new Set<string>();
  const rows = contacts.flatMap((c) => {
    const e = c.email!.trim().toLowerCase();
    if (seen.has(e)) return [];
    seen.add(e);
    return [{ emailCampaignId: ec.id, recipientEmail: e, contactId: c.id, status: "queued" }];
  });
  await db.emailSend.createMany({ data: rows });
  await db.emailCampaign.update({ where: { id: ec.id }, data: { status: "sending", recipientCount: rows.length, sentAt: null } });
  await processSendQueue(100);
  return { queued: rows.length };
}

export async function processSendQueue(limit = 200) {
  const batch = await db.emailSend.findMany({ where: { status: "queued", emailCampaign: { status: "sending" } }, include: { emailCampaign: true }, orderBy: { createdAt: "asc" }, take: limit });
  const touched = new Set<string>();
  for (const s of batch) {
    const ec = s.emailCampaign!;
    touched.add(ec.id);
    const contact = s.contactId ? await db.contact.findUnique({ where: { id: s.contactId }, select: { firstName: true, name: true } }) : null;
    const vars = { firstName: contact?.firstName || contact?.name?.split(" ")[0] || "there", email: s.recipientEmail };
    const blocks = parseBlocks(ec.blocks, "email");
    const base = blocks.length ? renderEmailHtml(blocks, { preheader: ec.previewText ?? undefined, footer: `You are receiving this because you subscribed. <a href="${unsubscribeUrl(s.recipientEmail)}" style="color:#8A94A8">Unsubscribe</a>` }) : ec.content;
    try {
      const r = await sendEmail({ to: s.recipientEmail, subject: mergeTags(ec.subject, vars, false), html: trackEmailHtml(mergeTags(base, vars), s.id), category: "marketing" });
      await db.emailSend.update({ where: { id: s.id }, data: r.sent ? { status: "sent", deliveredAt: new Date() } : { status: r.reason === "suppressed" ? "suppressed" : "not_sent", error: r.reason } });
    } catch (e) {
      await db.emailSend.update({ where: { id: s.id }, data: { status: "failed", error: e instanceof Error ? e.message.slice(0, 300) : "Send failed" } });
    }
  }
  for (const id of touched) {
    const left = await db.emailSend.count({ where: { emailCampaignId: id, status: "queued" } });
    if (left) continue;
    const ec = await db.emailCampaign.update({ where: { id }, data: { status: "sent", sentAt: new Date() }, select: { id: true, name: true, workspaceId: true } });
    const by = await db.emailSend.groupBy({ by: ["status"], where: { emailCampaignId: id }, _count: true });
    const n = (s: string) => by.find((g) => g.status === s)?._count ?? 0;
    await notify({
      workspaceId: ec.workspaceId,
      category: "campaigns",
      severity: n("sent") === 0 || n("failed") + n("not_sent") > 0 ? "warning" : "success",
      title: `Email campaign "${ec.name}" finished sending`,
      body: `${n("sent")} sent, ${n("suppressed")} suppressed, ${n("failed")} failed, ${n("not_sent")} not sent${n("not_sent") ? " (no email provider is configured)" : ""}.`,
      link: `/app/marketing/emails?campaign=${ec.id}`,
      resourceType: "EmailCampaign",
      resourceId: ec.id,
    });
  }
  return batch.length;
}

/** One marketing cron tick: scheduled sends, send queue, due workflow runs, scheduled page publishes. */
export async function marketingTick() {
  const now = new Date();
  const scheduled = await db.emailCampaign.findMany({ where: { status: "scheduled", scheduledAt: { lte: now } }, select: { id: true }, take: 10 });
  for (const s of scheduled) await startCampaignSend(s.id);
  const sent = await processSendQueue(300);

  const due = await db.workflowExecution.findMany({ where: { status: { in: ["waiting", "pending"] }, OR: [{ resumeAt: { lte: now } }, { resumeAt: null, startedAt: { lte: new Date(now.getTime() - 60000) } }] }, select: { id: true }, take: 50 });
  for (const d of due) await runWorkflowExecution(d.id).catch(() => null);

  const pages = await db.landingPage.findMany({ where: { status: "scheduled", scheduledAt: { lte: now } }, select: { id: true, content: true, workspaceId: true } });
  for (const p of pages) {
    const last = await db.landingPageVersion.findFirst({ where: { landingPageId: p.id }, orderBy: { version: "desc" }, select: { version: true } });
    await db.landingPageVersion.create({ data: { landingPageId: p.id, version: (last?.version ?? 0) + 1, content: (p.content ?? []) as never } });
    const page = await db.landingPage.update({ where: { id: p.id }, data: { status: "published", isPublished: true, publishedAt: now, scheduledAt: null }, select: { id: true, title: true } });
    await notify({ workspaceId: p.workspaceId, category: "publishing", severity: "success", title: `Scheduled page "${page.title}" is live`, body: "The landing page was published at its scheduled time.", link: `/app/marketing/publishing?page=${page.id}`, resourceType: "LandingPage", resourceId: page.id });
  }
  // Scheduled platform content goes live at its publish time.
  const contentPublished = await publishDueContent().catch(() => 0);

  // Scheduled platform communications and in-flight sends.
  const comms = await processDueCommunications().catch(() => ({ due: 0, inFlight: 0 }));

  // Daily Growth Score snapshot and opportunity refresh per workspace.
  const scored = await refreshGrowthScoresDaily().catch(() => 0);
  return { scheduledCampaigns: scheduled.length, emailsProcessed: sent, workflowRuns: due.length, pagesPublished: pages.length, growthScores: scored, communications: comms, contentPublished };
}
