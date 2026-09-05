"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Activity, Download, Loader2, Upload, X } from "lucide-react";
import { importCsv, runSystemHealthCheck } from "@/app/(admin)/admin/actions";
import type { AdminRow } from "@/lib/server/admin-queries";
import { cn } from "@/lib/utils";

/** Downloads the current result set, honouring the active search and filters. */
export function SuperExportButton({ pageKey, disabled }: { pageKey: string; disabled?: boolean }) {
  const params = useSearchParams();
  const href = useMemo(() => {
    const next = new URLSearchParams(params.toString());
    next.delete("page");
    next.delete("pageSize");
    next.set("key", pageKey);
    return `/api/admin/export?${next.toString()}`;
  }, [params, pageKey]);

  if (disabled) {
    return (
      <span
        title="Export becomes available once this screen has a connected data source."
        className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13.5px] font-bold text-admin-navy opacity-45"
      >
        <Download className="h-4 w-4" /> Export
      </span>
    );
  }

  return (
    <a
      href={href}
      className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13.5px] font-bold text-admin-navy transition hover:bg-bg-soft"
    >
      <Download className="h-4 w-4" /> Export
    </a>
  );
}

/**
 * CSV import. Only offered on screens where importing is appropriate; elsewhere
 * the control explains why rather than sitting there dead.
 */
export function SuperImportButton({ pageKey, headers }: { pageKey: string; headers: string[] | null }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  if (!headers) {
    return (
      <span
        title="Import is limited to reference data. Governance and billing records must come from their own system of record."
        className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13.5px] font-bold text-admin-navy opacity-45"
      >
        <Upload className="h-4 w-4" /> Import
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13.5px] font-bold text-admin-navy transition hover:bg-bg-soft"
      >
        <Upload className="h-4 w-4" /> Import
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-admin-navy/40 p-4" role="dialog" aria-modal="true" aria-label="Import CSV">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 shadow-card-lg">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[17px] font-bold text-admin-navy">Import CSV</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-ink-muted hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-[13px] text-ink-soft">
              Expected header row: <code className="rounded bg-bg-soft px-1.5 py-0.5 text-[12px]">{headers.join(", ")}</code>
            </p>

            <form
              ref={formRef}
              className="mt-5"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                start(async () => {
                  const res = await importCsv(pageKey, fd);
                  setResult(res.ok ? { ok: true, message: res.message } : { ok: false, message: res.error });
                  if (res.ok) formRef.current?.reset();
                });
              }}
            >
              <input
                type="file"
                name="file"
                accept=".csv,text/csv"
                required
                className="block w-full rounded-xl border border-line bg-white p-3 text-[13px] file:mr-3 file:rounded-lg file:border-0 file:bg-royal-tint file:px-3 file:py-1.5 file:text-[12.5px] file:font-bold file:text-royal-blue"
              />
              {result && (
                <p className={cn("mt-4 rounded-xl px-4 py-3 text-[12.5px] font-semibold", result.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")} role="status">
                  {result.message}
                </p>
              )}
              <div className="mt-5 flex justify-end gap-2.5">
                <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-xl border border-line px-4 text-[13.5px] font-bold text-admin-navy hover:bg-bg-soft">
                  Close
                </button>
                <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-royal-blue px-4 text-[13.5px] font-bold text-white hover:bg-royal-soft disabled:opacity-60">
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />} Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/** Runs live diagnostics and writes the results the System Health screen reads. */
export function SuperHealthCheckButton() {
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await runSystemHealthCheck();
            setResult(res.ok ? { ok: true, message: res.message } : { ok: false, message: res.error });
          })
        }
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-royal-blue px-4 text-[13.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
        Run diagnostics
      </button>
      {result && (
        <span className={cn("rounded-xl px-3.5 py-2 text-[12.5px] font-semibold", result.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")} role="status">
          {result.message}
        </span>
      )}
    </div>
  );
}

/**
 * Table with row selection. Selecting rows reveals a bulk bar; "Export selected"
 * builds the CSV from the selected rows in the browser so it always matches
 * exactly what the operator picked.
 */
export function SuperSelectableTable({
  columns,
  rows,
  pageKey,
  detailHref,
}: {
  columns: string[];
  rows: AdminRow[];
  pageKey: string;
  detailHref?: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const allChecked = rows.length > 0 && selected.length === rows.length;

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  function exportSelected() {
    const chosen = rows.filter((r) => selected.includes(r.id));
    const esc = (v: string | null) => {
      const s = v ?? "";
      const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
      return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
    };
    const csv = [columns.map(esc).join(","), ...chosen.map((r) => r.cells.map(esc).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pageKey}-selected.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-royal-blue/30 bg-royal-tint px-4 py-3">
          <span className="text-[13px] font-bold text-admin-navy">{selected.length} selected</span>
          <button type="button" onClick={exportSelected} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12.5px] font-bold text-admin-navy hover:bg-bg-soft">
            <Download className="h-3.5 w-3.5" /> Export selected
          </button>
          <button type="button" onClick={() => setSelected([])} className="text-[12.5px] font-semibold text-royal-blue hover:underline">
            Clear
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-line bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => setSelected(e.currentTarget.checked ? rows.map((r) => r.id) : [])}
                    aria-label="Select all rows"
                    className="h-4 w-4 accent-royal-blue"
                  />
                </th>
                {columns.map((c) => (
                  <th key={c} scope="col" className="whitespace-nowrap px-6 py-4 text-left text-[13px] font-bold text-admin-navy">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={cn("border-b border-line last:border-0 hover:bg-bg-soft", selected.includes(r.id) && "bg-royal-tint/50")}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={() => toggle(r.id)}
                      aria-label={`Select ${r.cells[0] ?? r.id}`}
                      className="h-4 w-4 accent-royal-blue"
                    />
                  </td>
                  {r.cells.map((c, i) => (
                    <td key={i} className="whitespace-nowrap px-6 py-4 text-[13px] text-ink">
                      {i === 0 && detailHref ? (
                        <a href={`${detailHref}/${r.id}`} className="font-semibold text-royal-blue hover:underline">
                          {c ?? r.id}
                        </a>
                      ) : (
                        c ?? <span className="text-ink-muted">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
