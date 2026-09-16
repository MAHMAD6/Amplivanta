import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Star } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { EmptyState, ScreenHeader, fmtDate } from "@/components/amplivanta/screen-kit";
import { FilterBar, PanelTitle, Select, filterSearch, giPanel, headerOutline, headerPrimary, outlineSm } from "@/components/amplivanta/growth-kit";
import { ActButton } from "@/components/amplivanta/growth-ui";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { addStory, deleteStory, setStorySaved, storyToDraft } from "@/app/(app)/app/strategy/actions";
import { growthContext, since } from "@/lib/server/growth-screens";

export const metadata: Metadata = { title: "Industry News" };
export const dynamic = "force-dynamic";

type SP = { q?: string; topic?: string; source?: string; days?: string; story?: string };
type Story = { id: string; title: string; source: string; url: string; summary: string | null; topic: string | null; relevance: number | null; saved: boolean; publishedAt: Date };

export default async function IndustryNewsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await growthContext();
  let rows: Story[] = [];
  let saved: Story[] = [];
  let facets = { topics: [] as string[], sources: [] as string[] };
  if (c) {
    try {
      const w = c.workspaceId;
      const from = since(sp.days);
      const sel = { id: true, title: true, source: true, url: true, summary: true, topic: true, relevance: true, saved: true, publishedAt: true } as const;
      const [list, sv, all] = await Promise.all([
        db.newsItem.findMany({
          where: {
            workspaceId: w,
            ...(sp.q ? { OR: [{ title: { contains: sp.q, mode: "insensitive" } }, { summary: { contains: sp.q, mode: "insensitive" } }] } : {}),
            ...(sp.topic ? { topic: sp.topic } : {}),
            ...(sp.source ? { source: sp.source } : {}),
            ...(from ? { publishedAt: { gte: from } } : {}),
          },
          orderBy: { publishedAt: "desc" },
          take: 100,
          select: sel,
        }),
        db.newsItem.findMany({ where: { workspaceId: w, saved: true }, orderBy: { publishedAt: "desc" }, take: 20, select: sel }),
        db.newsItem.findMany({ where: { workspaceId: w }, select: { topic: true, source: true } }),
      ]);
      rows = list;
      saved = sv;
      const uniq = (xs: (string | null)[]) => [...new Set(xs.filter((x): x is string => Boolean(x)))].sort();
      facets = { topics: uniq(all.map((a) => a.topic)), sources: uniq(all.map((a) => a.source)) };
    } catch {
      rows = [];
    }
  }
  const top = rows.filter((r) => r.relevance != null).sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0)).slice(0, 5);
  const scored = rows.filter((r) => r.relevance != null);
  const avg = scored.length ? Math.round(scored.reduce((n, r) => n + (r.relevance ?? 0), 0) / scored.length) : null;
  const selected = rows.find((r) => r.id === sp.story) ?? saved.find((r) => r.id === sp.story) ?? top[0] ?? rows[0];
  const canEdit = Boolean(c?.canEdit);
  const base = new URLSearchParams(Object.entries({ q: sp.q, topic: sp.topic, source: sp.source, days: sp.days }).filter(([, v]) => v) as [string, string][]);
  const pick = (id: string) => { const u = new URLSearchParams(base); u.set("story", id); return `?${u}`; };

  const item = (s: Story) => (
    <li key={s.id} className={cn("py-2.5", selected?.id === s.id && "bg-royal-tint/40")}>
      <div className="flex items-start justify-between gap-2 px-2">
        <div className="min-w-0">
          <Link href={pick(s.id)} className="text-[13px] font-semibold text-deep-navy hover:text-[#0B5CFF]">{s.title}</Link>
          <div className="text-[11.5px] text-ink-muted">
            {s.source} · {fmtDate(s.publishedAt)}{s.topic ? ` · ${s.topic}` : ""}{s.relevance != null ? ` · relevance ${s.relevance}` : ""} · <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="text-[#0B5CFF]">Open</a>
          </div>
        </div>
        {canEdit && <ActButton action={setStorySaved.bind(null, s.id, !s.saved)} className="shrink-0">{s.saved ? "Unsave" : "Save"}</ActButton>}
      </div>
    </li>
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        title="Industry News"
        subtitle="Curate relevant industry stories and turn selected news into original content."
        actions={
          <>
            <FormDialog
              title="Add Story"
              label="Add Story"
              className={headerPrimary}
              action={addStory}
              disabled={!canEdit}
              submitLabel="Add story"
              note="Store the headline, link and your own summary only — don't paste the article text."
              fields={[
                { name: "title", label: "Headline", kind: "text", required: true },
                { name: "url", label: "Link", kind: "text", required: true, placeholder: "https://" },
                { name: "source", label: "Publisher", kind: "text" },
                { name: "topic", label: "Topic", kind: "text" },
                { name: "publishedAt", label: "Published", kind: "date" },
                { name: "relevance", label: "Relevance (0-100)", kind: "number" },
                { name: "summary", label: "Your summary", kind: "textarea", rows: 3 },
              ]}
            />
            <span className={cn(headerOutline, "cursor-not-allowed opacity-60")} title="Alerts need a connected news source, which is not available yet">Manage Alerts</span>
          </>
        }
      />
      <FilterBar>
        <input name="q" defaultValue={sp.q} placeholder="Search industry news" aria-label="Search industry news" className={filterSearch} />
        <Select name="topic" value={sp.topic} all="All Topics" options={facets.topics.map((x) => [x, x])} label="Topic" />
        <Select name="source" value={sp.source} all="All Sources" options={facets.sources.map((x) => [x, x])} label="Source" />
        <Select name="days" value={sp.days} all="Date Range" options={[["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 90 days"]]} label="Date range" />
      </FilterBar>
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className={giPanel}>
          <PanelTitle hint="Highest relevance first">Top Stories</PanelTitle>
          {top.length ? <ul className="divide-y divide-line">{top.map(item)}</ul> : <EmptyState icon={FileText} title="No top stories available" body="Relevant stories will appear when a news source is connected or stories are scored." action={<Link href="/app/integrations#catalog" className={outlineSm}>Connect News Source</Link>} />}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Bookmarked stories">Saved Stories</PanelTitle>
          {saved.length ? <ul className="divide-y divide-line">{saved.map(item)}</ul> : <EmptyState icon={Star} title="No saved stories" body="Bookmark stories to review or turn into content later." />}
        </section>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className={giPanel}>
          <PanelTitle hint="Newest first">Latest News</PanelTitle>
          {rows.length ? <ul className="max-h-[420px] divide-y divide-line overflow-y-auto">{rows.map(item)}</ul> : <EmptyState icon={FileText} title="No news available" body="No articles match the current filters." />}
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Average relevance of scored stories">Relevance</PanelTitle>
          <div className="mt-1 text-[24px] font-bold text-deep-navy">{avg != null ? `${avg}/100` : "—"}</div>
          <div className="mt-2 text-[12px] text-ink-muted">{avg != null ? `Across ${scored.length} scored stories` : "No relevance score"}</div>
        </section>
        <section className={giPanel}>
          <PanelTitle hint="Creates an original draft that credits the source">Content Actions</PanelTitle>
          {selected ? <p className="mb-2 line-clamp-2 text-[12px] text-ink-soft">For: <span className="font-semibold text-deep-navy">{selected.title}</span></p> : null}
          <ul className="space-y-2">
            {[["blog", "Blog", "Original draft"], ["social", "Social", "Original draft"], ["email", "Email", "Original draft"], ["video", "Video", "Original concept"], ["infographic", "Infographic", "Original concept"]].map(([k, l, v]) => (
              <li key={k} className="flex items-center justify-between gap-3 rounded-md border border-line bg-bg-soft/40 px-3 py-2 text-[12.5px]">
                <span className="font-semibold text-deep-navy">{l}</span>
                {selected && canEdit ? <ActButton action={storyToDraft.bind(null, selected.id, k)} goTo="/app/creative-studio/documents/" className="border-0 bg-transparent px-0 py-0 font-normal text-[#0B5CFF]">{v}</ActButton> : <span className="text-ink-soft">{v}</span>}
              </li>
            ))}
          </ul>
          {selected && canEdit && <div className="mt-3 text-right"><ActButton action={deleteStory.bind(null, selected.id)} confirm="Remove this story?">Remove story</ActButton></div>}
        </section>
      </div>
    </div>
  );
}
