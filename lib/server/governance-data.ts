import "server-only";
import { prisma } from "@/lib/prisma";

/** Row loaders for the governance panels in the admin console. */

const date = (d: Date | null | undefined) =>
  d ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d) : null;

export async function loadAssignments() {
  try {
    const rows = await prisma.adminAssignment.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: true, roleDefinition: true, organization: true },
    });
    return {
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        user: r.user?.name ?? null,
        role: r.roleDefinition?.name ?? null,
        scope: r.scopeLevel as string,
        where: r.organization?.name ?? r.workspaceId ?? r.moduleKey ?? null,
        expires: date(r.expiresAt),
      })),
    };
  } catch {
    return { connected: false, rows: [] };
  }
}

export async function loadInvitations() {
  try {
    const rows = await prisma.invitation.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    return {
      connected: true,
      rows: rows.map((r) => ({ id: r.id, email: r.email, status: r.status as string, expires: date(r.expiresAt) })),
    };
  } catch {
    return { connected: false, rows: [] };
  }
}

export async function loadSessions() {
  try {
    const rows = await prisma.userSession.findMany({
      where: { revokedAt: null },
      orderBy: { lastActiveAt: "desc" },
      take: 200,
      include: { user: true },
    });
    return {
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        user: r.user?.name ?? null,
        device: [r.device, r.browser, r.os].filter(Boolean).join(" · ") || null,
        ip: r.ipAddress,
        lastActive: date(r.lastActiveAt),
      })),
    };
  } catch {
    return { connected: false, rows: [] };
  }
}

export async function loadSuspensions() {
  try {
    const rows = await prisma.accessSuspension.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: true },
    });
    return {
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        user: r.user?.name ?? null,
        reason: r.reason,
        status: r.status as string,
        since: date(r.createdAt),
      })),
    };
  } catch {
    return { connected: false, rows: [] };
  }
}

export async function loadDataRequests() {
  try {
    const rows = await prisma.dataRequest.findMany({ orderBy: { requestedAt: "desc" }, take: 200 });
    return {
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        subject: r.subjectEmail,
        type: r.type as string,
        status: r.status as string,
        requested: date(r.requestedAt),
      })),
    };
  } catch {
    return { connected: false, rows: [] };
  }
}

export async function loadAnnouncements() {
  try {
    const rows = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    return {
      connected: true,
      rows: rows.map((r) => ({ id: r.id, title: r.title, audience: r.audience, published: date(r.publishedAt) })),
    };
  } catch {
    return { connected: false, rows: [] };
  }
}

export async function loadTickets() {
  try {
    const rows = await prisma.supportTicket.findMany({ orderBy: { updatedAt: "desc" }, take: 200 });
    return {
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        subject: r.subject,
        requester: r.requesterEmail,
        status: r.status as string,
        priority: r.priority,
        updated: date(r.updatedAt),
      })),
    };
  } catch {
    return { connected: false, rows: [] };
  }
}
