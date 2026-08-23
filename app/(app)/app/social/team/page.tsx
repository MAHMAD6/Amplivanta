import type { Metadata } from "next";
import { UserPlus, Check, X, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { SocialSubnav } from "@/components/amplivanta/social-subnav";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { TEAM } from "@/lib/social-data";

export const metadata: Metadata = { title: "Team & Roles — Amplivanta" };

const ROLE_TONE = { Owner: "violet", Admin: "pink", Editor: "blue", Reviewer: "amber", Viewer: "gray" } as const;
const ROLES = ["Owner", "Admin", "Editor", "Reviewer", "Viewer"] as const;

const PERMS = [
  { label: "Create posts", perms: [true, true, true, false, false] },
  { label: "Publish posts", perms: [true, true, true, false, false] },
  { label: "Approve posts", perms: [true, true, false, true, false] },
  { label: "Manage accounts", perms: [true, true, false, false, false] },
  { label: "Manage team", perms: [true, true, false, false, false] },
  { label: "View analytics", perms: [true, true, true, true, true] },
  { label: "Edit settings", perms: [true, true, false, false, false] },
  { label: "Access audit log", perms: [true, true, false, true, false] },
];

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Team & Roles"
        subtitle="Control who can create, approve, publish, manage accounts and administer settings."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <UserPlus className="h-3.5 w-3.5" /> Invite Member
          </button>
        }
      />
      <SocialSubnav />

      <div className="mb-6 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="border-b border-line p-4">
          <div className="text-[14px] font-bold text-ink">Members ({TEAM.length})</div>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/40 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Accounts</th>
              <th className="px-4 py-3">Last Active</th>
              <th className="px-4 py-3">Status</th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {TEAM.map((m) => (
              <tr key={m.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={m.name} size={32} />
                    <div>
                      <div className="text-[13px] font-semibold text-ink">{m.name}</div>
                      <div className="text-[11px] text-ink-muted">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><StatusPill tone={ROLE_TONE[m.role]}>{m.role}</StatusPill></td>
                <td className="px-4 py-3 text-[12.5px] text-ink">{m.accounts}</td>
                <td className="px-4 py-3 text-[12.5px] text-ink-muted">{m.lastActive}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${m.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-700"}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-2 py-3 text-right"><button className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft"><MoreHorizontal className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-4 text-[14px] font-bold text-ink">Permission Matrix</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="pb-2">Permission</th>
                {ROLES.map((r) => <th key={r} className="pb-2 text-center">{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERMS.map((p) => (
                <tr key={p.label} className="border-b border-line last:border-0">
                  <td className="py-3 text-[13px] text-ink">{p.label}</td>
                  {p.perms.map((v, i) => (
                    <td key={i} className="py-3 text-center">
                      {v ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <X className="mx-auto h-4 w-4 text-ink-muted/40" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
