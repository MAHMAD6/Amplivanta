import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Compass, LayoutTemplate, LifeBuoy, Newspaper, PlayCircle, Presentation, Search } from "lucide-react";
import { ScreenHeader } from "@/components/amplivanta/screen-kit";
import { ResourceList, ResourceSearch, resourceCrumbs } from "@/components/amplivanta/resources-ui";
import { matches, productTemplates, publishedResources, setupGuides } from "@/lib/server/resources-hub";
import { workspaceContext } from "@/lib/server/workspace-screens";
import { HELP_ARTICLES, RESOURCE_VIDEOS, RESOURCE_WEBINARS } from "@/lib/site-resource-items";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata: Metadata = { title: "Resources Hub" };
export const dynamic = "force-dynamic";

export default async function ResourcesHubPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 100);
  const c = await workspaceContext();
  const [templates, guides] = await Promise.all([productTemplates(c?.workspaceId ?? null), setupGuides(c?.workspaceId ?? null)]);
  const all = publishedResources();
  const guidesDone = guides.filter((g) => g.done).length;
  const knownGuides = guides.every((g) => g.done !== null);

  const categories = [
    { icon: Newspaper, name: "Blog", hint: "Articles on growth, automation, CRM and analytics.", href: "/app/resources/blog", count: `${BLOG_POSTS.length} article${BLOG_POSTS.length === 1 ? "" : "s"}` },
    { icon: BookOpen, name: "Knowledge Base", hint: "How-to articles for Amplivanta features.", href: "/app/resources/knowledge-base", count: HELP_ARTICLES.length ? `${HELP_ARTICLES.length} articles` : "No articles published yet" },
    { icon: Compass, name: "Guides", hint: "Setup guides that track your workspace progress.", href: "/app/resources/guides", count: knownGuides ? `${guidesDone} of ${guides.length} complete` : `${guides.length} guides` },
    { icon: PlayCircle, name: "Videos", hint: "Product walkthroughs and explainers.", href: "/app/resources/videos", count: RESOURCE_VIDEOS.length ? `${RESOURCE_VIDEOS.length} videos` : "No videos published yet" },
    { icon: Presentation, name: "Webinars", hint: "Live and on-demand sessions.", href: "/app/resources/webinars", count: RESOURCE_WEBINARS.length ? `${RESOURCE_WEBINARS.length} webinars` : "No webinars scheduled" },
    { icon: LayoutTemplate, name: "Templates", hint: "Automation, landing page, creative and email templates.", href: "/app/resources/templates", count: `${templates.items.length} available` },
    { icon: LifeBuoy, name: "Help Center", hint: "Support options and help topics.", href: "/app/help", count: "Help & Support" },
  ];

  const results = query
    ? [
        ...all.filter((e) => matches(query, e.title, e.summary, e.topic)),
        ...templates.items.filter((t) => matches(query, t.name, t.description, t.source, t.category)).map((t) => ({ type: "Template" as const, title: t.name, summary: `${t.source} · ${t.description}`, href: t.href, topic: t.category })),
      ]
    : [];

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={resourceCrumbs()} title="Resources Hub" subtitle="Published Amplivanta articles, guides and templates in one place." />
      <ResourceSearch action="/app/resources" q={query} placeholder="Search articles, help and templates" />

      {query ? (
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[16.5px] font-semibold text-deep-navy">{results.length} result{results.length === 1 ? "" : "s"} for “{query}”</h2>
          <ResourceList entries={results} empty={{ icon: Search, title: "Nothing matches that search", body: "Try fewer or different words, or browse a category below.", action: <Link href="/app/resources" className="text-[13px] font-semibold text-[#0B5CFF]">Clear search</Link> }} />
        </section>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((cat) => (
              <Link key={cat.name} href={cat.href} className="group rounded-xl border border-line bg-white p-5 transition hover:border-[#0B5CFF]/40">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><cat.icon className="h-5 w-5" /></span>
                <div className="mt-3 text-[15px] font-semibold text-deep-navy group-hover:text-[#0B5CFF]">{cat.name}</div>
                <p className="mt-0.5 text-[12.5px] text-ink-soft">{cat.hint}</p>
                <p className="mt-2 text-[12px] font-medium text-ink-muted">{cat.count}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <section className="min-w-0 rounded-xl border border-line bg-white p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-[16.5px] font-semibold text-deep-navy">Latest published</h2>
                <Link href="/resources" target="_blank" rel="noopener" className="text-[12.5px] font-semibold text-[#0B5CFF]">Public resources</Link>
              </div>
              <ResourceList entries={all.slice(0, 6)} empty={{ icon: Newspaper, title: "Nothing published yet", body: "Articles, videos and help content appear here when they are published." }} />
            </section>
            <section className="min-w-0 rounded-xl border border-line bg-white p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-[16.5px] font-semibold text-deep-navy">Your setup progress</h2>
                <Link href="/app/resources/guides" className="text-[12.5px] font-semibold text-[#0B5CFF]">All guides</Link>
              </div>
              {knownGuides && (
                <div className="mt-3">
                  <div className="h-2 rounded-full bg-bg-soft"><div className="h-2 rounded-full bg-[#0B5CFF]" style={{ width: `${Math.round((guidesDone / guides.length) * 100)}%` }} /></div>
                  <p className="mt-1.5 text-[12px] text-ink-soft">{guidesDone} of {guides.length} setup guides complete in this workspace</p>
                </div>
              )}
              <ul className="mt-3 divide-y divide-line">
                {guides.filter((g) => !g.done).slice(0, 4).map((g) => (
                  <li key={g.key} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0"><div className="text-[13.5px] font-semibold text-deep-navy">{g.title}</div><div className="text-[12px] text-ink-soft">{g.module}</div></div>
                    <Link href={g.href} className="shrink-0 text-[12.5px] font-semibold text-[#0B5CFF]">{g.cta}</Link>
                  </li>
                ))}
                {knownGuides && guidesDone === guides.length && <li className="py-3 text-[13px] text-ink-soft">Every setup guide is complete.</li>}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
