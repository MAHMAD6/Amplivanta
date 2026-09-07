import type { Metadata } from "next";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Clock,
  Database,
  Download,
  FileSpreadsheet,
  Loader2,
  RotateCw,
  Upload,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { IntegrationsSubnav } from "@/components/amplivanta/integrations-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill } from "@/components/amplivanta/status-pill";

export const metadata: Metadata = { title: "Import / Export" };

const IMPORT_TYPES = [
  { title: "Contacts", desc: "CSV or XLSX with email, name, company, tags.", icon: Users },
  { title: "Companies", desc: "Accounts with domain, industry and size.", icon: Database },
  { title: "Deals", desc: "Pipeline records with stage, value and owner.", icon: FileSpreadsheet },
];

const EXPORT_TYPES = [
  { title: "Contacts", format: "CSV · XLSX" },
  { title: "Campaign Analytics", format: "CSV" },
  { title: "Audit Log", format: "CSV · JSON" },
  { title: "Full Workspace Backup", format: "JSON" },
];

const JOBS = [
  { name: "contacts-may-2026.csv", kind: "Import", rows: "4,812 rows", by: "Alex Rivera", when: "May 30, 2026 · 10:24 AM", status: "Completed", tone: "green" as const, icon: CheckCircle2 },
  { name: "deals-q2.xlsx", kind: "Import", rows: "1,204 rows", by: "Priya Ramesh", when: "May 29, 2026 · 02:15 PM", status: "Processing", tone: "amber" as const, icon: Loader2 },
  { name: "campaign-analytics.csv", kind: "Export", rows: "18,930 rows", by: "Alex Rivera", when: "May 28, 2026 · 09:02 AM", status: "Completed", tone: "green" as const, icon: CheckCircle2 },
  { name: "audit-log-2026.json", kind: "Export", rows: "56,201 rows", by: "System", when: "May 27, 2026 · 12:00 AM", status: "Completed", tone: "green" as const, icon: CheckCircle2 },
  { name: "companies-legacy.csv", kind: "Import", rows: "312 rows", by: "Noah Thompson", when: "May 26, 2026 · 04:20 PM", status: "Failed", tone: "red" as const, icon: RotateCw },
];

export default function ImportExportPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Import / Export"
        subtitle="Bring data into Amplivanta or export it out — with validated, trackable jobs."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <Upload className="h-3.5 w-3.5" /> New Import
          </button>
        }
      />
      <IntegrationsSubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={ArrowDownToLine} label="Imports (30d)" value={null} tone="violet" />
        <KpiCard icon={ArrowUpFromLine} label="Exports (30d)" value={null} tone="blue" />
        <KpiCard icon={CheckCircle2} label="Success Rate" value={null} tone="green" />
        <KpiCard icon={Clock} label="Avg. Job Time" value={null} tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Import */}
        <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <h2 className="text-[14px] font-bold text-ink">Import Data</h2>
          <p className="mt-1 text-[12px] text-ink-soft">
            Upload a CSV or XLSX. We validate formats and flag duplicates before anything is written.
          </p>
          <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-bg-soft py-8 text-center">
            <Upload className="h-7 w-7 text-ink-muted" />
            <div className="mt-2 text-[13px] font-semibold text-ink">Drag &amp; drop a file</div>
            <div className="text-[11.5px] text-ink-muted">or click to browse · CSV, XLSX up to 25 MB</div>
            <button className="mt-3 rounded-xl border border-line bg-white px-4 py-2 text-[12.5px] font-semibold text-violet">
              Choose File
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {IMPORT_TYPES.map((t) => (
              <div key={t.title} className="flex items-center gap-3 rounded-xl border border-line p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet/10 text-violet">
                  <t.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold text-ink">{t.title}</div>
                  <div className="text-[11px] text-ink-muted">{t.desc}</div>
                </div>
                <button className="text-[11.5px] font-semibold text-violet">Template</button>
              </div>
            ))}
          </div>
        </section>

        {/* Export */}
        <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <h2 className="text-[14px] font-bold text-ink">Export Data</h2>
          <p className="mt-1 text-[12px] text-ink-soft">
            Exports respect your role permissions and are access-controlled after generation.
          </p>
          <div className="mt-4 space-y-2">
            {EXPORT_TYPES.map((t) => (
              <div key={t.title} className="flex items-center gap-3 rounded-xl border border-line p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-royal-blue/10 text-royal-blue">
                  <Download className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold text-ink">{t.title}</div>
                  <div className="text-[11px] text-ink-muted">{t.format}</div>
                </div>
                <button className="rounded-lg border border-line px-3 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:border-violet/30 hover:text-violet">
                  Export
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[11.5px] leading-relaxed text-amber-700">
            Deletion and retention jobs are managed under Settings → Data Management to respect legal
            and retention rules.
          </div>
        </section>
      </div>

      {/* Job history */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-[14px] font-bold text-ink">Job History</h2>
          <button className="text-[12px] font-semibold text-violet">View all</button>
        </div>
        <div className="grid grid-cols-[1fr_90px_110px_140px_180px_110px] gap-3 border-b border-line bg-bg-soft px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          <span>File</span>
          <span>Type</span>
          <span>Rows</span>
          <span>By</span>
          <span>When</span>
          <span>Status</span>
        </div>
        {JOBS.map((j) => (
          <div key={j.name} className="grid grid-cols-[1fr_90px_110px_140px_180px_110px] items-center gap-3 border-b border-line px-5 py-3.5 last:border-0 hover:bg-bg-soft">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="h-4 w-4 text-ink-muted" />
              <span className="truncate text-[12.5px] font-semibold text-ink">{j.name}</span>
            </div>
            <span className="text-[12px] text-ink-soft">{j.kind}</span>
            <span className="text-[12px] text-ink-soft">{j.rows}</span>
            <span className="text-[12px] text-ink-soft">{j.by}</span>
            <span className="text-[11.5px] text-ink-muted">{j.when}</span>
            <StatusPill tone={j.tone}>
              <span className="inline-flex items-center gap-1">
                <j.icon className={`h-3 w-3 ${j.status === "Processing" ? "animate-spin" : ""}`} /> {j.status}
              </span>
            </StatusPill>
          </div>
        ))}
      </section>
    </div>
  );
}
