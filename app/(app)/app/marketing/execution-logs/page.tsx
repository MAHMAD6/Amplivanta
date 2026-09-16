import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileText, Network, Play, RefreshCw } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, KeyList, Panel, Pill, ScreenHeader, StatGrid, fmtDateTime, figure } from "@/components/amplivanta/screen-kit";
import { FilterBar, Select, filterSearch, headerOutline, headerPrimary, outlineSm } from "@/components/amplivanta/growth-kit";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { RetryTable } from "@/components/amplivanta/marketing-builders";
import { retryExecutions, saveRetryPolicy } from "@/app/(app)/app/marketing/actions";
import { daysAgo, marketingContext, rangeDays } from "@/lib/server/marketing-screens";
import { ENVIRONMENTS, EXECUTION_STATUSES, label } from "@/lib/marketing/options";

export const metadata: Metadata = { title: "Automation Execution Logs" };
export const dynamic = "force-dynamic";

type SP = { q?: string; workflow?: string; status?: string; env?: string; days?: string; run?: string };
const TONE: Record<string, "green" | "red" | "blue" | "gray" | "amber"> = { completed: "green", failed: "red", running: "blue", waiting: "amber", pending: "gray", skipped: "amber" };
const duration = (a: Date, b: Date | null) => {
  if (!b) return "—";
  const ms = b.getTime() - a.getTime();
  return ms < 1000 ? `${ms} ms` : ms < 60000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms / 60000)} min`;
};

export default async function ExecutionLogsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const days = rangeDays(sp.days ?? "7");
  const c = await marketingContext();
  let flows: { id: string; name: string; maxRetries: number }[] = [];
  type Run = { id: string; workflowId: string; status: string; environment: string; startedAt: Date; completedAt: Date | null; error: string | null; attempt: number; goalReached: boolean; retryOfId: string | null; resumeAt: Date | null };
  let runs: Run[] = [];
  let stats = { total: 0, completed: 0, failed: 0, retries: 0 };
  let selected: (Run & { steps: { id: string; status: string; startedAt: Date; completedAt: Date | null; metadata: unknown }[] }) | null = null;
  if (c) {
    try {
      const w = c.workspaceId;
      flows = await db.workflow.findMany({ where: { workspaceId: w }, select: { id: true, name: true, maxRetries: true }, orderBy: { name: "asc" } });
      const scope = { workflow: { workspaceId: w }, startedAt: { gte: daysAgo(days) }, ...(sp.workflow ? { workflowId: sp.workflow } : {}), ...(sp.env ? { environment: sp.env } : {}) };
      const [list, total, done, failed, retries] = await Promise.all([
        db.workflowExecution.findMany({ where: { ...scope, ...(sp.status ? { status: sp.status } : {}), ...(sp.q ? { id: { contains: sp.q } } : {}) }, orderBy: { startedAt: "desc" }, take: 100, select: { id: true, workflowId: true, status: true, environment: true, startedAt: true, completedAt: true, error: true, attempt: true, goalReached: true, retryOfId: true, resumeAt: true } }),
        db.workflowExecution.count({ where: scope }),
        db.workflowExecution.count({ where: { ...scope, status: "completed" } }),
        db.workflowExecution.count({ where: { ...scope, status: "failed" } }),
        db.workflowExecution.count({ where: { ...scope, attempt: { gt: 1 } } }),
      ]);
      runs = list;
      stats = { total, completed: done, failed, retries };
      if (sp.run) selected = await db.workflowExecution.findFirst({ where: { id: sp.run, workflow: { workspaceId: w } }, include: { steps: { orderBy: { startedAt: "asc" }, select: { id: true, status: true, startedAt: true, completedAt: true, metadata: true } } } });
    } catch {
      runs = [];
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const name = (id: string) => flows.find((f) => f.id === id)?.name ?? "Workflow";
  const errors = new Map<string, number>();
  for (const r of runs.filter((x) => x.status === "failed")) errors.set(r.error ?? "Unknown error", (errors.get(r.error ?? "Unknown error") ?? 0) + 1);
  const base = Object.fromEntries(Object.entries({ q: sp.q, workflow: sp.workflow, status: sp.status, env: sp.env, days: sp.days }).filter(([, v]) => v)) as Record<string, string>;
  const retrySet = flows.filter((f) => f.maxRetries > 0).length;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Execution Logs"]]}
        title="Automation Execution Logs"
        subtitle="Monitor workflow runs, retries, and issues across your automation system."
        actions={
          <>
            <Link href={sp.workflow ? `/app/marketing/workflows?id=${sp.workflow}` : "/app/marketing/workflows"} className={headerOutline}>View Workflow</Link>
            <a href={`/api/marketing/export?kind=executions&days=${days}`} className={headerPrimary}>Export Logs</a>
          </>
        }
      />
      <StatGrid
        cols={4}
        stats={[
          { label: "Workflow Runs", icon: Play, value: figure(stats.total), hint: stats.total ? `Last ${days} days` : "No data yet" },
          { label: "Completed Runs", icon: CheckCircle2, value: figure(stats.completed), hint: stats.completed ? `${Math.round((stats.completed / stats.total) * 100)}% of runs` : "No data yet", tone: "green" },
          { label: "Errors", icon: AlertTriangle, value: figure(stats.failed), hint: stats.failed ? "Failed runs" : "No data yet", tone: "pink" },
          { label: "Retries", icon: RefreshCw, value: figure(stats.retries), hint: stats.retries ? "Runs after the first attempt" : "No data yet", tone: "violet" },
        ]}
      />
      <Panel className="mb-4">
        <FilterBar className="border-0 p-0">
          <input name="q" defaultValue={sp.q} placeholder="Search runs..." aria-label="Search runs by ID" className={filterSearch} />
          <Select name="workflow" value={sp.workflow} all="All Workflows" options={flows.map((f) => [f.id, f.name])} label="Workflow" />
          <Select name="status" value={sp.status} all="All Statuses" options={EXECUTION_STATUSES} label="Status" />
          <Select name="env" value={sp.env} all="All Environments" options={ENVIRONMENTS} label="Environment" />
          <Select name="days" value={sp.days} all="Last 7 days" options={[["30", "Last 30 days"], ["90", "Last 90 days"]]} label="Date range" />
        </FilterBar>
        {runs.length ? (
          <RetryTable
            canEdit={canEdit}
            retry={retryExecutions}
            head={["Run ID", "Workflow", "Status", "Started", "Duration", "Result"]}
            rows={runs.map((r) => ({
              id: r.id,
              failed: r.status === "failed",
              highlight: sp.run === r.id,
              cells: [
                <span key="id"><Link href={`?${new URLSearchParams({ ...base, run: r.id })}`} className="font-mono text-[#0B5CFF]">{r.id.slice(-10)}</Link>{r.environment === "test" && <span className="ml-1.5 rounded bg-bg-soft px-1.5 text-[10.5px] text-ink-soft">test</span>}</span>,
                <span key="wf" className="text-deep-navy">{name(r.workflowId)}</span>,
                <Pill key="st" tone={TONE[r.status] ?? "gray"}>{label(EXECUTION_STATUSES, r.status)}</Pill>,
                <span key="s" className="text-ink-soft">{fmtDateTime(r.startedAt)}</span>,
                <span key="d" className="text-ink-soft">{r.status === "waiting" && r.resumeAt ? `Resumes ${fmtDateTime(r.resumeAt)}` : duration(r.startedAt, r.completedAt)}</span>,
                <span key="r" className="block truncate text-ink-soft" title={r.error ?? undefined}>{r.error ?? (r.goalReached ? "Goal reached" : r.status === "completed" ? "All steps finished" : "—")}{r.attempt > 1 ? ` · attempt ${r.attempt}` : ""}</span>,
              ],
            }))}
          />
        ) : (
          <EmptyState icon={FileText} title="No execution logs yet" body="Workflow runs will appear here once automation is executed." action={<Link href="/app/marketing/workflows" className={outlineSm}>View Workflow</Link>} />
        )}
      </Panel>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Execution Trace" subtitle={selected ? `${name(selected.workflowId)} · ${selected.id}` : undefined}>
          {selected ? (
            <ol className="space-y-2">
              {selected.steps.map((s) => {
                const m = (s.metadata ?? {}) as Record<string, unknown>;
                const detail = m.error ?? m.reason ?? (m.simulated ? "Simulated (test run)" : m.to ? `To ${m.to}` : m.waitMinutes ? `Wait ${m.waitMinutes} min` : m.passed === false ? "Condition not met — run ended" : null);
                return (
                  <li key={s.id} className="rounded-lg border border-line px-3 py-2 text-[12.5px]">
                    <div className="flex items-center justify-between gap-2"><span className="font-semibold text-deep-navy">{String(m.name ?? m.type ?? "Step")}</span><Pill tone={TONE[s.status] ?? "gray"}>{s.status}</Pill></div>
                    <div className="text-ink-muted">{fmtDateTime(s.startedAt)} · {duration(s.startedAt, s.completedAt)}</div>
                    {detail != null && <div className="text-ink-soft">{String(detail)}</div>}
                  </li>
                );
              })}
              {!selected.steps.length && <li className="text-[13px] text-ink-soft">No steps recorded for this run.</li>}
            </ol>
          ) : (
            <EmptyState icon={Network} title="No execution selected" body="Select a run ID to inspect execution steps and activity details." />
          )}
        </Panel>
        <Panel title="Error Summary">
          {errors.size ? <ul className="space-y-2 text-[13px]">{[...errors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([e, n]) => <li key={e} className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-red-800"><b>{n}×</b> {e}</li>)}</ul> : <EmptyState icon={AlertTriangle} tone="pink" title="No issues detected" body="Errors and failures will be summarized here when they occur." />}
        </Panel>
        <Panel title="Retry Policy">
          <KeyList rows={[["Workflows with retries", `${retrySet} of ${flows.length}`], ["Retry timing", "5 min × attempt, from the failed step"]]} />
          <div className="mt-3">
            <FormDialog title="Retry Settings" label="View Retry Settings" className={outlineSm} action={saveRetryPolicy} disabled={!canEdit || !flows.length} submitLabel="Apply" note="Failed live runs retry automatically from the failed step. Earlier steps, such as emails already sent, are not repeated." fields={[{ name: "workflowId", label: "Apply to", kind: "select", options: flows.map((f) => [f.id, f.name]), placeholder: "All workflows" }, { name: "maxRetries", label: "Automatic retries (0-5)", kind: "number", required: true, defaultValue: "2" }]} />
          </div>
        </Panel>
      </div>
      <p className="mt-4 text-[12px] text-ink-muted">Execution logs are kept with the workflow; deleting a workflow removes its run history.</p>
    </div>
  );
}
