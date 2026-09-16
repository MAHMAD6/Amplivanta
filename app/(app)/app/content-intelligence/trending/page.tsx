import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CircleDot, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { BarList, EmptyState, KeyList, ScreenHeader } from "@/components/amplivanta/screen-kit";
import { FilterBar, PanelTitle, Select, filterSearch, giPanel, headerOutline, headerPrimary, outlineSm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { deleteTrend, trackTopic, trendToIdea } from "@/app/(app)/app/strategy/actions";
import { growthContext, since } from "@/lib/server/growth-screens";

export const metadata: Metadata = { title: "Trending Topics" };
export const dynamic = "force-dynamic";

type SP = { q?: string; source?: string; category?: string; country?: string; days?: string; topic?: string };

export default async function TrendingTopicsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await growthContext();
  type T = Awaited<ReturnType<typeof db.trend.findMany>>[number];
  let rows: T[] = [];
  let facets = { sources: [] as string[], categories: [] as string[], countries: [] as string[] };
  if (c) {
    try {
      const w = c.workspaceId;
      const from = since(sp.days);
      const [list, all] = await Promise.all([
        db.trend.findMany({
          where: {
            workspaceId: w,
            ...(sp.q ? { topic: { contains: sp.q, mode: "insensitive" } } : {}),
            ...(sp.source ? { source: sp.source } : {}),
            ...(sp.category ? { category: sp.category } : {}),
            ...(sp.country ? { country: sp.country } : {}),
            ...(from ? { createdAt: { gte: from } } : {}),
          },
          orderBy: [{ growth: "desc" }, { createdAt: "desc" }],
          take: 100,
        }),
        db.trend.findMany({ where: { workspaceId: w }, select: { source: true, category: true, country: true } }),
      ]);
      rows = list;
      const uniq = (xs: (string | null)[]) => [...new Set(xs.filter((x): x is string => Boolean(x)))].sort();
      facets = { sources: uniq(all.map((a) => a.source)), categories: uniq(all.map((a) => a.category)), countries: uniq(all.map((a) => a.country)) };
    } catch {
      rows = [];
    }
  }
  const selected = rows.find((r) => r.id === sp.topic) ?? rows[0];
  const bySource = new Map<string, number>();
  for (const r of rows) bySource.set(r.source ?? "Unspecified", (bySource.get(r.source ?? "Unspecified") ?? 0) + 1);
  const avgGrowth = rows.length ? rows.reduce((n, r) => n + r.growth, 0) / rows.length : null;
  const qs = new URLSearchParams(Object.entries({ q: sp.q, source: sp.source, category: sp.category, country: sp.country, days: sp.days }).filter(([, v]) => v) as [string, string][]);
  const topicHref = (id: string) => { const u = new URLSearchParams(qs); u.set("topic", id); return `?${u}`; };
  const canEdit = Boolean(c?.canEdit);
  const opt = (xs: string[]): [string, string][] => xs.map((x) => [x, x]);

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        title="Trending Topics"
        subtitle="Track timely topics and turn relevant trends into content opportunities."
        actions={
          <>
            <FormDialog
              title="Track Topic"
              label="Track Topic"
              className={headerPrimary}
              action={trackTopic}
              disabled={!canEdit}
              submitLabel="Track topic"
              note="No trend data provider is connected, so topics and figures are entered from your own research."
              fields={[
                { name: "topic", label: "Topic", kind: "text", required: true },
                { name: "source", label: "Source", kind: "text", placeholder: "e.g. Google Trends, Reddit" },
                { name: "category", label: "Industry / category", kind: "text" },
                { name: "country", label: "Country", kind: "text" },
                { name: "mentions", label: "Mentions", kind: "number" },
                { name: "growth", label: "Velocity (% change)", kind: "number" },
                { name: "relevance", label: "Relevance (0-100)", kind: "number" },
                { name: "hashtags", label: "Related hashtags", kind: "text", placeholder: "#topic, #another" },
              ]}
            />
            {rows.length ? <a href={`/api/trends/export${qs.size ? `?${qs}` : ""}`} className={headerOutline}>Export</a> : <span className={cn(headerOutline, "cursor-not-allowed opacity-50")} title="Nothing to export yet">Export</span>}
          </>
        }
      />
      <FilterBar>
        <input name="q" defaultValue={sp.q} placeholder="Search topics" aria-label="Search topics" className={filterSearch} />
        <Select name="source" value={sp.source} all="All Sources" options={opt(facets.sources)} label="Source" />
        <Select name="category" value={sp.category} all="All Industries" options={opt(facets.categories)} label="Industry" />
        <Select name="country" value={sp.country} all="All Countries" options={opt(facets.countries)} label="Country" />
        <Select name="days" value={sp.days} all="Date Range" options={[["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 90 days"]]} label="Date range" />
      </FilterBar>
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className={giPanel}>
          <PanelTitle hint="Mentions per tracked topic">Trend Activity</PanelTitle>
          {rows.some((r) => r.mentions) ? <BarList rows={rows.filter((r) => r.mentions).map((r) => [r.topic, r.mentions ?? 0])} /> : <EmptyState icon={ArrowUpRight} title="No trend data available" body="Trend activity will appear after a data source is connected or topics are tracked." action={<Link href="/app/integrations#catalog" className={outlineSm}>Connect Data Sources</Link>} />}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Average % change across the filtered topics">Velocity</PanelTitle>
          <div className="mt-1 text-[24px] font-bold text-deep-navy">{avgGrowth != null ? `${avgGrowth >= 0 ? "+" : ""}${avgGrowth.toFixed(1)}%` : "—"}</div>
          <div className="mt-2 text-[12px] text-ink-muted">{avgGrowth != null ? `Across ${rows.length} topics` : "No velocity data"}</div>
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Topics by source">Channel Mix</PanelTitle>
          {bySource.size ? <BarList rows={[...bySource.entries()]} /> : <EmptyState icon={CircleDot} title="No channel mix available" body="Channel distribution will appear when source data is available." />}
        </section>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className={giPanel}>
          <PanelTitle hint="Select a topic to see detail">Trending Topics</PanelTitle>
          {rows.length ? (
            <ul className="divide-y divide-line">
              {rows.map((r) => (
                <li key={r.id} className={cn("flex items-center justify-between gap-2 py-2.5", selected?.id === r.id && "bg-royal-tint/40")}>
                  <Link href={topicHref(r.id)} className="min-w-0 px-2">
                    <div className="truncate text-[13px] font-semibold text-deep-navy">{r.topic}</div>
                    <div className="text-[11.5px] text-ink-muted">{[r.source, r.category, r.country].filter(Boolean).join(" · ") || "Manual"}</div>
                  </Link>
                  <span className={cn("shrink-0 px-2 text-[12.5px] font-semibold", r.growth >= 0 ? "text-emerald-600" : "text-red-500")}>{r.growth >= 0 ? "+" : ""}{r.growth}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={TrendingUp} title="No topics found" body="Adjust filters or connect a trend source to populate topics." />
          )}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Figures as recorded for the topic" action={selected && canEdit ? <span className="flex gap-1.5"><ActButton action={trendToIdea.bind(null, selected.id)}>Save as idea</ActButton><ActButton action={deleteTrend.bind(null, selected.id)} confirm="Stop tracking this topic?">Remove</ActButton></span> : undefined}>Topic Detail{selected ? `: ${selected.topic}` : ""}</PanelTitle>
          <KeyList
            rows={[
              ["Mentions", selected?.mentions != null ? selected.mentions.toLocaleString("en-US") : "—"],
              ["Engagement", selected?.engagement != null ? selected.engagement.toLocaleString("en-US") : "—"],
              ["Velocity", selected ? `${selected.growth >= 0 ? "+" : ""}${selected.growth}%` : "—"],
              ["Relevance", selected?.relevance != null ? `${selected.relevance}/100` : "—"],
              ["Related hashtags", selected?.hashtags.length ? selected.hashtags.join(" ") : "—"],
            ]}
          />
        </section>
      </div>
    </div>
  );
}
