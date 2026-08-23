import type { Metadata } from "next";
import { Search, Filter, RotateCw, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { EXECUTIONS, EXEC_STATUS_TONE } from "@/lib/marketing-auto-data";

export const metadata: Metadata = { title: "Execution Logs — Amplivanta" };

export default function ExecutionLogsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Automation Execution Logs"
        subtitle="Workflow execution history, failures, retries and per-step outcomes."
      />
      <MarketingSubnav />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="h-3.5 w-3.5 text-ink-muted" />
          <input placeholder="Search by workflow, contact, error…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
        </div>
        {["All", "Running", "Completed", "Failed", "Waiting"].map((f, i) => (
          <button key={f} className={`rounded-xl border px-3 py-2 text-[12px] font-semibold ${i === 0 ? "border-violet/40 bg-violet/5 text-violet" : "border-line text-ink-soft"}`}>{f}</button>
        ))}
        <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-[12px] font-semibold text-ink"><Filter className="h-3.5 w-3.5" /> More</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Workflow</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Current Step</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Started</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Attempts</th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {EXECUTIONS.map((e) => (
              <tr key={e.id} className="border-b border-line last:border-0 hover:bg-bg-soft/40">
                <td className="px-4 py-3 text-[13px] font-semibold text-ink">{e.workflow}</td>
                <td className="px-4 py-3 text-[12px] text-blue-600 underline">{e.contact}</td>
                <td className="px-4 py-3">
                  <div className="text-[12.5px] text-ink">{e.step}</div>
                  {e.errorHint && <div className="mt-0.5 text-[10.5px] text-red-600">{e.errorHint}</div>}
                </td>
                <td className="px-4 py-3"><StatusPill tone={EXEC_STATUS_TONE[e.status]}>{e.status}</StatusPill></td>
                <td className="px-4 py-3 text-[11.5px] text-ink-muted">{e.startedAt}</td>
                <td className="px-4 py-3 text-[11.5px] text-ink-soft">{e.duration}</td>
                <td className="px-4 py-3 text-[11.5px] text-ink-soft">{e.attempts ?? 1}</td>
                <td className="px-2 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    {e.status === "Failed" && <button className="rounded-lg bg-amber-500 p-1.5 text-white"><RotateCw className="h-3 w-3" /></button>}
                    <button className="rounded-lg p-1.5 text-ink-muted hover:bg-bg-soft"><ChevronRight className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
