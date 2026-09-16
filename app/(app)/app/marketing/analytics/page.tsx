import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Filter, LineChart, Network, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { db } from "@/lib/db";
import { BarList, EmptyState, Panel, ScreenHeader, StatGrid, TrendColumns, figure } from "@/components/amplivanta/screen-kit";
import { FilterBar, Select, filterSearch, headerOutline } from "@/components/amplivanta/growth-kit";
import { dailySeries, daysAgo, marketingContext, pct, rangeDays } from "@/lib/server/marketing-screens";
import { NODE_LABELS, NODE_TYPES, type NodeType } from "@/lib/marketing/workflow";

export const metadata: Metadata = { title: "Automation Analytics" };
export const dynamic = "force-dynamic";

type SP = { days?: string; workflow?: string; q?: string; nodeType?: string };

export default async function AutomationAnalyticsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const days = rangeDays(sp.days ?? "7");
  const c = await marketingContext();
  const from = daysAgo(days);
  const prevFrom = daysAgo(days * 2);
  let flows: { id: string; name: string; status: string }[] = [];
  let runs: { workflowId: string; status: string; goalReached: boolean; startedAt: Date; error: string | null; resumeAt: Date | null }[] = [];
  let prev = { runs: 0, goals: 0, failed: 0 };
  let steps: { status: string; startedAt: Date; completedAt: Date | null; metadata: unknown }[] = [];
  if (c) {
    try {
      const w = c.workspaceId;
      flows = await db.workflow.findMany({ where: { workspaceId: w, ...(sp.q ? { name: { contains: sp.q, mode: "insensitive" } } : {}) }, select: { id: true, name: true, status: true } });
      const ids = sp.workflow ? flows.filter((f) => f.id === sp.workflow).map((f) => f.id) : flows.map((f) => f.id);
      const scope = { workflowId: { in: ids }, environment: "live" };
      const [r, pr, pg, pf, st] = await Promise.all([
        db.workflowExecution.findMany({ where: { ...scope, startedAt: { gte: from } }, select: { workflowId: true, status: true, goalReached: true, startedAt: true, error: true, resumeAt: true }, take: 20000 }),
        db.workflowExecution.count({ where: { ...scope, startedAt: { gte: prevFrom, lt: from } } }),
        db.workflowExecution.count({ where: { ...scope, startedAt: { gte: prevFrom, lt: from }, goalReached: true } }),
        db.workflowExecution.count({ where: { ...scope, startedAt: { gte: prevFrom, lt: from }, status: "failed" } }),
        db.workflowExecutionStep.findMany({ where: { execution: { ...scope, startedAt: { gte: from } } }, select: { status: true, startedAt: true, completedAt: true, metadata: true }, take: 20000 }),
      ]);
      runs = r;
      prev = { runs: pr, goals: pg, failed: pf };
      steps = st;
    } catch {
      runs = [];
    }
  }
  const goals = runs.filter((r) => r.goalReached).length;
  const failed = runs.filter((r) => r.status === "failed");
  const completed = runs.filter((r) => r.status === "completed").length;
  const active = flows.filter((f) => f.status === "active").length;
  const delta = (now: number, before: number) => (before ? `vs previous period ${now >= before ? "+" : ""}${Math.round(((now - before) / before) * 100)}%` : "vs previous period —");
  const rate = pct(goals, runs.length);
  const prevRate = prev.runs ? (prev.goals / prev.runs) * 100 : null;

  const byType = NODE_TYPES.filter((t) => !sp.nodeType || t === sp.nodeType).map((t) => {
    const mine = steps.filter((s) => (s.metadata as { type?: string } | null)?.type === t);
    const ok = mine.filter((s) => s.status === "completed").length;
    const dropped = mine.filter((s) => s.status === "failed" || s.status === "skipped").length;
    const timed = mine.filter((s) => s.completedAt);
    const avg = timed.length ? timed.reduce((n, s) => n + (s.completedAt!.getTime() - s.startedAt.getTime()), 0) / timed.length : 0;
    return { type: t as NodeType, n: mine.length, success: pct(ok, mine.length), drop: pct(dropped, mine.length), avg: timed.length ? (avg < 1000 ? `${Math.round(avg)} ms` : `${(avg / 1000).toFixed(1)} s`) : "—" };
  }).filter((x) => x.n > 0);

  const errors = new Map<string, number>();
  for (const f of failed) errors.set(f.error ?? "Unknown error", (errors.get(f.error ?? "Unknown error") ?? 0) + 1);
  const stuck = runs.filter((r) => r.resumeAt && r.resumeAt.getTime() < Date.now() - 15 * 60000).length;

  const insights: string[] = [];
  for (const f of flows) {
    const mine = runs.filter((r) => r.workflowId === f.id);
    const fails = mine.filter((r) => r.status === "failed").length;
    if (mine.length >= 5 && fails / mine.length > 0.2) insights.push(`${f.name}: ${Math.round((fails / mine.length) * 100)}% of runs failed. Check its webhook and email steps.`);
    if (f.status === "active" && !mine.length) insights.push(`${f.name} is active but didn't run in the last ${days} days. Check that its trigger fires.`);
  }
  const skippedEmail = steps.filter((s) => s.status === "skipped" && (s.metadata as { type?: string } | null)?.type === "email").length;
  if (skippedEmail) insights.push(`${skippedEmail} email step${skippedEmail === 1 ? " was" : "s were"} skipped (no address, suppressed, or sending not configured).`);
  if (stuck) insights.push(`${stuck} delayed run${stuck === 1 ? " is" : "s are"} overdue; the marketing scheduler may not be running.`);

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Automation Analytics"]]}
        title="Automation Analytics"
        actions={
          <>
            <Link href="/app/marketing/execution-logs" className={headerOutline}>View Logs</Link>
            <a href={`/api/marketing/export?kind=automation&days=${days}`} className={headerOutline}>Export Report</a>
          </>
        }
      />
      <StatGrid
        cols={4}
        stats={[
          { label: "Active Workflows", icon: Workflow, value: figure(active), hint: `${flows.length} total workflows` },
          { label: "Goal Completions", icon: CheckCircle2, value: figure(goals), hint: delta(goals, prev.goals), tone: "green" },
          { label: "Conversion Rate", icon: Filter, value: rate, hint: rate && prevRate != null ? `vs previous period ${prevRate.toFixed(1)}%` : "Goal completions per run", tone: "violet" },
          { label: "Exceptions / Alerts", icon: AlertTriangle, value: figure(failed.length), hint: delta(failed.length, prev.failed), tone: "orange" },
        ]}
      />
      <FilterBar>
        <Select name="days" value={String(days)} all="Last 7 days" options={[["30", "Last 30 days"], ["90", "Last 90 days"]]} label="Date range" />
        <Select name="workflow" value={sp.workflow} all="All Workflows" options={flows.map((f) => [f.id, f.name])} label="Workflow" />
        <Select name="nodeType" value={sp.nodeType} all="All Node Types" options={NODE_TYPES.map((t) => [t, NODE_LABELS[t]])} label="Node type" />
        <input name="q" defaultValue={sp.q} placeholder="Search workflows..." aria-label="Search workflows" className={filterSearch} />
      </FilterBar>
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Workflow Performance Over Time" subtitle="Live runs started per day">
          {runs.length ? (
            <>
              <TrendColumns points={dailySeries(runs.map((r) => r.startedAt), days)} label="Workflows started" />
              <div className="mt-3 flex flex-wrap gap-4 text-[12.5px] text-ink-soft"><span>Started: <b className="text-deep-navy">{runs.length}</b></span><span>Goal completions: <b className="text-deep-navy">{goals}</b></span><span>Completed: <b className="text-deep-navy">{completed}</b></span><span>Exceptions: <b className="text-deep-navy">{failed.length}</b></span></div>
            </>
          ) : (
            <EmptyState icon={LineChart} title="No data to display yet" body="Workflow performance over time will appear here once data is available." />
          )}
        </Panel>
        <Panel title="Workflow Funnel">
          {runs.length ? <BarList rows={[["Started", runs.length], ["Completed", completed], ["Goal reached", goals]]} /> : <EmptyState icon={Filter} tone="violet" title="No workflows to display yet" body="Workflow conversion funnel will appear here once data is available." />}
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Node Performance (Step Performance)">
          {byType.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-[12.5px]">
                <thead><tr className="border-b border-line text-deep-navy">{["Node / Step", "Executions", "Success Rate", "Drop-off Rate", "Avg. Time"].map((h) => <th key={h} className="py-2 pr-2 font-semibold">{h}</th>)}</tr></thead>
                <tbody>{byType.map((r) => <tr key={r.type} className="border-b border-line last:border-0"><td className="py-2 pr-2 font-semibold text-deep-navy">{NODE_LABELS[r.type]}</td><td className="py-2 pr-2">{r.n}</td><td className="py-2 pr-2">{r.success ?? "—"}</td><td className="py-2 pr-2">{r.drop ?? "—"}</td><td className="py-2 pr-2">{r.avg}</td></tr>)}</tbody>
              </table>
              <p className="mt-2 text-[11.5px] text-ink-muted">Drop-off counts failed and skipped steps. Delay time is excluded.</p>
            </div>
          ) : (
            <EmptyState icon={Network} tone="green" title="No node data yet" body="Node performance metrics will appear here once workflow data is available." />
          )}
        </Panel>
        <Panel title="Anomalies & Exceptions">
          {errors.size || stuck ? (
            <ul className="space-y-2 text-[13px]">
              {[...errors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([e, n]) => <li key={e} className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-red-800"><b>{n}×</b> {e}</li>)}
              {stuck > 0 && <li className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">{stuck} delayed run{stuck === 1 ? "" : "s"} past their resume time</li>}
            </ul>
          ) : (
            <EmptyState icon={ShieldCheck} title="No anomalies detected" body="Failed runs and overdue delays will be listed here." />
          )}
          <Link href="/app/marketing/execution-logs?status=failed" className="mt-3 block text-center text-[12.5px] font-semibold text-[#0B5CFF]">View All Alerts</Link>
        </Panel>
        <Panel title="Insights & Recommendations" subtitle="Rule-based checks over your run data">
          {insights.length ? <ul className="space-y-2 text-[13px]">{insights.slice(0, 6).map((i) => <li key={i} className="rounded-lg border border-line bg-bg-soft/40 px-3 py-2 text-deep-navy">{i}</li>)}</ul> : <EmptyState icon={Sparkles} tone="violet" title="No insights yet" body="Recommendations appear when runs show failures, skipped steps, or idle active workflows." />}
        </Panel>
      </div>
    </div>
  );
}
