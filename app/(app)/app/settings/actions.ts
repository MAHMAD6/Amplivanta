"use server";

import { randomBytes } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";
import { notify } from "@/lib/notifications";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { parsePreferences, PREFERENCE_SCOPES } from "@/lib/preferences";

/**
 * Workspace administration writes. Every action requires a workspace admin,
 * is scoped to the caller's workspace, and records an audit event.
 */

type Result = { ok: true; message: string } | { ok: false; error: string };

async function admin() {
  try {
    const ctx = await getSessionContext();
    return ["ADMIN", "OWNER", "SUPER_ADMIN"].includes(ctx.workspaceRole) ? ctx : null;
  } catch {
    return null;
  }
}

async function audit(ctx: { workspaceId: string; userId: string }, action: string, resourceType: string, resourceId: string | null, metadata: Record<string, unknown> = {}) {
  await db.auditLog
    .create({ data: { workspaceId: ctx.workspaceId, actorUserId: ctx.userId, action, resourceType, resourceId, metadata: metadata as never } })
    .catch(() => null);
}

export async function saveGeneralSettings(fd: FormData): Promise<Result> {
  const ctx = await admin();
  if (!ctx) return { ok: false, error: "Only workspace admins can change these settings." };
  const name = String(fd.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 160) return { ok: false, error: "Enter a workspace name (2-160 characters)." };
  const input: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") input[k] = v;
  const values = parsePreferences(PREFERENCE_SCOPES["workspace.general"], input);
  try {
    await db.$transaction([
      db.workspace.update({ where: { id: ctx.workspaceId }, data: { name } }),
      db.workspacePreference.upsert({
        where: { workspaceId_scope: { workspaceId: ctx.workspaceId, scope: "workspace.general" } },
        create: { workspaceId: ctx.workspaceId, scope: "workspace.general", values, updatedByUserId: ctx.userId },
        update: { values, updatedByUserId: ctx.userId },
      }),
    ]);
    await audit(ctx, "settings.updated", "WorkspacePreference", null, { scope: "workspace.general" });
    revalidatePath("/app/settings");
    return { ok: true, message: "Settings saved." };
  } catch {
    return { ok: false, error: "Settings could not be saved right now." };
  }
}

const ASSIGNABLE: Role[] = ["OWNER", "ADMIN", "EDITOR", "VIEWER"];

/** Changes a member's workspace role. A workspace always keeps at least one owner. */
export async function changeMemberRole(membershipId: string, role: string): Promise<Result> {
  const ctx = await admin();
  if (!ctx) return { ok: false, error: "Only workspace admins can change roles." };
  if (!ASSIGNABLE.includes(role as Role)) return { ok: false, error: "Choose a valid role." };
  if (role === "OWNER" && !["OWNER", "SUPER_ADMIN"].includes(ctx.workspaceRole)) return { ok: false, error: "Only an owner can grant ownership." };
  const member = await db.membership.findFirst({ where: { id: membershipId, workspaceId: ctx.workspaceId } });
  if (!member) return { ok: false, error: "That member is not in this workspace." };
  if (member.role === "OWNER" && role !== "OWNER") {
    const owners = await db.membership.count({ where: { workspaceId: ctx.workspaceId, role: "OWNER" } });
    if (owners <= 1) return { ok: false, error: "A workspace needs at least one owner." };
  }
  await db.membership.update({ where: { id: member.id }, data: { role: role as Role } });
  await audit(ctx, "member.role_changed", "Membership", member.id, { from: member.role, to: role });
  await notify({ workspaceId: ctx.workspaceId, userId: member.userId, category: "security", title: "Your workspace role changed", body: `Your role is now ${role.toLowerCase().replace(/_/g, " ")}.`, link: "/app/settings/users", resourceType: "Membership", resourceId: member.id });
  revalidatePath("/app/settings/users");
  return { ok: true, message: "Role updated." };
}

export async function removeMember(membershipId: string): Promise<Result> {
  const ctx = await admin();
  if (!ctx) return { ok: false, error: "Only workspace admins can remove members." };
  const member = await db.membership.findFirst({ where: { id: membershipId, workspaceId: ctx.workspaceId } });
  if (!member) return { ok: false, error: "That member is not in this workspace." };
  if (member.userId === ctx.userId) return { ok: false, error: "You can't remove yourself." };
  if (member.role === "OWNER") {
    const owners = await db.membership.count({ where: { workspaceId: ctx.workspaceId, role: "OWNER" } });
    if (owners <= 1) return { ok: false, error: "A workspace needs at least one owner." };
  }
  await db.membership.delete({ where: { id: member.id } });
  await audit(ctx, "member.removed", "Membership", member.id, { role: member.role });
  revalidatePath("/app/settings/users");
  return { ok: true, message: "Member removed." };
}

const DOMAIN_RE = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const verificationRecordName = (domain: string) => `_amplivanta.${domain}`;

export async function addDomain(fd: FormData): Promise<Result> {
  const ctx = await admin();
  if (!ctx) return { ok: false, error: "Only workspace admins can add domains." };
  const domain = String(fd.get("domain") ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  if (!DOMAIN_RE.test(domain)) return { ok: false, error: "Enter a domain such as example.com." };
  const taken = await db.domain.findUnique({ where: { domain } });
  if (taken) return { ok: false, error: taken.workspaceId === ctx.workspaceId ? "That domain is already added." : "That domain is registered to another workspace." };
  const row = await db.domain.create({ data: { workspaceId: ctx.workspaceId, domain, verificationToken: `amplivanta-verify=${randomBytes(16).toString("hex")}` } });
  await audit(ctx, "domain.added", "Domain", row.id, { domain });
  revalidatePath("/app/settings/api-domains");
  return { ok: true, message: "Domain added. Create the TXT record, then verify." };
}

/** Verifies ownership by looking up the TXT record — never by trusting the client. */
export async function verifyDomain(id: string): Promise<Result> {
  const ctx = await admin();
  if (!ctx) return { ok: false, error: "Only workspace admins can verify domains." };
  const row = await db.domain.findFirst({ where: { id, workspaceId: ctx.workspaceId } });
  if (!row || !row.verificationToken) return { ok: false, error: "That domain is not in this workspace." };
  let records: string[] = [];
  try {
    records = (await resolveTxt(verificationRecordName(row.domain))).map((parts) => parts.join(""));
  } catch {
    records = [];
  }
  if (!records.includes(row.verificationToken)) {
    return { ok: false, error: "The TXT record was not found yet. DNS changes can take time to propagate." };
  }
  await db.domain.update({ where: { id: row.id }, data: { isVerified: true } });
  await audit(ctx, "domain.verified", "Domain", row.id, { domain: row.domain });
  revalidatePath("/app/settings/api-domains");
  return { ok: true, message: "Domain verified." };
}

export async function removeDomain(id: string): Promise<Result> {
  const ctx = await admin();
  if (!ctx) return { ok: false, error: "Only workspace admins can remove domains." };
  const r = await db.domain.deleteMany({ where: { id, workspaceId: ctx.workspaceId } });
  if (!r.count) return { ok: false, error: "That domain is not in this workspace." };
  await audit(ctx, "domain.removed", "Domain", id);
  revalidatePath("/app/settings/api-domains");
  return { ok: true, message: "Domain removed." };
}
