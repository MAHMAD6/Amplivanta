"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { toastResult } from "@/lib/action-toast";
import {
  deleteBrandKit,
  deleteDocument,
  deleteProject,
  deleteTemplate,
  duplicateProject,
  saveBrandKit,
  saveDocument,
  setDefaultBrandKit,
  setDocumentStatus,
  transformText,
  updateProject,
  useTemplate as startFromTemplate,
} from "@/app/(app)/app/creative-studio/actions";

type Result = { ok: true; message: string; id?: string; text?: string } | { ok: false; error: string };

export type FieldSpec =
  | { name: string; label: string; kind: "text" | "number" | "color"; required?: boolean; placeholder?: string; defaultValue?: string }
  | { name: string; label: string; kind: "textarea"; required?: boolean; placeholder?: string; rows?: number; defaultValue?: string }
  | { name: string; label: string; kind: "select"; options: [string, string][]; required?: boolean; placeholder?: string; defaultValue?: string };

const control = "w-full rounded-md border border-line bg-white px-3 text-[13.5px] text-deep-navy focus:border-[#0B5CFF] focus:outline-none";
const small = "rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-deep-navy hover:bg-bg-soft disabled:opacity-50";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-navy/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-deep-navy">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-ink-muted hover:bg-bg-soft"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Fields({ fields }: { fields: FieldSpec[] }) {
  return (
    <>
      {fields.map((f) => (
        <label key={f.name} className="block">
          <span className="mb-1 block text-[13px] font-semibold text-deep-navy">{f.label}{f.required && <span className="text-red-500"> *</span>}</span>
          {f.kind === "textarea" ? (
            <textarea name={f.name} required={f.required} rows={f.rows ?? 4} placeholder={f.placeholder} defaultValue={f.defaultValue} className={cn(control, "py-2")} />
          ) : f.kind === "select" ? (
            <select name={f.name} required={f.required} defaultValue={f.defaultValue ?? ""} className={cn(control, "h-10")}>
              <option value="">{f.placeholder ?? "Select…"}</option>
              {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ) : f.kind === "color" ? (
            <span className="flex items-center gap-2">
              <input type="color" aria-label={`${f.label} picker`} defaultValue={f.defaultValue || "#0B5CFF"} onChange={(e) => { const t = e.currentTarget.nextElementSibling as HTMLInputElement | null; if (t) t.value = e.currentTarget.value.toUpperCase(); }} className="h-10 w-12 cursor-pointer rounded border border-line" />
              <input name={f.name} defaultValue={f.defaultValue} placeholder="#RRGGBB" pattern="#[0-9A-Fa-f]{6}" className={cn(control, "h-10")} />
            </span>
          ) : (
            <input name={f.name} type={f.kind} required={f.required} placeholder={f.placeholder} defaultValue={f.defaultValue} className={cn(control, "h-10")} />
          )}
        </label>
      ))}
    </>
  );
}

/** Button + modal form bound to a server action. Optionally navigates to the created record. */
export function FormDialog({
  title,
  label,
  className,
  action,
  fields,
  submitLabel = "Save",
  goTo,
  disabled,
  note,
}: {
  title: string;
  label: React.ReactNode;
  className?: string;
  action: (fd: FormData) => Promise<Result>;
  fields: FieldSpec[];
  submitLabel?: string;
  goTo?: string;
  disabled?: boolean;
  note?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <>
      <button type="button" disabled={disabled} onClick={() => setOpen(true)} className={className ?? "inline-flex h-10 items-center rounded-md bg-[#0B5CFF] px-5 text-[13.5px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50"}>{label}</button>
      {open && (
        <Modal title={title} onClose={() => setOpen(false)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              start(async () => {
                const res = await action(fd);
                if (toastResult(res)) {
                  setOpen(false);
                  if (goTo && res.ok && res.id) router.push(`${goTo}${res.id}`);
                  else router.refresh();
                }
              });
            }}
          >
            <Fields fields={fields} />
            {note && <p className="text-[12px] text-ink-muted">{note}</p>}
            <div className="flex justify-end pt-1">
              <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0B5CFF] px-5 text-[13.5px] font-semibold text-white disabled:opacity-60">
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} {submitLabel}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function useRun() {
  const [pending, start] = useTransition();
  const router = useRouter();
  return { pending, run: (fn: () => Promise<Result>, after?: (r: Result) => void) => start(async () => { const r = await fn(); if (toastResult(r)) { after?.(r); router.refresh(); } }) };
}

export function ProjectActions({ id, starred, status, canEdit }: { id: string; starred: boolean; status: string; canEdit: boolean }) {
  const { pending, run } = useRun();
  if (!canEdit) return null;
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <button type="button" aria-label={starred ? "Unstar" : "Star"} disabled={pending} className={small} onClick={() => run(() => updateProject(id, { starred: !starred }))}>
        <Star className={cn("h-3.5 w-3.5", starred && "fill-amber-400 text-amber-400")} />
      </button>
      <button type="button" disabled={pending} className={small} onClick={() => run(() => duplicateProject(id))}>Duplicate</button>
      {status !== "archived" ? (
        <button type="button" disabled={pending} className={small} onClick={() => run(() => updateProject(id, { status: "archived" }))}>Archive</button>
      ) : (
        <button type="button" disabled={pending} className={small} onClick={() => run(() => updateProject(id, { status: "active" }))}>Restore</button>
      )}
      <button type="button" disabled={pending} className={`${small} text-red-600`} onClick={() => { if (window.confirm("Delete this project?")) run(() => deleteProject(id)); }}>Delete</button>
    </div>
  );
}

export function TemplateActions({ id, type, canEdit }: { id: string; type: string; canEdit: boolean }) {
  const { pending, run } = useRun();
  const router = useRouter();
  if (!canEdit) return null;
  return (
    <div className="flex gap-1.5">
      {type === "document" && <button type="button" disabled={pending} className={small} onClick={() => run(() => startFromTemplate(id), (r) => { if (r.ok && r.id) router.push(`/app/creative-studio/documents/${r.id}`); })}>Use</button>}
      <button type="button" disabled={pending} className={`${small} text-red-600`} onClick={() => { if (window.confirm("Delete this template?")) run(() => deleteTemplate(id)); }}>Delete</button>
    </div>
  );
}

export function BrandKitActions({ id, isDefault, canEdit }: { id: string; isDefault: boolean; canEdit: boolean }) {
  const { pending, run } = useRun();
  if (!canEdit) return null;
  return (
    <div className="flex gap-1.5">
      {!isDefault && <button type="button" disabled={pending} className={small} onClick={() => run(() => setDefaultBrandKit(id))}>Make default</button>}
      <button type="button" disabled={pending} className={`${small} text-red-600`} onClick={() => { if (window.confirm("Delete this brand kit?")) run(() => deleteBrandKit(id)); }}>Delete</button>
    </div>
  );
}

export function BrandKitForm({
  kit,
  images,
  canEdit,
}: {
  kit: { id: string; name: string; primaryColor: string | null; secondaryColor: string | null; accentColor: string | null; heading: string | null; body: string | null; guidelines: string | null; logos: string[] } | null;
  images: { id: string; name: string; url: string }[];
  canEdit: boolean;
}) {
  const { pending, run } = useRun();
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        run(() => saveBrandKit(fd));
      }}
    >
      {kit && <input type="hidden" name="id" value={kit.id} />}
      <fieldset disabled={!canEdit} className="space-y-4">
        <Fields fields={[{ name: "name", label: "Brand kit name", kind: "text", required: true, defaultValue: kit?.name }]} />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Fields fields={[
            { name: "primaryColor", label: "Primary", kind: "color", defaultValue: kit?.primaryColor ?? "" },
            { name: "secondaryColor", label: "Secondary", kind: "color", defaultValue: kit?.secondaryColor ?? "" },
            { name: "accentColor", label: "Accent", kind: "color", defaultValue: kit?.accentColor ?? "" },
          ]} />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Fields fields={[
            { name: "headingFont", label: "Heading font", kind: "text", placeholder: "e.g. Sora", defaultValue: kit?.heading ?? "" },
            { name: "bodyFont", label: "Body font", kind: "text", placeholder: "e.g. Inter", defaultValue: kit?.body ?? "" },
          ]} />
        </div>
        <div>
          <div className="mb-1 text-[13px] font-semibold text-deep-navy">Logos</div>
          {images.length ? (
            <div className="flex flex-wrap gap-2">
              {images.map((img) => (
                <label key={img.id} className="relative cursor-pointer">
                  <input type="checkbox" name="logos" value={img.id} defaultChecked={kit?.logos.includes(img.id)} className="peer absolute left-1 top-1 accent-[#0B5CFF]" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.name} className="h-16 w-16 rounded-md border-2 border-line object-contain peer-checked:border-[#0B5CFF]" />
                </label>
              ))}
            </div>
          ) : (
            <p className="text-[12.5px] text-ink-soft">Upload logo images in Creative Studio → Images, then select them here.</p>
          )}
        </div>
        <Fields fields={[{ name: "guidelines", label: "Guidelines", kind: "textarea", rows: 5, placeholder: "Voice, usage rules, do's and don'ts", defaultValue: kit?.guidelines ?? "" }]} />
      </fieldset>
      <div className="flex justify-end">
        <button type="submit" disabled={!canEdit || pending} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0B5CFF] px-6 text-[13.5px] font-semibold text-white disabled:opacity-50">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} {kit ? "Save Brand Kit" : "Create Brand Kit"}
        </button>
      </div>
    </form>
  );
}

export function DocumentRowActions({ id, status, canEdit }: { id: string; status: string; canEdit: boolean }) {
  const { pending, run } = useRun();
  if (!canEdit) return null;
  return status === "archived" ? (
    <div className="flex gap-1.5">
      <button type="button" disabled={pending} className={small} onClick={() => run(() => setDocumentStatus(id, "draft"))}>Restore</button>
      <button type="button" disabled={pending} className={`${small} text-red-600`} onClick={() => { if (window.confirm("Delete permanently?")) run(() => deleteDocument(id)); }}>Delete</button>
    </div>
  ) : (
    <button type="button" disabled={pending} className={small} onClick={() => run(() => setDocumentStatus(id, "archived"))}>Move to trash</button>
  );
}

/** Document editor with AI tools that suggest; applying replaces the selection or whole text. */
export function DocumentEditor({ id, title, content, tools, tones, canEdit }: { id: string; title: string; content: string; tools: [string, string, string][]; tones: [string, string][]; canEdit: boolean }) {
  const [t, setT] = useState(title);
  const [body, setBody] = useState(content);
  const [dirty, setDirty] = useState(false);
  const [suggestion, setSuggestion] = useState<{ text: string; from: number; to: number } | null>(null);
  const [option, setOption] = useState("");
  const area = useRef<HTMLTextAreaElement>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const save = () => start(async () => { if (toastResult(await saveDocument(id, t, body))) { setDirty(false); router.refresh(); } });
  const runTool = (tool: string) => {
    const el = area.current;
    const from = el && el.selectionEnd > el.selectionStart ? el.selectionStart : 0;
    const to = el && el.selectionEnd > el.selectionStart ? el.selectionEnd : body.length;
    start(async () => {
      const r = await transformText(tool, body.slice(from, to), option);
      if (r.ok && r.text) setSuggestion({ text: r.text, from, to });
      else if (!r.ok) toast.error(r.error);
    });
  };
  const exportFile = () => {
    const blob = new Blob([`# ${t}\n\n${body}`], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${t.replace(/[^\w-]+/g, "-").slice(0, 60) || "document"}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-xl border border-line bg-white p-5">
        <input value={t} onChange={(e) => { setT(e.target.value); setDirty(true); }} disabled={!canEdit} aria-label="Title" className="mb-3 w-full border-b border-line pb-2 text-[22px] font-bold text-deep-navy focus:outline-none" />
        <textarea ref={area} value={body} onChange={(e) => { setBody(e.target.value); setDirty(true); }} disabled={!canEdit} rows={24} aria-label="Document content" placeholder="Start writing…" className="w-full resize-y rounded-md border border-line p-3 font-mono text-[13.5px] leading-relaxed text-deep-navy focus:border-[#0B5CFF] focus:outline-none" />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[12px] text-ink-muted">{body.trim() ? `${body.trim().split(/\s+/).length.toLocaleString("en-US")} words` : "Empty"}{dirty ? " · Unsaved changes" : ""}</span>
          <div className="flex gap-2">
            <button type="button" onClick={exportFile} className="h-10 rounded-md border border-line px-4 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft">Export .md</button>
            <button type="button" onClick={save} disabled={!canEdit || pending || !dirty} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0B5CFF] px-5 text-[13.5px] font-semibold text-white disabled:opacity-50">{pending && <Loader2 className="h-4 w-4 animate-spin" />} Save</button>
          </div>
        </div>
      </section>
      <aside className="h-fit space-y-4 rounded-xl border border-line bg-white p-5">
        <h2 className="text-[16px] font-semibold text-deep-navy">Document Tools</h2>
        <p className="text-[12.5px] text-ink-soft">Select text to use a tool on part of the document, or leave nothing selected to use the whole document. Results are suggestions until you apply them.</p>
        <input value={option} onChange={(e) => setOption(e.target.value)} placeholder="Language or tone (for Translate / Change Tone)" list="tone-options" className={cn(control, "h-10")} />
        <datalist id="tone-options">{tones.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</datalist>
        <div className="grid grid-cols-2 gap-2">
          {tools.map(([v, l]) => (
            <button key={v} type="button" disabled={!canEdit || pending} onClick={() => runTool(v)} className="h-11 rounded-md border border-line text-[13px] font-semibold text-deep-navy hover:bg-bg-soft disabled:opacity-50">{l}</button>
          ))}
        </div>
        {pending && !suggestion && <p className="flex items-center gap-2 text-[12.5px] text-ink-muted"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Working…</p>}
        {suggestion && (
          <div className="rounded-lg border border-[#0B5CFF]/30 bg-royal-tint/30 p-3">
            <div className="mb-2 text-[12.5px] font-semibold text-deep-navy">Suggestion</div>
            <div className="max-h-72 overflow-y-auto whitespace-pre-wrap text-[12.5px] text-deep-navy">{suggestion.text}</div>
            <div className="mt-3 flex gap-2">
              <button type="button" className="h-9 rounded-md bg-[#0B5CFF] px-3 text-[12.5px] font-semibold text-white" onClick={() => { setBody(body.slice(0, suggestion.from) + suggestion.text + body.slice(suggestion.to)); setDirty(true); setSuggestion(null); }}>Apply</button>
              <button type="button" className="h-9 rounded-md border border-line px-3 text-[12.5px]" onClick={() => setSuggestion(null)}>Discard</button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
