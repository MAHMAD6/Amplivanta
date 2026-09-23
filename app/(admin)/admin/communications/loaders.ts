import "server-only";
import { prisma } from "@/lib/prisma";
import { AUDIENCE_SCOPES } from "@/lib/server/communications";

/** Reads for the Communications screens. Every list reports whether the database answered. */

const dt = (d: Date | null) => (d ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(d) : null);

export function audienceLabel(scope: string, ref: string | null, workspaces: { id: string; name: string }[]) {
  const base = AUDIENCE_SCOPES.find(([v]) => v === scope)?.[1] ?? scope;
  if (scope === "workspace") return `${base}: ${workspaces.find((w) => w.id === ref)?.name ?? ref ?? "—"}`;
  if (scope === "role") return `${base}: ${(ref ?? "").replace(/_/g, " ")}`;
  return base;
}

export async function loadCommunications(take = 50) {
  try {
    const [rows, workspaces] = await Promise.all([
      prisma.communication.findMany({ orderBy: { createdAt: "desc" }, take }),
      prisma.workspace.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" }, take: 200 }),
    ]);
    return {
      connected: true,
      workspaces,
      rows: rows.map((r) => ({
        id: r.id,
        subject: r.subject,
        body: r.body,
        type: r.type,
        audienceScope: r.audienceScope,
        audienceLabel: audienceLabel(r.audienceScope, r.audienceRef, workspaces),
        status: r.status,
        recipientCount: r.recipientCount,
        sentCount: r.sentCount,
        failedCount: r.failedCount,
        skippedCount: r.skippedCount,
        scheduledAt: dt(r.scheduledAt),
        sentAt: dt(r.sentAt),
        createdAt: dt(r.createdAt) ?? "",
      })),
    };
  } catch {
    return { connected: false, workspaces: [] as { id: string; name: string }[], rows: [] };
  }
}

export async function loadCommunicationTemplates() {
  try {
    const rows = await prisma.communicationTemplate.findMany({ orderBy: { updatedAt: "desc" }, take: 200 });
    return {
      connected: true,
      rows: rows.map((t) => ({ id: t.id, name: t.name, category: t.category, subject: t.subject, body: t.body, status: t.status, updatedAt: dt(t.updatedAt) ?? "" })),
    };
  } catch {
    return { connected: false, rows: [] };
  }
}

export async function loadRecipients(communicationId: string) {
  try {
    const rows = await prisma.communicationRecipient.findMany({ where: { communicationId }, orderBy: [{ status: "asc" }, { email: "asc" }], take: 500 });
    return rows.map((r) => ({ email: r.email, name: r.name, status: r.status, error: r.error, sentAt: dt(r.sentAt) }));
  } catch {
    return [];
  }
}
