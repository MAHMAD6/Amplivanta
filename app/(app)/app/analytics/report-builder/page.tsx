import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, CalendarDays, Clock, FileText, Filter, Plus, SlidersHorizontal, TrendingUp, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { ResourceDialog, type Field } from "@/components/amplivanta/crud/resource-dialog";
import { DeleteAction } from "@/components/amplivanta/crud/delete-action";
import { DataTable, EmptyState, KeyList, Panel, ScreenHeader, StatGrid, fmtDate, fmtDateTime, fmtInt } from "@/components/amplivanta/screen-kit";
import { analyticsContext } from "@/lib/server/analytics-screens";
import { REPORT_TYPES, runReport, type ReportTable } from "@/lib/server/report-data";

export const metadata: Metadata = { title: "Report Builder" };
export const dynamic = "force-dynamic";

const FIELDS: Field[] = [
  { name: "name", label: "Report name", required: true, placeholder: "Monthly pipeline summary" },
  { name: "type", label: "Report type", type: "select", required: true, options: REPORT_TYPES.map((t) => ({ value: t.value, label: t.label })) },
];

type SP = { report?: string; days?: string };

export default async function ReportBuilderPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const days = [7, 30, 90].includes(Number(sp.days)) ? Number(sp.days) : 30;
  const c = await analyticsContext();
  let reachable = Boolean(c);
  let reports: { id: string; name: string; type: string; createdAt: Date }[] = [];
  let exports: { id: string; createdAt: Date; resourceId: string | null }[] = [];
  let table: ReportTable | null = null;
  if (c) {
    try {
      [reports, exports] = await Promise.all([
        db.report.findMany({ where: { workspaceId: c.workspaceId }, orderBy: { createdAt: "desc" }, take: 50, select: { id: true, name: true, type: true, createdAt: true } }),
        db.auditLog.findMany({ where: { workspaceId: c.workspaceId, action: "report.exported" }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, createdAt: true, resourceId: true } }),
      ]);
    } catch {
      reachable = false;
    }
  }
  const selected = reports.find((r) => r.id === sp.report) ?? null;
  const def = selected ? REPORT_TYPES.find((t) => t.value === selected.type) : undefined;
  if (c && selected) table = await runReport(c.workspaceId, selected.type, days).catch(() => null);

  const newReport = (
    <ResourceDialog
      title="New Report"
      fields={FIELDS}
      endpoint="/api/reports"
      submitLabel="Create report"
      successMessage="Report saved"
      trigger={<button type="button" className="inline-flex h-11 items-center gap-2 rounded-md bg-[#0B5CFF] px-6 text-[14px] font-semibold text-white hover:bg-[#0A4FE0]"><Plus className="h-4 w-4" /> New Report</button>}
    />
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Analytics & Reports", "/app/analytics"], ["Report Builder"]]}
        title="Report Builder"
        subtitle="Create and save custom reports once data is available."
        actions={
          <>
            {newReport}
            {selected && (
              <form method="get" className="flex gap-2">
                <input type="hidden" name="report" value={selected.id} />
                <select name="days" defaultValue={String(days)} aria-label="Date range" className="h-11 rounded-md border border-line bg-white px-3 text-[13.5px] font-semibold"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select>
                <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-md border border-line bg-white px-4 text-[13.5px] font-semibold"><Filter className="h-4 w-4" /> Filters</button>
              </form>
            )}
            {selected && table?.rows.length ? (
              <a href={`/api/reports/${selected.id}/export?days=${days}`} className="inline-flex h-11 items-center gap-2 rounded-md border border-line bg-white px-5 text-[13.5px] font-semibold text-deep-navy"><Upload className="h-4 w-4" /> Export</a>
            ) : (
              <span className="inline-flex h-11 items-center gap-2 rounded-md border border-line bg-bg-soft px-5 text-[13.5px] text-ink-muted"><Upload className="h-4 w-4" /> Export</span>
            )}
          </>
        }
      />
      <StatGrid
        stats={[
          { label: "Saved Reports", icon: FileText, value: reports.length ? fmtInt(reports.length) : null },
          { label: "Scheduled Reports", icon: CalendarDays, value: null },
          { label: "Recent Exports", icon: Upload, value: exports.length ? fmtInt(exports.length) : null, hint: exports[0] ? `Last ${fmtDateTime(exports[0].createdAt)}` : undefined },
        ]}
      />
      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Saved Reports">
          {reports.length ? (
            <ul className="divide-y divide-line">
              {reports.map((r) => (
                <li key={r.id} className={cn("flex items-center justify-between gap-2 rounded px-2 py-2.5", r.id === selected?.id && "bg-royal-tint/50")}>
                  <Link href={`/app/analytics/report-builder?report=${r.id}`} className="min-w-0">
                    <span className="block truncate text-[13.5px] font-semibold text-deep-navy">{r.name}</span>
                    <span className="block text-[12px] capitalize text-ink-muted">{r.type} · {fmtDate(r.createdAt)}</span>
                  </Link>
                  <DeleteAction endpoint={`/api/reports/${r.id}`} label="Report" name={r.name} trigger={<button type="button" className="text-[12px] text-ink-muted hover:text-red-600">Delete</button>} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={FileText} title={reachable ? "No reports yet" : "Reports unavailable"} body="Create a report to begin." action={reachable ? newReport : undefined} />
          )}
        </Panel>
        <Panel title="Report Configuration">
          {selected && def ? (
            <KeyList rows={[["Name", selected.name], ["Type", def.label], ["Date range", `Last ${days} days`], ["Created", fmtDate(selected.createdAt)]]} />
          ) : (
            <EmptyState icon={SlidersHorizontal} title="No report configured" body={reports.length ? "Select a saved report to configure it." : "Create a report to begin."} />
          )}
        </Panel>
        <Panel title="Dimensions & Metrics">
          {def ? (
            <KeyList rows={[["Dimensions", def.dimensions], ["Metrics", def.metrics]]} />
          ) : (
            <EmptyState icon={BarChart3} title="No dimensions or metrics" body="Create a report to begin." />
          )}
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Preview" className="xl:col-span-1">
          {table && table.rows.length ? (
            <DataTable minWidth={320} columns={table.columns} rows={table.rows.map((r) => r.map((v) => (typeof v === "number" ? v.toLocaleString("en-US") : v)))} />
          ) : (
            <EmptyState icon={TrendingUp} title="No preview available" body={selected ? "This report has no data for the selected range yet." : "Create a report to begin."} />
          )}
        </Panel>
        <Panel title="Filters">
          {selected ? <KeyList rows={[["Date range", `Last ${days} days`], ["Workspace", "Current workspace"]]} /> : <EmptyState icon={Filter} title="No filters added" body="Add filters to refine your report." />}
        </Panel>
        <Panel title="Scheduled Exports">
          <EmptyState icon={Clock} title="No scheduled exports" body="Schedule exports once data is available." />
        </Panel>
      </div>
    </div>
  );
}
