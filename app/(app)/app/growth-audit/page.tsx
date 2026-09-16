import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CircleDot, Columns3, Target, XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { EmptyState, ScreenHeader, fmtDate } from "@/components/amplivanta/screen-kit";
import { MetricCards, PanelTitle, Progress, giPanel, headerPrimary } from "@/components/amplivanta/growth-kit";
import { ActionForm, SubmitButton } from "@/components/amplivanta/growth-ui";
import { runGrowthAudit } from "@/app/(app)/app/strategy/actions";
import { growthContext } from "@/lib/server/growth-screens";
import { dimensionScores, parseChecks } from "@/lib/growth/audit-checks";
import { GROWTH_GOALS, INDUSTRIES, PERIODS, label } from "@/lib/growth/options";

export const metadata: Metadata = { title: "Growth Audit™ – Audit Setup & Results" };
export const dynamic = "force-dynamic";

const field = "h-10 w-full rounded-md border border-line bg-white px-3 text-[13px] text-deep-navy placeholder:text-ink-muted focus:border-[#0B5CFF] focus:outline-none";
const lbl = "mb-1 block text-[12.5px] font-semibold text-deep-navy";

export default async function GrowthAuditPage({ searchParams }: { searchParams: Promise<{ audit?: string }> }) {
  const sp = await searchParams;
  const c = await growthContext();
  let history: { id: string; website: string; score: number | null; createdAt: Date }[] = [];
  let current: Awaited<ReturnType<typeof db.growthAudit.findFirst>> = null;
  if (c) {
    try {
      history = await db.growthAudit.findMany({ where: { workspaceId: c.workspaceId }, orderBy: { createdAt: "desc" }, take: 12, select: { id: true, website: true, score: true, createdAt: true } });
      current = history.length ? await db.growthAudit.findFirst({ where: { workspaceId: c.workspaceId, id: sp.audit && history.some((h) => h.id === sp.audit) ? sp.audit : history[0].id } }) : null;
    } catch {
      history = [];
    }
  }
  const checks = parseChecks(current?.checks);
  const passed = checks.filter((x) => x.passed);
  const gaps = checks.filter((x) => !x.passed);
  const previous = current ? history.find((h) => h.createdAt < current!.createdAt) : undefined;
  const step = current ? 5 : 1;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        title="Growth Audit™ – Audit Setup & Results"
        subtitle="Configure and run an actionable growth audit for a website or business."
        actions={<a href="#setup" className={headerPrimary}>Run Growth Audit</a>}
      />
      <ol className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-line bg-white px-5 py-3">
        {["Business", "Goals", "Competitors", "Review", "Results"].map((s, i) => (
          <li key={s} className="flex items-center gap-2 text-[12.5px] text-deep-navy">
            <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[11.5px] font-bold", i + 1 <= step ? "bg-[#0B5CFF] text-white" : "bg-royal-tint text-[#0B5CFF]")}>{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section id="setup" className={giPanel}>
          <PanelTitle hint="Inputs are stored with the audit in this workspace">Audit Setup</PanelTitle>
          <ActionForm action={runGrowthAudit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label><span className={lbl}>Website or Business</span><input name="website" required maxLength={200} placeholder="Enter website or business" defaultValue={current?.website} className={field} /></label>
            <label><span className={lbl}>Industry</span><select name="industry" defaultValue={current?.industry ?? ""} className={field}><option value="">Select industry</option>{INDUSTRIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <label><span className={lbl}>Primary Goal</span><select name="goal" defaultValue={current?.goal ?? ""} className={field}><option value="">Select a growth goal</option>{GROWTH_GOALS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <label><span className={lbl}>Date Range</span><select name="period" defaultValue={String(current?.periodDays ?? 30)} className={field}>{PERIODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            <label className="md:col-span-2"><span className={lbl}>Competitors</span><textarea name="competitors" rows={3} placeholder="Add competitor domains or names, one per line" defaultValue={current?.competitors.join("\n")} className="w-full rounded-md border border-line px-3 py-2 font-mono text-[12.5px] text-deep-navy placeholder:font-sans placeholder:text-ink-muted focus:border-[#0B5CFF] focus:outline-none" /></label>
            <p className="rounded-md bg-royal-tint/50 px-3 py-2 text-[11.5px] text-ink-soft md:col-span-2">Audit inputs are workspace-scoped. The audit checks your connected integrations and workspace records; it does not crawl the website or compare against external benchmarks.</p>
            <div className="md:col-span-2 flex justify-end">{c?.canEdit ? <SubmitButton>Run Growth Audit</SubmitButton> : <span className="text-[12px] text-ink-muted">Editors can run audits.</span>}</div>
          </ActionForm>
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Latest run and history">Audit Status</PanelTitle>
          {current ? (
            <div>
              <div className="flex items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2.5 text-[13px] text-emerald-800"><CheckCircle2 className="h-4 w-4" /> Completed {fmtDate(current.createdAt)} for <strong>{current.website}</strong></div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-[12.5px]">
                <div><dt className="text-ink-muted">Industry</dt><dd className="text-deep-navy">{label(INDUSTRIES, current.industry)}</dd></div>
                <div><dt className="text-ink-muted">Primary goal</dt><dd className="text-deep-navy">{label(GROWTH_GOALS, current.goal)}</dd></div>
                <div><dt className="text-ink-muted">Period</dt><dd className="text-deep-navy">{label(PERIODS, String(current.periodDays))}</dd></div>
                <div><dt className="text-ink-muted">Competitors</dt><dd className="text-deep-navy">{current.competitors.length || "—"}</dd></div>
              </dl>
              {history.length > 1 && (
                <ul className="mt-4 divide-y divide-line border-t border-line">
                  {history.map((h) => (
                    <li key={h.id}><Link href={`/app/growth-audit?audit=${h.id}`} className={cn("flex justify-between py-2 text-[12.5px] hover:text-[#0B5CFF]", h.id === current!.id ? "font-semibold text-[#0B5CFF]" : "text-deep-navy")}><span>{h.website} · {fmtDate(h.createdAt)}</span><span>{h.score ?? "—"}/100</span></Link></li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <EmptyState icon={Target} title="No audit results yet" body="Complete the setup and run a Growth Audit to generate findings." action={<a href="#setup" className="inline-flex h-9 items-center rounded-md border border-line px-4 text-[12.5px] font-semibold text-[#0B5CFF]">Run Growth Audit</a>} />
          )}
        </section>
      </div>
      <MetricCards
        items={[
          { label: "Overall Score", value: current?.score != null ? `${current.score}/100` : null, caption: current ? "Share of readiness checks passed" : "No score yet" },
          { label: "Strengths", value: current ? String(passed.length) : null, caption: current ? "Checks passed" : "No findings yet" },
          { label: "Opportunities", value: current ? String(gaps.length) : null, caption: current ? "Gaps to close" : "No findings yet" },
          { label: "Benchmark", value: null, caption: "No external benchmark source connected" },
        ]}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className={giPanel}>
          <PanelTitle hint="Pass rate per dimension, with each check">Score Breakdown</PanelTitle>
          {current ? (
            <div className="space-y-4">
              {dimensionScores(checks).map(([d, v]) => (
                <div key={d}>
                  <div className="mb-1 flex justify-between text-[13px] font-semibold text-deep-navy"><span>{d}</span><span>{v}%</span></div>
                  <Progress value={v} />
                  <ul className="mt-2 space-y-1">
                    {checks.filter((x) => x.dimension === d).map((x) => (
                      <li key={x.key} className="flex items-start gap-2 text-[12px]">
                        {x.passed ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />}
                        <span className="text-ink-soft"><Link href={x.href} className="font-semibold text-deep-navy hover:text-[#0B5CFF]">{x.label}</Link> — {x.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Columns3} title="No score breakdown" body="Audit dimensions will populate after a completed run." />
          )}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Your own audit history over time">Benchmark & Trend</PanelTitle>
          {history.length > 1 ? (
            <div>
              <div className="flex h-44 items-end gap-2 border-b border-line pb-1">
                {[...history].reverse().map((h) => (
                  <div key={h.id} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${fmtDate(h.createdAt)}: ${h.score ?? 0}/100`}>
                    <span className="text-[10.5px] text-ink-soft">{h.score ?? 0}</span>
                    <div className="w-full max-w-[36px] rounded-t bg-[#0B5CFF]" style={{ height: `${Math.max(2, (h.score ?? 0) * 1.4)}px` }} />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[12px] text-ink-soft">
                {previous && current?.score != null && previous.score != null ? `${current.score - previous.score >= 0 ? "+" : ""}${current.score - previous.score} points since the previous run. ` : ""}
                External benchmarks are not shown because no benchmark source is connected.
              </p>
            </div>
          ) : (
            <EmptyState icon={CircleDot} title="No benchmark trend" body="Historical comparisons appear after more than one audit run." />
          )}
        </section>
      </div>
    </div>
  );
}
