"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { CAMPAIGN_STATUSES, NOTE_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES, WORKFLOW_STATUSES } from "@/lib/workspace/options";

/**
 * AI Workspace writes: campaigns, tasks, notes and automations. Workspace-
 * scoped, editors and above. Automations are created as drafts; activating
 * one is an explicit user action.
 */

type Result = { ok: true; message: string; id?: string } | { ok: false; error: string };
const denied = { ok: false as const, error: "You don't have permission to make changes in this workspace." };
const str = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);
const inList = (v: string, list: [string, string][]) => list.some(([k]) => k === v);

async function editor() {
  try {
    const ctx = await getSessionContext();
    return ctx.workspaceRole === "VIEWER" ? null : ctx;
  } catch {
    return null;
  }
}

async function audit(c: { workspaceId: string; userId: string }, action: string, resourceType: string, resourceId: string, metadata: Record<string, unknown> = {}) {
  await db.auditLog.create({ data: { workspaceId: c.workspaceId, actorUserId: c.userId, action, resourceType, resourceId, metadata: metadata as never } }).catch(() => null);
}

function parseDate(v: string): Date | null | "invalid" {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "invalid" : d;
}

export async function createCampaign(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 160);
  if (name.length < 2) return { ok: false, error: "Enter a campaign name." };
  const start = parseDate(str(fd, "startDate", 20));
  const end = parseDate(str(fd, "endDate", 20));
  if (start === "invalid" || end === "invalid") return { ok: false, error: "Enter valid dates." };
  if (start && end && end < start) return { ok: false, error: "The end date must be after the start date." };
  const budgetRaw = str(fd, "budget", 20);
  const budget = budgetRaw ? Number(budgetRaw) : null;
  if (budget != null && (!Number.isFinite(budget) || budget < 0)) return { ok: false, error: "Budget must be a positive number." };
  const row = await db.campaign.create({
    data: { workspaceId: c.workspaceId, name, objective: str(fd, "objective", 160) || null, description: str(fd, "description", 2000) || null, status: "planning", budget, startDate: start, endDate: end },
  });
  await audit(c, "campaign.created", "Campaign", row.id);
  revalidatePath("/app/workspace/plan");
  revalidatePath("/app/workspace");
  return { ok: true, message: "Campaign created.", id: row.id };
}

export async function setCampaignStatus(id: string, status: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  if (!inList(status, CAMPAIGN_STATUSES)) return { ok: false, error: "Choose a valid status." };
  const r = await db.campaign.updateMany({ where: { id, workspaceId: c.workspaceId }, data: { status } });
  if (!r.count) return { ok: false, error: "That campaign is not in this workspace." };
  await audit(c, "campaign.status_changed", "Campaign", id, { status });
  revalidatePath("/app/workspace/plan");
  return { ok: true, message: "Campaign updated." };
}

export async function createTask(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const title = str(fd, "title", 200);
  if (title.length < 2) return { ok: false, error: "Enter a task title." };
  const due = parseDate(str(fd, "dueDate", 20));
  if (due === "invalid") return { ok: false, error: "Enter a valid due date." };
  const assigneeId = str(fd, "assigneeId", 40);
  if (assigneeId && !(await db.membership.findFirst({ where: { workspaceId: c.workspaceId, userId: assigneeId }, select: { id: true } }))) {
    return { ok: false, error: "The assignee is not a member of this workspace." };
  }
  const priority = str(fd, "priority", 20);
  const row = await db.task.create({
    data: { workspaceId: c.workspaceId, title, description: str(fd, "description", 2000) || null, dueDate: due, priority: inList(priority, TASK_PRIORITIES) ? priority : "medium", assigneeId: assigneeId || null, status: "open" },
  });
  await audit(c, "task.created", "Task", row.id);
  revalidatePath("/app/workspace/tasks");
  return { ok: true, message: "Task created.", id: row.id };
}

export async function setTaskStatus(id: string, status: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  if (!inList(status, TASK_STATUSES)) return { ok: false, error: "Choose a valid status." };
  const r = await db.task.updateMany({ where: { id, workspaceId: c.workspaceId }, data: { status, isCompleted: status === "done" } });
  if (!r.count) return { ok: false, error: "That task is not in this workspace." };
  await audit(c, "task.status_changed", "Task", id, { status });
  revalidatePath("/app/workspace/tasks");
  return { ok: true, message: "Task updated." };
}

export async function saveNote(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const id = str(fd, "id", 40);
  const content = str(fd, "content", 20000);
  if (!content) return { ok: false, error: "Write something in the note." };
  const category = str(fd, "category", 20);
  const data = { title: str(fd, "title", 200) || null, content, category: inList(category, NOTE_CATEGORIES) ? category : "uncategorized" };
  if (id) {
    const r = await db.note.updateMany({ where: { id, workspaceId: c.workspaceId }, data });
    if (!r.count) return { ok: false, error: "That note is not in this workspace." };
  } else {
    const row = await db.note.create({ data: { ...data, workspaceId: c.workspaceId, createdById: c.userId } });
    await audit(c, "note.created", "Note", row.id);
  }
  revalidatePath("/app/workspace/notes");
  return { ok: true, message: id ? "Note saved." : "Note created." };
}

export async function toggleNotePin(id: string, pinned: boolean): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.note.updateMany({ where: { id, workspaceId: c.workspaceId }, data: { pinned } });
  if (!r.count) return { ok: false, error: "That note is not in this workspace." };
  revalidatePath("/app/workspace/notes");
  return { ok: true, message: pinned ? "Pinned." : "Unpinned." };
}

export async function deleteNote(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.note.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return { ok: false, error: "That note is not in this workspace." };
  revalidatePath("/app/workspace/notes");
  return { ok: true, message: "Note deleted." };
}

export async function createAutomation(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 160);
  if (name.length < 2) return { ok: false, error: "Enter an automation name." };
  const row = await db.workflow.create({ data: { workspaceId: c.workspaceId, name, description: str(fd, "description", 2000) || null, trigger: str(fd, "trigger", 80) || null, status: "draft" } });
  await audit(c, "automation.created", "Workflow", row.id);
  revalidatePath("/app/workspace/automations");
  return { ok: true, message: "Automation created as a draft.", id: row.id };
}

export async function setAutomationStatus(id: string, status: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  if (!inList(status, WORKFLOW_STATUSES)) return { ok: false, error: "Choose a valid status." };
  const wf = await db.workflow.findFirst({ where: { id, workspaceId: c.workspaceId }, include: { _count: { select: { nodes: true } } } });
  if (!wf) return { ok: false, error: "That automation is not in this workspace." };
  if (status === "active" && wf._count.nodes === 0) return { ok: false, error: "Add at least one step in the Workflow Builder before activating." };
  await db.workflow.update({ where: { id }, data: { status } });
  await audit(c, "automation.status_changed", "Workflow", id, { status });
  revalidatePath("/app/workspace/automations");
  return { ok: true, message: status === "active" ? "Automation activated." : "Automation updated." };
}
