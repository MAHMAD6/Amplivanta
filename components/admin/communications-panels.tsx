"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, Database, FileText, Loader2, Mail, Plus, Send } from "lucide-react";
import {
  cancelCommunication,
  deleteCommunicationTemplate,
  previewAudience,
  saveCommunication,
  saveCommunicationTemplate,
  sendCommunication,
  setTemplateStatus,
} from "@/app/(admin)/admin/communication-actions";
import { toastResult } from "@/lib/action-toast";
import { cn } from "@/lib/utils";
import { SuperCard, SuperCardHeader, SuperEmptyState } from "./primitives";

export type TemplateRow = { id: string; name: string; category: string; subject: string; body: string; status: string; updatedAt: string };
export type CommunicationRow = {
  id: string;
  subject: string;
  type: string;
  audienceScope: string;
  audienceLabel: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  body: string;
};

const field = "h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[13.5px] text-admin-navy focus:border-royal-blue focus:outline-none disabled:bg-bg-soft";
const label = "mb-1.5 block text-[13px] font-bold text-admin-navy";
const btnPrimary = "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-royal-blue px-5 text-[13.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-50";
const btn = "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 text-[13.5px] font-bold text-admin-navy transition hover:bg-bg-soft disabled:opacity-50";
const small = "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12.5px] font-bold text-admin-navy transition hover:bg-bg-soft disabled:opacity-50";

const STATUS_TONE: Record<string, string> = {
  DRAFT: "bg-bg-soft text-ink-soft",
  SCHEDULED: "bg-royal-tint text-royal-blue",
  QUEUED: "bg-royal-tint text-royal-blue",
  SENDING: "bg-amber-50 text-amber-700",
  SENT: "bg-emerald-50 text-emerald-700",
  PARTIAL: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-600",
  CANCELLED: "bg-bg-soft text-ink-muted",
  active: "bg-emerald-50 text-emerald-700",
  draft: "bg-bg-soft text-ink-soft",
  archived: "bg-bg-soft text-ink-muted",
};

export function StatusPill({ value }: { value: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11.5px] font-bold capitalize", STATUS_TONE[value] ?? "bg-bg-soft text-ink-soft")}>{value.toLowerCase().replace(/_/g, " ")}</span>;
}

function useAct() {
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<{ ok: true; message: string; id?: string } | { ok: false; error: string }>, after?: (id?: string) => void) =>
    start(async () => {
      const res = await fn();
      if (toastResult(res)) {
        after?.("id" in res ? res.id : undefined);
        router.refresh();
      }
    });
  return { pending, run };
}

function Unavailable({ what }: { what: string }) {
  return (
    <SuperCard>
      <SuperEmptyState icon={Database} title="Data source unavailable" description={`The platform database could not be reached, so ${what} cannot be shown right now.`} />
    </SuperCard>
  );
}

/* ------------------------------------------------------------- compose */

export function ComposeCommunication({
  types,
  scopes,
  templates,
  workspaces,
  roles,
  providerReady,
  connected,
  draft,
}: {
  types: [string, string, boolean][];
  scopes: [string, string][];
  templates: TemplateRow[];
  workspaces: { id: string; name: string }[];
  roles: string[];
  providerReady: boolean;
  connected: boolean;
  draft: CommunicationRow | null;
}) {
  const { pending, run } = useAct();
  const [type, setType] = useState(draft?.type ?? "");
  const [scope, setScope] = useState(draft?.audienceScope ?? "");
  const [ref, setRef] = useState("");
  const [subject, setSubject] = useState(draft?.subject ?? "");
  const [body, setBody] = useState(draft?.body ?? "");
  const [templateId, setTemplateId] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [scheduledAt, setScheduledAt] = useState(draft?.scheduledAt ?? "");
  const [audience, setAudience] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);

  if (!connected) return <Unavailable what="communications" />;

  const form = () => {
    const fd = new FormData();
    if (draft) fd.set("id", draft.id);
    fd.set("type", type);
    fd.set("audienceScope", scope);
    fd.set("audienceRef", ref);
    fd.set("subject", subject);
    fd.set("body", body);
    fd.set("templateId", templateId);
    fd.set("replyTo", replyTo);
    fd.set("scheduledAt", scheduledAt);
    return fd;
  };

  const applyTemplate = (id: string) => {
    setTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    if (!subject.trim()) setSubject(t.subject);
    if (!body.trim()) setBody(t.body);
  };

  const needsRef = scope === "workspace" || scope === "role";
  const ready = type && scope && subject.trim() && body.trim() && (!needsRef || ref);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <SuperCard>
        <SuperCardHeader title="Compose Message" description="Fill in the details below to send a communication. Fields marked with * are required." />
        <div className="space-y-5 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label>
              <span className={label}>Communication Type *</span>
              <select value={type} onChange={(e) => setType(e.target.value)} className={field}>
                <option value="">Select communication type...</option>
                {types.map(([v, l, transactional]) => <option key={v} value={v}>{l}{transactional ? "" : " (respects opt-outs)"}</option>)}
              </select>
            </label>
            <label>
              <span className={label}>Recipient Scope *</span>
              <select
                value={scope}
                onChange={(e) => { setScope(e.target.value); setRef(""); setAudience(null); }}
                className={field}
              >
                <option value="">Select recipient scope...</option>
                {scopes.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>

          {needsRef && (
            <label className="block">
              <span className={label}>{scope === "workspace" ? "Workspace *" : "Platform role *"}</span>
              <select value={ref} onChange={(e) => { setRef(e.target.value); setAudience(null); }} className={field}>
                <option value="">{scope === "workspace" ? "Select a workspace..." : "Select a role..."}</option>
                {(scope === "workspace" ? workspaces.map((w) => [w.id, w.name] as [string, string]) : roles.map((r) => [r, r.replace(/_/g, " ")] as [string, string])).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </label>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={small}
              disabled={!scope || (needsRef && !ref) || checking}
              onClick={async () => {
                setChecking(true);
                const r = await previewAudience(scope, ref || null);
                setChecking(false);
                if (r.ok) setAudience(r.count);
                else toastResult({ ok: false, error: r.error });
              }}
            >
              {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Check audience size
            </button>
            {audience != null && <span className="text-[12.5px] text-ink-soft">{audience.toLocaleString("en-US")} recipient{audience === 1 ? "" : "s"} right now. The list is snapshotted when you send.</span>}
          </div>

          <label className="block">
            <span className={label}>Subject *</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} placeholder="Enter message subject..." className={field} />
          </label>

          <label className="block">
            <span className={label}>Message *</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={9} maxLength={20000} placeholder="Write your message here..." className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[13.5px] text-admin-navy focus:border-royal-blue focus:outline-none" />
            <span className="mt-1 block text-right text-[12px] text-ink-muted">{body.length} characters</span>
          </label>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label>
              <span className={label}>Template (optional)</span>
              <select value={templateId} onChange={(e) => applyTemplate(e.target.value)} className={field}>
                <option value="">Select a template (optional)...</option>
                {templates.filter((t) => t.status === "active").map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <label>
              <span className={label}>Reply-to address</span>
              <input value={replyTo} onChange={(e) => setReplyTo(e.target.value)} type="email" placeholder="replies@yourdomain.com" className={field} />
            </label>
          </div>

          <label className="block">
            <span className={label}>Schedule for later (optional)</span>
            <input value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} type="datetime-local" className={field} />
          </label>

          <div className="rounded-xl border border-royal-blue/20 bg-royal-tint/50 p-4 text-[12.5px] leading-relaxed text-admin-navy">
            <strong className="block">Important notice</strong>
            Communications are subject to your role permissions and platform delivery rules. Announcements and product updates respect unsubscribe and suppression lists; administrative and support messages are transactional.
            {!providerReady && <span className="mt-2 block font-semibold text-amber-700">No email provider is configured, so nothing can be delivered yet — messages will be recorded as not sent.</span>}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" className={btn} disabled={pending || !ready} onClick={() => run(() => saveCommunication(form()))}>
              <FileText className="h-4 w-4" /> {scheduledAt ? "Save schedule" : "Save draft"}
            </button>
            <button
              type="button"
              className={btnPrimary}
              disabled={pending || !ready}
              onClick={() => {
                if (!window.confirm(`Send "${subject}" now? The audience is snapshotted and the message is delivered immediately.`)) return;
                run(() => sendCommunication(form()));
              }}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send communication
            </button>
          </div>
        </div>
      </SuperCard>

      <SuperCard className="h-fit">
        <SuperCardHeader title="Preview" description="A preview of your message as recipients will see it." />
        <div className="px-6 py-5">
          {subject.trim() || body.trim() ? (
            <div className="rounded-xl border border-line bg-bg-soft/50 p-5">
              <div className="text-[15px] font-bold text-admin-navy">{subject || "(no subject yet)"}</div>
              <div className="mt-3 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-soft">{body || "(no message yet)"}</div>
            </div>
          ) : (
            <SuperEmptyState icon={FileText} title="Preview will appear here once content is added." description="Fill in the message details to see how it will look to recipients." />
          )}
        </div>
      </SuperCard>
    </div>
  );
}

/* ----------------------------------------------------------- templates */

export function TemplatesPanel({ templates, categories, connected }: { templates: TemplateRow[]; categories: [string, string, string][]; connected: boolean }) {
  const { pending, run } = useAct();
  const [editing, setEditing] = useState<TemplateRow | "new" | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  if (!connected) return <Unavailable what="communication templates" />;

  const shown = templates.filter(
    (t) => (!category || t.category === category) && (!status || t.status === status) && (!q || `${t.name} ${t.subject}`.toLowerCase().includes(q.toLowerCase())),
  );

  if (editing) {
    const t = editing === "new" ? null : editing;
    return (
      <SuperCard>
        <SuperCardHeader title={t ? `Edit ${t.name}` : "New template"} description="Templates standardise recurring platform messages." />
        <form
          className="space-y-5 px-6 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            if (t) fd.set("id", t.id);
            run(() => saveCommunicationTemplate(fd), () => setEditing(null));
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label><span className={label}>Template name *</span><input name="name" required maxLength={120} defaultValue={t?.name} className={field} /></label>
            <label>
              <span className={label}>Category *</span>
              <select name="category" required defaultValue={t?.category ?? ""} className={field}>
                <option value="">Select a category...</option>
                {categories.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>
          <label className="block"><span className={label}>Subject *</span><input name="subject" required maxLength={200} defaultValue={t?.subject} className={field} /></label>
          <label className="block">
            <span className={label}>Message *</span>
            <textarea name="body" required rows={8} maxLength={20000} defaultValue={t?.body} className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[13.5px] focus:border-royal-blue focus:outline-none" />
          </label>
          <label className="block"><span className={label}>Description</span><input name="description" maxLength={300} placeholder="When to use this template" className={field} /></label>
          <label className="block md:w-1/2">
            <span className={label}>Status</span>
            <select name="status" defaultValue={t?.status ?? "draft"} className={field}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className={btnPrimary} disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />} Save template</button>
            <button type="button" className={btn} onClick={() => setEditing(null)} disabled={pending}>Cancel</button>
          </div>
        </form>
      </SuperCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {categories.map(([value, title, description]) => (
          <SuperCard key={value} className="p-5">
            <div className="text-[15px] font-bold text-admin-navy">{title}</div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{description}</p>
            <div className="mt-3 text-[12.5px] font-semibold text-royal-blue">{templates.filter((t) => t.category === value).length} template{templates.filter((t) => t.category === value).length === 1 ? "" : "s"}</div>
          </SuperCard>
        ))}
      </div>

      <SuperCard>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-6 py-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search templates..." className="h-11 min-w-[200px] flex-1 rounded-xl border border-line px-3.5 text-[13px] focus:border-royal-blue focus:outline-none" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 rounded-xl border border-line px-3 text-[13px]">
            <option value="">All types</option>
            {categories.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-xl border border-line px-3 text-[13px]">
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <button type="button" className={btnPrimary} onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> New template</button>
        </div>
        {shown.length === 0 ? (
          <SuperEmptyState
            icon={FileText}
            title={templates.length ? "No templates match these filters" : "No templates yet"}
            description={templates.length ? "Try another category or status." : "Create your first communication template to standardise your messages."}
            action={<button type="button" className={btnPrimary} onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> New template</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-line text-left text-[13px] font-bold text-admin-navy">
                  <th className="px-6 py-4">Template name</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Last updated</th><th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((t) => (
                  <tr key={t.id} className="border-b border-line last:border-0 text-[13px] text-ink-soft">
                    <td className="px-6 py-4"><div className="font-semibold text-admin-navy">{t.name}</div><div className="text-[12px]">{t.subject}</div></td>
                    <td className="px-6 py-4 capitalize">{t.category}</td>
                    <td className="px-6 py-4"><StatusPill value={t.status} /></td>
                    <td className="px-6 py-4">{t.updatedAt}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className={small} onClick={() => setEditing(t)}>Edit</button>
                        {t.status !== "active" && <button type="button" className={small} disabled={pending} onClick={() => run(() => setTemplateStatus(t.id, "active"))}>Activate</button>}
                        {t.status === "active" && <button type="button" className={small} disabled={pending} onClick={() => run(() => setTemplateStatus(t.id, "archived"))}>Archive</button>}
                        <button
                          type="button"
                          className={small}
                          disabled={pending}
                          onClick={() => { if (window.confirm(`Delete "${t.name}"?`)) run(() => deleteCommunicationTemplate(t.id)); }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SuperCard>
    </div>
  );
}

/* ------------------------------------------------------------- history */

export function DeliveryHistoryPanel({
  rows,
  connected,
  recipients,
  selectedId,
}: {
  rows: CommunicationRow[];
  connected: boolean;
  recipients: { email: string; name: string | null; status: string; error: string | null; sentAt: string | null }[];
  selectedId: string | null;
}) {
  const router = useRouter();
  const { pending, run } = useAct();
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  if (!connected) return <Unavailable what="delivery history" />;

  const shown = rows.filter(
    (r) => (!type || r.type === type) && (!status || r.status === status) && (!q || `${r.subject} ${r.audienceLabel}`.toLowerCase().includes(q.toLowerCase())),
  );
  const selected = rows.find((r) => r.id === selectedId) ?? null;
  const types = [...new Set(rows.map((r) => r.type))];
  const statuses = [...new Set(rows.map((r) => r.status))];

  return (
    <div className="space-y-6">
      <SuperCard>
        <div className="flex flex-wrap items-center gap-3 px-6 py-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search messages, recipients, or keywords..." className="h-11 min-w-[220px] flex-1 rounded-xl border border-line px-3.5 text-[13px] focus:border-royal-blue focus:outline-none" />
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-11 rounded-xl border border-line px-3 text-[13px]">
            <option value="">All types</option>
            {types.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-xl border border-line px-3 text-[13px]">
            <option value="">All statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}
          </select>
        </div>
        {shown.length === 0 ? (
          <SuperEmptyState
            icon={Mail}
            title={rows.length ? "No communications match these filters" : "No delivery history yet"}
            description={rows.length ? "Try another type, status or search." : "Communications you send through the platform will appear here once they have been sent."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr className="border-b border-line text-left text-[13px] font-bold text-admin-navy">
                  <th className="px-6 py-4">Message</th><th className="px-6 py-4">Recipient scope</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Sent at</th><th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} className={cn("border-b border-line last:border-0 text-[13px] text-ink-soft", r.id === selectedId && "bg-royal-tint/40")}>
                    <td className="px-6 py-4"><div className="font-semibold text-admin-navy">{r.subject}</div><div className="text-[12px]">{r.sentCount} sent · {r.failedCount} failed · {r.skippedCount} skipped of {r.recipientCount}</div></td>
                    <td className="px-6 py-4">{r.audienceLabel}</td>
                    <td className="px-6 py-4 capitalize">{r.type.replace(/_/g, " ")}</td>
                    <td className="px-6 py-4"><StatusPill value={r.status} /></td>
                    <td className="px-6 py-4">{r.sentAt ?? (r.scheduledAt ? `Scheduled ${r.scheduledAt}` : "—")}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className={small} onClick={() => router.push(`/admin/communications/history?id=${r.id}`)}>Details</button>
                        {["DRAFT", "SCHEDULED", "QUEUED"].includes(r.status) && (
                          <button type="button" className={small} disabled={pending} onClick={() => { if (window.confirm("Cancel this communication?")) run(() => cancelCommunication(r.id)); }}>Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SuperCard>

      <SuperCard>
        <SuperCardHeader title="Delivery details" description="Select a message from the list above to view its recipients and delivery status." />
        <div className="px-6 py-5">
          {!selected ? (
            <SuperEmptyState icon={Clock} title="No message selected" description="Choose a message from the delivery history table to see detailed information here." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 text-[13px] md:grid-cols-4">
                {[["Recipients", selected.recipientCount], ["Sent", selected.sentCount], ["Failed", selected.failedCount], ["Skipped", selected.skippedCount]].map(([l, v]) => (
                  <div key={String(l)}><div className="text-[12px] text-ink-muted">{l}</div><div className="text-[18px] font-bold text-admin-navy">{Number(v).toLocaleString("en-US")}</div></div>
                ))}
              </div>
              <div className="mt-4 whitespace-pre-wrap rounded-xl border border-line bg-bg-soft/50 p-4 text-[13px] text-ink-soft">{selected.body}</div>
              <h3 className="mt-5 text-[13.5px] font-bold text-admin-navy">Recipients</h3>
              {recipients.length === 0 ? (
                <p className="mt-2 text-[13px] text-ink-soft">No recipient records for this message.</p>
              ) : (
                <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-line">
                  <table className="w-full border-collapse text-[12.5px]">
                    <tbody>
                      {recipients.map((r) => (
                        <tr key={r.email} className="border-b border-line last:border-0">
                          <td className="px-4 py-2 font-medium text-admin-navy">{r.name || r.email}</td>
                          <td className="px-4 py-2 text-ink-soft">{r.email}</td>
                          <td className="px-4 py-2"><StatusPill value={r.status} /></td>
                          <td className="px-4 py-2 text-ink-muted">{r.error ?? r.sentAt ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </SuperCard>
    </div>
  );
}
