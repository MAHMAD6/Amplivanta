import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { ScreenHeader } from "@/components/amplivanta/screen-kit";
import { ResourceList, ResourceSearch, TopicChips, resourceCrumbs } from "@/components/amplivanta/resources-ui";
import { matches, publishedResources } from "@/lib/server/resources-hub";

export const metadata: Metadata = { title: "Blog" };

export default async function ResourcesBlogPage({ searchParams }: { searchParams: Promise<{ q?: string; topic?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const articles = publishedResources().filter((e) => e.type === "Article");
  const topics = [...new Set(articles.map((a) => a.topic).filter((t): t is string => Boolean(t)))].sort();
  const topic = topics.includes(sp.topic ?? "") ? sp.topic : undefined;
  const shown = articles.filter((a) => (!topic || a.topic === topic) && (!q || matches(q, a.title, a.summary, a.topic)));

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={resourceCrumbs("Blog")} title="Amplivanta Blog" subtitle="Published articles on growth strategy, automation, CRM, analytics and AI-assisted work." />
      <ResourceSearch action="/app/resources/blog" q={q} placeholder="Search articles">{topic && <input type="hidden" name="topic" value={topic} />}</ResourceSearch>
      <TopicChips base="/app/resources/blog" topics={topics} active={topic} q={q} />
      <section className="rounded-xl border border-line bg-white p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-[16.5px] font-semibold text-deep-navy">{topic ?? "All articles"}</h2>
          <span className="text-[12.5px] text-ink-soft">{shown.length} of {articles.length}</span>
        </div>
        <ResourceList
          entries={shown}
          empty={
            articles.length
              ? { icon: Newspaper, title: "No articles match", body: "Try another topic or search.", action: <Link href="/app/resources/blog" className="text-[13px] font-semibold text-[#0B5CFF]">Show all articles</Link> }
              : { icon: Newspaper, title: "No published articles yet", body: "Articles appear here when Amplivanta publishes them." }
          }
        />
        <p className="mt-3 text-[12px] text-ink-muted">Articles open on the public Amplivanta site in a new tab.</p>
      </section>
    </div>
  );
}
