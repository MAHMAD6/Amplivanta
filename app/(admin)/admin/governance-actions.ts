"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  AdminScopeLevel,
  DataRequestStatus,
  InvitationStatus,
  Prisma,
  SuspensionStatus,
} from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canGrant, getEffectiveAccess, hasPermission } from "@/lib/server/rbac";

/**
 * Platform governance write paths.
 *
 * Every action re-resolves the actor's effective permissions server-side,
 * requires a reason where the decision is consequential, and appends an audit
 * event. Grants are additionally checked against the granter's own permissions
 * so nobody can hand out authority they do not hold.
 */

export type GovResult = { ok: true; message: string } | { ok: false; error: string };

async function actor(permission: string) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!user) return null;
  const access = await getEffectiveAccess(user.id ?? null, user.role ?? null);
  // Platform governance is admin-console work; the console already gates entry,
  // but every action re-checks rather than trusting that.
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "OWNER";
  if (!isAdmin && !hasPermission(access, permission)) return null;
  return { user, access };
}

async function audit(
  actorUserId: string | null,
  action: string,
  resourceType: string,
  resourceId?: string,
  metadata?: Prisma.InputJsonValue,
  reason?: string,
) {
  try {
    await prisma.platformAuditLog.create({
      data: { actorUserId, action, resourceType, resourceId, metadata: metadata ?? {}, reason },
    });
  } catch {
    /* an authorized change is not rolled back because auditing failed */
  }
}

/* --------------------------------------------------------- roles + grants */

export async function upsertRoleDefinition(formData: FormData): Promise<GovResult> {
  const a = await actor("marketplace.admin.read");
  if (!a) return { ok: false, error: "You are not authorized to manage roles." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "A role name is required." };
  const key = (String(formData.get("key") ?? "").trim() || name)
    .toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const permissions = String(formData.get("permissions") ?? "")
    .split(/[\n,]/).map((x) => x.trim()).filter(Boolean);

  // No self-elevation: you cannot mint a role granting more than you hold.
  const check = canGrant(a.access, a.user.role ?? null, permissions);
  if (!check.ok) return { ok: false, error: check.error };

  try {
    const role = await prisma.$transaction(async (tx) => {
      const r = await tx.roleDefinition.upsert({
        where: { key },
        create: { key, name, description: String(formData.get("description") ?? "").trim() || null },
        update: { name, description: String(formData.get("description") ?? "").trim() || null },
      });
      await tx.rolePermissionGrant.deleteMany({ where: { roleDefinitionId: r.id } });
      if (permissions.length) {
        await tx.rolePermissionGrant.createMany({
          data: permissions.map((permissionKey) => ({ roleDefinitionId: r.id, permissionKey })),
          skipDuplicates: true,
        });
      }
      return r;
    });
    await audit(a.user.id ?? null, "role.upserted", "RoleDefinition", role.id, { key, permissions });
    revalidatePath("/admin/user-management/roles-and-permissions");
    return { ok: true, message: `Role "${name}" saved with ${permissions.length} permission(s).` };
  } catch {
    return { ok: false, error: "Could not save the role — the platform database was unreachable." };
  }
}

export async function grantAdminAssignment(formData: FormData): Promise<GovResult> {
  const a = await actor("marketplace.admin.read");
  if (!a) return { ok: false, error: "You are not authorized to grant access." };

  const userId = String(formData.get("userId") ?? "").trim();
  const roleDefinitionId = String(formData.get("roleDefinitionId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!userId) return { ok: false, error: "Choose the user to grant access to." };
  if (!roleDefinitionId) return { ok: false, error: "Choose a role." };
  if (!reason) return { ok: false, error: "A reason is required." };

  const scopeLevel = String(formData.get("scopeLevel") ?? "ORGANIZATION") as AdminScopeLevel;
  if (!Object.values(AdminScopeLevel).includes(scopeLevel)) {
    return { ok: false, error: "Choose a valid scope." };
  }
  if (userId === a.user.id) return { ok: false, error: "You cannot grant access to yourself." };

  try {
    const role = await prisma.roleDefinition.findUnique({
      where: { id: roleDefinitionId },
      include: { permissions: true },
    });
    if (!role) return { ok: false, error: "That role does not exist." };

    // Escalation guard: only grant what the granter already holds.
    const check = canGrant(a.access, a.user.role ?? null, role.permissions.filter((p) => p.allowed).map((p) => p.permissionKey));
    if (!check.ok) return { ok: false, error: check.error };

    const rawExpiry = String(formData.get("expiresAt") ?? "").trim();
    const assignment = await prisma.adminAssignment.create({
      data: {
        userId,
        roleDefinitionId,
        scopeLevel,
        organizationId: String(formData.get("organizationId") ?? "").trim() || null,
        workspaceId: String(formData.get("workspaceId") ?? "").trim() || null,
        moduleKey: String(formData.get("moduleKey") ?? "").trim() || null,
        grantedByUserId: a.user.id ?? null,
        expiresAt: rawExpiry ? new Date(rawExpiry) : null,
      },
    });
    await audit(a.user.id ?? null, "access.granted", "AdminAssignment", assignment.id, { userId, roleDefinitionId, scopeLevel }, reason);
    revalidatePath("/admin/user-management/access-assignments");
    revalidatePath("/admin/user-management/sub-admins");
    return { ok: true, message: `Granted ${role.name} at ${scopeLevel.toLowerCase()} scope.` };
  } catch {
    return { ok: false, error: "Could not grant access — the platform database was unreachable." };
  }
}

export async function revokeAdminAssignment(assignmentId: string, reason: string): Promise<GovResult> {
  const a = await actor("marketplace.admin.read");
  if (!a) return { ok: false, error: "You are not authorized to revoke access." };
  if (!reason.trim()) return { ok: false, error: "A reason is required." };
  try {
    await prisma.adminAssignment.delete({ where: { id: assignmentId } });
    await audit(a.user.id ?? null, "access.revoked", "AdminAssignment", assignmentId, {}, reason);
    revalidatePath("/admin/user-management/access-assignments");
    return { ok: true, message: "Access revoked." };
  } catch {
    return { ok: false, error: "Could not revoke access — the platform database was unreachable." };
  }
}

/* ------------------------------------------------------------- invitations */

export async function createInvitation(formData: FormData): Promise<GovResult> {
  const a = await actor("marketplace.admin.read");
  if (!a) return { ok: false, error: "You are not authorized to invite users." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, error: "Enter a valid email address." };
  const scopeLevel = String(formData.get("scopeLevel") ?? "ORGANIZATION") as AdminScopeLevel;

  try {
    const days = Number(String(formData.get("expiresInDays") ?? "14")) || 14;
    const inv = await prisma.invitation.create({
      data: {
        email,
        roleDefinitionId: String(formData.get("roleDefinitionId") ?? "").trim() || null,
        scopeLevel,
        organizationId: String(formData.get("organizationId") ?? "").trim() || null,
        token: randomBytes(24).toString("hex"),
        invitedByUserId: a.user.id ?? null,
        expiresAt: new Date(Date.now() + days * 86_400_000),
      },
    });
    await audit(a.user.id ?? null, "invitation.created", "Invitation", inv.id, { email, scopeLevel });
    revalidatePath("/admin/user-management/invitations");
    return {
      ok: true,
      message: `Invitation recorded for ${email}. Delivery happens once an email provider is connected.`,
    };
  } catch {
    return { ok: false, error: "Could not create the invitation — the platform database was unreachable." };
  }
}

export async function revokeInvitation(invitationId: string): Promise<GovResult> {
  const a = await actor("marketplace.admin.read");
  if (!a) return { ok: false, error: "You are not authorized to revoke invitations." };
  try {
    await prisma.invitation.update({ where: { id: invitationId }, data: { status: InvitationStatus.REVOKED } });
    await audit(a.user.id ?? null, "invitation.revoked", "Invitation", invitationId);
    revalidatePath("/admin/user-management/invitations");
    return { ok: true, message: "Invitation revoked." };
  } catch {
    return { ok: false, error: "Could not revoke the invitation." };
  }
}

/* -------------------------------------------------- sessions + suspensions */

export async function revokeSession(sessionId: string, reason: string): Promise<GovResult> {
  const a = await actor("marketplace.admin.read");
  if (!a) return { ok: false, error: "You are not authorized to revoke sessions." };
  if (!reason.trim()) return { ok: false, error: "A reason is required." };
  try {
    await prisma.userSession.update({ where: { id: sessionId }, data: { revokedAt: new Date() } });
    await audit(a.user.id ?? null, "session.revoked", "UserSession", sessionId, {}, reason);
    revalidatePath("/admin/user-management/sessions-devices");
    return { ok: true, message: "Session revoked." };
  } catch {
    return { ok: false, error: "Could not revoke the session." };
  }
}

export async function suspendUser(userId: string, reason: string): Promise<GovResult> {
  const a = await actor("marketplace.admin.read");
  if (!a) return { ok: false, error: "You are not authorized to suspend accounts." };
  if (!reason.trim()) return { ok: false, error: "A reason is required." };
  if (userId === a.user.id) return { ok: false, error: "You cannot suspend your own account." };
  try {
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, name: true } });
    if (!target) return { ok: false, error: "User not found." };
    if (target.role === "SUPER_ADMIN" && a.user.role !== "SUPER_ADMIN") {
      return { ok: false, error: "Only a super admin can suspend another super admin." };
    }
    const s = await prisma.accessSuspension.create({
      data: { userId, reason, suspendedByUserId: a.user.id ?? null },
    });
    await audit(a.user.id ?? null, "access.suspended", "AccessSuspension", s.id, { userId }, reason);
    revalidatePath("/admin/user-management/suspended-access");
    return { ok: true, message: `${target.name} suspended.` };
  } catch {
    return { ok: false, error: "Could not suspend the account." };
  }
}

export async function liftSuspension(suspensionId: string, reason: string): Promise<GovResult> {
  const a = await actor("marketplace.admin.read");
  if (!a) return { ok: false, error: "You are not authorized to lift suspensions." };
  if (!reason.trim()) return { ok: false, error: "A reason is required." };
  try {
    await prisma.accessSuspension.update({
      where: { id: suspensionId },
      data: { status: SuspensionStatus.LIFTED, liftedAt: new Date() },
    });
    await audit(a.user.id ?? null, "access.suspension_lifted", "AccessSuspension", suspensionId, {}, reason);
    revalidatePath("/admin/user-management/suspended-access");
    return { ok: true, message: "Suspension lifted." };
  } catch {
    return { ok: false, error: "Could not lift the suspension." };
  }
}

/* --------------------------------------------------------------- DSAR ---- */

export async function decideDataRequest(requestId: string, status: string, notes: string): Promise<GovResult> {
  const a = await actor("marketplace.admin.read");
  if (!a) return { ok: false, error: "You are not authorized to process data requests." };
  if (!Object.values(DataRequestStatus).includes(status as DataRequestStatus)) {
    return { ok: false, error: "Choose a valid status." };
  }
  try {
    const done = status === DataRequestStatus.COMPLETED || status === DataRequestStatus.REJECTED;
    await prisma.dataRequest.update({
      where: { id: requestId },
      data: { status: status as DataRequestStatus, notes: notes || null, completedAt: done ? new Date() : null },
    });
    await audit(a.user.id ?? null, "dsar.updated", "DataRequest", requestId, { status }, notes);
    revalidatePath("/admin/security-compliance/data-requests-dsar");
    return { ok: true, message: `Request moved to ${status.toLowerCase().replace(/_/g, " ")}.` };
  } catch {
    return { ok: false, error: "Could not update the request." };
  }
}

/* ------------------------------------------------- announcements + tickets */

export async function createAnnouncement(formData: FormData): Promise<GovResult> {
  const a = await actor("marketplace.admin.read");
  if (!a) return { ok: false, error: "You are not authorized to publish announcements." };
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return { ok: false, error: "A title and body are required." };
  try {
    const publish = String(formData.get("publish") ?? "") === "on";
    const rec = await prisma.announcement.create({
      data: {
        title,
        body,
        audience: String(formData.get("audience") ?? "all"),
        publishedAt: publish ? new Date() : null,
      },
    });
    await audit(a.user.id ?? null, "announcement.created", "Announcement", rec.id, { title, published: publish });
    revalidatePath("/admin/announcements/announcements");
    return { ok: true, message: publish ? `"${title}" published.` : `"${title}" saved as a draft.` };
  } catch {
    return { ok: false, error: "Could not save the announcement." };
  }
}

export async function setTicketStatus(ticketId: string, status: string, note: string): Promise<GovResult> {
  const a = await actor("marketplace.admin.read");
  if (!a) return { ok: false, error: "You are not authorized to manage tickets." };
  const allowed = ["OPEN", "PENDING", "RESOLVED", "CLOSED"];
  if (!allowed.includes(status)) return { ok: false, error: "Choose a valid status." };
  try {
    await prisma.$transaction(async (tx) => {
      await tx.supportTicket.update({
        where: { id: ticketId },
        data: { status: status as never, assignedToUserId: a.user.id ?? null },
      });
      if (note.trim()) {
        await tx.ticketMessage.create({
          data: { ticketId, authorEmail: a.user.email ?? null, body: note.trim(), isInternal: true },
        });
      }
    });
    await audit(a.user.id ?? null, "ticket.updated", "SupportTicket", ticketId, { status }, note || undefined);
    revalidatePath("/admin/support-tickets/support-tickets");
    return { ok: true, message: `Ticket moved to ${status.toLowerCase()}.` };
  } catch {
    return { ok: false, error: "Could not update the ticket." };
  }
}

/* ---------------------------------------------------------------- loaders */

export async function loadGovernanceOptions() {
  try {
    const [roles, users] = await Promise.all([
      prisma.roleDefinition.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { permissions: true, assignments: true } } },
      }),
      prisma.user.findMany({ orderBy: { name: "asc" }, take: 200, select: { id: true, name: true, email: true } }),
    ]);
    return {
      connected: true,
      roles: roles.map((r) => ({
        id: r.id,
        key: r.key,
        name: r.name,
        description: r.description,
        permissions: r._count.permissions,
        assignments: r._count.assignments,
      })),
      users,
    };
  } catch {
    return { connected: false, roles: [], users: [] };
  }
}
