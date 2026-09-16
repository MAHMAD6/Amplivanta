import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Gauge, Layers, ListOrdered, RefreshCw, Sparkles, Target } from "lucide-react";
import { db } from "@/lib/db";
import { BarList, EmptyState, Panel, Pill, ScreenHeader, fmtDateTime } from "@/components/amplivanta/screen-kit";
import { headerOutline, headerPrimary, outlineSm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { createScoreBand, createScoringRule, deleteScoreBand, deleteScoringRule, recalculateScores, toggleScoringRule } from "@/app/(app)/app/marketing/actions";
import { marketingContext } from "@/lib/server/marketing-screens";
import { SCORING_SIGNALS, bandFor } from "@/lib/marketing/logic";

export const metadata: Metadata = { title: "Lead Scoring" };
export const dynamic = "force-dynamic";

export default async function LeadScoringPage() {
  const c = await marketingContext();
  let rules: { id: string; name: string; signal: string; value: string | null; points: number; active: boolean }[] = [];
  let bands: { id: string; name: string; minScore: number }[] = [];
  let leads: { id: string; name: string | null; email: string | null; companyName: string | null; leadScore: number | null; status: string }[] = [];
  let runs: { id: string; status: string; contactsScored: number; rulesApplied: number; startedAt: Date; completedAt: Date | null }[] = [];
  let scores: number[] = [];
  let staleSince: Date | null = null;
  if (c) {
    try {
      const w = c.workspaceId;
      [rules, bands, leads, runs, scores] = await Promise.all([
        db.scoringRule.findMany({ where: { workspaceId: w }, orderBy: [{ active: "desc" }, { points: "desc" }], select: { id: true, name: true, signal: true, value: true, points: true, active: true } }),
        db.scoreBand.findMany({ where: { workspaceId: w }, orderBy: { minScore: "desc" }, select: { id: true, name: true, minScore: true } }),
        db.contact.findMany({ where: { workspaceId: w, leadScore: { gt: 0 } }, orderBy: { leadScore: "desc" }, take: 10, select: { id: true, name: true, email: true, companyName: true, leadScore: true, status: true } }),
        db.scoringRun.findMany({ where: { workspaceId: w }, orderBy: { startedAt: "desc" }, take: 8, select: { id: true, status: true, contactsScored: true, rulesApplied: true, startedAt: true, completedAt: true } }),
        db.contact.findMany({ where: { workspaceId: w }, select: { leadScore: true }, take: 20000 }).then((r) => r.map((x) => x.leadScore ?? 0)),
      ]);
      const lastRule = await db.scoringRule.findFirst({ where: { workspaceId: w }, orderBy: { updatedAt: "desc" }, select: { updatedAt: true } });
      staleSince = lastRule && runs[0] && lastRule.updatedAt > runs[0].startedAt ? lastRule.updatedAt : null;
    } catch {
      rules = [];
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const active = rules.filter((r) => r.active);
  const signal = (k: string) => SCORING_SIGNALS.find(([s]) => s === k)?.[1] ?? k;
  const createRule = (cls: string, text = "+ Create Rule") => <FormDialog title="Create Scoring Rule" label={text} className={cls} action={createScoringRule} disabled={!canEdit} submitLabel="Create rule" note="Use negative points for signals that lower priority. Value is needed for job title, status and tag signals." fields={[{ name: "signal", label: "Signal", kind: "select", options: SCORING_SIGNALS.map(([k, l]) => [k, l]), required: true }, { name: "value", label: "Value", kind: "text", placeholder: "e.g. director, qualified, vip" }, { name: "points", label: "Points (-100 to 100)", kind: "number", required: true }, { name: "name", label: "Rule name (optional)", kind: "text" }]} />;
  const createBand = (cls: string, text = "Configure Score Bands") => <FormDialog title="Add Score Band" label={text} className={cls} action={createScoreBand} disabled={!canEdit} submitLabel="Add band" note="A contact belongs to the highest band whose minimum score it reaches." fields={[{ name: "name", label: "Band name", kind: "text", required: true, placeholder: "Hot" }, { name: "minScore", label: "Minimum score", kind: "number", required: true }]} />;
  const dist = bands.map((b, i): [string, number] => [`${b.name} (${b.minScore}+)`, scores.filter((s) => s >= b.minScore && (i === 0 || s < bands[i - 1].minScore)).length]);
  const topBand = bands[0];
  const insights: string[] = [];
  if (active.length && !active.some((r) => r.points < 0)) insights.push("No negative rules yet. Consider lowering scores for signals like an Unqualified status.");
  if (scores.length && active.length && runs.length && scores.every((s) => s === 0)) insights.push("Every contact scored 0. Check that rule values match your CRM data (status names, tags).");
  if (topBand && runs.length && !scores.some((s) => s >= topBand.minScore)) insights.push(`No contacts reach the ${topBand.name} band (${topBand.minScore}+). The threshold may be too high.`);
  if (staleSince) insights.push("Rules changed since the last recalculation. Recalculate to apply them.");

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["Lead Scoring"]]}
        title="Lead Scoring"
        subtitle="Configure scoring rules and prioritize lead quality."
        actions={<>{createRule(headerPrimary)}{canEdit && <ActButton action={recalculateScores} disabled={!active.length} className={headerOutline}><RefreshCw className="h-4 w-4" /> Recalculate Scores</ActButton>}<a href="/api/marketing/export?kind=lead-scores" className={headerOutline}>Export</a></>}
      />
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [Gauge, "Scoring Model", active.length ? `${active.length} active rule${active.length === 1 ? "" : "s"}` : null, active.length ? `${rules.length - active.length} disabled` : "No scoring model configured"],
          [Layers, "Score Bands", bands.length ? String(bands.length) : null, bands.length ? bands.map((b) => b.name).join(" · ") : "No score bands configured"],
          [Target, "Prioritized Leads", leads.length ? String(scores.filter((s) => s > 0).length) : null, leads.length ? "Contacts with a positive score" : "No prioritized leads yet"],
          [RefreshCw, "Recalculation Status", runs[0] ? (staleSince ? "Out of date" : "Up to date") : null, runs[0] ? `Last run ${fmtDateTime(runs[0].startedAt)}` : "No recalculation has run"],
        ].map(([Icon, l, v, h]) => {
          const I = Icon as typeof Gauge;
          return <div key={l as string} className="rounded-xl border border-line bg-white p-5"><div className="flex items-center gap-2 text-[14px] font-semibold text-deep-navy"><I className="h-4 w-4 text-[#0B5CFF]" />{l as string}</div><div className="mt-2 text-[21px] font-bold text-deep-navy">{(v as string | null) ?? "—"}</div><div className="mt-1 text-[12px] text-ink-muted">{h as string}</div></div>;
        })}
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Scoring Rules" action={rules.length ? createRule(outlineSm, "Add Rule") : undefined}>
          {rules.length ? (
            <ul className="divide-y divide-line">
              {rules.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-[13px]">
                  <span className="min-w-0"><b className="text-deep-navy">{r.name}</b><span className="block text-[12px] text-ink-soft">{signal(r.signal)}{r.value ? `: ${r.value}` : ""}</span></span>
                  <span className="flex items-center gap-2">
                    <Pill tone={r.points > 0 ? "green" : "red"}>{r.points > 0 ? "+" : ""}{r.points}</Pill>
                    {!r.active && <Pill>Disabled</Pill>}
                    {canEdit && <><ActButton action={toggleScoringRule.bind(null, r.id)}>{r.active ? "Disable" : "Enable"}</ActButton><ActButton action={deleteScoringRule.bind(null, r.id)} confirm="Delete this rule?">Delete</ActButton></>}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={ListOrdered} title="No scoring rules yet" body="Create scoring rules to evaluate lead signals and prioritize follow-up." action={createRule(outlineSm, "Create Rule")} />
          )}
        </Panel>
        <Panel title="Score Bands" action={bands.length ? createBand(outlineSm, "Add Band") : undefined}>
          {bands.length ? (
            <>
              <ul className="divide-y divide-line">{bands.map((b) => <li key={b.id} className="flex items-center justify-between py-2.5 text-[13px]"><span><b className="text-deep-navy">{b.name}</b> <span className="text-ink-soft">· {b.minScore}+</span></span>{canEdit && <ActButton action={deleteScoreBand.bind(null, b.id)} confirm="Remove this band?">Remove</ActButton>}</li>)}</ul>
              {scores.length > 0 && <div className="mt-4"><h3 className="mb-2 text-[13px] font-semibold text-deep-navy">Contacts per band</h3><BarList rows={dist} /></div>}
            </>
          ) : (
            <EmptyState icon={Layers} title="No score bands configured" body="Define score ranges when your scoring model is ready." action={createBand(outlineSm)} />
          )}
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Prioritized Leads">
          {leads.length ? (
            <ul className="divide-y divide-line">{leads.map((l) => <li key={l.id} className="flex items-center justify-between gap-2 py-2 text-[13px]"><Link href={`/app/crm/contacts?q=${encodeURIComponent(l.email ?? l.name ?? "")}`} className="min-w-0 truncate font-semibold text-deep-navy hover:text-[#0B5CFF]">{l.name ?? l.email}<span className="block truncate text-[12px] font-normal text-ink-muted">{l.companyName ?? l.email}</span></Link><span className="flex shrink-0 items-center gap-2">{bands.length > 0 && <span className="text-[12px] text-ink-soft">{bandFor(l.leadScore ?? 0, bands)?.name ?? "—"}</span>}<Pill tone="blue">{l.leadScore}</Pill></span></li>)}</ul>
          ) : (
            <EmptyState icon={Target} title="No prioritized leads yet" body="Prioritized leads will appear after a scoring model is configured and run." />
          )}
        </Panel>
        <Panel title="Insights">
          {insights.length ? <ul className="space-y-2 text-[13px]">{insights.map((i) => <li key={i} className="rounded-lg border border-line bg-bg-soft/40 px-3 py-2 text-deep-navy">{i}</li>)}</ul> : <EmptyState icon={runs.length ? BarChart3 : Sparkles} title="No insights yet" body="Optimization guidance will appear after scoring data is available." />}
        </Panel>
        <Panel title="Recalculation History">
          {runs.length ? <ul className="divide-y divide-line">{runs.map((r) => <li key={r.id} className="flex justify-between gap-2 py-2 text-[13px]"><span><b className="text-deep-navy">{r.contactsScored.toLocaleString()} contacts</b><span className="block text-[12px] text-ink-muted">{r.rulesApplied} rules · {fmtDateTime(r.startedAt)}</span></span><Pill tone={r.status === "completed" ? "green" : "amber"}>{r.status}</Pill></li>)}</ul> : <EmptyState icon={RefreshCw} title="No recalculation history" body="Recalculation status and model history will appear here." />}
        </Panel>
      </div>
    </div>
  );
}
