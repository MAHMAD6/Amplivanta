import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CircleDot, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { isAiConfigured } from "@/lib/ai";
import { EmptyState, Pill, ScreenHeader } from "@/components/amplivanta/screen-kit";
import { MetricCards, PanelTitle, Progress, RowList, giPanel, headerPrimary, outlineSm } from "@/components/amplivanta/growth-kit";
import { AskAdvisor, GenerateRecommendations } from "@/components/amplivanta/growth-ui";
import { connectedProviders, growthContext } from "@/lib/server/growth-screens";
import { dimensionScores, parseChecks } from "@/lib/growth/audit-checks";

export const metadata: Metadata = { title: "AI Advisor – Growth Plan & Recommendations" };
export const dynamic = "force-dynamic";

const OPEN = ["new", "pending", "saved", "ready"];

export default async function AiAdvisorPage() {
  const c = await growthContext();
  const ai = isAiConfigured();
  let data: null | {
    audit: { score: number | null; checks: ReturnType<typeof parseChecks>; createdAt: Date } | null;
    open: number;
    high: number;
    sources: number;
    recs: { id: string; title: string; body: string | null; category: string; impact: string; confidence: number | null }[];
  } = null;
  if (c) {
    try {
      const w = c.workspaceId;
      const [audit, open, high, sources, recs] = await Promise.all([
        db.growthAudit.findFirst({ where: { workspaceId: w }, orderBy: { createdAt: "desc" } }),
        db.recommendation.count({ where: { workspaceId: w, status: { in: OPEN } } }),
        db.recommendation.count({ where: { workspaceId: w, status: { in: OPEN }, impact: "high" } }),
        connectedProviders(w),
        db.recommendation.findMany({ where: { workspaceId: w, status: { in: OPEN } }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, body: true, category: true, impact: true, confidence: true } }),
      ]);
      data = { audit: audit ? { score: audit.score, checks: parseChecks(audit.checks), createdAt: audit.createdAt } : null, open, high, sources: sources.length, recs };
    } catch {
      data = null;
    }
  }
  const failed = data?.audit?.checks.filter((x) => !x.passed) ?? [];
  const canEdit = Boolean(c?.canEdit);

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        title="AI Advisor – Growth Plan & Recommendations"
        subtitle="Turn connected workspace data and business questions into prioritized growth actions."
        actions={<a href="#ask" className={headerPrimary}>Ask AI Advisor</a>}
      />
      <MetricCards
        items={[
          { label: "Growth Score", value: data?.audit?.score != null ? `${data.audit.score}/100` : null, caption: data?.audit ? "Setup readiness from the latest Growth Audit" : "No analysis yet", hint: "Share of Growth Audit readiness checks passed" },
          { label: "Opportunities", value: data?.open ? String(data.open) : null, caption: data?.open ? "Open recommendations" : "No opportunities yet" },
          { label: "Potential Impact", value: data?.high ? `${data.high} high` : null, caption: data?.high ? "High-impact recommendations open" : "No impact estimate yet" },
          { label: "Connected Sources", value: data?.sources ? String(data.sources) : null, caption: data?.sources ? "Live integrations" : "Connect data to begin" },
        ]}
      />
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section id="ask" className={giPanel}>
          <PanelTitle hint="Questions go to the AI Advisor and are saved in your history">Ask About Growth</PanelTitle>
          <AskAdvisor available={ai} canUse={Boolean(c)} />
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Pass rate per audit dimension">Growth Health</PanelTitle>
          {data?.audit ? (
            <ul className="space-y-3 py-2">
              {dimensionScores(data.audit.checks).map(([d, v]) => (
                <li key={d}>
                  <div className="mb-1 flex justify-between text-[12.5px]"><span className="text-deep-navy">{d}</span><span className="text-ink-soft">{v}%</span></div>
                  <Progress value={v} />
                </li>
              ))}
              <li className="pt-1 text-[11.5px] text-ink-muted">From the Growth Audit run {data.audit.createdAt.toISOString().slice(0, 10)}. <Link href="/app/growth-audit" className="font-semibold text-[#0B5CFF]">Run again</Link></li>
            </ul>
          ) : (
            <EmptyState icon={CircleDot} title="No analysis available" body="Connect data sources or run an analysis to populate growth health." action={<Link href="/app/integrations#catalog" className={outlineSm}>Connect Integrations</Link>} />
          )}
        </section>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className={giPanel}>
          <PanelTitle hint="Readiness gaps found by the latest Growth Audit">Top Opportunities</PanelTitle>
          {failed.length ? (
            <ul className="divide-y divide-line">
              {failed.slice(0, 5).map((f) => (
                <li key={f.key} className="py-2.5">
                  <Link href={f.href} className="text-[13px] font-semibold text-deep-navy hover:text-[#0B5CFF]">{f.label}</Link>
                  <p className="text-[12px] text-ink-soft">{f.detail}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={ArrowUpRight} title={data?.audit ? "No gaps found" : "No opportunities yet"} body={data?.audit ? "Every readiness check passed in the latest audit." : "Prioritized opportunities will appear after analysis."} action={<Link href="/app/growth-audit" className={outlineSm}>Run Analysis</Link>} />
          )}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Generated from aggregate workspace facts" action={data?.recs.length ? <Link href="/app/ai-advisor/history" className="text-[12px] font-semibold text-[#0B5CFF]">View all</Link> : undefined}>Recommendations</PanelTitle>
          {data?.recs.length ? (
            <ul className="divide-y divide-line">
              {data.recs.map((r) => (
                <li key={r.id} className="py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-semibold text-deep-navy">{r.title}</span>
                    <Pill tone={r.impact === "high" ? "green" : r.impact === "medium" ? "amber" : "gray"}>{r.impact}</Pill>
                  </div>
                  <p className="line-clamp-2 text-[12px] text-ink-soft">{r.body}</p>
                  <p className="text-[11px] text-ink-muted">{r.category}{r.confidence != null ? ` · ${Math.round(r.confidence * 100)}% confidence` : ""}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="No recommendations yet"
              body={ai ? "AI recommendations will appear with impact and confidence once generated." : "AI recommendations need an AI provider to be configured."}
              action={<GenerateRecommendations available={ai} canUse={canEdit} className={outlineSm}>Ask AI Advisor</GenerateRecommendations>}
            />
          )}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Start the draft in the module that executes it">Action Handoffs</PanelTitle>
          <RowList
            rows={[
              { label: "Campaign", value: "Creates a draft", href: "/app/workspace/plan" },
              { label: "Landing Page", value: "Creates a draft", href: "/app/marketing/landing-pages" },
              { label: "Email Sequence", value: "Creates a draft", href: "/app/marketing/emails" },
              { label: "Automation", value: "Creates a draft", href: "/app/workspace/automations" },
              { label: "Social Post", value: "Creates a draft", href: "/app/social/compose" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
