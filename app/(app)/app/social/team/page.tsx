import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ShieldCheck, UserPlus, Users } from "lucide-react";
import { DataTable, EmptyState, InfoList, Panel, fmtDate, kitOutline, kitPrimary } from "@/components/amplivanta/screen-kit";
import { db } from "@/lib/db";
import { socialContext } from "@/lib/server/social-screens";

export const metadata: Metadata = { title: "Team & Roles" };
export const dynamic = "force-dynamic";

const ROLE_ACCESS: [string, string, string, string, string][] = [
  ["Owner", "Yes", "Yes", "Yes", "Yes"],
  ["Admin", "Yes", "Yes", "Yes", "Yes"],
  ["Editor", "Yes", "Yes, unless approval is required", "No", "No"],
  ["Viewer", "No", "No", "No", "No"],
];

export default async function SocialTeamPage() {
  const c = await socialContext();
  let members: { id: string; name: string; email: string; role: string; joined: Date }[] = [];
  let reachable = Boolean(c);
  if (c) {
    try {
      const rows = await db.membership.findMany({ where: { workspaceId: c.workspaceId }, orderBy: { createdAt: "asc" }, take: 100, include: { user: { select: { name: true, email: true } } } });
      members = rows.map((m) => ({ id: m.id, name: m.user.name ?? m.user.email, email: m.user.email, role: m.role, joined: m.createdAt }));
    } catch {
      reachable = false;
    }
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[30px] font-bold text-deep-navy">Team &amp; Roles</h1>
      <p className="mb-5 mt-1 text-[14.5px] text-ink-soft">Manage access, invitations, and publishing permissions for your workspace.</p>

      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title="Team Members" action={<Link href="/app/settings/users" className="inline-flex h-9 items-center gap-2 rounded-md border border-[#0B5CFF] px-3 text-[13px] font-semibold text-[#0B5CFF]"><UserPlus className="h-4 w-4" /> Invite Member</Link>}>
          {members.length ? (
            <DataTable columns={["Name", "Email", "Role", "Joined"]} minWidth={520} rows={members.map((m) => [m.name, m.email, <span key="r" className="capitalize">{m.role.toLowerCase()}</span>, fmtDate(m.joined)])} />
          ) : (
            <EmptyState icon={Users} title={reachable ? "No team members yet" : "Team unavailable"} body={reachable ? "Add your team to collaborate on content, manage accounts, and streamline your publishing workflow." : "Members could not be loaded right now."} action={reachable ? <Link href="/app/settings/users" className={kitPrimary}>Invite Member</Link> : undefined} />
          )}
        </Panel>
        <Panel title="Invitations" action={<Link href="/app/settings/users" className="inline-flex h-9 items-center rounded-md border border-[#0B5CFF] px-3 text-[13px] font-semibold text-[#0B5CFF]">View Invitations</Link>}>
          <EmptyState icon={Mail} title="Invitations are managed in Team settings" body="Invite teammates to give them access to your workspace and publishing tools." action={<Link href="/app/settings/users" className={kitPrimary}>Invite Member</Link>} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Panel title="Publishing Permissions" subtitle="What each workspace role can do in Social Publishing.">
          <DataTable columns={["Role", "Create & edit posts", "Schedule", "Approve", "Change settings"]} rows={ROLE_ACCESS.map((r) => [...r])} minWidth={640} />
          <Link href="/app/settings/users" className={`${kitOutline} mt-4`}><ShieldCheck className="h-4 w-4" /> Manage Roles</Link>
        </Panel>
        <Panel title="About Roles & Permissions">
          <InfoList
            rows={[
              { title: "Role-based access", body: "Workspace roles define who can create, approve, publish, manage accounts, and change settings." },
              { title: "Approval workflow", body: "When approval is required, editors submit posts and admins approve them.", href: "/app/social/settings" },
              { title: "Administrative safeguards", body: "Critical access changes require appropriate authorization and are recorded in the audit log." },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}
