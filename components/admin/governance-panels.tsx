"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Database, Loader2, Plus } from "lucide-react";
import {
  createAnnouncement,
  createInvitation,
  decideDataRequest,
  grantAdminAssignment,
  liftSuspension,
  revokeAdminAssignment,
  revokeInvitation,
  revokeSession,
  setTicketStatus,
  suspendUser,
  upsertRoleDefinition,
} from "@/app/(admin)/admin/governance-actions";
import { toastResult } from "@/lib/action-toast";
import { cn } from "@/lib/utils";
import { SuperCard, SuperEmptyState } from "./primitives";

type Msg = { ok: boolean; text: string } | null;
type Role = { id: string; key: string; name: string; description: string | null; permissions: number; assignments: number };
type User = { id: string; name: string; email: string };

const field =
  "h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[13.5px] focus:border-royal-blue focus:outline-none";
const btnPrimary =
  "inline-flex h-11 items-center gap-2 rounded-xl bg-royal-blue px-4 text-[13.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-50";
const btn =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12.5px] font-bold text-admin-navy transition hover:bg-bg-soft disabled:opacity-50";

function Unavailable({ what }: { what: string }) {
  return (
    <SuperCard>
      <SuperEmptyState icon={Database} title="Data source unavailable" description={`The platform database could not be reached, so ${what} cannot be shown or changed.`} />
    </SuperCard>
  );
}

function useAct() {
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<{ ok: true; message: string } | { ok: false; error: string }>, after?: () => void) =>
    start(async () => {
      const res = await fn();
      if (toastResult(res)) {
        after?.();
        router.refresh();
      }
    });
  return { pending, run };
}

/* ------------------------------------------------------- roles + grants */

export function RolesPanel({ roles, connected }: { roles: Role[]; connected: boolean }) {
  const { pending, run } = useAct();
  const [open, setOpen] = useState(false);
  if (!connected) return <Unavailable what="roles" />;

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" className={btnPrimary} onClick={() => setOpen((v) => !v)}>
          <Plus className="h-4 w-4" /> New role
        </button>
      </div>

      {open && (
        <SuperCard className="mb-4 p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              run(() => upsertRoleDefinition(new FormData(form)), () => { form.reset(); setOpen(false); });
            }}
            className="grid gap-4 md:grid-cols-2"
          >
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Role name</span>
              <input name="name" required className={field} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Key</span>
              <input name="key" placeholder="auto from name" className={field} />
            </label>
            <div className="md:col-span-2">
              <label className="block">
                <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Description</span>
                <input name="description" className={field} />
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block">
                <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Permissions</span>
                <textarea
                  name="permissions"
                  rows={5}
                  placeholder="One permission key per line, e.g. marketplace.admin.products.moderate"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[13px] focus:border-royal-blue focus:outline-none"
                />
                <span className="mt-1 block text-[11.5px] text-ink-muted">
                  You can only grant permissions you hold yourself.
                </span>
              </label>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className={btnPrimary} disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save role
              </button>
            </div>
          </form>
        </SuperCard>
      )}

      {roles.length === 0 ? (
        <SuperCard>
          <SuperEmptyState icon={Database} title="No roles defined" description="Create a role, then grant it to a user at the scope they should administer." />
        </SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {roles.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-admin-navy">{r.name}</div>
                  <div className="text-[12px] text-ink-muted">
                    {r.key} · {r.permissions} permission(s) · {r.assignments} assignment(s)
                  </div>
                  {r.description && <p className="mt-0.5 text-[12.5px] text-ink-soft">{r.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </SuperCard>
      )}
    </>
  );
}

export function AccessAssignmentsPanel({
  roles,
  users,
  assignments,
  connected,
}: {
  roles: Role[];
  users: User[];
  assignments: { id: string; user: string | null; role: string | null; scope: string; where: string | null; expires: string | null }[];
  connected: boolean;
}) {
  const { pending, run } = useAct();
  if (!connected) return <Unavailable what="access assignments" />;

  return (
    <>
      <SuperCard className="mb-6 p-5">
        <h2 className="mb-4 text-[15px] font-bold text-admin-navy">Grant access</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            run(() => grantAdminAssignment(new FormData(form)), () => form.reset());
          }}
          className="grid gap-4 md:grid-cols-2"
        >
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">User</span>
            <select name="userId" required defaultValue="" className={field}>
              <option value="" disabled>Select a user</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Role</span>
            <select name="roleDefinitionId" required defaultValue="" className={field}>
              <option value="" disabled>Select a role</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Scope</span>
            <select name="scopeLevel" defaultValue="ORGANIZATION" className={field}>
              {["GLOBAL", "ORGANIZATION", "WORKSPACE", "MODULE"].map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Scope id</span>
            <input name="organizationId" placeholder="organization id (blank for global)" className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Expires</span>
            <input name="expiresAt" type="date" className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">
              Reason <span className="text-orange-cta">(required)</span>
            </span>
            <input name="reason" required className={field} />
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className={btnPrimary} disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />} Grant access
            </button>
          </div>
        </form>
      </SuperCard>

      {assignments.length === 0 ? (
        <SuperCard>
          <SuperEmptyState icon={Database} title="No access assignments" description="Granted roles and their scopes appear here." />
        </SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {assignments.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-admin-navy">{a.user ?? "unknown user"}</div>
                  <div className="text-[12px] text-ink-muted">
                    {a.role ?? "no role"} · {a.scope.toLowerCase()}{a.where ? ` · ${a.where}` : ""}
                    {a.expires ? ` · expires ${a.expires}` : ""}
                  </div>
                </div>
                <RevokeButton onRevoke={(reason) => run(() => revokeAdminAssignment(a.id, reason))} pending={pending} />
              </div>
            ))}
          </div>
        </SuperCard>
      )}
    </>
  );
}

/** Small inline reason prompt shared by the destructive row actions. */
function RevokeButton({ onRevoke, pending, label = "Revoke" }: { onRevoke: (reason: string) => void; pending: boolean; label?: string }) {
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" className={btn} onClick={() => setOpen(true)}>{label}</button>
    );
  }
  return (
    <span className="flex items-center gap-2">
      <input
        value={reason}
        onChange={(e) => setReason(e.currentTarget.value)}
        placeholder="Reason (required)"
        aria-label="Reason"
        className="h-9 w-56 rounded-lg border border-line px-3 text-[12.5px] focus:border-royal-blue focus:outline-none"
      />
      <button type="button" className={btn} disabled={pending || !reason.trim()} onClick={() => onRevoke(reason)}>
        Confirm
      </button>
      <button type="button" className={btn} onClick={() => setOpen(false)}>Cancel</button>
    </span>
  );
}

/* ------------------------------------------------------------ invitations */

export function InvitationsPanel({
  roles,
  invitations,
  connected,
}: {
  roles: Role[];
  invitations: { id: string; email: string; status: string; expires: string | null }[];
  connected: boolean;
}) {
  const { pending, run } = useAct();
  if (!connected) return <Unavailable what="invitations" />;

  return (
    <>
      <SuperCard className="mb-6 p-5">
        <h2 className="mb-4 text-[15px] font-bold text-admin-navy">Invite a user</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            run(() => createInvitation(new FormData(form)), () => form.reset());
          }}
          className="grid gap-4 md:grid-cols-2"
        >
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Email</span>
            <input name="email" type="email" required className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Role</span>
            <select name="roleDefinitionId" defaultValue="" className={field}>
              <option value="">No role</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Scope</span>
            <select name="scopeLevel" defaultValue="ORGANIZATION" className={field}>
              {["GLOBAL", "ORGANIZATION", "WORKSPACE"].map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Expires in (days)</span>
            <input name="expiresInDays" type="number" min={1} defaultValue={14} className={field} />
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className={btnPrimary} disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />} Create invitation
            </button>
          </div>
        </form>
        <p className="mt-3 text-[12px] text-ink-muted">
          The invitation is recorded now; delivery happens once an email provider is connected.
        </p>
      </SuperCard>

      {invitations.length === 0 ? (
        <SuperCard>
          <SuperEmptyState icon={Database} title="No invitations" description="Invitations you create appear here." />
        </SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {invitations.map((i) => (
              <div key={i.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-admin-navy">{i.email}</div>
                  <div className="text-[12px] text-ink-muted">
                    {i.status.toLowerCase()}{i.expires ? ` · expires ${i.expires}` : ""}
                  </div>
                </div>
                {i.status === "PENDING" && (
                  <button type="button" className={btn} disabled={pending} onClick={() => run(() => revokeInvitation(i.id))}>
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </SuperCard>
      )}
    </>
  );
}

/* --------------------------------------------------- sessions/suspensions */

export function SessionsPanel({
  sessions,
  connected,
}: {
  sessions: { id: string; user: string | null; device: string | null; ip: string | null; lastActive: string | null }[];
  connected: boolean;
}) {
  const { pending, run } = useAct();
  if (!connected) return <Unavailable what="sessions" />;
  return (
    <>
      {sessions.length === 0 ? (
        <SuperCard>
          <SuperEmptyState icon={Database} title="No active sessions" description="Active sessions and devices appear here." />
        </SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {sessions.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-admin-navy">{s.user ?? "unknown user"}</div>
                  <div className="text-[12px] text-ink-muted">
                    {s.device ?? "unknown device"}{s.ip ? ` · ${s.ip}` : ""}{s.lastActive ? ` · ${s.lastActive}` : ""}
                  </div>
                </div>
                <RevokeButton pending={pending} onRevoke={(reason) => run(() => revokeSession(s.id, reason))} />
              </div>
            ))}
          </div>
        </SuperCard>
      )}
    </>
  );
}

export function SuspensionsPanel({
  users,
  suspensions,
  connected,
}: {
  users: User[];
  suspensions: { id: string; user: string | null; reason: string; status: string; since: string | null }[];
  connected: boolean;
}) {
  const { pending, run } = useAct();
  if (!connected) return <Unavailable what="suspensions" />;
  return (
    <>
      <SuperCard className="mb-6 p-5">
        <h2 className="mb-4 text-[15px] font-bold text-admin-navy">Suspend an account</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const form = e.currentTarget;
            run(() => suspendUser(String(fd.get("userId")), String(fd.get("reason"))), () => form.reset());
          }}
          className="grid gap-4 md:grid-cols-2"
        >
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">User</span>
            <select name="userId" required defaultValue="" className={field}>
              <option value="" disabled>Select a user</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">
              Reason <span className="text-orange-cta">(required)</span>
            </span>
            <input name="reason" required className={field} />
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className={btnPrimary} disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />} Suspend
            </button>
          </div>
        </form>
      </SuperCard>

      {suspensions.length === 0 ? (
        <SuperCard>
          <SuperEmptyState icon={Database} title="No suspended accounts" description="Suspensions appear here." />
        </SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {suspensions.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-admin-navy">{s.user ?? "unknown user"}</div>
                  <div className="text-[12px] text-ink-muted">
                    {s.reason} · {s.status.toLowerCase()}{s.since ? ` · ${s.since}` : ""}
                  </div>
                </div>
                {s.status === "ACTIVE" && (
                  <RevokeButton label="Lift" pending={pending} onRevoke={(reason) => run(() => liftSuspension(s.id, reason))} />
                )}
              </div>
            ))}
          </div>
        </SuperCard>
      )}
    </>
  );
}

/* ----------------------------------------------------------- DSAR/tickets */

export function DataRequestsPanel({
  requests,
  connected,
}: {
  requests: { id: string; subject: string; type: string; status: string; requested: string | null }[];
  connected: boolean;
}) {
  const { pending, run } = useAct();
  const [notes, setNotes] = useState("");
  if (!connected) return <Unavailable what="data requests" />;
  return (
    <>
      <SuperCard className="mb-4 p-5">
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Notes for the next decision</span>
          <input value={notes} onChange={(e) => setNotes(e.currentTarget.value)} className={field} />
        </label>
      </SuperCard>
      {requests.length === 0 ? (
        <SuperCard>
          <SuperEmptyState icon={Database} title="No data requests" description="Subject access and deletion requests appear here." />
        </SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {requests.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-admin-navy">{r.subject}</div>
                  <div className="text-[12px] text-ink-muted">
                    {r.type.toLowerCase()} · {r.status.toLowerCase().replace(/_/g, " ")}{r.requested ? ` · ${r.requested}` : ""}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["IN_PROGRESS", "COMPLETED", "REJECTED"].map((s) => (
                    <button key={s} type="button" className={btn} disabled={pending} onClick={() => run(() => decideDataRequest(r.id, s, notes))}>
                      {s.toLowerCase().replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SuperCard>
      )}
    </>
  );
}

export function AnnouncementsPanel({
  announcements,
  connected,
}: {
  announcements: { id: string; title: string; audience: string; published: string | null }[];
  connected: boolean;
}) {
  const { pending, run } = useAct();
  if (!connected) return <Unavailable what="announcements" />;
  return (
    <>
      <SuperCard className="mb-6 p-5">
        <h2 className="mb-4 text-[15px] font-bold text-admin-navy">New announcement</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            run(() => createAnnouncement(new FormData(form)), () => form.reset());
          }}
          className="grid gap-4"
        >
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Title</span>
            <input name="title" required className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Body</span>
            <textarea name="body" rows={4} required className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[13px] focus:border-royal-blue focus:outline-none" />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-[13px] text-ink-soft">
              <input type="checkbox" name="publish" className="h-4 w-4 accent-royal-blue" /> Publish immediately
            </label>
            <button type="submit" className={btnPrimary} disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save
            </button>
          </div>
        </form>
      </SuperCard>

      {announcements.length === 0 ? (
        <SuperCard>
          <SuperEmptyState icon={Database} title="No announcements" description="Announcements you create appear here." />
        </SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {announcements.map((a) => (
              <div key={a.id} className="px-6 py-4">
                <div className="text-[14px] font-bold text-admin-navy">{a.title}</div>
                <div className="text-[12px] text-ink-muted">
                  {a.audience} · {a.published ? `published ${a.published}` : "draft"}
                </div>
              </div>
            ))}
          </div>
        </SuperCard>
      )}
    </>
  );
}

export function TicketsPanel({
  tickets,
  connected,
}: {
  tickets: { id: string; subject: string; requester: string; status: string; priority: string; updated: string | null }[];
  connected: boolean;
}) {
  const { pending, run } = useAct();
  const [note, setNote] = useState("");
  if (!connected) return <Unavailable what="tickets" />;
  return (
    <>
      <SuperCard className="mb-4 p-5">
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Internal note for the next update</span>
          <input value={note} onChange={(e) => setNote(e.currentTarget.value)} className={field} />
        </label>
      </SuperCard>
      {tickets.length === 0 ? (
        <SuperCard>
          <SuperEmptyState icon={Database} title="No tickets" description="Support tickets appear here." />
        </SuperCard>
      ) : (
        <SuperCard>
          <div className="divide-y divide-line">
            {tickets.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-admin-navy">{t.subject}</div>
                  <div className="text-[12px] text-ink-muted">
                    {t.requester} · {t.priority} · {t.status.toLowerCase()}{t.updated ? ` · ${t.updated}` : ""}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["PENDING", "RESOLVED", "CLOSED"].map((s) => (
                    <button key={s} type="button" className={btn} disabled={pending} onClick={() => run(() => setTicketStatus(t.id, s, note))}>
                      {s.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SuperCard>
      )}
    </>
  );
}
