import type { Metadata } from "next";
import Link from "next/link";
import { Columns3, Target, Zap } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { EmptyState, Pill, ScreenHeader, fmtDate } from "@/components/amplivanta/screen-kit";
import { FilterBar, MetricCards, PanelTitle, Progress, Select, filterSearch, giPanel, headerPrimary, outlineSm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { createGoal, deleteGoal, setGoalStatus, unlinkGoalCampaign, updateGoalProgress } from "@/app/(app)/app/strategy/actions";
import { growthContext, memberNames } from "@/lib/server/growth-screens";
import { GOAL_STATUSES, label } from "@/lib/growth/options";

export const metadata: Metadata = { title: "Marketing Goals" };
export const dynamic = "force-dynamic";

type SP = { q?: string; status?: string; owner?: string; due?: string; goal?: string };
const TONE: Record<string, "blue" | "green" | "amber" | "violet"> = { in_progress: "blue", on_track: "green", at_risk: "amber", completed: "violet" };

export default async function MarketingGoalsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await growthContext();
  type G = { id: string; title: string; metric: string; targetValue: number; currentValue: number; status: string; deadline: Date | null; ownerId: string | null; campaignIds: string[] };
  let goals: G[] = [];
  let counts = { active: 0, on_track: 0, at_risk: 0, completed: 0, total: 0 };
  let members: { id: string; name: string }[] = [];
  let strategies: [string, string][] = [];
  let campaigns: { id: string; name: string; status: string }[] = [];
  if (c) {
    try {
      const w = c.workspaceId;
      const now = new Date();
      const due = sp.due === "overdue" ? { deadline: { lt: now } } : sp.due === "30" ? { deadline: { gte: now, lte: new Date(now.getTime() + 30 * 86400000) } } : sp.due === "none" ? { deadline: null } : {};
      const [list, grouped, m, st, camps] = await Promise.all([
        db.goal.findMany({
          where: { workspaceId: w, ...(sp.q ? { OR: [{ title: { contains: sp.q, mode: "insensitive" } }, { metric: { contains: sp.q, mode: "insensitive" } }] } : {}), ...(sp.status ? { status: sp.status } : {}), ...(sp.owner ? { ownerId: sp.owner } : {}), ...due },
          orderBy: [{ deadline: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
          take: 200,
          select: { id: true, title: true, metric: true, targetValue: true, currentValue: true, status: true, deadline: true, ownerId: true, campaignIds: true },
        }),
        db.goal.groupBy({ by: ["status"], where: { workspaceId: w }, _count: true }),
        memberNames(w),
        db.strategy.findMany({ where: { workspaceId: w }, select: { id: true, name: true } }),
        db.campaign.findMany({ where: { workspaceId: w }, orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, name: true, status: true } }),
      ]);
      goals = list;
      const by = (s: string) => grouped.find((g) => g.status === s)?._count ?? 0;
      const total = grouped.reduce((n, g) => n + g._count, 0);
      counts = { total, active: total - by("completed"), on_track: by("on_track"), at_risk: by("at_risk"), completed: by("completed") };
      members = m;
      strategies = st.map((x) => [x.id, x.name]);
      campaigns = camps;
    } catch {
      goals = [];
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const selected = goals.find((g) => g.id === sp.goal) ?? goals[0];
  const linked = campaigns.filter((x) => selected?.campaignIds.includes(x.id));
  const owner = (id: string | null) => members.find((m) => m.id === id)?.name ?? "Unassigned";
  const base = Object.fromEntries(Object.entries({ q: sp.q, status: sp.status, owner: sp.owner, due: sp.due }).filter(([, v]) => v)) as Record<string, string>;
  const pick = (id: string) => `?${new URLSearchParams({ ...base, goal: id })}`;
  const has = counts.total > 0;

  const create = (cls: string) => (
    <FormDialog
      title="Create Goal"
      label="Create Goal"
      className={cls}
      action={createGoal}
      disabled={!canEdit}
      submitLabel="Create goal"
      fields={[
        { name: "title", label: "Goal", kind: "text", required: true },
        { name: "metric", label: "Metric", kind: "text", required: true, placeholder: "e.g. Qualified leads" },
        { name: "targetValue", label: "Target", kind: "number", required: true },
        { name: "currentValue", label: "Current value", kind: "number" },
        { name: "deadline", label: "Due date", kind: "date" },
        { name: "ownerId", label: "Owner", kind: "select", options: members.map((m) => [m.id, m.name]), placeholder: "Unassigned" },
        { name: "strategyId", label: "Strategy", kind: "select", options: strategies, placeholder: "None" },
      ]}
    />
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader title="Marketing Goals" subtitle="Define measurable objectives and connect them to campaigns, channels, budgets, and reporting." actions={create(headerPrimary)} />
      <FilterBar>
        <input name="q" defaultValue={sp.q} placeholder="Search goals" aria-label="Search goals" className={filterSearch} />
        <Select name="status" value={sp.status} all="All Statuses" options={GOAL_STATUSES} label="Status" />
        <Select name="owner" value={sp.owner} all="All Owners" options={members.map((m) => [m.id, m.name])} label="Owner" />
        <Select name="due" value={sp.due} all="Due Date" options={[["30", "Due in 30 days"], ["overdue", "Overdue"], ["none", "No due date"]]} label="Due date" />
      </FilterBar>
      <MetricCards
        items={[
          { label: "Active Goals", value: has ? String(counts.active) : null, caption: has ? "Not completed" : "No goals" },
          { label: "On Track", value: has ? String(counts.on_track) : null, caption: has ? "Marked on track" : "No data" },
          { label: "At Risk", value: has ? String(counts.at_risk) : null, caption: has ? "Marked at risk" : "No data" },
          { label: "Completed", value: has ? String(counts.completed) : null, caption: has ? "Goals achieved" : "No data" },
        ]}
      />
      <section className={cn(giPanel, "mb-4")}>
        <PanelTitle hint="Select a goal to see linked campaigns">Goals</PanelTitle>
        {goals.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-[12.5px]">
              <thead><tr className="border-b border-line bg-bg-soft/70 text-deep-navy">{["Goal", "Owner", "Progress", "Due", "Status", ""].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
              <tbody>
                {goals.map((g) => {
                  const pct = (g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0);
                  const late = g.status !== "completed" && g.deadline && g.deadline < new Date();
                  return (
                    <tr key={g.id} className={cn("border-b border-line last:border-0", selected?.id === g.id && "bg-royal-tint/30")}>
                      <td className="px-3 py-2.5"><Link href={pick(g.id)} className="font-semibold text-deep-navy hover:text-[#0B5CFF]">{g.title}</Link><div className="text-[11.5px] text-ink-muted">{g.metric}</div></td>
                      <td className="px-3 py-2.5 text-ink-soft">{owner(g.ownerId)}</td>
                      <td className="w-[220px] px-3 py-2.5"><Progress value={pct} /><div className="mt-1 text-[11px] text-ink-muted">{g.currentValue.toLocaleString("en-US")} of {g.targetValue.toLocaleString("en-US")} ({Math.round(pct)}%)</div></td>
                      <td className={cn("px-3 py-2.5", late ? "font-semibold text-red-600" : "text-ink-soft")}>{fmtDate(g.deadline)}</td>
                      <td className="px-3 py-2.5">
                        <Pill tone={TONE[g.status] ?? "gray"}>{label(GOAL_STATUSES, g.status)}</Pill>
                      </td>
                      <td className="px-3 py-2.5">
                        {canEdit && (
                          <span className="flex flex-wrap justify-end gap-1.5">
                            <FormDialog
                              title={`Update “${g.title}”`}
                              label="Update"
                              className="rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-deep-navy hover:bg-bg-soft"
                              action={updateGoalProgress}
                              submitLabel="Save"
                              fields={[
                                { name: "id", kind: "hidden", value: g.id },
                                { name: "currentValue", label: `Current ${g.metric}`, kind: "number", required: true, defaultValue: String(g.currentValue) },
                                { name: "campaignId", label: "Link a campaign", kind: "select", options: campaigns.filter((x) => !g.campaignIds.includes(x.id)).map((x) => [x.id, x.name]), placeholder: "No change" },
                              ]}
                            />
                            {GOAL_STATUSES.filter(([v]) => v !== g.status).map(([v, l]) => <ActButton key={v} action={setGoalStatus.bind(null, g.id, v)}>{l}</ActButton>)}
                            <ActButton action={deleteGoal.bind(null, g.id)} confirm="Delete this goal?">Delete</ActButton>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Target} title={has ? "No goals match these filters" : "No marketing goals yet"} body="Create a measurable goal with a metric, target, owner, and due date." action={has ? undefined : create(outlineSm)} />
        )}
      </section>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className={giPanel}>
          <PanelTitle hint="Current value recorded against target">Goal Progress</PanelTitle>
          {goals.length ? (
            <ul className="space-y-3">
              {goals.slice(0, 8).map((g) => (
                <li key={g.id}>
                  <div className="mb-1 flex justify-between text-[12.5px]"><span className="truncate text-deep-navy">{g.title}</span><span className="text-ink-soft">{Math.round((g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0))}%</span></div>
                  <Progress value={(g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0)} />
                </li>
              ))}
              <li className="text-[11.5px] text-ink-muted">Progress is updated manually; automatic reconciliation from analytics is not available yet.</li>
            </ul>
          ) : (
            <EmptyState icon={Columns3} title="No progress data" body="Progress appears once goals have targets and current values." />
          )}
        </section>
        <section className={giPanel}>
          <PanelTitle hint={selected ? `For ${selected.title}` : "For the selected goal"}>Linked Campaigns</PanelTitle>
          {linked.length ? (
            <ul className="divide-y divide-line">
              {linked.map((x) => (
                <li key={x.id} className="flex items-center justify-between py-2.5 text-[13px]">
                  <span className="font-semibold text-deep-navy">{x.name} <span className="font-normal capitalize text-ink-muted">· {x.status}</span></span>
                  {canEdit && selected && <ActButton action={unlinkGoalCampaign.bind(null, selected.id, x.id)}>Unlink</ActButton>}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Zap} title="No linked campaigns" body="Campaigns connected to the selected goal will appear here. Link one with Update." />
          )}
        </section>
      </div>
    </div>
  );
}
