"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

type Preview = {
  fileName: string;
  headers: string[];
  mapping: (string | null)[];
  mappingError: string | null;
  fields: { key: string; label: string; required: boolean }[];
  sample: string[][];
  rows: number;
  tooMany: boolean;
  valid: number;
  invalid: number;
  errors: { row: number; message: string }[];
};

const ENTITIES: [string, string, string][] = [
  ["contacts", "Contacts", "Email, name, phone, job title, company, status and tags."],
  ["companies", "Companies", "Name, domain, website, industry, size and location."],
  ["deals", "Deals", "Name, value, currency, stage, status, close date, contact email and company."],
];

const btn = "inline-flex h-10 items-center justify-center gap-2 rounded-md px-5 text-[13.5px] font-semibold disabled:opacity-50";

async function post<T>(url: string, fd: FormData): Promise<T> {
  const res = await fetch(url, { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof json.error === "string" && !json.error.startsWith("[") ? json.error : "The request could not be completed.");
  return json as T;
}

export function ImportWizard({ canEdit }: { canEdit: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [entity, setEntity] = useState("contacts");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [mapping, setMapping] = useState<(string | null)[]>([]);
  const [duplicates, setDuplicates] = useState("skip");
  const [busy, setBusy] = useState<"preview" | "import" | null>(null);
  const [drag, setDrag] = useState(false);
  const [result, setResult] = useState<null | { status: string; totalRows: number; created: number; updated: number; skipped: number; errors: number; id: string }>(null);

  async function load(f: File, ent = entity, map?: (string | null)[]) {
    setBusy("preview");
    setResult(null);
    try {
      const fd = new FormData();
      fd.set("file", f);
      fd.set("entity", ent);
      if (map) fd.set("mapping", JSON.stringify(map));
      const p = await post<Preview>("/api/data-transfer/preview", fd);
      setFile(f);
      setPreview(p);
      setMapping(p.mapping);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read the file");
    } finally {
      setBusy(null);
    }
  }

  async function run() {
    if (!file || !preview) return;
    setBusy("import");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("entity", entity);
      fd.set("mapping", JSON.stringify(mapping));
      fd.set("duplicates", duplicates);
      const { job } = await post<{ job: NonNullable<typeof result> }>("/api/data-transfer/import", fd);
      setResult(job);
      setPreview(null);
      setFile(null);
      if (job.status === "failed") toast.error("No rows could be imported");
      else toast.success(`Imported: ${job.created} created, ${job.updated} updated`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(null);
    }
  }

  const reset = () => {
    setPreview(null);
    setFile(null);
    setMapping([]);
    if (input.current) input.current.value = "";
  };

  return (
    <div>
      <fieldset disabled={!canEdit || busy !== null} className="space-y-2">
        <legend className="sr-only">What are you importing?</legend>
        {ENTITIES.map(([v, l, d]) => (
          <label key={v} className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-3", entity === v ? "border-[#0B5CFF] bg-royal-tint/40" : "border-line hover:bg-bg-soft")}>
            <input type="radio" name="entity" value={v} checked={entity === v} onChange={() => { setEntity(v); if (file) void load(file, v); }} className="mt-1" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-semibold text-deep-navy">{l}</span>
              <span className="block text-[12px] text-ink-soft">{d}</span>
            </span>
            <a href={`/api/data-transfer/template?entity=${v}`} className="shrink-0 text-[12px] font-semibold text-[#0B5CFF] hover:underline" onClick={(e) => e.stopPropagation()}>Template</a>
          </label>
        ))}
      </fieldset>

      {!preview && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f && canEdit) void load(f); }}
          className={cn("mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center", drag ? "border-[#0B5CFF] bg-royal-tint/40" : "border-line bg-bg-soft/60")}
        >
          {busy === "preview" ? <Loader2 className="h-7 w-7 animate-spin text-[#0B5CFF]" /> : <Upload className="h-7 w-7 text-ink-muted" />}
          <div className="mt-2 text-[13.5px] font-semibold text-deep-navy">{busy === "preview" ? "Reading file…" : "Drag and drop a CSV file"}</div>
          <div className="text-[12px] text-ink-soft">or choose one · CSV up to 5 MB and 10,000 rows</div>
          <input ref={input} type="file" accept=".csv,text/csv" className="sr-only" id="import-file" onChange={(e) => { const f = e.target.files?.[0]; if (f) void load(f); }} disabled={!canEdit || busy !== null} />
          <label htmlFor="import-file" className={cn(btn, "mt-3 cursor-pointer border border-line bg-white text-deep-navy hover:bg-bg-soft", (!canEdit || busy) && "pointer-events-none opacity-50")}>Choose File</label>
          {!canEdit && <p className="mt-2 text-[12px] text-ink-muted">Viewers cannot import data.</p>}
        </div>
      )}

      {preview && (
        <div className="mt-4 rounded-xl border border-line p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[13.5px] font-semibold text-deep-navy"><FileSpreadsheet className="h-4 w-4 text-ink-muted" />{preview.fileName}</div>
            <div className="text-[12.5px] text-ink-soft">{preview.rows.toLocaleString("en-US")} rows · {preview.valid.toLocaleString("en-US")} valid · {preview.invalid.toLocaleString("en-US")} with problems</div>
          </div>
          {preview.tooMany && <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-[12.5px] text-red-700">This file has more than 10,000 rows. Split it into smaller files.</p>}

          <h3 className="mt-4 text-[13px] font-semibold text-deep-navy">Map columns</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[12.5px]">
              <thead><tr className="border-b border-line text-ink-soft"><th className="py-2 pr-3 font-semibold">Column in file</th><th className="py-2 pr-3 font-semibold">Example</th><th className="py-2 font-semibold">Import as</th></tr></thead>
              <tbody>
                {preview.headers.map((h, i) => (
                  <tr key={`${h}-${i}`} className="border-b border-line last:border-0">
                    <td className="py-2 pr-3 font-medium text-deep-navy">{h || <em className="text-ink-muted">Untitled</em>}</td>
                    <td className="max-w-[180px] truncate py-2 pr-3 text-ink-soft">{preview.sample[0]?.[i] || "—"}</td>
                    <td className="py-2">
                      <select
                        aria-label={`Field for ${h}`}
                        value={mapping[i] ?? ""}
                        disabled={busy !== null}
                        onChange={(e) => { const next = [...mapping]; next[i] = e.target.value || null; setMapping(next); if (file) void load(file, entity, next); }}
                        className="h-9 w-full rounded-md border border-line bg-white px-2 text-[12.5px] text-deep-navy"
                      >
                        <option value="">Don’t import</option>
                        {preview.fields.map((f) => <option key={f.key} value={f.key} disabled={mapping.includes(f.key) && mapping[i] !== f.key}>{f.label}{f.required ? " *" : ""}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.mappingError && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{preview.mappingError}</p>}
          {preview.errors.length > 0 && (
            <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
              <div className="flex items-center gap-1.5 font-semibold"><AlertTriangle className="h-3.5 w-3.5" /> Rows that will be skipped</div>
              <ul className="mt-1 space-y-0.5">{preview.errors.map((e) => <li key={e.row}>Row {e.row}: {e.message}</li>)}</ul>
            </div>
          )}

          {entity !== "deals" && (
            <fieldset className="mt-4">
              <legend className="text-[13px] font-semibold text-deep-navy">When a record already exists{entity === "contacts" ? " (same email)" : " (same domain or name)"}</legend>
              <div className="mt-1.5 flex flex-wrap gap-4 text-[12.5px] text-deep-navy">
                <label className="flex items-center gap-2"><input type="radio" name="dup" checked={duplicates === "skip"} onChange={() => setDuplicates("skip")} /> Skip it</label>
                <label className="flex items-center gap-2"><input type="radio" name="dup" checked={duplicates === "update"} onChange={() => setDuplicates("update")} /> Update it with values from the file</label>
              </div>
            </fieldset>
          )}

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button type="button" onClick={run} disabled={busy !== null || preview.tooMany || preview.valid === 0 || Boolean(preview.mappingError)} className={cn(btn, "bg-[#0B5CFF] text-white hover:bg-[#0A4FE0]")}>
              {busy === "import" && <Loader2 className="h-4 w-4 animate-spin" />} Import {preview.valid.toLocaleString("en-US")} row{preview.valid === 1 ? "" : "s"}
            </button>
            <button type="button" onClick={reset} disabled={busy !== null} className={cn(btn, "border border-line bg-white text-deep-navy hover:bg-bg-soft")}>Cancel</button>
          </div>
        </div>
      )}

      {result && (
        <div className={cn("mt-4 rounded-xl border p-4 text-[13px]", result.status === "failed" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800")}>
          <div className="flex items-center gap-2 font-semibold">{result.status === "failed" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />} {result.status === "failed" ? "Import failed" : "Import finished"}</div>
          <p className="mt-1">{result.created} created · {result.updated} updated · {result.skipped} skipped{result.errors ? ` (${result.errors} with problems)` : ""} of {result.totalRows} rows.</p>
          <a href={`/app/integrations/import-export?job=${result.id}#job`} className="mt-1 inline-block font-semibold underline">View job details</a>
        </div>
      )}
    </div>
  );
}
