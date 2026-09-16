import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { KeyList, Pill, ScreenHeader, fmtDate } from "@/components/amplivanta/screen-kit";
import { PanelTitle, Progress, giPanel, headerOutline, headerPrimary } from "@/components/amplivanta/growth-kit";
import { PrintButton } from "@/components/amplivanta/growth-ui";
import { growthContext, money } from "@/lib/server/growth-screens";
import { GOAL_STATUSES, PERIODS, PLAN_CHANNELS, REPORT_SECTIONS, STRATEGY_REPORT_TYPES, label } from "@/lib/growth/options";

export const metadata: Metadata = { title: "Strategy Report" };
export const dynamic = "force-dynamic";

/** A strategy report rendered from live workspace data at view time. */
export default async function StrategyReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await growthContext();
  if (!c) notFound();
  const report = await db.report.findFirst({ where: { id, workspaceId: c.workspaceId, type: { startsWith: "strategy_" } } }).catch(() => null);
  if (!report) notFound();
  const cfg = (report.config ?? {}) as { periodDays?: number; sections?: string[] };
  const days = cfg.periodDays ?? 90;
  const sections = new Set(cfg.sections?.length ? cfg.sections : REPORT_SECTIONS.map(([k]) => k));
  const from = new Date(Date.now() - days * 86400000);
  const w = c.workspaceId;

  const [goals, personas, plans, campaigns, recs, wonDeals] = await Promise.all([
    sections.has("goals") ? db.goal.findMany({ where: { workspaceId: w }, orderBy: { deadline: { sort: "asc", nulls: "last" } }, take: 30 }) : [],
    sections.has("audience") ? db.persona.findMany({ where: { workspaceId: w, status: "active" }, take: 10 }) : [],
    sections.has("channels") || sections.has("budget") ? db.channelPlan.findMany({ where: { workspaceId: w }, orderBy: { budget: "desc" } }) : [],
    sections.has("budget") ? db.campaign.findMany({ where: { workspaceId: w, updatedAt: { gte: from } }, select: { id: true, name: true, budget: true, spend: true, status: true } }) : [],
    sections.has("recommendations") ? db.recommendation.findMany({ where: { workspaceId: w, createdAt: { gte: from } }, orderBy: { createdAt: "desc" }, take: 8 }) : [],
    db.deal.aggregate({ where: { workspaceId: w, status: "won", updatedAt: { gte: from } }, _sum: { value: true }, _count: true }),
  ]);
  const budgetTotal = campaigns.reduce((n, x) => n + (x.budget ?? 0), 0);
  const spendTotal = campaigns.reduce((n, x) => n + (x.spend ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1100px] print:max-w-none">
      <ScreenHeader
        crumbs={[["Strategy Reports", "/app/strategy/reports"], [report.name]]}
        title={report.name}
        subtitle={`${label(STRATEGY_REPORT_TYPES, report.type)} · ${label(PERIODS, String(days))} · generated ${fmtDate(new Date())}`}
        actions={
          <span className="flex gap-2 print:hidden">
            <Link href="/app/strategy/reports" className={headerOutline}>Back</Link>
            <PrintButton className={headerPrimary}>Print / Save as PDF</PrintButton>
          </span>
        }
      />
      <div className="space-y-4">
        <section className={giPanel}>
          <PanelTitle>Summary</PanelTitle>
          <KeyList
            rows={[
              ["Status", <Pill key="s" tone={report.status === "final" ? "green" : "gray"}>{report.status}</Pill>],
              ["Won deals in period", wonDeals._count ? `${wonDeals._count} · ${money(wonDeals._sum.value ?? 0)}` : "—"],
              ["Goals tracked", goals.length ? String(goals.length) : sections.has("goals") ? "—" : "Not included"],
              ["Channel budget", plans.length ? money(plans.reduce((n, p) => n + p.budget, 0)) : "—"],
            ]}
          />
        </section>
        {sections.has("goals") && (
          <section className={giPanel}>
            <PanelTitle>Goal Progress</PanelTitle>
            {goals.length ? (
              <ul className="space-y-3">
                {goals.map((g) => (
                  <li key={g.id}>
                    <div className="mb-1 flex justify-between gap-2 text-[12.5px]"><span className="font-semibold text-deep-navy">{g.title} <span className="font-normal text-ink-muted">· {label(GOAL_STATUSES, g.status)}</span></span><span className="text-ink-soft">{g.currentValue.toLocaleString("en-US")} / {g.targetValue.toLocaleString("en-US")} {g.metric}</span></div>
                    <Progress value={g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0} />
                  </li>
                ))}
              </ul>
            ) : <p className="text-[13px] text-ink-soft">No goals defined.</p>}
          </section>
        )}
        {sections.has("audience") && (
          <section className={giPanel}>
            <PanelTitle>Audience Insights</PanelTitle>
            {personas.length ? (
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {personas.map((p) => (
                  <li key={p.id} className="rounded-md border border-line p-3 text-[12.5px]">
                    <div className="font-semibold text-deep-navy">{p.name}{p.role ? ` · ${p.role}` : ""}</div>
                    {p.painPoints.length > 0 && <div className="mt-1 text-ink-soft">Pain points: {p.painPoints.join("; ")}</div>}
                    {p.channels.length > 0 && <div className="text-ink-soft">Channels: {p.channels.join(", ")}</div>}
                  </li>
                ))}
              </ul>
            ) : <p className="text-[13px] text-ink-soft">No active personas.</p>}
          </section>
        )}
        {sections.has("channels") && (
          <section className={giPanel}>
            <PanelTitle>Channel Performance</PanelTitle>
            {plans.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-[12.5px]">
                  <thead><tr className="border-b border-line text-deep-navy">{["Channel", "Budget", "Planned", "Expected return", "Target leads"].map((h) => <th key={h} className="px-2 py-2 font-semibold">{h}</th>)}</tr></thead>
                  <tbody>{plans.map((p) => <tr key={p.id} className="border-b border-line last:border-0 text-ink-soft"><td className="px-2 py-2 font-semibold text-deep-navy">{label(PLAN_CHANNELS, p.channel)}</td><td className="px-2 py-2">{money(p.budget)}</td><td className="px-2 py-2">{money(p.plannedSpend) ?? "—"}</td><td className="px-2 py-2">{money(p.expectedReturn) ?? "—"}</td><td className="px-2 py-2">{p.targetLeads?.toLocaleString("en-US") ?? "—"}</td></tr>)}</tbody>
                </table>
                <p className="mt-2 text-[11.5px] text-ink-muted">Planned figures from the channel plan; measured channel performance needs connected analytics.</p>
              </div>
            ) : <p className="text-[13px] text-ink-soft">No channel plan.</p>}
          </section>
        )}
        {sections.has("budget") && (
          <section className={giPanel}>
            <PanelTitle>Budget Variance</PanelTitle>
            {campaigns.length ? (
              <KeyList rows={[["Campaign budgets", money(budgetTotal)], ["Recorded spend", money(spendTotal)], ["Variance", budgetTotal ? `${money(budgetTotal - spendTotal)} (${Math.round((spendTotal / budgetTotal) * 100)}% used)` : "—"]]} />
            ) : <p className="text-[13px] text-ink-soft">No campaigns updated in this period.</p>}
          </section>
        )}
        {sections.has("recommendations") && (
          <section className={giPanel}>
            <PanelTitle>AI Recommendations</PanelTitle>
            {recs.length ? (
              <ul className="divide-y divide-line">{recs.map((r) => <li key={r.id} className="py-2 text-[12.5px]"><div className="font-semibold text-deep-navy">{r.title} <span className="font-normal text-ink-muted">· {r.impact} impact</span></div>{r.body && <p className="text-ink-soft">{r.body}</p>}</li>)}</ul>
            ) : <p className="text-[13px] text-ink-soft">No recommendations in this period.</p>}
          </section>
        )}
      </div>
    </div>
  );
}
