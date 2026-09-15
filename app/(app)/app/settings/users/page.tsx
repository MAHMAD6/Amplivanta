import type { Metadata } from "next";
import { Diamond, History, Plus, UserCog, Users } from "lucide-react";
import { db } from "@/lib/db";
import { SettingsHeader } from "@/components/amplivanta/settings-header";
import { ResourceDialog, type Field } from "@/components/amplivanta/crud/resource-dialog";
import { MemberRoleControls } from "@/components/amplivanta/settings-ui";
import { DataTable, EmptyState, InfoList, Pill, StatGrid, fmtDate, fmtInt } from "@/components/amplivanta/screen-kit";
import { settingsContext } from "@/lib/server/settings-screens";

export const metadata: Metadata = { title: "Roles & Permissions" };
export const dynamic = "force-dynamic";

const SYSTEM_ROLES: [string, string, string][] = [
  ["OWNER", "Owner", "Full access, billing and ownership transfer"],
  ["ADMIN", "Admin", "Manage members, settings, integrations and approvals"],
  ["EDITOR", "Editor", "Create and edit content, CRM records and campaigns"],
  ["VIEWER", "Viewer", "Read-only access"],
];
const ROLE_FIELDS: Field[] = [
  { name: "name", label: "Role name", required: true },
  { name: "description", label: "Description", type: "textarea" },
];

export default async function RolesPage() {
  const c = await settingsContext();
  let reachable = Boolean(c);
  let members: { id: string; userId: string; name: string; email: string; role: string; joined: Date }[] = [];
  let custom: { id: string; name: string; description: string | null; permissions: number }[] = [];
  let changes = 0;
  if (c) {
    try {
      const [m, r, a] = await Promise.all([
        db.membership.findMany({ where: { workspaceId: c.workspaceId }, orderBy: { createdAt: "asc" }, include: { user: { select: { name: true, email: true } } } }),
        db.workspaceRole.findMany({ where: { workspaceId: c.workspaceId }, orderBy: { name: "asc" }, include: { _count: { select: { permissions: true } } } }),
        db.auditLog.count({ where: { workspaceId: c.workspaceId, action: { startsWith: "member.role" } } }),
      ]);
      members = m.map((x) => ({ id: x.id, userId: x.userId, name: x.user.name || x.user.email, email: x.user.email, role: x.role, joined: x.createdAt }));
      custom = r.map((x) => ({ id: x.id, name: x.name, description: x.description, permissions: x._count.permissions }));
      changes = a;
    } catch {
      reachable = false;
    }
  }
  const count = (role: string) => members.filter((m) => m.role === role).length;

  return (
    <>
      <SettingsHeader
        title="Roles & Permissions"
        subtitle="Define workspace roles and granular permissions across modules and sensitive actions."
        actions={
          c?.isAdmin ? (
            <ResourceDialog
              title="Create Custom Role"
              fields={ROLE_FIELDS}
              endpoint="/api/roles"
              submitLabel="Create role"
              successMessage="Role created"
              trigger={<button type="button" className="inline-flex h-11 items-center gap-2 rounded-md bg-[#0B5CFF] px-7 text-[14px] font-semibold text-white"><Plus className="h-4 w-4" /> Create Custom Role</button>}
            />
          ) : undefined
        }
      />
      <StatGrid
        stats={[
          { label: "Roles", icon: Diamond, value: reachable ? fmtInt(SYSTEM_ROLES.length + custom.length) : null, hint: reachable ? "System and custom roles" : undefined },
          { label: "Assignments", icon: Users, value: members.length ? fmtInt(members.length) : null },
          { label: "Custom Roles", icon: UserCog, value: custom.length ? fmtInt(custom.length) : null },
          { label: "Permission Changes", icon: History, value: changes ? fmtInt(changes) : null },
        ]}
      />
      <div className="mb-5 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_1fr]">
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="mb-3 text-[18px] font-semibold text-deep-navy">Workspace Roles</h2>
          {reachable ? (
            <DataTable
              columns={["Role", "Members", "Permission Summary", "Protected"]}
              minWidth={620}
              rows={[
                ...SYSTEM_ROLES.map(([key, label, summary]) => [label, fmtInt(count(key)), summary, <Pill key="p" tone={key === "OWNER" ? "blue" : "gray"}>{key === "OWNER" ? "Protected" : "System"}</Pill>]),
                ...custom.map((r) => [r.name, "—", r.description ?? `${r.permissions} permission${r.permissions === 1 ? "" : "s"}`, <Pill key="p">Custom</Pill>]),
              ]}
            />
          ) : (
            <EmptyState icon={Diamond} title="Role data is not available yet" body="Configured roles and member assignments will appear here." />
          )}
        </section>
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[18px] font-semibold text-deep-navy">Permission Guidance</h2>
          <InfoList
            rows={[
              { title: "Module & action permissions", body: "Access is defined at the module and sensitive-action level." },
              { title: "Safe assignment", body: "Role changes take effect immediately and are recorded in the audit log." },
              { title: "Protected roles", body: "A workspace always keeps at least one owner; the last owner cannot be demoted or removed." },
              { title: "Authorization", body: "Server-side authorization matches the permissions shown here." },
            ]}
          />
        </section>
      </div>
      <section className="rounded-xl border border-line bg-white p-5">
        <h2 className="mb-3 text-[18px] font-semibold text-deep-navy">Member Assignments</h2>
        <DataTable
          columns={["Member", "Email", "Role", "Joined", "Actions"]}
          rows={members.map((m) => [
            m.name,
            m.email,
            <span key="r" className="capitalize">{m.role.toLowerCase()}</span>,
            fmtDate(m.joined),
            <MemberRoleControls key="a" id={m.id} role={m.role} isSelf={m.userId === c?.userId} canEdit={Boolean(c?.isAdmin)} />,
          ])}
          empty={<EmptyState icon={Users} compact title="No members yet" body="Workspace members and their roles will appear here." />}
        />
      </section>
    </>
  );
}
