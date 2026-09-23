import "server-only";
import { prisma } from "@/lib/prisma";
import { emailProvider, sendEmail } from "@/lib/email";

/**
 * Platform communications: audience snapshot, queue, provider send and
 * delivery history.
 *
 * Rules from the Super Admin guide:
 *  - The audience is snapshotted before sending, never re-queried mid-send.
 *  - Marketing-style messages honour suppression; administrative and security
 *    messages are transactional and are not held back by marketing opt-outs.
 *  - A recipient is only ever reported as SENT when the provider accepted it.
 *    Delivered, opened and clicked are not claimed without provider events.
 */

export const COMMUNICATION_TYPES: [value: string, label: string, transactional: boolean][] = [
  ["administrative", "Administrative", true],
  ["announcement", "Announcement", false],
  ["product_update", "Product update", false],
  ["support", "Support", true],
];

export const AUDIENCE_SCOPES: [value: string, label: string][] = [
  ["all_users", "All users"],
  ["admins", "Admins"],
  ["sub_admins", "Sub-admins"],
  ["workspace", "One workspace"],
  ["role", "One platform role"],
];

export const COMMUNICATION_STATUSES = ["DRAFT", "SCHEDULED", "QUEUED", "SENDING", "SENT", "PARTIAL", "FAILED", "CANCELLED"] as const;

export const TEMPLATE_CATEGORIES: [value: string, label: string, description: string][] = [
  ["administrative", "Administrative", "Templates for user management, account access, and system notifications."],
  ["announcement", "Announcements", "Templates for product updates, feature releases, and general announcements."],
  ["support", "Support", "Templates for customer support, help resources, and user assistance communications."],
];

export const isTransactional = (type: string) => COMMUNICATION_TYPES.find(([v]) => v === type)?.[2] ?? true;

export type AudienceMember = { userId: string | null; email: string; name: string | null };

/** Resolves the audience to a concrete recipient list at this moment in time. */
export async function resolveAudience(scope: string, ref: string | null): Promise<AudienceMember[]> {
  const select = { id: true, email: true, name: true };
  let users: { id: string; email: string; name: string | null }[] = [];
  switch (scope) {
    case "admins":
      users = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } }, select });
      break;
    case "sub_admins":
      users = await prisma.user.findMany({ where: { role: "EDITOR", adminAssignments: { some: {} } }, select });
      break;
    case "workspace":
      if (!ref) return [];
      users = await prisma.user.findMany({ where: { memberships: { some: { workspaceId: ref } } }, select });
      break;
    case "role":
      if (!ref) return [];
      users = await prisma.user.findMany({ where: { role: ref as never }, select });
      break;
    default:
      users = await prisma.user.findMany({ select });
  }
  const seen = new Set<string>();
  return users
    .filter((u) => u.email && !seen.has(u.email.toLowerCase()) && seen.add(u.email.toLowerCase()))
    .map((u) => ({ userId: u.id, email: u.email.toLowerCase(), name: u.name }));
}

/** Snapshots the audience onto the communication and marks it queued. */
export async function queueCommunication(communicationId: string): Promise<{ queued: number }> {
  const c = await prisma.communication.findUnique({ where: { id: communicationId } });
  if (!c) throw new Error("That communication no longer exists.");
  if (!["DRAFT", "SCHEDULED"].includes(c.status)) throw new Error("Only a draft or scheduled communication can be queued.");
  const audience = await resolveAudience(c.audienceScope, c.audienceRef);
  if (audience.length === 0) throw new Error("That audience has no recipients.");

  await prisma.$transaction([
    prisma.communicationRecipient.deleteMany({ where: { communicationId } }),
    prisma.communicationRecipient.createMany({ data: audience.map((a) => ({ communicationId, userId: a.userId, email: a.email, name: a.name })) }),
    prisma.communication.update({ where: { id: communicationId }, data: { status: "QUEUED", recipientCount: audience.length, sentCount: 0, failedCount: 0, skippedCount: 0 } }),
  ]);
  return { queued: audience.length };
}

/**
 * Sends the queued recipients in batches and records each outcome. Safe to run
 * repeatedly: only recipients still QUEUED are attempted.
 */
export async function processCommunication(communicationId: string, limit = 200) {
  const c = await prisma.communication.findUnique({ where: { id: communicationId } });
  if (!c || !["QUEUED", "SENDING"].includes(c.status)) return { processed: 0 };
  await prisma.communication.update({ where: { id: communicationId }, data: { status: "SENDING" } });

  const batch = await prisma.communicationRecipient.findMany({ where: { communicationId, status: "QUEUED" }, take: limit });
  const category = isTransactional(c.type) ? "transactional" : "marketing";
  for (const r of batch) {
    try {
      const result = await sendEmail({
        to: r.email,
        subject: c.subject,
        category,
        html: renderCommunicationHtml(c.subject, c.body),
        text: c.body,
        replyTo: c.replyTo ?? undefined,
      });
      await prisma.communicationRecipient.update({
        where: { id: r.id },
        data: result.sent
          ? { status: "SENT", sentAt: new Date() }
          : { status: result.reason === "suppressed" ? "SUPPRESSED" : "NOT_SENT", error: result.reason },
      });
    } catch (e) {
      await prisma.communicationRecipient.update({ where: { id: r.id }, data: { status: "FAILED", error: e instanceof Error ? e.message.slice(0, 300) : "Send failed" } });
    }
  }

  const [sent, failed, skipped, left] = await Promise.all([
    prisma.communicationRecipient.count({ where: { communicationId, status: "SENT" } }),
    prisma.communicationRecipient.count({ where: { communicationId, status: "FAILED" } }),
    prisma.communicationRecipient.count({ where: { communicationId, status: { in: ["SUPPRESSED", "NOT_SENT"] } } }),
    prisma.communicationRecipient.count({ where: { communicationId, status: "QUEUED" } }),
  ]);
  const status = left > 0 ? "SENDING" : sent === 0 ? "FAILED" : failed + skipped > 0 ? "PARTIAL" : "SENT";
  await prisma.communication.update({
    where: { id: communicationId },
    data: { sentCount: sent, failedCount: failed, skippedCount: skipped, status, sentAt: left === 0 ? new Date() : null },
  });
  return { processed: batch.length, sent, failed, skipped, remaining: left, status };
}

/** Sends scheduled communications that are due; called by the platform scheduler. */
export async function processDueCommunications(limit = 5) {
  const due = await prisma.communication.findMany({ where: { status: "SCHEDULED", scheduledAt: { lte: new Date() } }, select: { id: true }, take: limit });
  for (const d of due) {
    await queueCommunication(d.id).catch(() => null);
    await processCommunication(d.id).catch(() => null);
  }
  const sending = await prisma.communication.findMany({ where: { status: { in: ["QUEUED", "SENDING"] } }, select: { id: true }, take: limit });
  for (const s of sending) await processCommunication(s.id).catch(() => null);
  return { due: due.length, inFlight: sending.length };
}

export function renderCommunicationHtml(subject: string, body: string) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;font-size:14px;line-height:1.6">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0B2350">
  <h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(subject)}</h1>
  ${paragraphs}
  <p style="font-size:12px;color:#6b7280;margin-top:24px">Amplivanta Inc.</p>
</div>`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Provider readiness, so the UI can say plainly when nothing can be delivered. */
export const communicationsReady = () => Boolean(emailProvider());
