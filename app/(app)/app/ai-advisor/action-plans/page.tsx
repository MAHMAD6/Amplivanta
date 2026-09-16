import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ClipboardList, ListChecks, Timer } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, Pill, ScreenHeader, StatGrid, TabBar, fmtDate } from "@/components/amplivanta/screen-kit";
import { PanelTitle, giPanel } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { recommendationToTask, setRecommendationStatus } from "@/app/(app)/app/strategy/actions";
import { growthContext } from "@/lib/server/growth-screens";
import { ADVISOR_TABS, REC_STATUS_LABELS } from "@/lib/growth/advisor-tabs";

export const metadata: Metadata = { title: "Action Plans" };
export const dynamic = "force-dynamic";

const COLUMNS: [string, string, string][] = [
  ["ready", "Ready for action", "Saved insights marked ready"],
  ["in_progress", "In progress", "A task was created"],
  ["implemented", "Implemented", "Marked done"],
];

export default async function ActionPlansPage() {
  const c = await growthContext();
  type Rec = { id: string; title: string; body: string | null; category: string; impact: string; status: string; createdAt: Date };
  let recs: Rec[] = [];
  let tasks: { id: string; title: string; status: string; dueDate: Date | null }[] = [];
  if (c) {
    try {
      const w = c.workspaceId;
      recs = await db.recommendation.findMany({ where: { workspaceId: w, status: { in: COLUMNS.map((x) => x[0]) } }, orderBy: { createdAt: "desc" }, take: 150, select: { id: true, title: true, body: true, category: true, impact: true, status: true, createdAt: true } });
      const logs = await db.auditLog.findMany({ where: { workspaceId: w, action: "task.created", resourceType: "Task" }, orderBy: { createdAt: "desc" }, take: 300, select: { resourceId: true, metadata: true } });
      const ids = logs.filter((l) => (l.metadata as { recommendationId?: string } | null)?.recommendationId).map((l) => l.resourceId).filter((x): x is string => Boolean(x));
      tasks = ids.length ? await db.task.findMany({ where: { workspaceId: w, id: { in: ids } }, orderBy: { createdAt: "desc" }, take: 50, select: { id: true, title: true, status: true, dueDate: true } }) : [];
    } catch {
      recs = [];
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const by = (s: string) => recs.filter((r) => r.status === s);
  const has = recs.length > 0 || tasks.length > 0;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={[["AI Advisor", "/app/ai-advisor"], ["Action Plans"]]} title="Action Plans" subtitle="Turn recommendations into owned tasks and track them to done." />
      <TabBar tabs={ADVISOR_TABS} active="/app/ai-advisor/action-plans" />
      <StatGrid
        stats={[
          { label: "Ready", icon: ClipboardList, value: has ? String(by("ready").length) : null },
          { label: "In Progress", icon: Timer, value: has ? String(by("in_progress").length) : null, tone: "orange" },
          { label: "Implemented", icon: CheckCircle2, value: has ? String(by("implemented").length) : null, tone: "green" },
          { label: "Linked Tasks", icon: ListChecks, value: has ? String(tasks.length) : null, tone: "violet", hint: has ? `${tasks.filter((t) => t.status === "done").length} done` : undefined },
        ]}
      />
      {has ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          {COLUMNS.map(([s, l, hint]) => (
            <section key={s} className={giPanel}>
              <PanelTitle hint={hint}>{l} <span className="text-[13px] font-normal text-ink-muted">{by(s).length}</span></PanelTitle>
              <ul className="space-y-2">
                {by(s).map((r) => (
                  <li key={r.id} className="rounded-md border border-line p-3">
                    <div className="text-[13px] font-semibold text-deep-navy">{r.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-muted"><Pill tone={r.impact === "high" ? "green" : "gray"}>{r.impact}</Pill>{r.category} · {fmtDate(r.createdAt)}</div>
                    {canEdit && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {s === "ready" && <ActButton action={recommendationToTask.bind(null, r.id)}>Create task</ActButton>}
                        {s === "in_progress" && <ActButton action={setRecommendationStatus.bind(null, r.id, "implemented")}>Mark implemented</ActButton>}
                        {s === "implemented" && <ActButton action={setRecommendationStatus.bind(null, r.id, "in_progress")}>Reopen</ActButton>}
                      </div>
                    )}
                  </li>
                ))}
                {by(s).length === 0 && <li className="text-[12px] text-ink-muted">Nothing {REC_STATUS_LABELS[s].toLowerCase()}.</li>}
              </ul>
            </section>
          ))}
          <section className={giPanel}>
            <PanelTitle hint="Tasks created from recommendations" action={<Link href="/app/workspace/tasks" className="text-[12px] font-semibold text-[#0B5CFF]">All tasks</Link>}>Linked Tasks</PanelTitle>
            {tasks.length ? (
              <ul className="divide-y divide-line">
                {tasks.map((t) => <li key={t.id} className="py-2 text-[12.5px]"><div className="font-semibold text-deep-navy">{t.title}</div><div className="text-[11px] capitalize text-ink-muted">{t.status.replace("_", " ")}{t.dueDate ? ` · due ${fmtDate(t.dueDate)}` : ""}</div></li>)}
              </ul>
            ) : (
              <p className="text-[12px] text-ink-muted">No tasks created yet.</p>
            )}
          </section>
        </div>
      ) : (
        <section className={giPanel}>
          <EmptyState icon={ClipboardList} title="No action plans yet" body="Mark saved insights ready, or create a task from a recommendation, to start an action plan." action={<Link href="/app/ai-advisor/history" className="inline-flex h-9 items-center rounded-md border border-line px-4 text-[12.5px] font-semibold text-[#0B5CFF]">Recommendation History</Link>} />
        </section>
      )}
    </div>
  );
}
