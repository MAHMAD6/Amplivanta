import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileText, Square } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, Pill, ScreenHeader, fmtDate } from "@/components/amplivanta/screen-kit";
import { Chips, FilterBar, PanelTitle, RowList, Select, filterSearch, giPanel, headerPrimary, outlineSm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { createStrategyReport, deleteStrategyReport, setReportShared, setReportStatus } from "@/app/(app)/app/strategy/actions";
import { growthContext } from "@/lib/server/growth-screens";
import { PERIODS, REPORT_SECTIONS, STRATEGY_REPORT_TYPES, label } from "@/lib/growth/options";

export const metadata: Metadata = { title: "Strategy Reports" };
export const dynamic = "force-dynamic";

type SP = { q?: string; type?: string; period?: string; status?: string };
type R = { id: string; name: string; type: string; status: string; sharedAt: Date | null; config: unknown; createdAt: Date };
const periodOf = (config: unknown) => String((config as { periodDays?: number } | null)?.periodDays ?? "");

export default async function StrategyReportsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await growthContext();
  let reports: R[] = [];
  let total = 0;
  if (c) {
    try {
      const w = c.workspaceId;
      const [list, n] = await Promise.all([
        db.report.findMany({
          where: { workspaceId: w, type: sp.type && STRATEGY_REPORT_TYPES.some(([v]) => v === sp.type) ? sp.type : { startsWith: "strategy_" }, ...(sp.q ? { name: { contains: sp.q, mode: "insensitive" } } : {}), ...(sp.status ? { status: sp.status } : {}) },
          orderBy: { createdAt: "desc" },
          take: 100,
          select: { id: true, name: true, type: true, status: true, sharedAt: true, config: true, createdAt: true },
        }),
        db.report.count({ where: { workspaceId: w, type: { startsWith: "strategy_" } } }),
      ]);
      reports = sp.period ? list.filter((r) => periodOf(r.config) === sp.period) : list;
      total = n;
    } catch {
      reports = [];
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const shared = reports.filter((r) => r.sharedAt);
  const create = (cls: string) => (
    <FormDialog
      title="Create Report"
      label="Create Report"
      className={cls}
      action={createStrategyReport}
      disabled={!canEdit}
      submitLabel="Create report"
      goTo="/app/strategy/reports/"
      fields={[
        { name: "name", label: "Report name", kind: "text", required: true },
        { name: "type", label: "Report type", kind: "select", options: STRATEGY_REPORT_TYPES, required: true, defaultValue: "strategy_executive" },
        { name: "period", label: "Reporting period", kind: "select", options: PERIODS, defaultValue: "90" },
        ...REPORT_SECTIONS.map(([k, l]) => ({ name: `section_${k}`, label: l, kind: "checkbox" as const, defaultChecked: true })),
      ]}
    />
  );
  const row = (r: R) => (
    <li key={r.id} className="py-2.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/app/strategy/reports/${r.id}`} className="text-[13px] font-semibold text-deep-navy hover:text-[#0B5CFF]">{r.name}</Link>
          <div className="text-[11.5px] text-ink-muted">{label(STRATEGY_REPORT_TYPES, r.type)} · {label(PERIODS, periodOf(r.config))} · {fmtDate(r.createdAt)}</div>
        </div>
        <span className="flex items-center gap-1.5">
          <Pill tone={r.status === "final" ? "green" : "gray"}>{r.status}</Pill>
          {canEdit && <ActButton action={setReportStatus.bind(null, r.id, r.status === "final" ? "draft" : "final")}>{r.status === "final" ? "Reopen" : "Finalize"}</ActButton>}
          {canEdit && <ActButton action={setReportShared.bind(null, r.id, !r.sharedAt)}>{r.sharedAt ? "Unshare" : "Share"}</ActButton>}
          {canEdit && <ActButton action={deleteStrategyReport.bind(null, r.id)} confirm="Delete this report?">Delete</ActButton>}
        </span>
      </div>
    </li>
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader title="Strategy Reports" subtitle="Create executive reports combining goals, audiences, channel plans, performance, budgets, and recommendations." actions={create(headerPrimary)} />
      <FilterBar>
        <input name="q" defaultValue={sp.q} placeholder="Search reports" aria-label="Search reports" className={filterSearch} />
        <Select name="type" value={sp.type} all="All Report Types" options={STRATEGY_REPORT_TYPES} label="Report type" />
        <Select name="period" value={sp.period} all="Reporting Period" options={PERIODS} label="Reporting period" />
        <Select name="status" value={sp.status} all="All Statuses" options={[["draft", "Draft"], ["final", "Final"]]} label="Status" />
      </FilterBar>
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className={giPanel}>
          <PanelTitle hint="All strategy reports">Report Library</PanelTitle>
          {reports.length ? <ul className="divide-y divide-line">{reports.map(row)}</ul> : <EmptyState icon={FileText} title={total ? "No reports match" : "No strategy reports yet"} body="Create a report to summarize your current strategy and performance." action={total ? undefined : create(outlineSm)} />}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Automatic delivery on a cadence">Scheduled Reports</PanelTitle>
          <EmptyState icon={Square} title="No scheduled reports" body="Scheduled delivery is not available yet. Open a report and print or save it as PDF instead." />
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Visible to authorized workspace members">Shared Reports</PanelTitle>
          {shared.length ? (
            <ul className="divide-y divide-line">
              {shared.map((r) => <li key={r.id} className="flex justify-between py-2.5 text-[13px]"><Link href={`/app/strategy/reports/${r.id}`} className="font-semibold text-deep-navy hover:text-[#0B5CFF]">{r.name}</Link><span className="text-[12px] text-ink-soft">Shared {fmtDate(r.sharedAt)}</span></li>)}
            </ul>
          ) : (
            <EmptyState icon={ArrowUpRight} title="No shared reports" body="Reports shared with authorized workspace members will appear here." />
          )}
        </section>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className={giPanel}>
          <PanelTitle hint="Chosen per report when it is created">Report Sections</PanelTitle>
          <Chips items={REPORT_SECTIONS.map(([, l]) => ({ label: l }))} />
        </section>
        <section className={giPanel}>
          <PanelTitle hint="How reports leave the workspace">Export & Sharing</PanelTitle>
          <RowList
            rows={[
              { label: "PDF Export", value: reports.length ? "Open a report, then Print / Save as PDF" : "Available after report creation" },
              { label: "Share Link", value: "Workspace permissions apply" },
              { label: "Schedule", value: "Not available yet" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
