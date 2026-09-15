"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { toastResult } from "@/lib/action-toast";
import { addDomain, changeMemberRole, removeDomain, removeMember, saveGeneralSettings, verifyDomain } from "@/app/(app)/app/settings/actions";
import { savePreferences } from "@/app/(app)/app/preferences-actions";

const control = "h-11 w-full rounded-md border border-line bg-white px-3 text-[13.5px] text-deep-navy focus:border-[#0B5CFF] focus:outline-none disabled:bg-bg-soft/60";
const small = "rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-deep-navy hover:bg-bg-soft disabled:opacity-50";

type Opt = [string, string];

/** General Settings form: workspace name plus saved workspace defaults. */
export function GeneralSettingsForm({
  name,
  slug,
  values,
  options,
  canEdit,
}: {
  name: string;
  slug: string;
  values: Record<string, string>;
  options: { key: string; label: string; placeholder: string; options: Opt[] }[];
  canEdit: boolean;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form
      id="general-settings"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => { if (toastResult(await saveGeneralSettings(fd))) router.refresh(); });
      }}
      className="grid grid-cols-1 gap-x-7 gap-y-4 md:grid-cols-2"
    >
      <label>
        <span className="mb-1.5 block text-[13.5px] font-semibold text-deep-navy">Workspace Name</span>
        <input name="name" defaultValue={name} required minLength={2} maxLength={160} disabled={!canEdit} className={control} placeholder="Not configured" />
      </label>
      <label>
        <span className="mb-1.5 block text-[13.5px] font-semibold text-deep-navy">Workspace URL / Slug</span>
        <input value={slug} readOnly disabled className={control} aria-describedby="slug-note" />
        <span id="slug-note" className="mt-1 block text-[11.5px] text-ink-muted">The workspace slug can't be changed after creation.</span>
      </label>
      {options.map((o) => (
        <label key={o.key}>
          <span className="mb-1.5 block text-[13.5px] font-semibold text-deep-navy">{o.label}</span>
          <select name={o.key} defaultValue={values[o.key] ?? ""} disabled={!canEdit} className={control}>
            <option value="">{o.placeholder}</option>
            {o.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      ))}
      <button type="submit" hidden disabled={pending} />
      {pending && <span className="flex items-center gap-2 text-[12.5px] text-ink-muted"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</span>}
    </form>
  );
}

/** Header submit button bound to a form elsewhere on the page. */
export function SubmitFor({ form, label, disabled }: { form: string; label: string; disabled?: boolean }) {
  return (
    <button type="submit" form={form} disabled={disabled} className="inline-flex h-11 items-center rounded-md bg-[#0B5CFF] px-10 text-[14px] font-semibold text-white hover:bg-[#0A4FE0] disabled:border disabled:border-line disabled:bg-bg-soft disabled:text-ink-muted">
      {label}
    </button>
  );
}

/** Notification matrix (design 04). Security rows are fixed by platform policy. */
export function NotificationMatrix({
  rows,
  values,
  canEdit,
}: {
  rows: { key: string; label: string; policy: "configurable" | "policy" | "dependent" }[];
  values: Record<string, string>;
  canEdit: boolean;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const cell = "h-9 w-full rounded-md border border-line bg-white px-2 text-center text-[12px] text-deep-navy disabled:text-ink-muted";
  const channel: Opt[] = [["", "Use workspace default"], ["on", "On"], ["off", "Off"]];
  const freq: Opt[] = [["", "Not configured"], ["realtime", "Real time"], ["daily", "Daily digest"], ["weekly", "Weekly digest"]];
  return (
    <form
      id="notification-settings"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => { if (toastResult(await savePreferences("workspace.notifications", "/app/settings/notifications", fd))) router.refresh(); });
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className="border-b border-line text-[14px] font-semibold text-deep-navy">
              <th className="px-1 py-4">Event Category</th>
              <th className="w-[180px] px-1 py-4">In-App</th>
              <th className="w-[180px] px-1 py-4">Email</th>
              <th className="w-[180px] px-1 py-4">Frequency</th>
              <th className="w-[200px] px-4 py-4">Policy</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const locked = r.policy === "policy";
              return (
                <tr key={r.key} className="border-b border-line">
                  <td className="px-1 py-5 text-[14px] font-semibold text-deep-navy">{r.label}</td>
                  {locked ? (
                    <>
                      <td className="px-1"><div className={`${cell} flex items-center justify-center`}>Platform policy</div></td>
                      <td className="px-1"><div className={`${cell} flex items-center justify-center`}>Platform policy</div></td>
                      <td className="px-1"><div className={`${cell} flex items-center justify-center`}>As required</div></td>
                    </>
                  ) : (
                    (["inApp", "email", "frequency"] as const).map((k) => (
                      <td key={k} className="px-1">
                        <select name={`${r.key}.${k}`} aria-label={`${r.label} ${k}`} defaultValue={values[`${r.key}.${k}`] === "default" ? "" : values[`${r.key}.${k}`] ?? ""} disabled={!canEdit} className={cell}>
                          {(k === "frequency" ? freq : channel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </td>
                    ))
                  )}
                  <td className="px-4"><div className={`${cell} flex items-center justify-center`}>{locked ? "Policy-controlled" : r.policy === "dependent" ? "Policy-dependent" : "Configurable"}</div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pending && <p className="mt-2 flex items-center gap-2 text-[12.5px] text-ink-muted"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</p>}
    </form>
  );
}

export function MemberRoleControls({ id, role, isSelf, canEdit }: { id: string; role: string; isSelf: boolean; canEdit: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!canEdit) return <span className="text-[12px] text-ink-muted">—</span>;
  return (
    <div className="flex items-center justify-end gap-2">
      <select
        aria-label="Role"
        defaultValue={role}
        disabled={pending || isSelf}
        onChange={(e) => {
          const next = e.target.value;
          start(async () => { if (!toastResult(await changeMemberRole(id, next))) e.target.value = role; router.refresh(); });
        }}
        className="h-8 rounded-md border border-line bg-white px-2 text-[12.5px]"
      >
        {["OWNER", "ADMIN", "EDITOR", "VIEWER"].map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
      </select>
      {!isSelf && (
        <button type="button" disabled={pending} className={`${small} text-red-600`} onClick={() => { if (window.confirm("Remove this member from the workspace?")) start(async () => { if (toastResult(await removeMember(id))) router.refresh(); }); }}>
          Remove
        </button>
      )}
    </div>
  );
}

export function AddDomainForm({ canEdit }: { canEdit: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  if (!open) {
    return (
      <button type="button" disabled={!canEdit} onClick={() => setOpen(true)} className="inline-flex h-11 items-center rounded-md bg-[#0B5CFF] px-11 text-[14px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50">
        + Add Domain
      </button>
    );
  }
  return (
    <form
      ref={ref}
      className="flex w-full max-w-[460px] gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => { if (toastResult(await addDomain(fd))) { ref.current?.reset(); setOpen(false); router.refresh(); } });
      }}
    >
      <input name="domain" required placeholder="example.com" autoFocus className={control} />
      <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-md bg-[#0B5CFF] px-5 text-[13.5px] font-semibold text-white disabled:opacity-60">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Add
      </button>
      <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-md border border-line px-4 text-[13.5px]">Cancel</button>
    </form>
  );
}

export function DomainActions({ id, verified, record, token, canEdit }: { id: string; verified: boolean; record: string; token: string | null; canEdit: boolean }) {
  const [pending, start] = useTransition();
  const [show, setShow] = useState(false);
  const router = useRouter();
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-1.5">
        {!verified && token && <button type="button" className={small} onClick={() => setShow((s) => !s)}>{show ? "Hide DNS" : "DNS record"}</button>}
        {!verified && canEdit && <button type="button" disabled={pending} className={small} onClick={() => start(async () => { toastResult(await verifyDomain(id)); router.refresh(); })}>{pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify"}</button>}
        {canEdit && <button type="button" disabled={pending} className={`${small} text-red-600`} onClick={() => { if (window.confirm("Remove this domain?")) start(async () => { if (toastResult(await removeDomain(id))) router.refresh(); }); }}>Remove</button>}
      </div>
      {show && token && (
        <div className="w-[340px] rounded-md bg-bg-soft p-2 text-left text-[11.5px] text-deep-navy">
          <div>Type: <b>TXT</b></div>
          <div className="break-all">Name: <b>{record}</b></div>
          <div className="flex items-start gap-1 break-all">Value: <b>{token}</b>
            <button type="button" aria-label="Copy value" onClick={() => { void navigator.clipboard.writeText(token); toast.success("Copied"); }}><Copy className="h-3 w-3" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
