import type { Metadata } from "next";
import { UserPlus, MoreHorizontal, Check, X, ShieldCheck } from "lucide-react";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { USERS, USER_STATUS_TONE, ROLE_TONE, ROLES, PERMISSION_MATRIX } from "@/lib/settings-data";

export const metadata: Metadata = { title: "Users & Permissions" };

const ROLE_KEYS = ["Owner", "Admin", "Editor", "Reviewer", "Viewer"] as const;

export default function UsersPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-line p-4">
          <div>
            <div className="text-[14px] font-bold text-ink">Members ({USERS.length})</div>
            <div className="text-[11.5px] text-ink-muted">Invite, assign roles, deactivate.</div>
          </div>
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <UserPlus className="h-3.5 w-3.5" /> Invite Member
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-line bg-bg-soft/40 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Teams</th>
                <th className="px-4 py-3">MFA</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="w-10 px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {USERS.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} size={32} />
                      <div>
                        <div className="text-[13px] font-semibold text-ink">{u.name}</div>
                        <div className="text-[11px] text-ink-muted">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusPill tone={ROLE_TONE[u.role as keyof typeof ROLE_TONE]}>{u.role}</StatusPill></td>
                  <td className="px-4 py-3 text-[11.5px] text-ink-soft">{u.teams.join(", ")}</td>
                  <td className="px-4 py-3">{u.mfa ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : <span className="text-[11.5px] text-amber-600">Off</span>}</td>
                  <td className="px-4 py-3"><StatusPill tone={USER_STATUS_TONE[u.status as keyof typeof USER_STATUS_TONE]}>{u.status}</StatusPill></td>
                  <td className="px-4 py-3 text-[11.5px] text-ink-muted">{u.lastActive}</td>
                  <td className="px-2 py-3 text-right"><button className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft"><MoreHorizontal className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[14px] font-bold text-ink">Roles</div>
          <button className="text-[12px] font-semibold text-violet">+ Custom role</button>
        </div>
        <div className="space-y-2">
          {ROLES.map((r) => (
            <div key={r.name} className="flex items-center gap-3 rounded-xl border border-line p-3">
              <StatusPill tone={ROLE_TONE[r.name as keyof typeof ROLE_TONE] ?? "gray"}>{r.name}</StatusPill>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] text-ink"><span className="font-semibold">{r.members} members</span> · <span className="text-ink-soft">{r.perms}</span></div>
              </div>
              {r.locked ? <span className="text-[10.5px] font-bold text-ink-muted">Locked</span> : <button className="text-[11.5px] font-semibold text-violet">Edit</button>}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-card">
        <div className="border-b border-line p-4"><div className="text-[14px] font-bold text-ink">Permission Matrix</div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-bg-soft/40 text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="px-4 py-3">Permission</th>
                {ROLE_KEYS.map((r) => <th key={r} className="px-4 py-3 text-center">{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_MATRIX.flatMap((sec) => [
                <tr key={`${sec.section}-header`} className="border-b border-line bg-bg-soft/60">
                  <td colSpan={6} className="px-4 py-2 text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">{sec.section}</td>
                </tr>,
                ...sec.perms.map((p) => (
                  <tr key={`${sec.section}-${p.label}`} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-[12.5px] text-ink">{p.label}</td>
                    {ROLE_KEYS.map((r) => (
                      <td key={r} className="px-4 py-3 text-center">{p.grants[r] ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <X className="mx-auto h-4 w-4 text-ink-muted/40" />}</td>
                    ))}
                  </tr>
                )),
              ])}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
