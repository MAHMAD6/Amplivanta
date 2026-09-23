"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectiveAccess, hasPermission } from "@/lib/server/rbac";
import { AUDIENCE_SCOPES, COMMUNICATION_TYPES, TEMPLATE_CATEGORIES, processCommunication, queueCommunication, resolveAudience } from "@/lib/server/communications";

/**
 * Communications write paths. Every action re-checks the actor's effective
 * permission server-side and records a platform audit event; sending is a
 * consequential action, so it is separate from saving a draft.
 */

export type CommResult = { ok: true; message: string; id?: string } | { ok: false; error: string };

const denied = { ok: false as const, error: "You do not have permission to manage communications." };
const str = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);

async function actor() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return null;
  const access = await getEffectiveAccess(user.id, user.role ?? null);
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
  if (!isAdmin && !hasPermission(access, "communications.manage")) return null;
  return user as { id: string; role?: string };
}

async function audit(actorUserId: string, action: string, resourceId: string | undefined, metadata: Record<string, unknown>) {
  await prisma.platformAuditLog.create({ data: { actorUserId, action, resourceType: "Communication", resourceId, metadata: metadata as never } }).catch(() => null);
}

const refresh = () => revalidatePath("/admin/communications", "layout");

function parse(fd: FormData) {
  const type = str(fd, "type", 40);
  const audienceScope = str(fd, "audienceScope", 40);
  const subject = str(fd, "subject", 200);
  const body = String(fd.get("body") ?? "").trim().slice(0, 20000);
  const replyTo = str(fd, "replyTo", 200);
  const templateId = str(fd, "templateId", 40);
  const scheduledRaw = str(fd, "scheduledAt", 40);
  if (!COMMUNICATION_TYPES.some(([v]) => v === type)) return { error: "Choose a communication type." };
  if (!AUDIENCE_SCOPES.some(([v]) => v === audienceScope)) return { error: "Choose a recipient scope." };
  if (!subject) return { error: "Enter a subject." };
  if (!body) return { error: "Enter the message." };
  if (replyTo && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(replyTo)) return { error: "Enter a valid reply-to address." };
  const scheduledAt = scheduledRaw ? new Date(scheduledRaw) : null;
  if (scheduledAt && Number.isNaN(scheduledAt.getTime())) return { error: "Enter a valid schedule time." };
  if (scheduledAt && scheduledAt.getTime() < Date.now() - 60000) return { error: "Schedule a time in the future." };
  return {
    data: {
      type,
      audienceScope,
      audienceRef: str(fd, "audienceRef", 60) || null,
      subject,
      body,
      replyTo: replyTo || null,
      templateId: templateId || null,
      scheduledAt,
    },
  };
}

/** Saves a draft, or reschedules an existing one. */
export async function saveCommunication(fd: FormData): Promise<CommResult> {
  const a = await actor();
  if (!a) return denied;
  const v = parse(fd);
  if ("error" in v) return { ok: false, error: v.error! };
  const id = str(fd, "id", 40);
  const status = v.data!.scheduledAt ? "SCHEDULED" : "DRAFT";
  if (id) {
    const existing = await prisma.communication.findUnique({ where: { id }, select: { status: true } });
    if (!existing) return { ok: false, error: "That communication no longer exists." };
    if (!["DRAFT", "SCHEDULED"].includes(existing.status)) return { ok: false, error: "A communication that has been queued or sent cannot be edited." };
    await prisma.communication.update({ where: { id }, data: { ...v.data!, status } });
    await audit(a.id, "communication.updated", id, { status });
    refresh();
    return { ok: true, message: status === "SCHEDULED" ? "Schedule saved" : "Draft saved", id };
  }
  const row = await prisma.communication.create({ data: { ...v.data!, status, createdById: a.id } });
  await audit(a.id, "communication.created", row.id, { status, type: row.type, audienceScope: row.audienceScope });
  refresh();
  return { ok: true, message: status === "SCHEDULED" ? "Communication scheduled" : "Draft saved", id: row.id };
}

/** Snapshots the audience and sends now. */
export async function sendCommunication(fd: FormData): Promise<CommResult> {
  const a = await actor();
  if (!a) return denied;
  let id = str(fd, "id", 40);
  if (!id) {
    const saved = await saveCommunication(fd);
    if (!saved.ok) return saved;
    id = saved.id!;
  } else {
    const v = parse(fd);
    if ("error" in v) return { ok: false, error: v.error! };
    await prisma.communication.update({ where: { id }, data: { ...v.data!, scheduledAt: null } });
  }
  try {
    const { queued } = await queueCommunication(id);
    await audit(a.id, "communication.queued", id, { recipients: queued });
    const result = await processCommunication(id);
    await audit(a.id, "communication.sent", id, { sent: result.sent ?? 0, failed: result.failed ?? 0, skipped: result.skipped ?? 0, status: result.status });
    refresh();
    const sent = result.sent ?? 0;
    const skipped = result.skipped ?? 0;
    return {
      ok: true,
      id,
      message: sent > 0 ? `Sent to ${sent} of ${queued} recipients${skipped ? `, ${skipped} skipped` : ""}` : "Queued, but nothing could be delivered — check the email provider configuration",
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "The communication could not be sent." };
  }
}

/** Cancels a draft or scheduled communication. */
export async function cancelCommunication(id: string): Promise<CommResult> {
  const a = await actor();
  if (!a) return denied;
  const row = await prisma.communication.findUnique({ where: { id }, select: { status: true } });
  if (!row) return { ok: false, error: "That communication no longer exists." };
  if (!["DRAFT", "SCHEDULED", "QUEUED"].includes(row.status)) return { ok: false, error: "Only a draft, scheduled or queued communication can be cancelled." };
  await prisma.communication.update({ where: { id }, data: { status: "CANCELLED" } });
  await audit(a.id, "communication.cancelled", id, { from: row.status });
  refresh();
  return { ok: true, message: "Communication cancelled" };
}

/** How many recipients an audience resolves to right now. */
export async function previewAudience(scope: string, ref: string | null): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const a = await actor();
  if (!a) return { ok: false, error: denied.error };
  try {
    const audience = await resolveAudience(scope, ref);
    return { ok: true, count: audience.length };
  } catch {
    return { ok: false, error: "That audience could not be resolved." };
  }
}

/* ------------------------------------------------------------- templates */

export async function saveCommunicationTemplate(fd: FormData): Promise<CommResult> {
  const a = await actor();
  if (!a) return denied;
  const id = str(fd, "id", 40);
  const name = str(fd, "name", 120);
  const category = str(fd, "category", 40);
  const subject = str(fd, "subject", 200);
  const body = String(fd.get("body") ?? "").trim().slice(0, 20000);
  const status = str(fd, "status", 20) || "draft";
  if (!name) return { ok: false, error: "Enter a template name." };
  if (!TEMPLATE_CATEGORIES.some(([v]) => v === category)) return { ok: false, error: "Choose a category." };
  if (!subject || !body) return { ok: false, error: "Enter both a subject and a message." };
  if (!["draft", "active", "archived"].includes(status)) return { ok: false, error: "Choose a valid status." };
  const data = { name, category, subject, body, status, description: str(fd, "description", 300) || null };
  if (id) {
    const exists = await prisma.communicationTemplate.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return { ok: false, error: "That template no longer exists." };
    await prisma.communicationTemplate.update({ where: { id }, data });
    await audit(a.id, "communication_template.updated", id, { status });
    refresh();
    return { ok: true, message: "Template saved", id };
  }
  const row = await prisma.communicationTemplate.create({ data: { ...data, createdById: a.id } });
  await audit(a.id, "communication_template.created", row.id, { category, status });
  refresh();
  return { ok: true, message: "Template created", id: row.id };
}

export async function setTemplateStatus(id: string, status: string): Promise<CommResult> {
  const a = await actor();
  if (!a) return denied;
  if (!["draft", "active", "archived"].includes(status)) return { ok: false, error: "Choose a valid status." };
  const r = await prisma.communicationTemplate.updateMany({ where: { id }, data: { status } });
  if (!r.count) return { ok: false, error: "That template no longer exists." };
  await audit(a.id, "communication_template.status_changed", id, { status });
  refresh();
  return { ok: true, message: `Template ${status}` };
}

export async function deleteCommunicationTemplate(id: string): Promise<CommResult> {
  const a = await actor();
  if (!a) return denied;
  const used = await prisma.communication.count({ where: { templateId: id } });
  if (used > 0) return { ok: false, error: `That template is referenced by ${used} communication${used === 1 ? "" : "s"}. Archive it instead.` };
  const r = await prisma.communicationTemplate.deleteMany({ where: { id } });
  if (!r.count) return { ok: false, error: "That template no longer exists." };
  await audit(a.id, "communication_template.deleted", id, {});
  refresh();
  return { ok: true, message: "Template deleted" };
}
