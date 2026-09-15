"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { api } from "@/lib/client/api";

const small = "rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-deep-navy hover:bg-bg-soft disabled:opacity-50";
const field = "h-10 w-full rounded-md border border-line bg-white px-3 text-[13.5px] text-deep-navy focus:border-[#0B5CFF] focus:outline-none";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-navy/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-deep-navy">{title}</h2>
          <button type="button" onClick={onClose} className="text-[13px] text-ink-muted hover:text-deep-navy">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SecretOnce({ label, value, note }: { label: string; value: string; note: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="mb-2 text-[13px] text-ink-soft">{note}</p>
      <div className="flex items-center gap-2 rounded-lg border border-line bg-bg-soft/60 p-3">
        <code className="min-w-0 flex-1 break-all font-mono text-[12px] text-deep-navy" aria-label={label}>{value}</code>
        <button
          type="button"
          onClick={() => { void navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
          className={small}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

export function CreateApiKeyButton({ label = "+ Create API Key", canEdit }: { label?: string; canEdit: boolean }) {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const close = () => { setOpen(false); setCreated(null); };
  return (
    <>
      <button type="button" disabled={!canEdit} onClick={() => setOpen(true)} className="inline-flex h-11 items-center rounded-md bg-[#0B5CFF] px-7 text-[14px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50">{label}</button>
      {open && (
        <Modal title={created ? "Copy your API key" : "Create API Key"} onClose={close}>
          {created ? (
            <SecretOnce label="API key" value={created} note="This is the only time the full key is shown. Store it somewhere safe. Send it as Authorization: Bearer <key>." />
          ) : (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const scopes = fd.get("access") === "write" ? ["read", "write"] : ["read"];
                start(async () => {
                  try {
                    const res = await api.post<{ key: string }>("/api/api-keys", { name: String(fd.get("name") ?? ""), scopes });
                    setCreated(res.key);
                    router.refresh();
                  } catch (err) {
                    toast.error((err as Error).message || "Could not create key");
                  }
                });
              }}
            >
              <label className="block"><span className="mb-1 block text-[13px] font-semibold text-deep-navy">Key name</span><input name="name" required maxLength={120} placeholder="Production server" className={field} /></label>
              <label className="block">
                <span className="mb-1 block text-[13px] font-semibold text-deep-navy">Access</span>
                <select name="access" defaultValue="read" className={field}>
                  <option value="read">Read only</option>
                  <option value="write">Read and write</option>
                </select>
              </label>
              <p className="text-[12px] text-ink-muted">Assign only the access the integration needs. Keys can be revoked at any time.</p>
              <div className="flex justify-end"><button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0B5CFF] px-5 text-[13.5px] font-semibold text-white disabled:opacity-60">{pending && <Loader2 className="h-4 w-4 animate-spin" />} Create key</button></div>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}

export function CreateWebhookButton({ events, label = "+ New Webhook", canEdit }: { events: string[]; label?: string; canEdit: boolean }) {
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const close = () => { setOpen(false); setSecret(null); };
  return (
    <>
      <button type="button" disabled={!canEdit} onClick={() => setOpen(true)} className="inline-flex h-11 items-center rounded-md bg-[#0B5CFF] px-7 text-[14px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50">{label}</button>
      {open && (
        <Modal title={secret ? "Signing secret" : "New Webhook"} onClose={close}>
          {secret ? (
            <SecretOnce label="Signing secret" value={secret} note="Verify each delivery's x-amplivanta-signature header (HMAC-SHA256 of the body) with this secret. It is shown only once." />
          ) : (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const chosen = events.filter((ev) => fd.get(`ev_${ev}`) === "on");
                if (!chosen.length) { toast.error("Choose at least one event."); return; }
                start(async () => {
                  try {
                    const res = await api.post<{ signingSecret: string }>("/api/webhooks", { url: String(fd.get("url") ?? ""), events: chosen });
                    setSecret(res.signingSecret);
                    router.refresh();
                  } catch (err) {
                    toast.error((err as Error).message || "Could not create webhook");
                  }
                });
              }}
            >
              <label className="block"><span className="mb-1 block text-[13px] font-semibold text-deep-navy">Endpoint URL</span><input name="url" type="url" required placeholder="https://example.com/webhooks/amplivanta" className={field} /></label>
              <fieldset>
                <legend className="mb-1 text-[13px] font-semibold text-deep-navy">Subscribed events</legend>
                <div className="grid grid-cols-2 gap-1.5">
                  {events.map((ev) => (
                    <label key={ev} className="flex items-center gap-2 text-[13px] text-deep-navy"><input type="checkbox" name={`ev_${ev}`} className="accent-[#0B5CFF]" /> {ev}</label>
                  ))}
                </div>
              </fieldset>
              <div className="flex justify-end"><button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0B5CFF] px-5 text-[13.5px] font-semibold text-white disabled:opacity-60">{pending && <Loader2 className="h-4 w-4 animate-spin" />} Create webhook</button></div>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}

export function WebhookRowActions({ id, status, canEdit }: { id: string; status: string; canEdit: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!canEdit) return <span className="text-[12px] text-ink-muted">—</span>;
  const run = (fn: () => Promise<void>) => start(async () => { try { await fn(); router.refresh(); } catch (err) { toast.error((err as Error).message || "Action failed"); } });
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <button type="button" disabled={pending} className={small} onClick={() => run(async () => {
        const r = await api.post<{ responseCode: number | null; latencyMs: number | null }>(`/api/webhooks/${id}/test`, {});
        if (r.responseCode && r.responseCode >= 200 && r.responseCode < 300) toast.success(`Test delivered (${r.responseCode}, ${r.latencyMs} ms)`);
        else toast.error(r.responseCode ? `Endpoint responded ${r.responseCode}` : "Endpoint could not be reached");
      })}>{pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Test"}</button>
      <button type="button" disabled={pending} className={small} onClick={() => run(async () => { await api.patch(`/api/webhooks/${id}`, { status: status === "active" ? "paused" : "active" }); toast.success(status === "active" ? "Paused" : "Resumed"); })}>{status === "active" ? "Pause" : "Resume"}</button>
      <button type="button" disabled={pending} className={`${small} text-red-600`} onClick={() => { if (window.confirm("Delete this webhook endpoint?")) run(async () => { await api.del(`/api/webhooks/${id}`); toast.success("Webhook deleted"); }); }}>Delete</button>
    </div>
  );
}

export function RevokeKeyButton({ id, canEdit }: { id: string; canEdit: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!canEdit) return <span className="text-[12px] text-ink-muted">—</span>;
  return (
    <button
      type="button"
      disabled={pending}
      className={`${small} text-red-600`}
      onClick={() => {
        if (!window.confirm("Revoke this key? Requests using it stop working immediately.")) return;
        start(async () => { try { await api.del(`/api/api-keys/${id}`); toast.success("Key revoked"); router.refresh(); } catch (err) { toast.error((err as Error).message || "Could not revoke"); } });
      }}
    >
      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Revoke"}
    </button>
  );
}
