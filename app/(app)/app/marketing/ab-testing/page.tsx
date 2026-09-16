import type { Metadata } from "next";
import Link from "next/link";
import { Archive, BarChart3, FlaskConical, Info, Target } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { EmptyState, Panel, Pill, ScreenHeader, fmtDate, fmtDateTime } from "@/components/amplivanta/screen-kit";
import { headerPrimary, outlineSm, primarySm } from "@/components/amplivanta/growth-kit";
import { ActButton, ActionForm, SubmitButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { addExperimentVariant, createExperiment, declareWinner, deleteExperiment, setExperimentStatus, updateAllocation } from "@/app/(app)/app/marketing/actions";
import { marketingContext } from "@/lib/server/marketing-screens";
import { parseVariants, significance } from "@/lib/marketing/logic";
import { EXPERIMENT_GOALS, EXPERIMENT_STATUSES, label } from "@/lib/marketing/options";

export const metadata: Metadata = { title: "A/B Testing" };
export const dynamic = "force-dynamic";

const TONE: Record<string, "gray" | "green" | "amber" | "violet"> = { draft: "gray", running: "green", paused: "amber", completed: "violet" };
const COLORS = ["#7C3AED", "#0B5CFF", "#10B981", "#F97316"];

export default async function ABTestingPage({ searchParams }: { searchParams: Promise<{ id?: string; page?: string; best?: string }> }) {
  const sp = await searchParams;
  const c = await marketingContext();
  const canEdit = Boolean(c?.canEdit);
  type Ex = { id: string; name: string; landingPageId: string; goal: string; minSampleSize: number; status: string; variants: unknown; winner: string | null; startedAt: Date | null; endedAt: Date | null; updatedAt: Date };
  let tests: Ex[] = [];
  let pages: { id: string; title: string; status: string }[] = [];
  let results: { key: string; visits: number; conversions: number }[] = [];
  if (c) {
    try {
      const w = c.workspaceId;
      [tests, pages] = await Promise.all([
        db.experiment.findMany({ where: { workspaceId: w }, orderBy: { updatedAt: "desc" }, select: { id: true, name: true, landingPageId: true, goal: true, minSampleSize: true, status: true, variants: true, winner: true, startedAt: true, endedAt: true, updatedAt: true } }),
        db.landingPage.findMany({ where: { workspaceId: w, status: { not: "archived" } }, select: { id: true, title: true, status: true }, orderBy: { title: "asc" } }),
      ]);
      const sel = tests.find((t) => t.id === sp.id) ?? tests[0];
      if (sel) {
        results = await Promise.all(
          parseVariants(sel.variants).map(async (v) => ({
            key: v.key,
            visits: await db.landingPageVisit.count({ where: { experimentId: sel.id, variant: v.key } }),
            conversions: await db.landingPageVisit.count({ where: { experimentId: sel.id, variant: v.key, ...(sel.goal === "form_start" ? { formStarted: true } : { converted: true }) } }),
          })),
        );
      }
    } catch {
      tests = [];
    }
  }
  const selected = tests.find((t) => t.id === sp.id) ?? tests[0];
  const variants = selected ? parseVariants(selected.variants) : [];
  const page = (id: string) => pages.find((p) => p.id === id)?.title ?? "Page removed";
  const control = results.find((r) => r.key === "A");
  const sampleReached = results.length > 0 && results.every((r) => r.visits >= (selected?.minSampleSize ?? 100));
  const create = (cls: string, text = "+ Create Test") => <FormDialog title="Create A/B Test" label={text} className={cls} action={createExperiment} disabled={!canEdit || pages.length < 2} submitLabel="Create test" note="Visitors to variant A's published URL are split between both pages. Variant B doesn't need to be published." fields={[{ name: "name", label: "Test name", kind: "text", required: true }, { name: "landingPageId", label: "Variant A (published page URL)", kind: "select", options: pages.map((p) => [p.id, `${p.title}${p.status === "published" ? "" : " (not published)"}`]), required: true, defaultValue: sp.page }, { name: "variantPageId", label: "Variant B page", kind: "select", options: pages.map((p) => [p.id, p.title]), required: true }, { name: "weightA", label: "Traffic to A (%)", kind: "number", defaultValue: "50", required: true }, { name: "goal", label: "Goal", kind: "select", options: EXPERIMENT_GOALS, defaultValue: "form_submission" }, { name: "minSampleSize", label: "Minimum visits per variant", kind: "number", defaultValue: "100" }]} />;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={[["Home", "/app"], ["Marketing Automation", "/app/marketing"], ["A/B Testing"]]} title="A/B Testing" subtitle="Set up landing page experiments and compare variants when tests are ready to run." actions={create(headerPrimary)} />
      {(!tests.length || sp.best) && (
        <Panel className="mb-4" id="best">
          {tests.length ? null : <EmptyState icon={FlaskConical} tone="violet" title="No experiments yet" body={pages.length < 2 ? "Create at least two landing pages (for example, duplicate one and change the headline) to compare variants." : "Create your first A/B test to compare landing page variants and discover what resonates best with your audience."} action={<span className="flex gap-2">{create(primarySm, "Create Test")}<Link href="?best=1#best" className={outlineSm}>View Best Practices</Link></span>} />}
          {sp.best && <ul className="mx-auto mt-2 max-w-[720px] list-disc space-y-1 pl-5 text-[13px] text-ink-soft"><li>Change one thing per test (headline, form length, call to action) so results are clear.</li><li>Decide the goal and minimum sample size before starting, and don&apos;t stop early.</li><li>Keep both variants live for full weeks to even out weekday patterns.</li><li>Treat 95% confidence or more as a reliable result.</li></ul>}
        </Panel>
      )}
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel title="Experiments">
          {tests.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[12.5px]">
                <thead><tr className="border-b border-line bg-bg-soft/70 text-deep-navy">{["Test Name", "Goal", "Variants", "Status", "Last Updated", ""].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {tests.map((t) => (
                    <tr key={t.id} className={cn("border-b border-line last:border-0", selected?.id === t.id && "bg-royal-tint/30")}>
                      <td className="px-3 py-2.5"><Link href={`?id=${t.id}`} className="font-semibold text-deep-navy hover:text-[#0B5CFF]">{t.name}</Link></td>
                      <td className="px-3 py-2.5 text-ink-soft">{label(EXPERIMENT_GOALS, t.goal)}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{parseVariants(t.variants).length}</td>
                      <td className="px-3 py-2.5"><Pill tone={TONE[t.status] ?? "gray"}>{label(EXPERIMENT_STATUSES, t.status)}</Pill>{t.winner && <span className="ml-1 text-[11.5px] text-violet">Winner {t.winner}</span>}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{fmtDate(t.updatedAt)}</td>
                      <td className="px-3 py-2.5">{canEdit && <span className="flex gap-1.5">{t.status !== "running" && t.status !== "completed" && <ActButton action={setExperimentStatus.bind(null, t.id, "running")}>Start</ActButton>}{t.status === "running" && <ActButton action={setExperimentStatus.bind(null, t.id, "paused")}>Pause</ActButton>}{["running", "paused"].includes(t.status) && <ActButton action={setExperimentStatus.bind(null, t.id, "completed")}>End</ActButton>}{t.status !== "running" && <ActButton action={deleteExperiment.bind(null, t.id)} confirm="Delete this test?">Delete</ActButton>}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Archive} title="No experiments yet" body="Your created tests will appear here." />
          )}
        </Panel>
        <Panel title="Variant Setup" subtitle={selected?.name}>
          {selected ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {variants.map((v) => <div key={v.key} className="rounded-lg border border-dashed border-line p-3 text-center"><b className="text-deep-navy">Variant {v.key}</b><p className="mt-1 truncate text-[12.5px] text-ink-soft">{page(v.landingPageId)}</p><Link href={`/app/marketing/page-builder?id=${v.landingPageId}`} className="text-[12px] font-semibold text-[#0B5CFF]">Edit page</Link></div>)}
              </div>
              {canEdit && selected.status === "draft" && variants.length < 4 && (
                <div className="mt-3 text-center"><FormDialog title="Add Variant" label="+ Add Variant" className={outlineSm} action={addExperimentVariant} submitLabel="Add variant" note="Traffic is rebalanced evenly; adjust it in Traffic Allocation." fields={[{ name: "id", kind: "hidden", value: selected.id }, { name: "landingPageId", label: "Page", kind: "select", options: pages.filter((p) => !variants.some((v) => v.landingPageId === p.id)).map((p) => [p.id, p.title]), required: true }]} /></div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">{["A", "B"].map((k) => <div key={k} className="rounded-lg border border-dashed border-line p-6 text-center text-[13px]"><b className="block text-deep-navy">Variant {k}</b><span className="text-ink-muted">Not configured</span></div>)}</div>
          )}
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Traffic Allocation">
          {selected ? (
            <>
              <div className="mb-3 flex h-3 overflow-hidden rounded-full bg-bg-soft">{variants.map((v, i) => <div key={v.key} style={{ width: `${v.weight}%`, background: COLORS[i] }} title={`${v.key}: ${v.weight}%`} />)}</div>
              <ActionForm action={updateAllocation} className="space-y-2">
                <input type="hidden" name="id" value={selected.id} />
                {variants.map((v, i) => <label key={v.key} className="flex items-center justify-between gap-2 text-[13px]"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />Variant {v.key}</span><span className="flex items-center gap-1"><input name={`w_${v.key}`} type="number" min={0} max={100} defaultValue={v.weight} disabled={!canEdit || selected.status === "completed"} className="h-8 w-20 rounded-md border border-line px-2 text-right" />%</span></label>)}
                {canEdit && selected.status !== "completed" && <SubmitButton className="w-full">Save allocation</SubmitButton>}
              </ActionForm>
            </>
          ) : (
            <p className="flex gap-2 rounded-lg bg-bg-soft/60 p-3 text-[12.5px] text-ink-soft"><Info className="h-4 w-4 shrink-0" />Set traffic allocation when you&apos;re ready to run your test.</p>
          )}
        </Panel>
        <Panel title="Goal & Success Criteria">
          {selected ? (
            <ul className="space-y-2 text-[13px]">
              <li className="flex justify-between"><span>Primary goal</span><b>{label(EXPERIMENT_GOALS, selected.goal)}</b></li>
              <li className="flex justify-between"><span>Minimum visits per variant</span><b>{selected.minSampleSize}</b></li>
              <li className="flex justify-between"><span>Confidence target</span><b>95%</b></li>
              <li className="flex justify-between"><span>Started</span><b>{fmtDateTime(selected.startedAt)}</b></li>
              {selected.endedAt && <li className="flex justify-between"><span>Ended</span><b>{fmtDateTime(selected.endedAt)}</b></li>}
            </ul>
          ) : (
            <EmptyState icon={Target} title="Not configured" body="Define your primary goal and success criteria to measure experiment performance." compact />
          )}
        </Panel>
        <Panel title="Results / Significance">
          {selected && results.some((r) => r.visits > 0) ? (
            <>
              <table className="w-full text-left text-[12.5px]">
                <thead><tr className="border-b border-line text-deep-navy">{["Variant", "Visits", "Conv.", "Rate", "Lift", "Confidence"].map((h) => <th key={h} className="py-1.5 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {results.map((r) => {
                    const sig = r.key === "A" || !control ? null : significance(control, r);
                    return <tr key={r.key} className="border-b border-line last:border-0"><td className="py-1.5 font-semibold">{r.key}{selected.winner === r.key ? " ★" : ""}</td><td>{r.visits}</td><td>{r.conversions}</td><td>{r.visits ? `${((r.conversions / r.visits) * 100).toFixed(1)}%` : "—"}</td><td>{sig?.lift != null ? `${sig.lift > 0 ? "+" : ""}${sig.lift.toFixed(1)}%` : r.key === "A" ? "control" : "—"}</td><td>{sig?.confidence != null ? `${sig.confidence}%` : "—"}</td></tr>;
                  })}
                </tbody>
              </table>
              <p className="mt-2 text-[12px] text-ink-muted">{sampleReached ? "Minimum sample reached." : `Waiting for ${selected.minSampleSize} visits per variant before drawing conclusions.`}</p>
              {canEdit && selected.status !== "draft" && !selected.winner && <div className="mt-2 flex flex-wrap gap-1.5">{results.map((r) => <ActButton key={r.key} action={declareWinner.bind(null, selected.id, r.key)} confirm={`Mark variant ${r.key} as the winner and end the test?`}>Declare {r.key} winner</ActButton>)}</div>}
            </>
          ) : (
            <EmptyState icon={BarChart3} title="No data available" body="Results and significance will appear here once your test is running." compact />
          )}
        </Panel>
      </div>
    </div>
  );
}
