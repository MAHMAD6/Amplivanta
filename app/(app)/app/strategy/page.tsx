import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleDot, LayoutGrid, Target, UserRound } from "lucide-react";
import { db } from "@/lib/db";
import { BarList, EmptyState, ScreenHeader, fmtDate } from "@/components/amplivanta/screen-kit";
import { MetricCards, PanelTitle, Progress, giPanel, headerPrimary, outlineSm } from "@/components/amplivanta/growth-kit";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { createStrategy, saveStrategyDetails } from "@/app/(app)/app/strategy/actions";
import { growthContext, money } from "@/lib/server/growth-screens";
import { PLAN_CHANNELS, label } from "@/lib/growth/options";

export const metadata: Metadata = { title: "Strategy Dashboard" };
export const dynamic = "force-dynamic";

type Swot = { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
const asSwot = (v: unknown): Swot => {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const arr = (k: string) => (Array.isArray(o[k]) ? (o[k] as unknown[]).filter((x): x is string => typeof x === "string") : []);
  return { strengths: arr("strengths"), weaknesses: arr("weaknesses"), opportunities: arr("opportunities"), threats: arr("threats") };
};

export default async function StrategyDashboardPage() {
  const c = await growthContext();
  type Data = {
    strategy: Awaited<ReturnType<typeof db.strategy.findFirst>>;
    strategies: { id: string; name: string; status: string; startDate: Date | null; endDate: Date | null }[];
    goals: { id: string; title: string; metric: string; targetValue: number; currentValue: number; status: string; deadline: Date | null }[];
    campaigns: number;
    plans: { channel: string; budget: number; expectedReturn: number | null }[];
    personas: { id: string; name: string; role: string | null }[];
  };
  let d: Data | null = null;
  if (c) {
    try {
      const w = c.workspaceId;
      const [strategies, goals, campaigns, plans, personas] = await Promise.all([
        db.strategy.findMany({ where: { workspaceId: w }, orderBy: [{ status: "asc" }, { updatedAt: "desc" }], take: 20 }),
        db.goal.findMany({ where: { workspaceId: w }, orderBy: [{ deadline: { sort: "asc", nulls: "last" } }], take: 50, select: { id: true, title: true, metric: true, targetValue: true, currentValue: true, status: true, deadline: true } }),
        db.campaign.count({ where: { workspaceId: w, status: { in: ["active", "planning", "scheduled"] } } }),
        db.channelPlan.findMany({ where: { workspaceId: w }, select: { channel: true, budget: true, expectedReturn: true } }),
        db.persona.findMany({ where: { workspaceId: w, status: "active" }, take: 6, select: { id: true, name: true, role: true } }),
      ]);
      d = { strategy: strategies.find((s) => s.status === "active") ?? strategies[0] ?? null, strategies, goals, campaigns, plans, personas };
    } catch {
      d = null;
    }
  }
  const s = d?.strategy ?? null;
  const swot = asSwot(s?.swot);
  const open = d?.goals.filter((g) => g.status !== "completed") ?? [];
  const healthy = open.filter((g) => g.status === "on_track").length;
  const forecast = d?.plans.reduce((n, p) => n + (p.expectedReturn ?? 0), 0) ?? 0;
  const byChannel = new Map<string, number>();
  for (const p of d?.plans ?? []) byChannel.set(label(PLAN_CHANNELS, p.channel), (byChannel.get(label(PLAN_CHANNELS, p.channel)) ?? 0) + p.budget);
  const canEdit = Boolean(c?.canEdit);
  const roadmap = [
    ...(d?.strategies ?? []).flatMap((x) => [x.startDate && { when: x.startDate, text: `${x.name} starts` }, x.endDate && { when: x.endDate, text: `${x.name} ends` }]),
    ...(d?.goals ?? []).map((g) => g.deadline && { when: g.deadline, text: `Goal due: ${g.title}` }),
  ]
    .filter((x): x is { when: Date; text: string } => Boolean(x))
    .sort((a, b) => a.when.getTime() - b.when.getTime())
    .slice(0, 8);

  const createBtn = (cls: string, text = "Create Strategy") => (
    <FormDialog
      title="Create Strategy"
      label={text}
      className={cls}
      action={createStrategy}
      disabled={!canEdit}
      submitLabel="Create strategy"
      fields={[
        { name: "name", label: "Strategy name", kind: "text", required: true },
        { name: "description", label: "Objective", kind: "textarea", rows: 3 },
        { name: "startDate", label: "Start", kind: "date" },
        { name: "endDate", label: "End", kind: "date" },
        { name: "pillars", label: "Strategic pillars (one per line)", kind: "textarea", rows: 4 },
      ]}
    />
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader title="Strategy Dashboard" subtitle="Define objectives, prioritize initiatives, allocate channels, and coordinate execution." actions={createBtn(headerPrimary)} />
      <MetricCards
        cols={5}
        items={[
          { label: "Goals", value: d?.goals.length ? String(d.goals.length) : null, caption: d?.goals.length ? `${open.length} open` : "No goals" },
          { label: "Aligned Campaigns", value: d?.campaigns ? String(d.campaigns) : null, caption: d?.campaigns ? "Planned or active" : "No campaigns" },
          { label: "Initiatives", value: d?.strategies.length ? String(d.strategies.length) : null, caption: d?.strategies.length ? "Strategies defined" : "No initiatives" },
          { label: "Forecast Revenue", value: forecast ? money(forecast) : null, caption: forecast ? "Expected return in channel plan" : "No forecast" },
          { label: "Strategy Health", value: open.length && s ? `${Math.round((healthy / open.length) * 100)}%` : null, caption: open.length && s ? "Open goals marked on track" : "No strategy yet" },
        ]}
      />
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className={giPanel}>
          <PanelTitle hint="Goals with progress toward target" action={d?.goals.length ? <Link href="/app/strategy/goals" className="text-[12px] font-semibold text-[#0B5CFF]">Manage</Link> : undefined}>Goals & Objectives</PanelTitle>
          {d?.goals.length ? (
            <ul className="space-y-3">
              {d.goals.slice(0, 6).map((g) => (
                <li key={g.id}>
                  <div className="mb-1 flex justify-between gap-2 text-[12.5px]"><span className="truncate font-semibold text-deep-navy">{g.title}</span><span className="shrink-0 text-ink-soft">{g.currentValue.toLocaleString("en-US")} / {g.targetValue.toLocaleString("en-US")} {g.metric}</span></div>
                  <Progress value={(g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0)} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Target} title="No objectives defined" body="Create a strategy or add an objective to begin." action={<Link href="/app/strategy/goals" className={outlineSm}>Add Objective</Link>} />
          )}
        </section>
        <section className={giPanel}>
          <PanelTitle
            hint={s ? `From ${s.name}` : "Themes of the active strategy"}
            action={s && canEdit ? <FormDialog title="Edit Pillars" label="Edit" className="text-[12px] font-semibold text-[#0B5CFF]" action={saveStrategyDetails} submitLabel="Save pillars" fields={[{ name: "id", kind: "hidden", value: s.id }, { name: "pillars", label: "Strategic pillars (one per line)", kind: "textarea", rows: 6, defaultValue: s.pillars.join("\n") }]} /> : undefined}
          >
            Strategic Pillars
          </PanelTitle>
          {s?.pillars.length ? (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {s.pillars.map((p) => <li key={p} className="rounded-md border border-line bg-bg-soft/40 px-3 py-2.5 text-[12.5px] font-semibold text-deep-navy">{p}</li>)}
            </ul>
          ) : (
            <EmptyState icon={LayoutGrid} title="No pillars defined" body={s ? "Add the strategic themes that guide execution." : "Create a strategy to define its pillars."} action={s ? undefined : createBtn(outlineSm)} />
          )}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Budget by channel from the channel plan" action={byChannel.size ? <Link href="/app/strategy/channels" className="text-[12px] font-semibold text-[#0B5CFF]">Plan</Link> : undefined}>Channel Allocation</PanelTitle>
          {byChannel.size ? <BarList rows={[...byChannel.entries()]} format={(n) => money(n) ?? "—"} /> : <EmptyState icon={CircleDot} title="No channel plan" body="Allocate budget and priorities after defining your strategy." />}
        </section>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className={giPanel}>
          <PanelTitle hint="Strategy dates and goal deadlines">Strategy Roadmap</PanelTitle>
          {roadmap.length ? (
            <ol className="relative space-y-3 border-l border-line pl-4">
              {roadmap.map((r, i) => (
                <li key={i} className="relative text-[12.5px]">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#0B5CFF]" />
                  <div className="font-semibold text-deep-navy">{r.text}</div>
                  <div className="text-ink-muted">{fmtDate(r.when)}</div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState icon={ArrowRight} title="No roadmap items" body="Initiatives and milestones will appear here." />
          )}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Active personas" action={d?.personas.length ? <Link href="/app/strategy/personas" className="text-[12px] font-semibold text-[#0B5CFF]">Manage</Link> : undefined}>Audience & Personas</PanelTitle>
          {d?.personas.length ? (
            <ul className="divide-y divide-line">
              {d.personas.map((p) => <li key={p.id} className="py-2 text-[13px]"><Link href={`/app/strategy/personas?persona=${p.id}`} className="font-semibold text-deep-navy hover:text-[#0B5CFF]">{p.name}</Link>{p.role && <span className="text-ink-soft"> · {p.role}</span>}</li>)}
            </ul>
          ) : (
            <EmptyState icon={UserRound} title="No linked personas" body="Create or link personas to this strategy." action={<Link href="/app/strategy/personas" className={outlineSm}>Create Persona</Link>} />
          )}
        </section>
        <section className={giPanel}>
          <PanelTitle
            hint={s ? `From ${s.name}` : "Needs a strategy"}
            action={
              s && canEdit ? (
                <FormDialog
                  title="Edit SWOT"
                  label="Edit"
                  className="text-[12px] font-semibold text-[#0B5CFF]"
                  action={saveStrategyDetails}
                  submitLabel="Save SWOT"
                  fields={[
                    { name: "id", kind: "hidden", value: s.id },
                    { name: "strengths", label: "Strengths (one per line)", kind: "textarea", rows: 3, defaultValue: swot.strengths.join("\n") },
                    { name: "weaknesses", label: "Weaknesses", kind: "textarea", rows: 3, defaultValue: swot.weaknesses.join("\n") },
                    { name: "opportunities", label: "Opportunities", kind: "textarea", rows: 3, defaultValue: swot.opportunities.join("\n") },
                    { name: "threats", label: "Threats", kind: "textarea", rows: 3, defaultValue: swot.threats.join("\n") },
                  ]}
                />
              ) : undefined
            }
          >
            SWOT
          </PanelTitle>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(["strengths", "weaknesses", "opportunities", "threats"] as const).map((k) => (
              <div key={k} className="rounded-md border border-line px-3 py-2 text-[12px]">
                <div className="font-semibold capitalize text-deep-navy">{k} {swot[k].length ? "" : "—"}</div>
                {swot[k].length > 0 && <ul className="mt-1 list-disc space-y-0.5 pl-4 text-ink-soft">{swot[k].map((x) => <li key={x}>{x}</li>)}</ul>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
