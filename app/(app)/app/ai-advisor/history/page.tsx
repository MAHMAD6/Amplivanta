import type { Metadata } from "next";
import { History } from "lucide-react";
import { db } from "@/lib/db";
import { isAiConfigured } from "@/lib/ai";
import { DataTable, EmptyState, Pill, ScreenHeader, StatGrid, TabBar, fmtDate } from "@/components/amplivanta/screen-kit";
import { FilterBar, Select, filterSearch, giPanel, headerPrimary } from "@/components/amplivanta/growth-kit";
import { ActButton, GenerateRecommendations } from "@/components/amplivanta/growth-ui";
import { recommendationToTask, setRecommendationStatus } from "@/app/(app)/app/strategy/actions";
import { growthContext, since } from "@/lib/server/growth-screens";
import { ADVISOR_TABS, REC_STATUS_LABELS } from "@/lib/growth/advisor-tabs";
import { CheckCircle2, Lightbulb, TrendingUp, Zap } from "lucide-react";

export const metadata: Metadata = { title: "Recommendation History" };
export const dynamic = "force-dynamic";

type SP = { q?: string; category?: string; impact?: string; status?: string; days?: string };

export default async function RecommendationHistoryPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await growthContext();
  const ai = isAiConfigured();
  let rows: { id: string; title: string; body: string | null; category: string; impact: string; confidence: number | null; status: string; createdAt: Date }[] = [];
  let stats = { total: 0, high: 0, acted: 0, implemented: 0 };
  let categories: string[] = [];
  if (c) {
    try {
      const w = c.workspaceId;
      const from = since(sp.days);
      const [list, total, high, acted, implemented, cats] = await Promise.all([
        db.recommendation.findMany({
          where: { workspaceId: w, ...(sp.q ? { title: { contains: sp.q, mode: "insensitive" } } : {}), ...(sp.category ? { category: sp.category } : {}), ...(sp.impact ? { impact: sp.impact } : {}), ...(sp.status ? { status: sp.status } : {}), ...(from ? { createdAt: { gte: from } } : {}) },
          orderBy: { createdAt: "desc" },
          take: 100,
          select: { id: true, title: true, body: true, category: true, impact: true, confidence: true, status: true, createdAt: true },
        }),
        db.recommendation.count({ where: { workspaceId: w } }),
        db.recommendation.count({ where: { workspaceId: w, impact: "high" } }),
        db.recommendation.count({ where: { workspaceId: w, status: { in: ["in_progress", "implemented"] } } }),
        db.recommendation.count({ where: { workspaceId: w, status: "implemented" } }),
        db.recommendation.groupBy({ by: ["category"], where: { workspaceId: w } }),
      ]);
      rows = list;
      stats = { total, high, acted, implemented };
      categories = cats.map((x) => x.category).sort();
    } catch {
      rows = [];
    }
  }
  const canEdit = Boolean(c?.canEdit);
  const has = stats.total > 0;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["AI Advisor", "/app/ai-advisor"], ["Recommendation History"]]}
        title="Recommendation History"
        subtitle="Every AI recommendation for this workspace, with what happened next."
        actions={<GenerateRecommendations available={ai} canUse={canEdit} className={headerPrimary}>Generate Recommendations</GenerateRecommendations>}
      />
      <TabBar tabs={ADVISOR_TABS} active="/app/ai-advisor/history" />
      <StatGrid
        stats={[
          { label: "Recommendations", icon: Lightbulb, value: has ? String(stats.total) : null },
          { label: "High Impact", icon: TrendingUp, value: has ? String(stats.high) : null, tone: "green" },
          { label: "Acted On", icon: Zap, value: has ? String(stats.acted) : null, tone: "orange", hint: has ? "In progress or implemented" : undefined },
          { label: "Implemented", icon: CheckCircle2, value: has ? String(stats.implemented) : null, tone: "violet" },
        ]}
      />
      <FilterBar>
        <input name="q" defaultValue={sp.q} placeholder="Search recommendations" aria-label="Search recommendations" className={filterSearch} />
        <Select name="category" value={sp.category} all="All Categories" options={categories.map((x) => [x, x])} label="Category" />
        <Select name="impact" value={sp.impact} all="All Impact" options={[["high", "High"], ["medium", "Medium"], ["low", "Low"]]} label="Impact" />
        <Select name="status" value={sp.status} all="All Statuses" options={Object.entries(REC_STATUS_LABELS)} label="Status" />
        <Select name="days" value={sp.days} all="Any Time" options={[["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 90 days"]]} label="Created" />
      </FilterBar>
      <section className={giPanel}>
        <DataTable
          minWidth={960}
          columns={["Recommendation", "Category", "Impact", "Confidence", "Created", "Status", ""]}
          rows={rows.map((r) => [
            <div key="t"><div>{r.title}</div>{r.body && <div className="line-clamp-2 text-[11.5px] font-normal text-ink-soft">{r.body}</div>}</div>,
            r.category,
            <Pill key="i" tone={r.impact === "high" ? "green" : r.impact === "medium" ? "amber" : "gray"}>{r.impact}</Pill>,
            r.confidence != null ? `${Math.round(r.confidence * 100)}%` : "—",
            fmtDate(r.createdAt),
            <Pill key="s" tone={r.status === "implemented" ? "green" : r.status === "in_progress" ? "blue" : r.status === "dismissed" || r.status === "archived" ? "gray" : "violet"}>{REC_STATUS_LABELS[r.status] ?? r.status}</Pill>,
            canEdit ? (
              <span key="a" className="flex flex-wrap justify-end gap-1.5">
                {!["in_progress", "implemented"].includes(r.status) && <ActButton action={recommendationToTask.bind(null, r.id)}>Create task</ActButton>}
                {!["saved", "ready", "implemented"].includes(r.status) && <ActButton action={setRecommendationStatus.bind(null, r.id, "saved")}>Save</ActButton>}
                {r.status === "in_progress" && <ActButton action={setRecommendationStatus.bind(null, r.id, "implemented")}>Implemented</ActButton>}
                {!["dismissed", "implemented"].includes(r.status) && <ActButton action={setRecommendationStatus.bind(null, r.id, "dismissed")}>Dismiss</ActButton>}
              </span>
            ) : "",
          ])}
          empty={<EmptyState icon={History} title={has ? "No recommendations match" : "No recommendations yet"} body={ai ? "Generate recommendations from your workspace data to start a history." : "Recommendations need an AI provider to be configured."} />}
        />
      </section>
    </div>
  );
}
