import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownToLine, ArrowUpFromLine, CheckCircle2, Download, FileSpreadsheet, ServerCrash, Upload } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { DataTable, EmptyState, Pill, ScreenHeader, StatGrid, fmtDateTime, fmtInt } from "@/components/amplivanta/screen-kit";
import { ImportWizard } from "@/components/amplivanta/import-wizard";
import { settingsContext } from "@/lib/server/settings-screens";
import { EXPORTS } from "@/lib/server/data-transfer";

export const metadata: Metadata = { title: "Import / Export" };
export const dynamic = "force-dynamic";

const EXPORT_ROWS: { entity: keyof typeof EXPORTS; desc: string; formats: ("csv" | "json")[] }[] = [
  { entity: "contacts", desc: "Every contact with status, tags and lead score.", formats: ["csv", "json"] },
  { entity: "companies", desc: "Accounts with domain, industry, size and location.", formats: ["csv", "json"] },
  { entity: "deals", desc: "Deals with stage, value, status, contact and company.", formats: ["csv", "json"] },
  { entity: "campaign_metrics", desc: "Daily campaign impressions, clicks, conversions, revenue and spend.", formats: ["csv"] },
  { entity: "audit_log", desc: "Workspace audit trail. Admins only.", formats: ["csv", "json"] },
  { entity: "workspace_backup", desc: "Core CRM and marketing records as JSON. Excludes credentials and secrets. Admins only.", formats: ["json"] },
];

const STATUS: Record<string, { label: string; tone: "green" | "amber" | "red" }> = {
  completed: { label: "Completed", tone: "green" },
  completed_with_errors: { label: "Completed with errors", tone: "amber" },
  failed: { label: "Failed", tone: "red" },
};

const ENTITY_LABEL = (e: string) => (e in EXPORTS ? EXPORTS[e as keyof typeof EXPORTS].label : e.replace(/_/g, " "));

type SP = { job?: string; kind?: string };

export default async function ImportExportPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const kind = sp.kind === "import" || sp.kind === "export" ? sp.kind : undefined;
  const c = await settingsContext();
  const canEdit = Boolean(c && c.role !== "VIEWER");

  let data: null | {
    jobs: { id: string; kind: string; entity: string; fileName: string | null; format: string; status: string; totalRows: number; createdCount: number; updatedCount: number; skippedCount: number; errorCount: number; startedAt: Date; by: string | null }[];
    stats: { imports: number; exports: number; rows: number; failed: number };
    detail: null | { id: string; fileName: string | null; entity: string; status: string; totalRows: number; createdCount: number; updatedCount: number; skippedCount: number; errorCount: number; errors: { row: number; message: string }[]; options: { duplicates?: string } | null; startedAt: Date };
  } = null;
  if (c) {
    try {
      const since = new Date(Date.now() - 30 * 86400000);
      const w = c.workspaceId;
      const [jobs, imports, exports, rows, failed, detail] = await Promise.all([
        db.dataTransferJob.findMany({ where: { workspaceId: w, ...(kind ? { kind } : {}) }, orderBy: { startedAt: "desc" }, take: 50 }),
        db.dataTransferJob.count({ where: { workspaceId: w, kind: "import", startedAt: { gte: since } } }),
        db.dataTransferJob.count({ where: { workspaceId: w, kind: "export", startedAt: { gte: since } } }),
        db.dataTransferJob.aggregate({ where: { workspaceId: w, kind: "import", startedAt: { gte: since } }, _sum: { createdCount: true, updatedCount: true } }),
        db.dataTransferJob.count({ where: { workspaceId: w, status: "failed", startedAt: { gte: since } } }),
        sp.job ? db.dataTransferJob.findFirst({ where: { id: sp.job, workspaceId: w } }) : null,
      ]);
      const userIds = [...new Set(jobs.map((j) => j.createdById).filter((x): x is string => Boolean(x)))];
      const users = userIds.length ? await db.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } }) : [];
      const who = new Map(users.map((u) => [u.id, u.name || u.email]));
      data = {
        jobs: jobs.map((j) => ({ ...j, by: j.createdById ? who.get(j.createdById) ?? null : null })),
        stats: { imports, exports, rows: (rows._sum.createdCount ?? 0) + (rows._sum.updatedCount ?? 0), failed },
        detail: detail ? { ...detail, errors: (Array.isArray(detail.errors) ? detail.errors : []) as { row: number; message: string }[], options: (detail.options ?? null) as { duplicates?: string } | null } : null,
      };
    } catch {
      data = null;
    }
  }

  const total = data ? data.stats.imports + data.stats.exports : 0;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={[["Integrations", "/app/integrations"], ["Import / Export"]]} title="Import / Export" subtitle="Bring CRM data into Amplivanta or export it, with validated, tracked jobs." />
      <StatGrid
        stats={[
          { label: "Imports (30 days)", icon: ArrowDownToLine, value: data?.stats.imports ? fmtInt(data.stats.imports) : null },
          { label: "Exports (30 days)", icon: ArrowUpFromLine, value: data?.stats.exports ? fmtInt(data.stats.exports) : null },
          { label: "Records imported", icon: FileSpreadsheet, value: data?.stats.rows ? fmtInt(data.stats.rows) : null, hint: data?.stats.rows ? "Created or updated in 30 days" : undefined },
          { label: "Success rate", icon: CheckCircle2, value: total ? `${Math.round(((total - (data?.stats.failed ?? 0)) / total) * 100)}%` : null, hint: total ? `${data?.stats.failed ?? 0} failed in 30 days` : undefined },
        ]}
      />

      {!c || data === null ? (
        <section className="rounded-xl border border-line bg-white p-5">
          <EmptyState icon={ServerCrash} tone="orange" title="Import / Export is unavailable" body={c ? "Workspace data could not be loaded. Try again shortly." : "Sign in to a workspace to import or export data."} />
        </section>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="min-w-0 rounded-xl border border-line bg-white p-5">
              <h2 className="flex items-center gap-2 text-[16.5px] font-semibold text-deep-navy"><Upload className="h-4 w-4" /> Import Data</h2>
              <p className="mb-4 mt-1 text-[12.5px] text-ink-soft">Upload a CSV. Columns are mapped and every row is validated before anything is written; invalid rows are skipped and reported.</p>
              <ImportWizard canEdit={canEdit} />
            </section>

            <section className="min-w-0 rounded-xl border border-line bg-white p-5">
              <h2 className="flex items-center gap-2 text-[16.5px] font-semibold text-deep-navy"><Download className="h-4 w-4" /> Export Data</h2>
              <p className="mb-4 mt-1 text-[12.5px] text-ink-soft">Exports follow your role and are recorded in the job history and audit log.</p>
              <ul className="space-y-2">
                {EXPORT_ROWS.map((e) => {
                  const spec = EXPORTS[e.entity];
                  const allowed = spec.admin ? c.isAdmin : canEdit;
                  return (
                    <li key={e.entity} className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[13.5px] font-semibold text-deep-navy">{spec.label}</div>
                        <div className="text-[12px] text-ink-soft">{e.desc}</div>
                      </div>
                      <div className="flex gap-2">
                        {e.formats.map((f) =>
                          allowed ? (
                            <a key={f} href={`/api/data-transfer/export?entity=${e.entity}&format=${f}`} className="inline-flex h-9 items-center rounded-md border border-line bg-white px-3.5 text-[12.5px] font-semibold uppercase text-deep-navy hover:bg-bg-soft">{f}</a>
                          ) : (
                            <span key={f} title={spec.admin ? "Workspace admins only" : "Viewers cannot export"} className="inline-flex h-9 cursor-not-allowed items-center rounded-md border border-line bg-bg-soft px-3.5 text-[12.5px] font-semibold uppercase text-ink-muted">{f}</span>
                          ),
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                Deletion and retention are managed under <Link href="/app/settings/data" className="font-semibold underline">Settings → Data Management</Link>. Form submissions can be exported from Marketing Automation.
              </p>
            </section>
          </div>

          {data.detail && (
            <section className="mt-6 rounded-xl border border-line bg-white p-5" id="job">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[16.5px] font-semibold text-deep-navy">{data.detail.fileName ?? ENTITY_LABEL(data.detail.entity)}</h2>
                  <p className="mt-0.5 text-[12.5px] text-ink-soft">{ENTITY_LABEL(data.detail.entity)} · {fmtDateTime(data.detail.startedAt)}{data.detail.options?.duplicates ? ` · existing records ${data.detail.options.duplicates === "update" ? "updated" : "skipped"}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone={STATUS[data.detail.status]?.tone ?? "gray"}>{STATUS[data.detail.status]?.label ?? data.detail.status}</Pill>
                  <Link href="/app/integrations/import-export" className="text-[12.5px] font-semibold text-[#0B5CFF]">Close</Link>
                </div>
              </div>
              <p className="mt-3 text-[13px] text-deep-navy">{data.detail.totalRows} rows · {data.detail.createdCount} created · {data.detail.updatedCount} updated · {data.detail.skippedCount} skipped · {data.detail.errorCount} with problems</p>
              {data.detail.errors.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-[13px] font-semibold text-deep-navy">Rows with problems{data.detail.errorCount > data.detail.errors.length ? ` (first ${data.detail.errors.length} of ${data.detail.errorCount})` : ""}</h3>
                  <ul className="mt-1.5 max-h-60 space-y-0.5 overflow-y-auto text-[12.5px] text-ink-soft">
                    {data.detail.errors.map((e, i) => <li key={`${e.row}-${i}`}>Row {e.row}: {e.message}</li>)}
                  </ul>
                </div>
              )}
            </section>
          )}

          <section className="mt-6 rounded-xl border border-line bg-white p-5" id="history">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[16.5px] font-semibold text-deep-navy">Job History</h2>
              <nav className="flex gap-2 text-[12.5px]" aria-label="Job type">
                {([[undefined, "All"], ["import", "Imports"], ["export", "Exports"]] as const).map(([k, l]) => (
                  <Link key={l} href={k ? `/app/integrations/import-export?kind=${k}#history` : "/app/integrations/import-export#history"} className={cn("rounded-full border px-3 py-1", kind === k ? "border-[#0B5CFF] bg-royal-tint font-semibold text-[#0B5CFF]" : "border-line text-ink-soft")}>{l}</Link>
                ))}
              </nav>
            </div>
            <DataTable
              minWidth={860}
              columns={["File", "Type", "Data", "Rows", "Result", "By", "When", "Status"]}
              rows={data.jobs.map((j) => [
                j.kind === "import" ? <Link key="f" href={`/app/integrations/import-export?job=${j.id}#job`} className="hover:text-[#0B5CFF] hover:underline">{j.fileName ?? "—"}</Link> : j.fileName ?? "—",
                j.kind === "import" ? "Import" : "Export",
                ENTITY_LABEL(j.entity),
                fmtInt(j.totalRows),
                j.kind === "import" ? `${j.createdCount} created · ${j.updatedCount} updated · ${j.skippedCount} skipped` : j.format.toUpperCase(),
                j.by ?? "—",
                fmtDateTime(j.startedAt),
                <Pill key="s" tone={STATUS[j.status]?.tone ?? "gray"}>{STATUS[j.status]?.label ?? j.status}</Pill>,
              ])}
              empty={<EmptyState icon={FileSpreadsheet} compact title={kind ? `No ${kind}s yet` : "No import or export jobs yet"} body="Jobs appear here after you import a file or download an export." />}
            />
          </section>
        </>
      )}
    </div>
  );
}
