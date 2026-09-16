"use server";

import { randomBytes } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { emailProvider, sendEmail } from "@/lib/email";
import { getSessionContext } from "@/lib/tenant";
import { enqueueWorkflowRun } from "@/lib/queue";
import { runWorkflowExecution, nodesFor } from "@/lib/workflow-engine";
import { segmentContactWhere, startCampaignSend } from "@/lib/server/marketing-runtime";
import { LANDING_TEMPLATES, mergeTags, parseBlocks, renderEmailHtml } from "@/lib/marketing/blocks";
import { AUTOMATION_TEMPLATES, parseNodes, validateGraph } from "@/lib/marketing/workflow";
import { isEmail, parseFields, parseRules, parseVariants, readiness, rulesToWhere, scoreContact, slugify, SCORING_SIGNALS } from "@/lib/marketing/logic";
import {
  ATTRIBUTION_MODELS,
  CAMPAIGN_CHANNELS,
  CAMPAIGN_GOALS,
  CAMPAIGN_STATUSES,
  EVENT_SOURCES,
  EXPERIMENT_GOALS,
  LOOKBACK_WINDOWS,
  inList,
} from "@/lib/marketing/options";

/**
 * Marketing Automation writes. Workspace-scoped; editors and above, except
 * domains and suppressions which need an admin. Publishing, sending and
 * activating are always explicit user actions.
 */

type Result = { ok: true; message: string; id?: string } | { ok: false; error: string };
const denied = { ok: false as const, error: "You don't have permission to make changes in this workspace." };
const missing = (what: string) => ({ ok: false as const, error: `That ${what} is not in this workspace.` });
const str = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);
const refresh = () => revalidatePath("/app/marketing", "layout");

async function session() {
  try {
    return await getSessionContext();
  } catch {
    return null;
  }
}
async function editor() {
  const c = await session();
  return c && c.workspaceRole !== "VIEWER" ? c : null;
}
async function admin() {
  const c = await session();
  return c && ["ADMIN", "OWNER", "SUPER_ADMIN"].includes(c.workspaceRole) ? c : null;
}
type Ctx = { workspaceId: string; userId: string };
async function audit(c: Ctx, action: string, resourceType: string, resourceId: string, metadata: Record<string, unknown> = {}) {
  await db.auditLog.create({ data: { workspaceId: c.workspaceId, actorUserId: c.userId, action, resourceType, resourceId, metadata: metadata as never } }).catch(() => null);
}
function date(v: string): Date | null | "invalid" {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "invalid" : d;
}
function httpUrl(v: string): string | null | "invalid" {
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : "invalid";
  } catch {
    return "invalid";
  }
}
function json(fd: FormData, k: string): unknown {
  try {
    return JSON.parse(String(fd.get(k) ?? "null"));
  } catch {
    return null;
  }
}
async function pref(workspaceId: string, scope: string): Promise<Record<string, unknown>> {
  const row = await db.workspacePreference.findUnique({ where: { workspaceId_scope: { workspaceId, scope } } });
  return (row?.values as Record<string, unknown>) ?? {};
}
async function setPref(c: Ctx, scope: string, values: Record<string, unknown>) {
  await db.workspacePreference.upsert({
    where: { workspaceId_scope: { workspaceId: c.workspaceId, scope } },
    create: { workspaceId: c.workspaceId, scope, values: values as never, updatedByUserId: c.userId },
    update: { values: values as never, updatedByUserId: c.userId },
  });
}
const owned = {
  workflow: (c: Ctx, id: string) => db.workflow.findFirst({ where: { id, workspaceId: c.workspaceId } }),
  email: (c: Ctx, id: string) => db.emailCampaign.findFirst({ where: { id, workspaceId: c.workspaceId } }),
  form: (c: Ctx, id: string) => db.form.findFirst({ where: { id, workspaceId: c.workspaceId } }),
  page: (c: Ctx, id: string) => db.landingPage.findFirst({ where: { id, workspaceId: c.workspaceId } }),
  segment: (c: Ctx, id: string) => db.segment.findFirst({ where: { id, workspaceId: c.workspaceId } }),
};

/* -------------------------------- Campaigns ------------------------------- */

export async function createCampaign(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 160);
  if (name.length < 2) return { ok: false, error: "Enter a campaign name." };
  const start = date(str(fd, "startDate", 20));
  const end = date(str(fd, "endDate", 20));
  if (start === "invalid" || end === "invalid") return { ok: false, error: "Enter valid dates." };
  if (start && end && end < start) return { ok: false, error: "The end date must be after the start date." };
  const budget = str(fd, "budget", 20) ? Number(str(fd, "budget", 20)) : null;
  if (budget != null && (!Number.isFinite(budget) || budget < 0)) return { ok: false, error: "Budget must be a positive number." };
  const channel = str(fd, "channel", 40);
  const goal = str(fd, "goal", 40);
  const ownerId = str(fd, "ownerId", 40);
  if (channel && !inList(channel, CAMPAIGN_CHANNELS)) return { ok: false, error: "Choose a valid channel." };
  if (goal && !inList(goal, CAMPAIGN_GOALS)) return { ok: false, error: "Choose a valid goal." };
  if (ownerId && !(await db.membership.findFirst({ where: { workspaceId: c.workspaceId, userId: ownerId } }))) return { ok: false, error: "The owner is not a member of this workspace." };
  const status = start && start > new Date() ? "scheduled" : "planning";
  const row = await db.campaign.create({ data: { workspaceId: c.workspaceId, name, description: str(fd, "description", 2000) || null, objective: goal ? CAMPAIGN_GOALS.find(([k]) => k === goal)?.[1] : null, channel: channel || null, goal: goal || null, ownerId: ownerId || null, budget, startDate: start, endDate: end, status } });
  await audit(c, "campaign.created", "Campaign", row.id);
  refresh();
  return { ok: true, message: "Campaign created.", id: row.id };
}

export async function setCampaignStatus(id: string, status: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  if (!inList(status, CAMPAIGN_STATUSES)) return { ok: false, error: "Choose a valid status." };
  const r = await db.campaign.updateMany({ where: { id, workspaceId: c.workspaceId }, data: { status } });
  if (!r.count) return missing("campaign");
  await audit(c, "campaign.status_changed", "Campaign", id, { status });
  refresh();
  return { ok: true, message: "Campaign updated." };
}

export async function duplicateCampaign(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const src = await db.campaign.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!src) return missing("campaign");
  const row = await db.campaign.create({ data: { workspaceId: c.workspaceId, name: `${src.name} (copy)`.slice(0, 160), description: src.description, objective: src.objective, channel: src.channel, goal: src.goal, ownerId: src.ownerId, budget: src.budget, status: "planning" } });
  await audit(c, "campaign.duplicated", "Campaign", row.id, { from: id });
  refresh();
  return { ok: true, message: "Campaign duplicated.", id: row.id };
}

export async function deleteCampaign(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.campaign.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return missing("campaign");
  await audit(c, "campaign.deleted", "Campaign", id);
  refresh();
  return { ok: true, message: "Campaign deleted." };
}

/** CSV with a header row: name, channel, goal, start_date, end_date, budget. */
export async function importCampaigns(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const rows = str(fd, "csv", 50000).split(/\r?\n/).map((l) => l.split(",").map((x) => x.trim().replace(/^"|"$/g, ""))).filter((r) => r.some(Boolean));
  if (rows.length < 2) return { ok: false, error: "Paste a header row and at least one campaign." };
  const head = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  const col = (r: string[], k: string) => r[head.indexOf(k)] ?? "";
  if (!head.includes("name")) return { ok: false, error: "The header row needs a name column." };
  const data = rows.slice(1, 201).flatMap((r) => {
    const name = col(r, "name").slice(0, 160);
    if (name.length < 2) return [];
    const s = date(col(r, "start_date"));
    const e = date(col(r, "end_date"));
    const budget = Number(col(r, "budget"));
    return [{ workspaceId: c.workspaceId, name, channel: inList(col(r, "channel"), CAMPAIGN_CHANNELS) ? col(r, "channel") : null, goal: inList(col(r, "goal"), CAMPAIGN_GOALS) ? col(r, "goal") : null, startDate: s instanceof Date ? s : null, endDate: e instanceof Date ? e : null, budget: Number.isFinite(budget) && budget > 0 ? budget : null, status: "planning" }];
  });
  if (!data.length) return { ok: false, error: "No valid rows were found." };
  await db.campaign.createMany({ data });
  await audit(c, "campaign.imported", "Campaign", "import", { count: data.length });
  refresh();
  return { ok: true, message: `${data.length} campaign${data.length === 1 ? "" : "s"} imported as drafts.` };
}

/* -------------------------------- Workflows ------------------------------- */

export async function createWorkflow(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 160);
  if (name.length < 2) return { ok: false, error: "Enter a workflow name." };
  const trigger = str(fd, "trigger", 80);
  const row = await db.workflow.create({ data: { workspaceId: c.workspaceId, name, description: str(fd, "description", 1000) || null, trigger: trigger || null, status: "draft" } });
  if (trigger) await db.workflowNode.create({ data: { workflowId: row.id, type: "trigger", name: "Trigger", position: { order: 0 }, config: { event: trigger } } });
  await audit(c, "automation.created", "Workflow", row.id);
  refresh();
  return { ok: true, message: "Workflow created.", id: row.id };
}

async function writeNodes(workflowId: string, nodes: ReturnType<typeof parseNodes>) {
  await db.$transaction([
    db.workflowNode.deleteMany({ where: { workflowId } }),
    db.workflowNode.createMany({ data: nodes.map((n, i) => ({ workflowId, type: n.type, name: n.name, position: { order: i }, config: n.config })) }),
    db.workflow.update({ where: { id: workflowId }, data: { trigger: nodes[0]?.type === "trigger" ? nodes[0].config.event || null : null } }),
  ]);
}

export async function saveWorkflowDraft(id: string, nodesJson: string, settings: { name: string; segmentId: string; goal: string; maxRetries: number }): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const wf = await owned.workflow(c, id);
  if (!wf) return missing("workflow");
  let raw: unknown = null;
  try {
    raw = JSON.parse(nodesJson);
  } catch {
    return { ok: false, error: "The workflow could not be read." };
  }
  const nodes = parseNodes(raw);
  const name = String(settings.name ?? "").trim().slice(0, 160);
  if (name.length < 2) return { ok: false, error: "Enter a workflow name." };
  if (settings.segmentId && !(await owned.segment(c, settings.segmentId))) return missing("segment");
  const maxRetries = Math.max(0, Math.min(5, Math.round(Number(settings.maxRetries) || 0)));
  await writeNodes(id, nodes);
  await db.workflow.update({ where: { id }, data: { name, segmentId: settings.segmentId || null, goal: String(settings.goal ?? "").slice(0, 160) || null, maxRetries } });
  refresh();
  return { ok: true, message: "Draft saved." };
}

export async function publishWorkflow(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const wf = await owned.workflow(c, id);
  if (!wf) return missing("workflow");
  const nodes = await nodesFor(id, null);
  const issues = validateGraph(nodes);
  if (issues.length) return { ok: false, error: issues[0] };
  const version = wf.version + 1;
  await db.$transaction([
    db.workflowVersion.create({ data: { workflowId: id, version, nodes: nodes as never, createdById: c.userId } }),
    db.workflow.update({ where: { id }, data: { version, publishedAt: new Date(), status: "active" } }),
  ]);
  await audit(c, "automation.published", "Workflow", id, { version });
  refresh();
  return { ok: true, message: `Version ${version} is live.` };
}

export async function setWorkflowStatus(id: string, status: "active" | "inactive"): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const wf = await owned.workflow(c, id);
  if (!wf) return missing("workflow");
  if (status === "active" && wf.version === 0) return { ok: false, error: "Publish the workflow before activating it." };
  await db.workflow.update({ where: { id }, data: { status } });
  await audit(c, status === "active" ? "automation.activated" : "automation.paused", "Workflow", id);
  refresh();
  return { ok: true, message: status === "active" ? "Workflow activated." : "Workflow paused." };
}

export async function restoreWorkflowVersion(id: string, version: number): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const wf = await owned.workflow(c, id);
  if (!wf) return missing("workflow");
  const v = await db.workflowVersion.findUnique({ where: { workflowId_version: { workflowId: id, version } } });
  if (!v) return { ok: false, error: "That version does not exist." };
  await writeNodes(id, parseNodes(v.nodes));
  await audit(c, "automation.version_restored", "Workflow", id, { version });
  refresh();
  return { ok: true, message: `Draft restored from version ${version}. Publish to make it live.` };
}

/** Test run: uses the draft nodes and simulates email, tag and webhook effects. */
export async function testWorkflow(id: string, contactId: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const wf = await owned.workflow(c, id);
  if (!wf) return missing("workflow");
  const issues = validateGraph(await nodesFor(id, null));
  if (issues.length) return { ok: false, error: issues[0] };
  if (contactId && !(await db.contact.findFirst({ where: { id: contactId, workspaceId: c.workspaceId }, select: { id: true } }))) return missing("contact");
  const ex = await db.workflowExecution.create({ data: { workflowId: id, environment: "test", contactId: contactId || null, triggerPayload: { event: "test" }, status: "pending" } });
  await runWorkflowExecution(ex.id);
  const done = await db.workflowExecution.findUnique({ where: { id: ex.id } });
  await audit(c, "automation.tested", "Workflow", id, { executionId: ex.id });
  refresh();
  return done?.status === "failed" ? { ok: false, error: done.error ?? "The test run failed." } : { ok: true, message: "Test run completed. No emails or webhooks were sent.", id: ex.id };
}

/** Live run for one contact, using the published version. */
export async function runWorkflowForContact(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const wf = await owned.workflow(c, str(fd, "workflowId", 40));
  if (!wf) return missing("workflow");
  if (wf.status !== "active" || wf.version === 0) return { ok: false, error: "Publish and activate the workflow first." };
  const contact = await db.contact.findFirst({ where: { id: str(fd, "contactId", 40), workspaceId: c.workspaceId }, select: { id: true } });
  if (!contact) return missing("contact");
  const ex = await db.workflowExecution.create({ data: { workflowId: wf.id, environment: "live", version: wf.version, contactId: contact.id, triggerPayload: { event: "manual" }, status: "pending" } });
  await enqueueWorkflowRun(ex.id);
  await audit(c, "automation.run", "Workflow", wf.id, { executionId: ex.id });
  refresh();
  return { ok: true, message: "Workflow run started." };
}

export async function retryExecutions(ids: string[]): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const list = await db.workflowExecution.findMany({ where: { id: { in: ids.slice(0, 50) }, status: "failed", workflow: { workspaceId: c.workspaceId } } });
  if (!list.length) return { ok: false, error: "Select failed runs to retry." };
  for (const ex of list) {
    const retry = await db.workflowExecution.create({ data: { workflowId: ex.workflowId, environment: ex.environment, version: ex.version, contactId: ex.contactId, triggerPayload: ex.triggerPayload ?? undefined, attempt: ex.attempt + 1, retryOfId: ex.id, cursor: ex.cursor, status: "pending" } });
    await enqueueWorkflowRun(retry.id);
  }
  await audit(c, "automation.retried", "WorkflowExecution", list[0].id, { count: list.length });
  refresh();
  return { ok: true, message: `${list.length} run${list.length === 1 ? "" : "s"} retried from the failed step.` };
}

export async function deleteWorkflow(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.workflow.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return missing("workflow");
  await audit(c, "automation.deleted", "Workflow", id);
  refresh();
  return { ok: true, message: "Workflow deleted." };
}

export async function applyAutomationTemplate(key: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const t = AUTOMATION_TEMPLATES.find((x) => x.key === key);
  let name: string;
  let nodes: ReturnType<typeof parseNodes>;
  if (t) {
    name = t.name;
    nodes = parseNodes(t.nodes);
  } else {
    const custom = await db.template.findFirst({ where: { id: key, workspaceId: c.workspaceId, type: "automation" } });
    if (!custom) return { ok: false, error: "That template is not available." };
    name = custom.name;
    nodes = parseNodes((custom.content as { nodes?: unknown })?.nodes);
  }
  const wf = await db.workflow.create({ data: { workspaceId: c.workspaceId, name, status: "draft", templateKey: key } });
  await writeNodes(wf.id, nodes);
  const recent = ((await pref(c.workspaceId, "automation_templates")).recent as string[] | undefined) ?? [];
  const saved = (await pref(c.workspaceId, "automation_templates")).saved ?? [];
  await setPref(c, "automation_templates", { saved, recent: [key, ...recent.filter((k) => k !== key)].slice(0, 8) });
  await audit(c, "automation.created_from_template", "Workflow", wf.id, { template: key });
  refresh();
  return { ok: true, message: "Draft workflow created from the template.", id: wf.id };
}

export async function toggleSavedTemplate(key: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  if (!AUTOMATION_TEMPLATES.some((t) => t.key === key)) return { ok: false, error: "That template is not available." };
  const p = await pref(c.workspaceId, "automation_templates");
  const saved = (p.saved as string[] | undefined) ?? [];
  const next = saved.includes(key) ? saved.filter((k) => k !== key) : [...saved, key];
  await setPref(c, "automation_templates", { ...p, saved: next });
  refresh();
  return { ok: true, message: saved.includes(key) ? "Removed from saved templates." : "Template saved." };
}

export async function saveWorkflowAsTemplate(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const wf = await owned.workflow(c, id);
  if (!wf) return missing("workflow");
  const nodes = await nodesFor(id, null);
  if (!nodes.length) return { ok: false, error: "Add nodes before saving a template." };
  const t = await db.template.create({ data: { workspaceId: c.workspaceId, name: wf.name, category: "internal", type: "automation", channel: "email", content: { nodes } as never } });
  await audit(c, "automation.template_saved", "Template", t.id);
  refresh();
  return { ok: true, message: "Saved as a custom template." };
}

/* ------------------------------ Trigger events ---------------------------- */

const EVENT_NAME = /^[a-z][a-z0-9_.]{1,79}$/;

export async function createEvent(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 80).toLowerCase();
  if (!EVENT_NAME.test(name)) return { ok: false, error: "Event names use lowercase letters, numbers, dots and underscores (e.g. trial.started)." };
  const source = str(fd, "source", 40) || "custom";
  if (!inList(source, EVENT_SOURCES)) return { ok: false, error: "Choose a valid source." };
  if (await db.eventDefinition.findFirst({ where: { workspaceId: c.workspaceId, name } })) return { ok: false, error: "An event with that name already exists." };
  const sample = str(fd, "payload", 5000);
  let properties: unknown = null;
  if (sample) {
    try {
      properties = JSON.parse(sample);
    } catch {
      return { ok: false, error: "The sample payload must be valid JSON." };
    }
  }
  const row = await db.eventDefinition.create({ data: { workspaceId: c.workspaceId, name, description: str(fd, "description", 300) || null, source, properties: properties as never } });
  await audit(c, "automation.event_created", "EventDefinition", row.id, { name });
  refresh();
  return { ok: true, message: "Event created.", id: row.id };
}

/** JSON array of { name, description?, source?, payload? }. */
export async function importEventSchema(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  let list: unknown;
  try {
    list = JSON.parse(str(fd, "schema", 100000));
  } catch {
    return { ok: false, error: "Paste a JSON array of events." };
  }
  if (!Array.isArray(list)) return { ok: false, error: "Paste a JSON array of events." };
  const existing = new Set((await db.eventDefinition.findMany({ where: { workspaceId: c.workspaceId }, select: { name: true } })).map((e) => e.name));
  const data = list.slice(0, 100).flatMap((e) => {
    const o = (e ?? {}) as Record<string, unknown>;
    const name = String(o.name ?? "").toLowerCase();
    if (!EVENT_NAME.test(name) || existing.has(name)) return [];
    existing.add(name);
    return [{ workspaceId: c.workspaceId, name, description: typeof o.description === "string" ? o.description.slice(0, 300) : null, source: inList(String(o.source), EVENT_SOURCES) ? String(o.source) : "custom", properties: (o.payload ?? null) as never }];
  });
  if (!data.length) return { ok: false, error: "No new valid events were found." };
  await db.eventDefinition.createMany({ data });
  await audit(c, "automation.events_imported", "EventDefinition", "import", { count: data.length });
  refresh();
  return { ok: true, message: `${data.length} event${data.length === 1 ? "" : "s"} imported.` };
}

export async function validateEvent(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const ev = await db.eventDefinition.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!ev) return missing("event");
  const problems: string[] = [];
  if (!EVENT_NAME.test(ev.name)) problems.push("name format");
  if (!ev.properties || typeof ev.properties !== "object" || Array.isArray(ev.properties)) problems.push("sample payload must be a JSON object");
  const status = problems.length ? "failed" : "passed";
  await db.eventDefinition.update({ where: { id }, data: { validationStatus: status, validatedAt: new Date() } });
  refresh();
  return problems.length ? { ok: false, error: `Validation failed: ${problems.join(", ")}.` } : { ok: true, message: "Event schema is valid." };
}

export async function deleteEvent(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.eventDefinition.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return missing("event");
  refresh();
  return { ok: true, message: "Event deleted." };
}

/* ----------------------------- Email campaigns ---------------------------- */

export async function createEmailCampaign(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 160);
  if (name.length < 2) return { ok: false, error: "Enter a campaign name." };
  const segmentId = str(fd, "segmentId", 40);
  if (segmentId && !(await owned.segment(c, segmentId))) return missing("segment");
  const row = await db.emailCampaign.create({ data: { workspaceId: c.workspaceId, name, subject: str(fd, "subject", 200) || name, content: "", segmentId: segmentId || null, status: "draft" } });
  await audit(c, "email.created", "EmailCampaign", row.id);
  refresh();
  return { ok: true, message: "Email campaign created.", id: row.id };
}

export async function saveEmail(id: string, payload: { blocks: unknown; senderName: string; senderEmail: string; replyTo: string; subject: string; preheader: string; segmentId: string }): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const ec = await owned.email(c, id);
  if (!ec) return missing("email campaign");
  if (["sending", "sent"].includes(ec.status)) return { ok: false, error: "Sent campaigns can't be edited. Duplicate it instead." };
  const blocks = parseBlocks(payload.blocks, "email");
  const subject = String(payload.subject ?? "").trim().slice(0, 200);
  if (!subject) return { ok: false, error: "Enter a subject." };
  for (const e of [payload.senderEmail, payload.replyTo]) if (e && !isEmail(String(e).trim())) return { ok: false, error: "Enter valid email addresses." };
  if (payload.segmentId && !(await owned.segment(c, payload.segmentId))) return missing("segment");
  await db.emailCampaign.update({
    where: { id },
    data: { blocks: blocks as never, content: renderEmailHtml(blocks, { preheader: payload.preheader }), subject, previewText: String(payload.preheader ?? "").slice(0, 200) || null, fromName: String(payload.senderName ?? "").slice(0, 100) || null, fromEmail: String(payload.senderEmail ?? "").trim() || null, replyTo: String(payload.replyTo ?? "").trim() || null, segmentId: payload.segmentId || null },
  });
  refresh();
  return { ok: true, message: "Email saved." };
}

async function sendReadiness(c: Ctx, id: string) {
  const ec = await owned.email(c, id);
  if (!ec) return { error: "That email campaign is not in this workspace." };
  if (!parseBlocks(ec.blocks, "email").length) return { error: "Add content in the Email Composer first." };
  if (!ec.segmentId) return { error: "Choose an audience segment first." };
  const where = await segmentContactWhere(c.workspaceId, ec.segmentId);
  const recipients = where ? await db.contact.count({ where: { ...where, email: { not: null } } as never }) : 0;
  if (!recipients) return { error: "The selected audience has no contacts with an email address." };
  if (!emailProvider()) return { error: "Email sending is not configured on this server yet." };
  return { ec, recipients };
}

export async function sendTestEmail(id: string): Promise<Result> {
  const c = await session();
  if (!c || c.workspaceRole === "VIEWER") return denied;
  const ec = await owned.email(c, id);
  if (!ec) return missing("email campaign");
  const blocks = parseBlocks(ec.blocks, "email");
  if (!blocks.length) return { ok: false, error: "Save some content before sending a test." };
  const r = await sendEmail({ to: c.email, subject: `[Test] ${mergeTags(ec.subject, { firstName: "there" }, false)}`, html: mergeTags(renderEmailHtml(blocks, { preheader: ec.previewText ?? undefined }), { firstName: "there", email: c.email }), category: "transactional" });
  return r.sent ? { ok: true, message: `Test sent to ${c.email}.` } : { ok: false, error: r.reason === "not_configured" ? "Email sending is not configured on this server yet." : "Your address is on the suppression list." };
}

export async function scheduleEmail(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const id = str(fd, "id", 40);
  const when = date(str(fd, "scheduledAt", 30));
  if (!(when instanceof Date) || when.getTime() < Date.now() + 60000) return { ok: false, error: "Choose a time at least a minute from now." };
  const r = await sendReadiness(c, id);
  if ("error" in r) return { ok: false, error: r.error! };
  if (!["draft", "paused", "scheduled"].includes(r.ec.status)) return { ok: false, error: "Only drafts can be scheduled." };
  await db.emailCampaign.update({ where: { id }, data: { status: "scheduled", scheduledAt: when } });
  await audit(c, "email.scheduled", "EmailCampaign", id, { scheduledAt: when.toISOString(), recipients: r.recipients });
  refresh();
  return { ok: true, message: `Scheduled for ${r.recipients.toLocaleString("en-US")} recipients.` };
}

export async function sendEmailNow(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await sendReadiness(c, id);
  if ("error" in r) return { ok: false, error: r.error! };
  if (!["draft", "scheduled"].includes(r.ec.status)) return { ok: false, error: "This campaign has already been sent." };
  const { queued } = await startCampaignSend(id);
  await audit(c, "email.sent", "EmailCampaign", id, { recipients: queued });
  refresh();
  return { ok: true, message: `Sending to ${queued.toLocaleString("en-US")} recipients.` };
}

export async function setEmailPaused(id: string, paused: boolean): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const ec = await owned.email(c, id);
  if (!ec) return missing("email campaign");
  if (paused && !["sending", "scheduled"].includes(ec.status)) return { ok: false, error: "Only scheduled or sending campaigns can be paused." };
  if (!paused && ec.status !== "paused") return { ok: false, error: "This campaign is not paused." };
  const queued = await db.emailSend.count({ where: { emailCampaignId: id, status: "queued" } });
  await db.emailCampaign.update({ where: { id }, data: { status: paused ? "paused" : queued ? "sending" : ec.scheduledAt ? "scheduled" : "draft" } });
  await audit(c, paused ? "email.paused" : "email.resumed", "EmailCampaign", id);
  refresh();
  return { ok: true, message: paused ? "Campaign paused." : "Campaign resumed." };
}

export async function duplicateEmail(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const ec = await owned.email(c, id);
  if (!ec) return missing("email campaign");
  const row = await db.emailCampaign.create({ data: { workspaceId: c.workspaceId, name: `${ec.name} (copy)`.slice(0, 160), subject: ec.subject, previewText: ec.previewText, fromName: ec.fromName, fromEmail: ec.fromEmail, replyTo: ec.replyTo, content: ec.content, blocks: ec.blocks ?? undefined, segmentId: ec.segmentId, status: "draft" } });
  await audit(c, "email.duplicated", "EmailCampaign", row.id, { from: id });
  refresh();
  return { ok: true, message: "Email duplicated.", id: row.id };
}

export async function deleteEmail(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const ec = await owned.email(c, id);
  if (!ec) return missing("email campaign");
  if (ec.status === "sending") return { ok: false, error: "Pause the campaign before deleting it." };
  await db.emailCampaign.delete({ where: { id } });
  await audit(c, "email.deleted", "EmailCampaign", id);
  refresh();
  return { ok: true, message: "Email campaign deleted." };
}

/* ---------------------------------- Forms --------------------------------- */

export async function createForm(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 160);
  if (name.length < 2) return { ok: false, error: "Enter a form name." };
  const fields = [
    { id: "f0", type: "text", label: "Name", name: "name", required: true, options: "", value: "" },
    { id: "f1", type: "email", label: "Email", name: "email", required: true, options: "", value: "" },
  ];
  const row = await db.form.create({ data: { workspaceId: c.workspaceId, name, fields, status: "draft" } });
  await audit(c, "form.created", "Form", row.id);
  refresh();
  return { ok: true, message: "Form created.", id: row.id };
}

export async function saveForm(id: string, payload: { name: string; fields: unknown; submitButtonText: string; successMessage: string; redirectUrl: string; workflowId: string; requireConsent: boolean; consentText: string; privacyUrl: string; termsUrl: string; confirmationSubject: string }): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const form = await owned.form(c, id);
  if (!form) return missing("form");
  const fields = parseFields(payload.fields);
  const name = String(payload.name ?? "").trim().slice(0, 160);
  if (name.length < 2) return { ok: false, error: "Enter a form name." };
  if (form.status === "active" && !fields.some((f) => f.type === "email")) return { ok: false, error: "Active forms need an email field." };
  const urls = [payload.redirectUrl, payload.privacyUrl, payload.termsUrl].map((u) => httpUrl(String(u ?? "").trim()));
  if (urls.includes("invalid")) return { ok: false, error: "Links must start with http:// or https://." };
  if (payload.requireConsent && !urls[1]) return { ok: false, error: "Add a privacy policy URL when consent is required." };
  if (payload.workflowId && !(await owned.workflow(c, payload.workflowId))) return missing("workflow");
  await db.form.update({
    where: { id },
    data: { name, fields, submitButtonText: String(payload.submitButtonText || "Submit").slice(0, 60), successMessage: String(payload.successMessage || "Thank you!").slice(0, 300), redirectUrl: urls[0] as string | null, privacyUrl: urls[1] as string | null, termsUrl: urls[2] as string | null, workflowId: payload.workflowId || null, requireConsent: Boolean(payload.requireConsent), consentText: String(payload.consentText ?? "").slice(0, 500) || null, confirmationSubject: String(payload.confirmationSubject ?? "").slice(0, 160) || null },
  });
  refresh();
  return { ok: true, message: "Form saved." };
}

export async function setFormStatus(id: string, status: "draft" | "active" | "archived"): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const form = await owned.form(c, id);
  if (!form) return missing("form");
  if (status === "active") {
    const fields = parseFields(form.fields);
    if (!fields.some((f) => f.type === "email")) return { ok: false, error: "Add an email field before activating the form." };
    if (form.requireConsent && !form.privacyUrl) return { ok: false, error: "Add a privacy policy URL before activating." };
  }
  await db.form.update({ where: { id }, data: { status } });
  await audit(c, `form.${status === "active" ? "activated" : status}`, "Form", id);
  refresh();
  return { ok: true, message: status === "active" ? "Form is live and accepting submissions." : "Form updated." };
}

export async function duplicateForm(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const f = await owned.form(c, id);
  if (!f) return missing("form");
  const row = await db.form.create({ data: { workspaceId: c.workspaceId, name: `${f.name} (copy)`.slice(0, 160), fields: f.fields ?? [], submitButtonText: f.submitButtonText, successMessage: f.successMessage, redirectUrl: f.redirectUrl, requireConsent: f.requireConsent, consentText: f.consentText, privacyUrl: f.privacyUrl, termsUrl: f.termsUrl, status: "draft" } });
  refresh();
  return { ok: true, message: "Form duplicated.", id: row.id };
}

export async function deleteForm(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.form.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return missing("form");
  await db.landingPage.updateMany({ where: { workspaceId: c.workspaceId, formId: id }, data: { formId: null } });
  await audit(c, "form.deleted", "Form", id);
  refresh();
  return { ok: true, message: "Form deleted." };
}

/* ------------------------------ Landing pages ----------------------------- */

/** New pages follow the workspace's publish preferences. */
async function pageDefaults(workspaceId: string) {
  const p = (await pref(workspaceId, "publishing")) as { defaultVisibility?: string; analyticsByDefault?: boolean };
  return { visibility: p.defaultVisibility === "unlisted" ? "unlisted" : "public", analyticsEnabled: p.analyticsByDefault !== false };
}

async function uniqueSlug(workspaceId: string, base: string, exceptId?: string) {
  const root = slugify(base) || "page";
  for (let i = 0; i < 50; i++) {
    const slug = i ? `${root}-${i + 1}` : root;
    const hit = await db.landingPage.findFirst({ where: { workspaceId, slug, ...(exceptId ? { NOT: { id: exceptId } } : {}) }, select: { id: true } });
    if (!hit) return slug;
  }
  return `${root}-${randomBytes(3).toString("hex")}`;
}

export async function createLandingPage(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const templateKey = str(fd, "templateKey", 40) || "blank";
  const t = LANDING_TEMPLATES.find((x) => x.key === templateKey);
  if (!t) return { ok: false, error: "That template is not available." };
  const title = str(fd, "title", 160) || (t.key === "blank" ? "Untitled landing page" : t.name);
  const blocks = t.blocks.map((b, i) => ({ id: `b${i}`, ...b }));
  const row = await db.landingPage.create({ data: { workspaceId: c.workspaceId, title, slug: await uniqueSlug(c.workspaceId, str(fd, "slug", 80) || title), content: blocks as never, templateKey: t.key, status: "draft", ...(await pageDefaults(c.workspaceId)) } });
  await audit(c, "page.created", "LandingPage", row.id, { template: t.key });
  refresh();
  return { ok: true, message: "Landing page created.", id: row.id };
}

/** JSON export of a page's blocks (from another workspace or a backup). */
export async function importLandingPage(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  let raw: unknown;
  try {
    raw = JSON.parse(str(fd, "json", 200000));
  } catch {
    return { ok: false, error: "Paste valid JSON." };
  }
  const src = (Array.isArray(raw) ? { blocks: raw } : raw ?? {}) as { title?: unknown; blocks?: unknown };
  const blocks = parseBlocks(src.blocks, "page");
  if (!blocks.length) return { ok: false, error: "No supported sections were found." };
  const title = (typeof src.title === "string" && src.title.trim().slice(0, 160)) || "Imported landing page";
  const row = await db.landingPage.create({ data: { workspaceId: c.workspaceId, title, slug: await uniqueSlug(c.workspaceId, title), content: blocks as never, status: "draft", ...(await pageDefaults(c.workspaceId)) } });
  await audit(c, "page.imported", "LandingPage", row.id);
  refresh();
  return { ok: true, message: "Page imported as a draft.", id: row.id };
}

export async function savePage(id: string, payload: { title: string; slug: string; metaTitle: string; metaDescription: string; socialImage: string; blocks: unknown; formId: string }): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const page = await owned.page(c, id);
  if (!page) return missing("landing page");
  const title = String(payload.title ?? "").trim().slice(0, 160);
  if (title.length < 2) return { ok: false, error: "Enter a page name." };
  const slug = slugify(String(payload.slug || title));
  if (!slug) return { ok: false, error: "Enter a page URL." };
  if (await db.landingPage.findFirst({ where: { workspaceId: c.workspaceId, slug, NOT: { id } }, select: { id: true } })) return { ok: false, error: "Another page already uses that URL." };
  const image = httpUrl(String(payload.socialImage ?? "").trim());
  if (image === "invalid") return { ok: false, error: "The social image must be an http(s) URL." };
  if (payload.formId && !(await owned.form(c, payload.formId))) return missing("form");
  await db.landingPage.update({
    where: { id },
    data: { title, slug, metaTitle: String(payload.metaTitle ?? "").slice(0, 70) || null, metaDescription: String(payload.metaDescription ?? "").slice(0, 170) || null, socialImage: image, content: parseBlocks(payload.blocks, "page") as never, formId: payload.formId || null },
  });
  refresh();
  return { ok: true, message: page.status === "published" ? "Draft saved. Publish to update the live page." : "Draft saved." };
}

export async function setPageReview(id: string, key: "contentReviewed" | "seoReviewed", value: boolean): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.landingPage.updateMany({ where: { id, workspaceId: c.workspaceId }, data: { [key]: value } });
  if (!r.count) return missing("landing page");
  refresh();
  return { ok: true, message: value ? "Marked as reviewed." : "Review cleared." };
}

export async function updatePublishSettings(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const id = str(fd, "id", 40);
  const page = await owned.page(c, id);
  if (!page) return missing("landing page");
  const domainId = str(fd, "domainId", 40);
  if (domainId && !(await db.domain.findFirst({ where: { id: domainId, workspaceId: c.workspaceId, purpose: "publishing" } }))) return missing("domain");
  const visibility = str(fd, "visibility", 20) === "unlisted" ? "unlisted" : "public";
  await db.landingPage.update({ where: { id }, data: { domainId: domainId || null, visibility, analyticsEnabled: fd.get("analyticsEnabled") === "on" } });
  refresh();
  return { ok: true, message: "Publish settings saved." };
}

async function snapshot(c: Ctx, pageId: string, content: unknown) {
  const last = await db.landingPageVersion.findFirst({ where: { landingPageId: pageId }, orderBy: { version: "desc" }, select: { version: true } });
  const version = (last?.version ?? 0) + 1;
  await db.landingPageVersion.create({ data: { landingPageId: pageId, version, content: (content ?? []) as never, createdById: c.userId } });
  return version;
}

export async function publishPage(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const page = await owned.page(c, id);
  if (!page) return missing("landing page");
  const blocks = parseBlocks(page.content, "page");
  const check = readiness({ ...page, blocks: blocks.length, hasFormBlock: blocks.some((b) => b.type === "form") });
  if (!check.canPublish) return { ok: false, error: `Not ready: ${check.items.find((i) => i.blocking)?.detail}` };
  if (page.formId && !(await db.form.findFirst({ where: { id: page.formId, status: "active" } }))) return { ok: false, error: "Activate the connected form before publishing." };
  const version = await snapshot(c, id, blocks);
  await db.landingPage.update({ where: { id }, data: { status: "published", isPublished: true, publishedAt: new Date(), scheduledAt: null } });
  await audit(c, "page.published", "LandingPage", id, { version });
  refresh();
  return { ok: true, message: `Published version ${version}.` };
}

export async function schedulePage(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const id = str(fd, "id", 40);
  const page = await owned.page(c, id);
  if (!page) return missing("landing page");
  const when = date(str(fd, "scheduledAt", 30));
  if (!(when instanceof Date) || when.getTime() < Date.now() + 60000) return { ok: false, error: "Choose a time at least a minute from now." };
  const blocks = parseBlocks(page.content, "page");
  const check = readiness({ ...page, blocks: blocks.length, hasFormBlock: blocks.some((b) => b.type === "form") });
  if (!check.canPublish) return { ok: false, error: `Not ready: ${check.items.find((i) => i.blocking)?.detail}` };
  await db.landingPage.update({ where: { id }, data: { status: "scheduled", scheduledAt: when } });
  await audit(c, "page.scheduled", "LandingPage", id, { scheduledAt: when.toISOString() });
  refresh();
  return { ok: true, message: "Publish scheduled." };
}

export async function setPageStatus(id: string, status: "draft" | "archived"): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.landingPage.updateMany({ where: { id, workspaceId: c.workspaceId }, data: { status, isPublished: false, scheduledAt: null } });
  if (!r.count) return missing("landing page");
  await audit(c, status === "archived" ? "page.archived" : "page.unpublished", "LandingPage", id);
  refresh();
  return { ok: true, message: status === "archived" ? "Page archived." : "Page unpublished." };
}

export async function rollbackPage(id: string, version: number): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const page = await owned.page(c, id);
  if (!page) return missing("landing page");
  const v = await db.landingPageVersion.findFirst({ where: { landingPageId: id, version } });
  if (!v) return { ok: false, error: "That version does not exist." };
  const next = await snapshot(c, id, v.content);
  await db.landingPage.update({ where: { id }, data: { content: v.content as never, status: "published", isPublished: true, publishedAt: new Date() } });
  await audit(c, "page.rolled_back", "LandingPage", id, { to: version, version: next });
  refresh();
  return { ok: true, message: `Restored version ${version} as version ${next}.` };
}

export async function duplicatePage(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const p = await owned.page(c, id);
  if (!p) return missing("landing page");
  const title = `${p.title} (copy)`.slice(0, 160);
  const row = await db.landingPage.create({ data: { workspaceId: c.workspaceId, title, slug: await uniqueSlug(c.workspaceId, title), content: p.content ?? undefined, metaTitle: p.metaTitle, metaDescription: p.metaDescription, socialImage: p.socialImage, formId: p.formId, templateKey: p.templateKey, status: "draft" } });
  refresh();
  return { ok: true, message: "Page duplicated.", id: row.id };
}

export async function deletePage(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  if (await db.experiment.findFirst({ where: { workspaceId: c.workspaceId, landingPageId: id, status: "running" } })) return { ok: false, error: "Stop the running A/B test on this page first." };
  const r = await db.landingPage.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return missing("landing page");
  await audit(c, "page.deleted", "LandingPage", id);
  refresh();
  return { ok: true, message: "Page deleted." };
}

/* --------------------------------- Domains -------------------------------- */

const DOMAIN_RE = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export async function addMarketingDomain(fd: FormData): Promise<Result> {
  const c = await admin();
  if (!c) return { ok: false, error: "Only workspace admins can add domains." };
  const domain = str(fd, "domain", 253).toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!DOMAIN_RE.test(domain)) return { ok: false, error: "Enter a domain such as pages.example.com." };
  const purpose = str(fd, "purpose", 20) === "sending" ? "sending" : "publishing";
  const taken = await db.domain.findUnique({ where: { domain } });
  if (taken) return { ok: false, error: taken.workspaceId === c.workspaceId ? "That domain is already added." : "That domain is registered to another workspace." };
  const row = await db.domain.create({ data: { workspaceId: c.workspaceId, domain, purpose, verificationToken: `amplivanta-verify=${randomBytes(16).toString("hex")}` } });
  await audit(c, "domain.added", "Domain", row.id, { domain, purpose });
  refresh();
  revalidatePath("/app/settings/api-domains");
  return { ok: true, message: "Domain added. Create the TXT record, then verify." };
}

async function txt(name: string) {
  try {
    return (await resolveTxt(name)).map((p) => p.join(""));
  } catch {
    return [];
  }
}

/** Looks up ownership TXT, SPF and DMARC records. DKIM depends on the sending provider's selector and is not checked here. */
export async function checkDomainRecords(id: string): Promise<Result> {
  const c = await admin();
  if (!c) return { ok: false, error: "Only workspace admins can check domains." };
  const d = await db.domain.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!d) return missing("domain");
  const [owner, root, dmarc] = await Promise.all([txt(`_amplivanta.${d.domain}`), txt(d.domain), txt(`_dmarc.${d.domain}`)]);
  const verified = Boolean(d.verificationToken && owner.includes(d.verificationToken));
  const spf = root.find((r) => r.toLowerCase().startsWith("v=spf1")) ?? null;
  const dm = dmarc.find((r) => r.toLowerCase().startsWith("v=dmarc1")) ?? null;
  await db.domain.update({ where: { id }, data: { isVerified: verified || d.isVerified, lastCheckedAt: new Date(), authChecks: { ownership: verified || d.isVerified, spf, dmarc: dm } } });
  await audit(c, "domain.checked", "Domain", id, { verified, spf: Boolean(spf), dmarc: Boolean(dm) });
  refresh();
  revalidatePath("/app/settings/api-domains");
  return verified || d.isVerified ? { ok: true, message: `Ownership verified. SPF ${spf ? "found" : "missing"}, DMARC ${dm ? "found" : "missing"}.` } : { ok: false, error: "The ownership TXT record was not found yet. DNS changes can take time to propagate." };
}

export async function setDefaultDomain(id: string): Promise<Result> {
  const c = await admin();
  if (!c) return { ok: false, error: "Only workspace admins can change the default domain." };
  const d = await db.domain.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!d) return missing("domain");
  if (!d.isVerified) return { ok: false, error: "Verify the domain first." };
  await db.$transaction([db.domain.updateMany({ where: { workspaceId: c.workspaceId, purpose: d.purpose }, data: { isDefault: false } }), db.domain.update({ where: { id }, data: { isDefault: true } })]);
  refresh();
  return { ok: true, message: "Default domain updated." };
}

export async function removeMarketingDomain(id: string): Promise<Result> {
  const c = await admin();
  if (!c) return { ok: false, error: "Only workspace admins can remove domains." };
  const r = await db.domain.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return missing("domain");
  await db.landingPage.updateMany({ where: { workspaceId: c.workspaceId, domainId: id }, data: { domainId: null } });
  await audit(c, "domain.removed", "Domain", id);
  refresh();
  return { ok: true, message: "Domain removed." };
}

export async function savePublishPreferences(fd: FormData): Promise<Result> {
  const c = await admin();
  if (!c) return { ok: false, error: "Only workspace admins can change publishing preferences." };
  const defaultVisibility = str(fd, "defaultVisibility", 20) === "unlisted" ? "unlisted" : "public";
  await setPref(c, "publishing", { defaultVisibility, analyticsByDefault: fd.get("analyticsByDefault") === "on" });
  refresh();
  return { ok: true, message: "Publishing preferences saved." };
}

/** Adds an unsubscribe suppression for addresses that belong to this workspace's contacts. */
export async function suppressContacts(fd: FormData): Promise<Result> {
  const c = await admin();
  if (!c) return { ok: false, error: "Only workspace admins can manage suppressions." };
  const emails = [...new Set(str(fd, "emails", 20000).split(/[\s,;]+/).map((e) => e.toLowerCase()).filter(isEmail))].slice(0, 500);
  if (!emails.length) return { ok: false, error: "Enter at least one email address." };
  const contacts = await db.contact.findMany({ where: { workspaceId: c.workspaceId, email: { in: emails, mode: "insensitive" } }, select: { email: true } });
  const allowed = [...new Set(contacts.map((x) => x.email!.toLowerCase()))];
  for (const email of allowed) await db.suppressionEntry.upsert({ where: { email_reason: { email, reason: "unsubscribe" } }, create: { email, reason: "unsubscribe", source: `workspace:${c.workspaceId}` }, update: {} });
  await audit(c, "email.suppressed", "SuppressionEntry", "manual", { count: allowed.length });
  refresh();
  return allowed.length ? { ok: true, message: `${allowed.length} contact${allowed.length === 1 ? "" : "s"} suppressed${allowed.length < emails.length ? `; ${emails.length - allowed.length} not in your contacts were skipped` : ""}.` } : { ok: false, error: "None of those addresses are contacts in this workspace." };
}

/* -------------------------------- Segments -------------------------------- */

function rulesFrom(fd: FormData) {
  return parseRules([0, 1, 2].map((i) => ({ field: str(fd, `field${i}`, 40), operator: str(fd, `operator${i}`, 20), value: str(fd, `value${i}`, 120) })));
}

export async function createSegment(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 120);
  if (name.length < 2) return { ok: false, error: "Enter a segment name." };
  const type = str(fd, "type", 20) === "static" ? "static" : "dynamic";
  let contactIds: string[] = [];
  let rules: ReturnType<typeof parseRules> = [];
  let memberCount = 0;
  if (type === "dynamic") {
    rules = rulesFrom(fd);
    if (!rules.length) return { ok: false, error: "Add at least one complete rule." };
    memberCount = await db.contact.count({ where: rulesToWhere(c.workspaceId, rules) as never });
  } else {
    const emails = [...new Set(str(fd, "emails", 50000).split(/[\s,;]+/).map((e) => e.toLowerCase()).filter(isEmail))].slice(0, 5000);
    if (!emails.length) return { ok: false, error: "Enter the email addresses of contacts to include." };
    const found = await db.contact.findMany({ where: { workspaceId: c.workspaceId, email: { in: emails, mode: "insensitive" } }, select: { id: true } });
    contactIds = found.map((x) => x.id);
    memberCount = contactIds.length;
    if (!memberCount) return { ok: false, error: "None of those addresses match contacts in this workspace." };
  }
  const row = await db.segment.create({ data: { workspaceId: c.workspaceId, name, description: str(fd, "description", 500) || null, type, source: type === "static" ? "import" : "crm", filterCriteria: { rules }, contactIds, memberCount, refreshedAt: new Date() } });
  await audit(c, "segment.created", "Segment", row.id, { type, memberCount });
  refresh();
  return { ok: true, message: `Segment created with ${memberCount.toLocaleString("en-US")} contacts.`, id: row.id };
}

/** CSV/lines of email[,first name,last name]; creates missing contacts, then a static list. */
export async function importAudience(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 120);
  if (name.length < 2) return { ok: false, error: "Enter a list name." };
  const rows = str(fd, "csv", 200000).split(/\r?\n/).map((l) => l.split(",").map((x) => x.trim())).filter((r) => isEmail((r[0] ?? "").toLowerCase())).slice(0, 5000);
  if (!rows.length) return { ok: false, error: "Paste one contact per line, starting with the email address." };
  const emails = [...new Set(rows.map((r) => r[0].toLowerCase()))];
  const existing = await db.contact.findMany({ where: { workspaceId: c.workspaceId, email: { in: emails, mode: "insensitive" } }, select: { id: true, email: true } });
  const have = new Set(existing.map((e) => e.email!.toLowerCase()));
  const toCreate = rows.filter((r, i, a) => !have.has(r[0].toLowerCase()) && a.findIndex((x) => x[0].toLowerCase() === r[0].toLowerCase()) === i);
  if (toCreate.length) await db.contact.createMany({ data: toCreate.map((r) => ({ workspaceId: c.workspaceId, email: r[0].toLowerCase(), firstName: r[1] || null, lastName: r[2] || null, name: [r[1], r[2]].filter(Boolean).join(" ") || null, status: "new" })) });
  const all = await db.contact.findMany({ where: { workspaceId: c.workspaceId, email: { in: emails, mode: "insensitive" } }, select: { id: true } });
  const row = await db.segment.create({ data: { workspaceId: c.workspaceId, name, type: "static", source: "import", filterCriteria: { rules: [] }, contactIds: all.map((x) => x.id), memberCount: all.length, refreshedAt: new Date() } });
  await audit(c, "segment.imported", "Segment", row.id, { contacts: all.length, created: toCreate.length });
  refresh();
  return { ok: true, message: `Imported ${all.length} contacts (${toCreate.length} new).`, id: row.id };
}

/** Recounts dynamic segments and drops deleted contacts from static lists. */
export async function syncSegments(): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const segs = await db.segment.findMany({ where: { workspaceId: c.workspaceId } });
  for (const s of segs) {
    if (s.type === "static") {
      const live = await db.contact.findMany({ where: { workspaceId: c.workspaceId, id: { in: s.contactIds } }, select: { id: true } });
      await db.segment.update({ where: { id: s.id }, data: { contactIds: live.map((x) => x.id), memberCount: live.length, refreshedAt: new Date() } });
    } else {
      const n = await db.contact.count({ where: rulesToWhere(c.workspaceId, parseRules((s.filterCriteria as { rules?: unknown })?.rules)) as never });
      await db.segment.update({ where: { id: s.id }, data: { memberCount: n, refreshedAt: new Date() } });
    }
  }
  refresh();
  return { ok: true, message: `${segs.length} segment${segs.length === 1 ? "" : "s"} synced with CRM contacts.` };
}

export async function setSegmentStatus(id: string, status: "active" | "paused"): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.segment.updateMany({ where: { id, workspaceId: c.workspaceId }, data: { status } });
  if (!r.count) return missing("segment");
  refresh();
  return { ok: true, message: status === "active" ? "Segment activated." : "Segment paused." };
}

export async function deleteSegment(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  if (await db.emailCampaign.findFirst({ where: { workspaceId: c.workspaceId, segmentId: id, status: { in: ["scheduled", "sending"] } } })) return { ok: false, error: "A scheduled or sending email uses this segment." };
  const r = await db.segment.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return missing("segment");
  await audit(c, "segment.deleted", "Segment", id);
  refresh();
  return { ok: true, message: "Segment deleted." };
}

/* ------------------------------ Lead scoring ------------------------------ */

export async function createScoringRule(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const signal = SCORING_SIGNALS.find(([k]) => k === str(fd, "signal", 40));
  if (!signal) return { ok: false, error: "Choose a signal." };
  const value = str(fd, "value", 120);
  if (signal[2] && !value) return { ok: false, error: "This signal needs a value." };
  const points = Number(str(fd, "points", 6));
  if (!Number.isInteger(points) || points === 0 || Math.abs(points) > 100) return { ok: false, error: "Points must be a whole number between -100 and 100 (not zero)." };
  const row = await db.scoringRule.create({ data: { workspaceId: c.workspaceId, name: str(fd, "name", 120) || signal[1], signal: signal[0], value: signal[2] ? value : null, points } });
  await audit(c, "scoring.rule_created", "ScoringRule", row.id);
  refresh();
  return { ok: true, message: "Scoring rule created. Recalculate to apply it." };
}

export async function toggleScoringRule(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const rule = await db.scoringRule.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!rule) return missing("rule");
  await db.scoringRule.update({ where: { id }, data: { active: !rule.active } });
  refresh();
  return { ok: true, message: rule.active ? "Rule disabled." : "Rule enabled." };
}

export async function deleteScoringRule(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.scoringRule.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return missing("rule");
  refresh();
  return { ok: true, message: "Rule deleted." };
}

export async function createScoreBand(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 60);
  const minScore = Number(str(fd, "minScore", 6));
  if (name.length < 2 || !Number.isInteger(minScore)) return { ok: false, error: "Enter a band name and a whole-number minimum score." };
  if (await db.scoreBand.findFirst({ where: { workspaceId: c.workspaceId, minScore } })) return { ok: false, error: "Another band already starts at that score." };
  await db.scoreBand.create({ data: { workspaceId: c.workspaceId, name, minScore } });
  refresh();
  return { ok: true, message: "Score band added." };
}

export async function deleteScoreBand(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.scoreBand.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return missing("band");
  refresh();
  return { ok: true, message: "Band removed." };
}

export async function recalculateScores(): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const rules = await db.scoringRule.findMany({ where: { workspaceId: c.workspaceId } });
  if (!rules.some((r) => r.active)) return { ok: false, error: "Create at least one active scoring rule first." };
  const run = await db.scoringRun.create({ data: { workspaceId: c.workspaceId, status: "running", rulesApplied: rules.filter((r) => r.active).length, createdById: c.userId } });
  const contacts = await db.contact.findMany({ where: { workspaceId: c.workspaceId }, select: { id: true, email: true, phone: true, companyName: true, companyId: true, jobTitle: true, status: true, tags: true, leadScore: true }, take: 5000, orderBy: { createdAt: "desc" } });
  const ids = contacts.map((x) => x.id);
  const [subs, deals, sends] = await Promise.all([
    db.formSubmission.groupBy({ by: ["contactId"], where: { contactId: { in: ids } }, _count: true }),
    db.deal.groupBy({ by: ["contactId"], where: { contactId: { in: ids }, status: "open" }, _count: true }),
    db.emailSend.findMany({ where: { contactId: { in: ids }, OR: [{ openedAt: { not: null } }, { clickedAt: { not: null } }] }, select: { contactId: true, openedAt: true, clickedAt: true } }),
  ]);
  const count = (list: { contactId: string | null; _count: number }[], id: string) => list.find((x) => x.contactId === id)?._count ?? 0;
  let changed = 0;
  for (const ct of contacts) {
    const mine = sends.filter((s) => s.contactId === ct.id);
    const score = scoreContact({ ...ct, submissions: count(subs, ct.id), openDeals: count(deals, ct.id), opened: mine.some((s) => s.openedAt), clicked: mine.some((s) => s.clickedAt) }, rules);
    if (score !== (ct.leadScore ?? 0)) {
      await db.contact.update({ where: { id: ct.id }, data: { leadScore: score } });
      changed++;
    }
  }
  await db.scoringRun.update({ where: { id: run.id }, data: { status: "completed", contactsScored: contacts.length, completedAt: new Date() } });
  await audit(c, "scoring.recalculated", "ScoringRun", run.id, { contacts: contacts.length, changed });
  refresh();
  return { ok: true, message: `Scored ${contacts.length.toLocaleString("en-US")} contacts; ${changed} changed.` };
}

/* ------------------------------- A/B testing ------------------------------ */

export async function createExperiment(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 120);
  if (name.length < 2) return { ok: false, error: "Enter a test name." };
  const control = str(fd, "landingPageId", 40);
  const variantB = str(fd, "variantPageId", 40);
  if (!control || !variantB || control === variantB) return { ok: false, error: "Choose two different pages for variants A and B." };
  const pages = await db.landingPage.findMany({ where: { workspaceId: c.workspaceId, id: { in: [control, variantB] } }, select: { id: true } });
  if (pages.length !== 2) return missing("landing page");
  const weightA = Math.round(Number(str(fd, "weightA", 3) || 50));
  if (!(weightA >= 1 && weightA <= 99)) return { ok: false, error: "Traffic for variant A must be between 1 and 99%." };
  const goal = str(fd, "goal", 40) || "form_submission";
  if (!inList(goal, EXPERIMENT_GOALS)) return { ok: false, error: "Choose a valid goal." };
  const minSampleSize = Math.max(20, Math.min(100000, Math.round(Number(str(fd, "minSampleSize", 6)) || 100)));
  const row = await db.experiment.create({ data: { workspaceId: c.workspaceId, name, landingPageId: control, goal, minSampleSize, variants: [{ key: "A", landingPageId: control, weight: weightA }, { key: "B", landingPageId: variantB, weight: 100 - weightA }] } });
  await audit(c, "experiment.created", "Experiment", row.id);
  refresh();
  return { ok: true, message: "A/B test created as a draft.", id: row.id };
}

export async function addExperimentVariant(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const ex = await db.experiment.findFirst({ where: { id: str(fd, "id", 40), workspaceId: c.workspaceId } });
  if (!ex) return missing("test");
  if (ex.status !== "draft") return { ok: false, error: "Variants can only be added to draft tests." };
  const variants = parseVariants(ex.variants);
  if (variants.length >= 4) return { ok: false, error: "A test can have up to four variants." };
  const pageId = str(fd, "landingPageId", 40);
  if (variants.some((v) => v.landingPageId === pageId) || !(await owned.page(c, pageId))) return { ok: false, error: "Choose a page that isn't already a variant." };
  const next = [...variants, { key: "", landingPageId: pageId, weight: 0 }];
  const even = Math.floor(100 / next.length);
  const balanced = parseVariants(next.map((v, i) => ({ ...v, weight: i === 0 ? 100 - even * (next.length - 1) : even })));
  await db.experiment.update({ where: { id: ex.id }, data: { variants: balanced } });
  refresh();
  return { ok: true, message: "Variant added and traffic rebalanced evenly." };
}

export async function updateAllocation(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const ex = await db.experiment.findFirst({ where: { id: str(fd, "id", 40), workspaceId: c.workspaceId } });
  if (!ex) return missing("test");
  const variants = parseVariants(ex.variants).map((v) => ({ ...v, weight: Math.round(Number(str(fd, `w_${v.key}`, 3))) }));
  if (variants.some((v) => !(v.weight >= 0 && v.weight <= 100)) || variants.reduce((n, v) => n + v.weight, 0) !== 100) return { ok: false, error: "Allocations must add up to 100%." };
  await db.experiment.update({ where: { id: ex.id }, data: { variants } });
  refresh();
  return { ok: true, message: "Traffic allocation saved." };
}

export async function setExperimentStatus(id: string, status: "running" | "paused" | "completed"): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const ex = await db.experiment.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!ex) return missing("test");
  if (status === "running") {
    const control = await db.landingPage.findFirst({ where: { id: ex.landingPageId, workspaceId: c.workspaceId } });
    if (control?.status !== "published") return { ok: false, error: "Publish variant A's page before starting the test." };
    if (await db.experiment.findFirst({ where: { workspaceId: c.workspaceId, landingPageId: ex.landingPageId, status: "running", NOT: { id } } })) return { ok: false, error: "Another test is already running on that page." };
  }
  await db.experiment.update({ where: { id }, data: { status, ...(status === "running" && !ex.startedAt ? { startedAt: new Date() } : {}), ...(status === "completed" ? { endedAt: new Date() } : {}) } });
  await audit(c, `experiment.${status}`, "Experiment", id);
  refresh();
  return { ok: true, message: status === "running" ? "Test started." : status === "paused" ? "Test paused." : "Test completed." };
}

export async function declareWinner(id: string, key: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const ex = await db.experiment.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!ex) return missing("test");
  if (!parseVariants(ex.variants).some((v) => v.key === key)) return { ok: false, error: "Choose a valid variant." };
  await db.experiment.update({ where: { id }, data: { winner: key, status: "completed", endedAt: ex.endedAt ?? new Date() } });
  await audit(c, "experiment.winner", "Experiment", id, { winner: key });
  refresh();
  return { ok: true, message: `Variant ${key} marked as the winner.` };
}

export async function deleteExperiment(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.experiment.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return missing("test");
  refresh();
  return { ok: true, message: "Test deleted." };
}

/* --------------------------- Conversion settings -------------------------- */

export type ConversionSettings = {
  primaryGoal?: { name: string; event: string; value: number | null };
  secondaryGoals?: { name: string; event: string }[];
  trackedEvents?: string[];
  attributionModel?: string;
  lookbackDays?: number;
  validation?: { ranAt: string; passed: boolean; issues: string[] };
};

export async function saveConversionSection(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const s = (await pref(c.workspaceId, "conversion")) as ConversionSettings;
  const section = str(fd, "section", 20);
  const events = new Set((await db.eventDefinition.findMany({ where: { workspaceId: c.workspaceId }, select: { name: true } })).map((e) => e.name));
  const knownEvent = (e: string) => ["form.submitted", "deal.won", "contact.created"].includes(e) || events.has(e);
  if (section === "primary" || section === "secondary") {
    const name = str(fd, "name", 80);
    const event = str(fd, "event", 80);
    if (name.length < 2 || !knownEvent(event)) return { ok: false, error: "Enter a goal name and choose a defined event." };
    if (section === "primary") {
      const value = str(fd, "value", 12) ? Number(str(fd, "value", 12)) : null;
      if (value != null && !(value >= 0)) return { ok: false, error: "Value must be a positive number." };
      s.primaryGoal = { name, event, value };
    } else {
      s.secondaryGoals = [...(s.secondaryGoals ?? []).filter((g) => g.event !== event), { name, event }].slice(0, 10);
    }
  } else if (section === "events") {
    const chosen = fd.getAll("events").map(String).filter(knownEvent);
    if (!chosen.length) return { ok: false, error: "Select at least one event to track." };
    s.trackedEvents = chosen.slice(0, 50);
  } else if (section === "attribution") {
    const model = str(fd, "model", 20);
    if (!inList(model, ATTRIBUTION_MODELS)) return { ok: false, error: "Choose an attribution model." };
    s.attributionModel = model;
  } else if (section === "lookback") {
    const days = str(fd, "days", 3);
    if (!inList(days, LOOKBACK_WINDOWS)) return { ok: false, error: "Choose a lookback window." };
    s.lookbackDays = Number(days);
  } else if (section === "removeSecondary") {
    s.secondaryGoals = (s.secondaryGoals ?? []).filter((g) => g.event !== str(fd, "event", 80));
  } else return { ok: false, error: "Unknown section." };
  await setPref(c, "conversion", s as Record<string, unknown>);
  await audit(c, "settings.conversion_updated", "WorkspacePreference", "conversion", { section });
  refresh();
  return { ok: true, message: "Conversion settings saved." };
}

export async function runConversionValidation(): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const s = (await pref(c.workspaceId, "conversion")) as ConversionSettings;
  const issues: string[] = [];
  if (!s.primaryGoal) issues.push("No primary conversion goal.");
  if (!s.trackedEvents?.length) issues.push("No tracked events selected.");
  if (!s.attributionModel) issues.push("No attribution model.");
  if (!s.lookbackDays) issues.push("No lookback window.");
  const [forms, pages] = await Promise.all([db.form.count({ where: { workspaceId: c.workspaceId, status: "active" } }), db.landingPage.count({ where: { workspaceId: c.workspaceId, status: "published", analyticsEnabled: true } })]);
  if (!forms && !pages) issues.push("No active forms or published pages with tracking are sending data.");
  if (s.primaryGoal?.event === "form.submitted" && !forms) issues.push("The primary goal uses form submissions but no form is active.");
  s.validation = { ranAt: new Date().toISOString(), passed: issues.length === 0, issues };
  await setPref(c, "conversion", s as Record<string, unknown>);
  refresh();
  return issues.length ? { ok: false, error: `${issues.length} issue${issues.length === 1 ? "" : "s"} found. See the Validation panel.` } : { ok: true, message: "Tracking setup is valid." };
}

export async function saveRetryPolicy(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const maxRetries = Math.round(Number(str(fd, "maxRetries", 2)));
  if (!(maxRetries >= 0 && maxRetries <= 5)) return { ok: false, error: "Retries must be between 0 and 5." };
  const r = await db.workflow.updateMany({ where: { workspaceId: c.workspaceId, ...(str(fd, "workflowId", 40) ? { id: str(fd, "workflowId", 40) } : {}) }, data: { maxRetries } });
  await setPref(c, "automation", { ...(await pref(c.workspaceId, "automation")), defaultMaxRetries: maxRetries });
  refresh();
  return { ok: true, message: `Retry policy applied to ${r.count} workflow${r.count === 1 ? "" : "s"}.` };
}
