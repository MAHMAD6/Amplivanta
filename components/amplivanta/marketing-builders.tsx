"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Copy, GripVertical, Loader2, Monitor, Redo2, Smartphone, Tablet, Trash2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { toastResult } from "@/lib/action-toast";
import { CONDITION_FIELDS, CONDITION_OPERATORS, NODE_FIELDS, NODE_LABELS, NODE_TYPES, validateGraph, type NodeType, type WorkflowNodeSpec } from "@/lib/marketing/workflow";
import { EMAIL_BLOCKS, PAGE_ELEMENTS, PAGE_SECTIONS, renderEmailHtml, type Block } from "@/lib/marketing/blocks";
import { FIELD_TYPES, type FormField } from "@/lib/marketing/logic";

type Result = { ok: true; message: string; id?: string } | { ok: false; error: string };
const uid = () => Math.random().toString(36).slice(2, 10);
const control = "h-10 w-full rounded-md border border-line bg-white px-3 text-[13px] text-deep-navy placeholder:text-ink-muted focus:border-[#0B5CFF] focus:outline-none disabled:bg-bg-soft/60";
const area = "w-full rounded-md border border-line bg-white px-3 py-2 text-[13px] text-deep-navy placeholder:text-ink-muted focus:border-[#0B5CFF] focus:outline-none disabled:bg-bg-soft/60";
const btn = "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft disabled:opacity-50";
const primary = "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0B5CFF] px-5 text-[13px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50";
const panel = "min-w-0 rounded-xl border border-line bg-white p-4";

/** Undo/redo history for a list. */
function useHistory<T>(initial: T[]) {
  const [state, setState] = useState({ past: [] as T[][], present: initial, future: [] as T[][] });
  return {
    items: state.present,
    set: (next: T[]) => setState((s) => ({ past: [...s.past.slice(-40), s.present], present: next, future: [] })),
    undo: () => setState((s) => (s.past.length ? { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] } : s)),
    redo: () => setState((s) => (s.future.length ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) } : s)),
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}

function useAction() {
  const [pending, start] = useTransition();
  const router = useRouter();
  return { pending, run: (fn: () => Promise<Result>, after?: () => void) => start(async () => { const r = await fn(); if (toastResult(r)) { after?.(); router.refresh(); } }) };
}

const move = <T,>(list: T[], i: number, d: number) => {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

/** Palette item: click to append, or drag onto the canvas. */
function PaletteItem({ label, type, onAdd, disabled, icon }: { label: string; type: string; onAdd: (t: string) => void; disabled?: boolean; icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      draggable={!disabled}
      disabled={disabled}
      onDragStart={(e) => e.dataTransfer.setData("text/av-block", type)}
      onClick={() => onAdd(type)}
      className="flex w-full items-center justify-between rounded-lg border border-line bg-white px-3 py-2.5 text-left text-[13px] font-semibold text-deep-navy hover:border-[#0B5CFF]/50 disabled:opacity-50"
    >
      <span className="flex items-center gap-2">{icon}{label}</span>
      <GripVertical className="h-4 w-4 text-ink-muted" />
    </button>
  );
}

function Canvas({ onDropType, children, empty, disabled, className }: { onDropType: (t: string) => void; children: React.ReactNode; empty: React.ReactNode; disabled?: boolean; className?: string }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const t = e.dataTransfer.getData("text/av-block");
        if (t && !disabled) onDropType(t);
      }}
      className={cn("min-h-[420px] rounded-xl border bg-bg-soft/30 p-4", over ? "border-[#0B5CFF] bg-royal-tint/40" : "border-line", className)}
    >
      {children}
      {empty}
    </div>
  );
}

function RowTools({ onUp, onDown, onRemove, onCopy, disabled }: { onUp: () => void; onDown: () => void; onRemove: () => void; onCopy?: () => void; disabled?: boolean }) {
  const b = "rounded p-1 text-ink-muted hover:bg-bg-soft hover:text-deep-navy disabled:opacity-40";
  return (
    <span className="flex shrink-0 items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      <button type="button" disabled={disabled} aria-label="Move up" className={b} onClick={onUp}><ArrowUp className="h-3.5 w-3.5" /></button>
      <button type="button" disabled={disabled} aria-label="Move down" className={b} onClick={onDown}><ArrowDown className="h-3.5 w-3.5" /></button>
      {onCopy && <button type="button" disabled={disabled} aria-label="Duplicate" className={b} onClick={onCopy}><Copy className="h-3.5 w-3.5" /></button>}
      <button type="button" disabled={disabled} aria-label="Remove" className={b} onClick={onRemove}><Trash2 className="h-3.5 w-3.5" /></button>
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-[12.5px] font-semibold text-deep-navy">{children}</span>;
}

/* ----------------------------- Workflow Builder ---------------------------- */

export function WorkflowBuilder({
  workflow,
  triggers,
  segments,
  contacts,
  canEdit,
  saveDraft,
  publish,
  test,
}: {
  workflow: { id: string; name: string; segmentId: string; goal: string; maxRetries: number; nodes: WorkflowNodeSpec[] };
  triggers: [string, string][];
  segments: [string, string][];
  contacts: [string, string][];
  canEdit: boolean;
  saveDraft: (id: string, nodes: string, settings: { name: string; segmentId: string; goal: string; maxRetries: number }) => Promise<Result>;
  publish: (id: string) => Promise<Result>;
  test: (id: string, contactId: string) => Promise<Result>;
}) {
  const h = useHistory<WorkflowNodeSpec>(workflow.nodes);
  const [selected, setSelected] = useState<string | null>(workflow.nodes[0]?.id ?? null);
  const [settings, setSettings] = useState({ name: workflow.name, segmentId: workflow.segmentId, goal: workflow.goal, maxRetries: workflow.maxRetries });
  const [testContact, setTestContact] = useState("");
  const [dirty, setDirty] = useState(false);
  const { pending, run } = useAction();
  const issues = useMemo(() => validateGraph(h.items), [h.items]);
  const node = h.items.find((n) => n.id === selected);

  const set = (next: WorkflowNodeSpec[]) => {
    h.set(next);
    setDirty(true);
  };
  const add = (type: string) => {
    const t = type as NodeType;
    if (t === "trigger" && h.items.some((n) => n.type === "trigger")) return toast.error("A workflow has a single trigger.");
    const n: WorkflowNodeSpec = { id: uid(), type: t, name: NODE_LABELS[t], config: Object.fromEntries(NODE_FIELDS[t].map(([k]) => [k, t === "trigger" ? triggers[0]?.[0] ?? "" : ""])) };
    set(t === "trigger" ? [n, ...h.items] : [...h.items, n]);
    setSelected(n.id);
  };
  const update = (patch: Partial<WorkflowNodeSpec> & { config?: Record<string, string> }) => set(h.items.map((n) => (n.id === selected ? { ...n, ...patch, config: { ...n.config, ...(patch.config ?? {}) } } : n)));
  const save = (after?: () => void) => run(() => saveDraft(workflow.id, JSON.stringify(h.items), settings), () => { setDirty(false); after?.(); });
  const triggerOpts = node?.type === "trigger" && node.config.event && !triggers.some(([k]) => k === node.config.event) ? [...triggers, [node.config.event, node.config.event] as [string, string]] : triggers;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button type="button" className={btn} disabled={!h.canUndo || !canEdit} onClick={() => { h.undo(); setDirty(true); }} aria-label="Undo"><Undo2 className="h-4 w-4" /></button>
          <button type="button" className={btn} disabled={!h.canRedo || !canEdit} onClick={() => { h.redo(); setDirty(true); }} aria-label="Redo"><Redo2 className="h-4 w-4" /></button>
          <span className={cn("ml-2 text-[12.5px]", dirty ? "text-amber-700" : "text-emerald-700")}>{dirty ? "Unsaved changes" : "Draft saved"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={btn} disabled={!canEdit || pending} onClick={() => save()}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}Save Draft</button>
          <select value={testContact} onChange={(e) => setTestContact(e.target.value)} aria-label="Test contact" className={cn(control, "w-[180px]")} disabled={!canEdit}>
            <option value="">Test without a contact</option>
            {contacts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button type="button" className={btn} disabled={!canEdit || pending || issues.length > 0} title={issues[0]} onClick={() => save(() => run(() => test(workflow.id, testContact)))}>Test</button>
          <button type="button" className={primary} disabled={!canEdit || pending || issues.length > 0} title={issues[0]} onClick={() => save(() => run(() => publish(workflow.id)))}>Publish</button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[230px_minmax(0,1fr)_300px]">
        <aside className={panel}>
          <h2 className="text-[15px] font-semibold text-deep-navy">Add Nodes</h2>
          <p className="mb-3 text-[12px] text-ink-muted">Click or drag a node to the canvas</p>
          <div className="space-y-2">{NODE_TYPES.map((t) => <PaletteItem key={t} type={t} label={NODE_LABELS[t]} onAdd={add} disabled={!canEdit} />)}</div>
          <p className="mt-4 rounded-lg bg-bg-soft/60 p-3 text-[11.5px] text-ink-soft">Nodes run top to bottom. A condition that doesn&apos;t match ends the run; delays pause it.</p>
        </aside>
        <Canvas
          onDropType={add}
          disabled={!canEdit}
          empty={!h.items.length && <div className="py-24 text-center"><h3 className="text-[16px] font-semibold text-deep-navy">Add a trigger to begin</h3><p className="mt-1 text-[13px] text-ink-soft">Choose a trigger from the left panel to start building your workflow.</p></div>}
        >
          <ol className="mx-auto max-w-[520px] space-y-0">
            {h.items.map((n, i) => (
              <li key={n.id}>
                {i > 0 && <div className="mx-auto h-5 w-px bg-line" />}
                <div role="button" tabIndex={0} onClick={() => setSelected(n.id)} onKeyDown={(e) => e.key === "Enter" && setSelected(n.id)} className={cn("flex items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2.5", selected === n.id ? "border-[#0B5CFF] ring-2 ring-[#0B5CFF]/15" : "border-line")}>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{NODE_LABELS[n.type]}</span>
                    <span className="block truncate text-[13.5px] font-semibold text-deep-navy">{n.name}</span>
                    <span className="block truncate text-[12px] text-ink-soft">{summary(n, triggers)}</span>
                  </span>
                  <RowTools disabled={!canEdit} onUp={() => set(move(h.items, i, -1))} onDown={() => set(move(h.items, i, 1))} onRemove={() => { set(h.items.filter((x) => x.id !== n.id)); setSelected(null); }} />
                </div>
              </li>
            ))}
          </ol>
          {h.items.length > 0 && issues.length > 0 && <ul className="mx-auto mt-4 max-w-[520px] space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">{issues.map((x) => <li key={x}>{x}</li>)}</ul>}
        </Canvas>
        <aside className={cn(panel, "space-y-3")}>
          {node ? (
            <>
              <h2 className="text-[15px] font-semibold text-deep-navy">{NODE_LABELS[node.type]} Settings</h2>
              <label className="block"><Label>Name</Label><input className={control} value={node.name} disabled={!canEdit} onChange={(e) => update({ name: e.target.value })} /></label>
              {NODE_FIELDS[node.type].map(([k, l, kind]) => (
                <label key={k} className="block">
                  <Label>{l}</Label>
                  {kind === "select" ? (
                    <select className={control} disabled={!canEdit} value={node.config[k] ?? ""} onChange={(e) => update({ config: { [k]: e.target.value } })}>
                      <option value="">Select…</option>
                      {(k === "event" ? triggerOpts : k === "field" ? CONDITION_FIELDS : CONDITION_OPERATORS).map(([v, lb]) => <option key={v} value={v}>{lb}</option>)}
                    </select>
                  ) : k === "body" ? (
                    <textarea rows={6} className={area} disabled={!canEdit} value={node.config[k] ?? ""} onChange={(e) => update({ config: { [k]: e.target.value } })} placeholder="Use {{firstName}} to personalise" />
                  ) : (
                    <input type={kind === "number" ? "number" : "text"} min={kind === "number" ? 1 : undefined} className={control} disabled={!canEdit} value={node.config[k] ?? ""} onChange={(e) => update({ config: { [k]: e.target.value } })} />
                  )}
                </label>
              ))}
              <button type="button" className="text-[12.5px] font-semibold text-[#0B5CFF]" onClick={() => setSelected(null)}>Workflow settings</button>
            </>
          ) : (
            <>
              <h2 className="text-[15px] font-semibold text-deep-navy">Workflow Settings</h2>
              <label className="block"><Label>Name</Label><input className={control} disabled={!canEdit} value={settings.name} onChange={(e) => { setSettings({ ...settings, name: e.target.value }); setDirty(true); }} /></label>
              <label className="block"><Label>Audience</Label>
                <select className={control} disabled={!canEdit} value={settings.segmentId} onChange={(e) => { setSettings({ ...settings, segmentId: e.target.value }); setDirty(true); }}>
                  <option value="">Not set</option>
                  {segments.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
              <label className="block"><Label>Goal</Label><input className={control} disabled={!canEdit} placeholder="Not set" value={settings.goal} onChange={(e) => { setSettings({ ...settings, goal: e.target.value }); setDirty(true); }} /></label>
              <label className="block"><Label>Retries on failure</Label><input type="number" min={0} max={5} className={control} disabled={!canEdit} value={settings.maxRetries} onChange={(e) => { setSettings({ ...settings, maxRetries: Number(e.target.value) }); setDirty(true); }} /></label>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function summary(n: WorkflowNodeSpec, triggers: [string, string][]) {
  const c = n.config;
  switch (n.type) {
    case "trigger": return triggers.find(([k]) => k === c.event)?.[1] ?? (c.event || "Not configured");
    case "condition": return c.field ? `${CONDITION_FIELDS.find(([k]) => k === c.field)?.[1]} ${CONDITION_OPERATORS.find(([k]) => k === c.operator)?.[1] ?? ""} ${c.value ?? ""}` : "Not configured";
    case "delay": return Number(c.minutes) > 0 ? (Number(c.minutes) % 1440 === 0 ? `Wait ${Number(c.minutes) / 1440} day(s)` : `Wait ${c.minutes} minute(s)`) : "Not configured";
    case "email": return c.subject || "Not configured";
    case "tag": return c.tag ? `Add tag “${c.tag}”` : "Not configured";
    case "webhook": return c.url || "Not configured";
    case "goal": return c.name || "Goal reached";
  }
}

/* ------------------------------ Email Composer ----------------------------- */

type EmailSettings = { senderName: string; senderEmail: string; replyTo: string; subject: string; preheader: string; segmentId: string };

export function EmailComposer({
  email,
  segments,
  canEdit,
  save,
  sendTest,
  sendNow,
  schedule,
}: {
  email: { id: string; blocks: Block[]; settings: EmailSettings; locked: boolean };
  segments: [string, string][];
  canEdit: boolean;
  save: (id: string, payload: EmailSettings & { blocks: unknown }) => Promise<Result>;
  sendTest: (id: string) => Promise<Result>;
  sendNow: (id: string) => Promise<Result>;
  schedule: (fd: FormData) => Promise<Result>;
}) {
  const editable = canEdit && !email.locked;
  const h = useHistory<Block>(email.blocks);
  const [s, setS] = useState(email.settings);
  const [tab, setTab] = useState<"settings" | "style">("settings");
  const [leftTab, setLeftTab] = useState<"content" | "layouts">("content");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [structure, setStructure] = useState(false);
  const [preview, setPreview] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [when, setWhen] = useState("");
  const [dirty, setDirty] = useState(false);
  const { pending, run } = useAction();
  const block = h.items.find((b) => b.id === selected);
  const set = (next: Block[]) => { h.set(next); setDirty(true); };
  const add = (type: string) => {
    const def = EMAIL_BLOCKS.find(([t]) => t === type);
    if (!def) return;
    const b = { id: uid(), type, props: Object.fromEntries(def[2].map(([k]) => [k, ""])) };
    set([...h.items, b]);
    setSelected(b.id);
  };
  const layouts: [string, string[]][] = [["Announcement", ["hero", "text", "button", "divider", "footer"]], ["Newsletter", ["hero", "text", "image", "text", "social", "footer"]], ["Simple note", ["text", "button", "footer"]]];
  const html = useMemo(() => renderEmailHtml(h.items, { preheader: s.preheader, footer: "Unsubscribe link is added automatically when sent." }), [h.items, s.preheader]);
  const doSave = (after?: () => void) => run(() => save(email.id, { ...s, blocks: h.items }), () => { setDirty(false); after?.(); });
  const width = device === "desktop" ? "max-w-[640px]" : device === "tablet" ? "max-w-[480px]" : "max-w-[360px]";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        {email.locked && <span className="mr-auto rounded-md bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800">This campaign has been sent or is sending, so it can&apos;t be edited.</span>}
        {!email.locked && <span className={cn("mr-auto text-[12.5px]", dirty ? "text-amber-700" : "text-emerald-700")}>{dirty ? "Unsaved changes" : "Saved"}</span>}
        <button type="button" className={btn} onClick={() => setPreview(!preview)}>{preview ? "Edit" : "Preview"}</button>
        <button type="button" className={btn} disabled={!editable || pending} onClick={() => doSave(() => run(() => sendTest(email.id)))}>Send Test</button>
        <button type="button" className={btn} disabled={!editable || pending} onClick={() => doSave()}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}Save</button>
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} aria-label="Schedule time" className={cn(control, "w-[210px]")} disabled={!editable} />
        <button type="button" className={btn} disabled={!editable || pending || !when} onClick={() => doSave(() => { const fd = new FormData(); fd.set("id", email.id); fd.set("scheduledAt", new Date(when).toISOString()); run(() => schedule(fd)); })}>Schedule</button>
        <button type="button" className={primary} disabled={!editable || pending} onClick={() => { if (window.confirm("Send this campaign to the selected audience now?")) doSave(() => run(() => sendNow(email.id))); }}>Send Now</button>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[240px_minmax(0,1fr)_320px]">
        <aside className={panel}>
          <div className="mb-3 grid grid-cols-2 border-b border-line text-[13px]">
            {(["content", "layouts"] as const).map((t) => <button key={t} type="button" onClick={() => setLeftTab(t)} className={cn("pb-2 font-semibold capitalize", leftTab === t ? "border-b-2 border-[#0B5CFF] text-[#0B5CFF]" : "text-ink-soft")}>{t}</button>)}
          </div>
          {leftTab === "content" ? (
            <div className="space-y-2">{EMAIL_BLOCKS.map(([t, l]) => <PaletteItem key={t} type={t} label={l} onAdd={add} disabled={!editable} />)}</div>
          ) : (
            <div className="space-y-2">
              {layouts.map(([name, types]) => (
                <button key={name} type="button" disabled={!editable} onClick={() => { if (!h.items.length || window.confirm("Replace the current content with this layout?")) set(types.map((t) => ({ id: uid(), type: t, props: Object.fromEntries((EMAIL_BLOCKS.find(([x]) => x === t)?.[2] ?? []).map(([k]) => [k, ""])) }))); }} className="w-full rounded-lg border border-line px-3 py-2.5 text-left text-[13px] font-semibold text-deep-navy hover:border-[#0B5CFF]/50 disabled:opacity-50">
                  {name}<span className="block text-[11.5px] font-normal text-ink-muted">{types.length} blocks</span>
                </button>
              ))}
            </div>
          )}
        </aside>
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex rounded-lg border border-line bg-white p-1">
              {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([d, I]) => <button key={d} type="button" onClick={() => setDevice(d)} className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold capitalize", device === d ? "bg-royal-tint text-[#0B5CFF]" : "text-ink-soft")}><I className="h-4 w-4" />{d}</button>)}
            </div>
            <div className="flex items-center gap-1.5">
              <label className="flex items-center gap-1.5 text-[12.5px] font-semibold text-deep-navy"><input type="checkbox" checked={structure} onChange={(e) => setStructure(e.target.checked)} /> Show Structure</label>
              <button type="button" className={btn} disabled={!h.canUndo || !editable} onClick={() => { h.undo(); setDirty(true); }} aria-label="Undo"><Undo2 className="h-4 w-4" /></button>
              <button type="button" className={btn} disabled={!h.canRedo || !editable} onClick={() => { h.redo(); setDirty(true); }} aria-label="Redo"><Redo2 className="h-4 w-4" /></button>
            </div>
          </div>
          {preview ? (
            <iframe title="Email preview" sandbox="" srcDoc={html} className={cn("mx-auto block h-[640px] w-full rounded-xl border border-line bg-white", width)} />
          ) : (
            <Canvas onDropType={add} disabled={!editable} empty={!h.items.length && <div className="py-24 text-center"><h3 className="text-[16px] font-semibold text-deep-navy">Start building your email</h3><p className="mt-1 text-[13px] text-ink-soft">Drag content blocks from the left panel to design your email.</p></div>}>
              <div className={cn("mx-auto space-y-2", width)}>
                {h.items.map((b, i) => (
                  <div key={b.id} role="button" tabIndex={0} onClick={() => { setSelected(b.id); setTab("settings"); }} onKeyDown={(e) => e.key === "Enter" && setSelected(b.id)} className={cn("rounded-lg border bg-white px-3 py-2.5", selected === b.id ? "border-[#0B5CFF] ring-2 ring-[#0B5CFF]/15" : structure ? "border-dashed border-ink-muted" : "border-line")}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{EMAIL_BLOCKS.find(([t]) => t === b.type)?.[1]}</span>
                      <RowTools disabled={!editable} onUp={() => set(move(h.items, i, -1))} onDown={() => set(move(h.items, i, 1))} onCopy={() => set([...h.items.slice(0, i + 1), { ...b, id: uid() }, ...h.items.slice(i + 1)])} onRemove={() => set(h.items.filter((x) => x.id !== b.id))} />
                    </div>
                    <p className="mt-1 line-clamp-2 whitespace-pre-line text-[13px] text-deep-navy">{b.props.heading || b.props.text || b.props.label || b.props.url || b.props.links || (b.type === "html" ? "Custom HTML" : b.type === "divider" ? "———" : "Empty block — select to edit")}</p>
                  </div>
                ))}
              </div>
            </Canvas>
          )}
        </div>
        <aside className={cn(panel, "space-y-3")}>
          <div className="grid grid-cols-2 border-b border-line text-[13px]">
            {(["settings", "style"] as const).map((t) => <button key={t} type="button" onClick={() => setTab(t)} className={cn("pb-2 font-semibold capitalize", tab === t ? "border-b-2 border-[#0B5CFF] text-[#0B5CFF]" : "text-ink-soft")}>{t}</button>)}
          </div>
          {tab === "settings" ? (
            <>
              <h2 className="text-[15px] font-semibold text-deep-navy">Email Settings</h2>
              {([["senderName", "Sender Name", "Enter sender name"], ["senderEmail", "Sender Email", "Enter sender email"], ["replyTo", "Reply-To Email", "Optional"], ["subject", "Subject", "Enter subject"], ["preheader", "Preheader", "Optional"]] as const).map(([k, l, ph]) => (
                <label key={k} className="block"><Label>{l}</Label><input className={control} disabled={!editable} placeholder={ph} value={s[k]} onChange={(e) => { setS({ ...s, [k]: e.target.value }); setDirty(true); }} /></label>
              ))}
              <label className="block"><Label>Audience</Label>
                <select className={control} disabled={!editable} value={s.segmentId} onChange={(e) => { setS({ ...s, segmentId: e.target.value }); setDirty(true); }}>
                  <option value="">Choose a segment</option>
                  {segments.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
              <p className="text-[11.5px] text-ink-muted">Mail is sent from the platform&apos;s verified sender; the sender name and reply-to are applied where the provider allows. An unsubscribe link is always added.</p>
            </>
          ) : block ? (
            <>
              <h2 className="text-[15px] font-semibold text-deep-navy">{EMAIL_BLOCKS.find(([t]) => t === block.type)?.[1]} Block</h2>
              {(EMAIL_BLOCKS.find(([t]) => t === block.type)?.[2] ?? []).map(([k, l, multi]) => (
                <label key={k} className="block"><Label>{l}</Label>
                  {multi ? <textarea rows={k === "html" ? 10 : 4} className={area} disabled={!editable} value={block.props[k] ?? ""} onChange={(e) => set(h.items.map((b) => (b.id === block.id ? { ...b, props: { ...b.props, [k]: e.target.value } } : b)))} /> : <input className={control} disabled={!editable} value={block.props[k] ?? ""} onChange={(e) => set(h.items.map((b) => (b.id === block.id ? { ...b, props: { ...b.props, [k]: e.target.value } } : b)))} />}
                </label>
              ))}
              {!(EMAIL_BLOCKS.find(([t]) => t === block.type)?.[2].length) && <p className="text-[12.5px] text-ink-soft">This block has no settings.</p>}
            </>
          ) : (
            <p className="py-8 text-center text-[13px] text-ink-soft">Select a block on the canvas to edit its content.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------- Form Builder ------------------------------ */

type FormSettings = { name: string; submitButtonText: string; successMessage: string; redirectUrl: string; workflowId: string; requireConsent: boolean; consentText: string; privacyUrl: string; termsUrl: string; confirmationSubject: string };

export function FormBuilder({ form, workflows, canEdit, save, tab }: { form: { id: string; fields: FormField[]; settings: FormSettings }; workflows: [string, string][]; canEdit: boolean; save: (id: string, payload: FormSettings & { fields: unknown }) => Promise<Result>; tab: "design" | "settings" | "integrations" | "compliance" }) {
  const h = useHistory<FormField>(form.fields);
  const [s, setS] = useState(form.settings);
  const [selected, setSelected] = useState<string | null>(form.fields[0]?.id ?? null);
  const [mobile, setMobile] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { pending, run } = useAction();
  const f = h.items.find((x) => x.id === selected);
  const set = (next: FormField[]) => { h.set(next); setDirty(true); };
  const add = (type: string) => {
    if (type === "button") return setSelected(null);
    const label = FIELD_TYPES.find(([t]) => t === type)?.[1] ?? "Field";
    const n: FormField = { id: uid(), type, label, name: `${type}_${h.items.length + 1}`, required: false, options: "", value: "" };
    set([...h.items, n]);
    setSelected(n.id);
  };
  const patch = (p: Partial<FormField>) => set(h.items.map((x) => (x.id === selected ? { ...x, ...p } : x)));
  const input = (k: keyof FormSettings, l: string, ph?: string) => (
    <label className="block"><Label>{l}</Label><input className={control} disabled={!canEdit} placeholder={ph} value={String(s[k])} onChange={(e) => { setS({ ...s, [k]: e.target.value }); setDirty(true); }} /></label>
  );

  const settingsPanel = (
    <div className="space-y-3">
      {tab === "design" && (f ? (
        <>
          <h2 className="text-[15px] font-semibold text-deep-navy">Field Settings</h2>
          <label className="block"><Label>Label</Label><input className={control} disabled={!canEdit} value={f.label} onChange={(e) => patch({ label: e.target.value })} /></label>
          <label className="block"><Label>Field key</Label><input className={control} disabled={!canEdit} value={f.name} onChange={(e) => patch({ name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })} /></label>
          {f.type === "dropdown" && <label className="block"><Label>Options (one per line)</Label><textarea rows={4} className={area} disabled={!canEdit} value={f.options} onChange={(e) => patch({ options: e.target.value })} /></label>}
          {f.type === "hidden" && <label className="block"><Label>Value</Label><input className={control} disabled={!canEdit} value={f.value} onChange={(e) => patch({ value: e.target.value })} /></label>}
          {f.type !== "hidden" && <label className="flex items-center gap-2 text-[13px] text-deep-navy"><input type="checkbox" disabled={!canEdit} checked={f.required} onChange={(e) => patch({ required: e.target.checked })} /> Required</label>}
          <p className="text-[11.5px] text-ink-muted">Keys like first_name, last_name, company, phone and job_title fill the matching contact fields.</p>
        </>
      ) : (
        <>
          <h2 className="text-[15px] font-semibold text-deep-navy">Button & Confirmation</h2>
          {input("submitButtonText", "Button text")}
          {input("successMessage", "Success message")}
        </>
      ))}
      {tab === "settings" && (<><h2 className="text-[15px] font-semibold text-deep-navy">Form Settings</h2>{input("name", "Form name")}{input("submitButtonText", "Button text")}{input("successMessage", "Success message")}{input("redirectUrl", "Redirect URL after submit", "Optional https:// link")}{input("confirmationSubject", "Email Confirmation subject", "Optional — sends the success message by email")}</>)}
      {tab === "integrations" && (
        <>
          <h2 className="text-[15px] font-semibold text-deep-navy">Workflow Assignment</h2>
          <select className={control} disabled={!canEdit} value={s.workflowId} onChange={(e) => { setS({ ...s, workflowId: e.target.value }); setDirty(true); }}>
            <option value="">Select workflow</option>
            {workflows.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <p className="text-[12px] text-ink-soft">Each submission creates or updates a CRM contact and starts the assigned workflow plus any active workflow triggered by “Form submitted”.</p>
        </>
      )}
      {tab === "compliance" && (
        <>
          <h2 className="text-[15px] font-semibold text-deep-navy">Consent</h2>
          <label className="flex items-center gap-2 text-[13px] text-deep-navy"><input type="checkbox" disabled={!canEdit} checked={s.requireConsent} onChange={(e) => { setS({ ...s, requireConsent: e.target.checked }); setDirty(true); }} /> Require consent checkbox</label>
          {input("consentText", "Consent statement", "I agree to receive communications…")}
          {input("privacyUrl", "Privacy Policy URL", "Enter policy URL")}
          {input("termsUrl", "Terms URL", "Enter terms URL")}
        </>
      )}
      <button type="button" className={cn(primary, "w-full")} disabled={!canEdit || pending} onClick={() => run(() => save(form.id, { ...s, fields: h.items }), () => setDirty(false))}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}Save Form</button>
      {dirty && <p className="text-center text-[12px] text-amber-700">Unsaved changes</p>}
    </div>
  );

  if (tab !== "design") return <div className={cn(panel, "max-w-[560px]")}>{settingsPanel}</div>;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[240px_minmax(0,1fr)_320px]">
      <aside className={panel}>
        <h2 className="text-[15px] font-semibold text-deep-navy">Add Fields</h2>
        <p className="mb-3 text-[12px] text-ink-muted">Click or drag fields to build your form</p>
        <div className="space-y-2">
          {FIELD_TYPES.map(([t, l]) => <PaletteItem key={t} type={t} label={l} onAdd={add} disabled={!canEdit} />)}
          <PaletteItem type="button" label="Button" onAdd={add} disabled={!canEdit} />
        </div>
      </aside>
      <div className={panel}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-deep-navy">Form Preview</h2>
          <div className="flex gap-1">
            <button type="button" aria-label="Desktop" onClick={() => setMobile(false)} className={cn("rounded-md border p-1.5", !mobile ? "border-[#0B5CFF] text-[#0B5CFF]" : "border-line text-ink-muted")}><Monitor className="h-4 w-4" /></button>
            <button type="button" aria-label="Mobile" onClick={() => setMobile(true)} className={cn("rounded-md border p-1.5", mobile ? "border-[#0B5CFF] text-[#0B5CFF]" : "border-line text-ink-muted")}><Smartphone className="h-4 w-4" /></button>
          </div>
        </div>
        <Canvas onDropType={add} disabled={!canEdit} empty={!h.items.length && <div className="py-20 text-center"><h3 className="text-[16px] font-semibold text-deep-navy">Start building your form</h3><p className="mt-1 text-[13px] text-ink-soft">Drag fields from the left panel to create a form.</p></div>}>
          <div className={cn("mx-auto space-y-2", mobile ? "max-w-[340px]" : "max-w-[520px]")}>
            {h.items.map((x, i) => (
              <div key={x.id} role="button" tabIndex={0} onClick={() => setSelected(x.id)} onKeyDown={(e) => e.key === "Enter" && setSelected(x.id)} className={cn("rounded-lg border bg-white p-3", selected === x.id ? "border-[#0B5CFF] ring-2 ring-[#0B5CFF]/15" : "border-line")}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-deep-navy">{x.label || "Untitled"}{x.required && <span className="text-red-600"> *</span>} <span className="font-normal text-ink-muted">· {FIELD_TYPES.find(([t]) => t === x.type)?.[1]}</span></span>
                  <RowTools disabled={!canEdit} onUp={() => set(move(h.items, i, -1))} onDown={() => set(move(h.items, i, 1))} onRemove={() => set(h.items.filter((y) => y.id !== x.id))} />
                </div>
                {x.type !== "hidden" && x.type !== "checkbox" && <div className="mt-2 h-9 rounded-md border border-line bg-bg-soft/40" />}
              </div>
            ))}
            {h.items.length > 0 && <div role="button" tabIndex={0} onClick={() => setSelected(null)} onKeyDown={(e) => e.key === "Enter" && setSelected(null)} className={cn("flex h-10 items-center justify-center rounded-md bg-[#0B5CFF] text-[13px] font-semibold text-white", selected === null && "ring-2 ring-[#0B5CFF]/30 ring-offset-2")}>{s.submitButtonText || "Submit"}</div>}
          </div>
        </Canvas>
      </div>
      <aside className={panel}>{settingsPanel}</aside>
    </div>
  );
}

/* --------------------------- Landing Page Builder -------------------------- */

type PageSettings = { title: string; slug: string; metaTitle: string; metaDescription: string; socialImage: string; formId: string };

export function PageBuilder({ page, forms, canEdit, save, publish, hostedBase, previewSlot }: { page: { id: string; blocks: Block[]; settings: PageSettings }; forms: [string, string][]; canEdit: boolean; save: (id: string, payload: PageSettings & { blocks: unknown }) => Promise<Result>; publish: (id: string) => Promise<Result>; hostedBase: string; previewSlot?: React.ReactNode }) {
  const h = useHistory<Block>(page.blocks);
  const [s, setS] = useState(page.settings);
  const [left, setLeft] = useState<"sections" | "elements">("sections");
  const [mobile, setMobile] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [selected, setSelected] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const { pending, run } = useAction();
  const all = [...PAGE_SECTIONS, ...PAGE_ELEMENTS];
  const block = h.items.find((b) => b.id === selected);
  const set = (next: Block[]) => { h.set(next); setDirty(true); };
  const add = (type: string) => {
    const def = all.find(([t]) => t === type);
    if (!def) return;
    const b = { id: uid(), type, props: Object.fromEntries(def[2].map(([k]) => [k, ""])) };
    set([...h.items, b]);
    setSelected(b.id);
  };
  const field = (k: keyof PageSettings, l: string, ph: string, max?: number) => (
    <label className="block"><Label>{l}{max ? <span className="float-right font-normal text-ink-muted">{String(s[k]).length}/{max}</span> : null}</Label><input className={control} maxLength={max} disabled={!canEdit} placeholder={ph} value={s[k]} onChange={(e) => { setS({ ...s, [k]: e.target.value }); setDirty(true); }} /></label>
  );
  const doSave = (after?: () => void) => run(() => save(page.id, { ...s, blocks: h.items }), () => { setDirty(false); after?.(); });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[260px] flex-1 items-center rounded-md border border-line bg-white px-3 text-[13px] text-ink-soft">{hostedBase}<input aria-label="Page URL" className="min-w-0 flex-1 bg-transparent text-deep-navy focus:outline-none" disabled={!canEdit} placeholder="set-page-url" value={s.slug} onChange={(e) => { setS({ ...s, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }); setDirty(true); }} /></div>
        <div className="flex rounded-lg border border-line bg-white p-1">
          <button type="button" aria-label="Desktop" onClick={() => setMobile(false)} className={cn("rounded-md px-2.5 py-1", !mobile ? "bg-royal-tint text-[#0B5CFF]" : "text-ink-muted")}><Monitor className="h-4 w-4" /></button>
          <button type="button" aria-label="Mobile" onClick={() => setMobile(true)} className={cn("rounded-md px-2.5 py-1", mobile ? "bg-royal-tint text-[#0B5CFF]" : "text-ink-muted")}><Smartphone className="h-4 w-4" /></button>
        </div>
        <button type="button" className={btn} disabled={!h.canUndo || !canEdit} onClick={() => { h.undo(); setDirty(true); }} aria-label="Undo"><Undo2 className="h-4 w-4" /></button>
        <button type="button" className={btn} disabled={!h.canRedo || !canEdit} onClick={() => { h.redo(); setDirty(true); }} aria-label="Redo"><Redo2 className="h-4 w-4" /></button>
        <div className="flex items-center rounded-md border border-line bg-white">
          <button type="button" className="px-3 py-2 text-deep-navy" onClick={() => setZoom(Math.max(50, zoom - 10))} aria-label="Zoom out">−</button>
          <span className="w-12 text-center text-[12.5px]">{zoom}%</span>
          <button type="button" className="px-3 py-2 text-deep-navy" onClick={() => setZoom(Math.min(150, zoom + 10))} aria-label="Zoom in">+</button>
        </div>
        <button type="button" className={btn} onClick={() => setZoom(100)}>Fit to Width</button>
        <span className={cn("text-[12.5px]", dirty ? "text-amber-700" : "text-emerald-700")}>{dirty ? "Unsaved changes" : "Saved"}</span>
        <button type="button" className={cn(btn, "ml-auto")} disabled={!canEdit || pending} onClick={() => doSave()}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}Save Draft</button>
        <button type="button" className={primary} disabled={!canEdit || pending} onClick={() => doSave(() => run(() => publish(page.id)))}>Publish</button>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[230px_minmax(0,1fr)_300px]">
        <aside className={panel}>
          <div className="mb-3 grid grid-cols-2 border-b border-line text-[13px]">
            {(["sections", "elements"] as const).map((t) => <button key={t} type="button" onClick={() => setLeft(t)} className={cn("pb-2 font-semibold capitalize", left === t ? "border-b-2 border-[#0B5CFF] text-[#0B5CFF]" : "text-ink-soft")}>{t}</button>)}
          </div>
          <p className="mb-2 text-[12px] text-ink-muted">Click or drag to build your page</p>
          <div className="space-y-2">{(left === "sections" ? PAGE_SECTIONS : PAGE_ELEMENTS).map(([t, l]) => <PaletteItem key={t} type={t} label={l} onAdd={add} disabled={!canEdit} />)}</div>
        </aside>
        <div className="min-w-0 overflow-hidden">
          <Canvas onDropType={add} disabled={!canEdit} className="overflow-auto" empty={!h.items.length && <div className="py-24 text-center"><h3 className="text-[16px] font-semibold text-deep-navy">Start building your landing page</h3><p className="mt-1 text-[13px] text-ink-soft">Drag sections or elements from the left panel to create your page.</p></div>}>
            <div className={cn("mx-auto origin-top space-y-2", mobile ? "max-w-[380px]" : "max-w-[760px]")} style={{ transform: `scale(${zoom / 100})` }}>
              {h.items.map((b, i) => (
                <div key={b.id} role="button" tabIndex={0} onClick={() => setSelected(b.id)} onKeyDown={(e) => e.key === "Enter" && setSelected(b.id)} className={cn("rounded-lg border bg-white px-3 py-3", selected === b.id ? "border-[#0B5CFF] ring-2 ring-[#0B5CFF]/15" : "border-line")}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{all.find(([t]) => t === b.type)?.[1]}</span>
                    <RowTools disabled={!canEdit} onUp={() => set(move(h.items, i, -1))} onDown={() => set(move(h.items, i, 1))} onCopy={() => set([...h.items.slice(0, i + 1), { ...b, id: uid() }, ...h.items.slice(i + 1)])} onRemove={() => set(h.items.filter((x) => x.id !== b.id))} />
                  </div>
                  <p className={cn("mt-1 line-clamp-2 whitespace-pre-line text-deep-navy", b.type === "hero" ? "text-[18px] font-bold" : "text-[13px]")}>{b.props.heading || b.props.text || b.props.quote || b.props.label || b.props.items || (b.type === "form" ? (s.formId ? "Lead form" : "Lead form — connect a form in Page Settings") : b.type === "divider" ? "———" : "Empty — select to edit")}</p>
                </div>
              ))}
            </div>
          </Canvas>
          {previewSlot}
        </div>
        <aside className={cn(panel, "space-y-3")}>
          {block ? (
            <>
              <div className="flex items-center justify-between"><h2 className="text-[15px] font-semibold text-deep-navy">{all.find(([t]) => t === block.type)?.[1]}</h2><button type="button" className="text-[12.5px] font-semibold text-[#0B5CFF]" onClick={() => setSelected(null)}>Page settings</button></div>
              {(all.find(([t]) => t === block.type)?.[2] ?? []).map(([k, l, multi]) => (
                <label key={k} className="block"><Label>{l}</Label>
                  {multi ? <textarea rows={4} className={area} disabled={!canEdit} value={block.props[k] ?? ""} onChange={(e) => set(h.items.map((b) => (b.id === block.id ? { ...b, props: { ...b.props, [k]: e.target.value } } : b)))} /> : <input className={control} disabled={!canEdit} value={block.props[k] ?? ""} onChange={(e) => set(h.items.map((b) => (b.id === block.id ? { ...b, props: { ...b.props, [k]: e.target.value } } : b)))} />}
                </label>
              ))}
            </>
          ) : (
            <>
              <h2 className="text-[15px] font-semibold text-deep-navy">Page Settings</h2>
              {field("title", "Page Name", "Untitled landing page")}
              {field("metaTitle", "Meta Title", "Optional", 60)}
              {field("metaDescription", "Meta Description", "Optional", 160)}
              {field("socialImage", "Social Image", "https:// image URL")}
              <label className="block"><Label>Lead form</Label>
                <select className={control} disabled={!canEdit} value={s.formId} onChange={(e) => { setS({ ...s, formId: e.target.value }); setDirty(true); }}>
                  <option value="">Not connected</option>
                  {forms.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

/* --------------------------------- Helpers -------------------------------- */

/** Execution log table with row selection and Retry Selected (only failed runs are selectable). */
export function RetryTable({ head, rows, canEdit, retry }: { head: string[]; rows: { id: string; failed: boolean; highlight?: boolean; cells: React.ReactNode[] }[]; canEdit: boolean; retry: (ids: string[]) => Promise<Result> }) {
  const [picked, setPicked] = useState<string[]>([]);
  const { pending, run } = useAction();
  const failed = rows.filter((r) => r.failed).map((r) => r.id);
  return (
    <div>
      <div className="mb-2 flex justify-end">
        <button type="button" className={btn} disabled={!canEdit || pending || !picked.length} onClick={() => run(() => retry(picked), () => setPicked([]))}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}Retry Selected{picked.length ? ` (${picked.length})` : ""}</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-line bg-bg-soft/70 text-deep-navy">
              <th className="w-10 px-3 py-2.5"><input type="checkbox" aria-label="Select all failed runs" disabled={!failed.length} checked={failed.length > 0 && picked.length === failed.length} onChange={(e) => setPicked(e.target.checked ? failed : [])} /></th>
              {head.map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={cn("border-b border-line last:border-0", r.highlight && "bg-royal-tint/30")}>
                <td className="px-3 py-2.5"><input type="checkbox" aria-label="Select run" disabled={!r.failed} checked={picked.includes(r.id)} onChange={(e) => setPicked(e.target.checked ? [...picked, r.id] : picked.filter((x) => x !== r.id))} /></td>
                {r.cells.map((cell, i) => <td key={i} className="max-w-[320px] px-3 py-2.5">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CopyField({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input readOnly value={value} className={control} onFocus={(e) => e.currentTarget.select()} />
        <button type="button" className={btn} onClick={() => navigator.clipboard.writeText(value).then(() => toast.success("Copied."), () => toast.error("Copy failed."))}>Copy</button>
      </div>
    </div>
  );
}

export function DateTimeAction({ id, action, label, className }: { id: string; action: (fd: FormData) => Promise<Result>; label: string; className?: string }) {
  const [when, setWhen] = useState("");
  const { pending, run } = useAction();
  return (
    <span className="flex flex-wrap items-center gap-2">
      <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} aria-label={`${label} time`} className={cn(control, "w-[210px]")} />
      <button type="button" className={className ?? btn} disabled={!when || pending} onClick={() => { const fd = new FormData(); fd.set("id", id); fd.set("scheduledAt", new Date(when).toISOString()); run(() => action(fd)); }}>{label}</button>
    </span>
  );
}
