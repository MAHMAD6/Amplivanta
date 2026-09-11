import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { btnPrimary } from "@/components/marketing/site-shell";
import { Crumb, Eyebrow, HeroVisual, Section } from "@/components/marketing/site-ui";
import { LibraryView, ResourceLibrary, type LibraryItem } from "@/components/marketing/resource-library";
import { RESOURCE_BY_SLUG, RESOURCE_PAGES } from "@/lib/site-resources";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { resourceListing } from "@/lib/site-resource-items";

export function generateStaticParams() {
  return RESOURCE_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = RESOURCE_BY_SLUG.get(slug);
  return page ? { title: page.name, description: page.description || page.lead } : {};
}

export default async function ResourceIndexPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = RESOURCE_BY_SLUG.get(slug);
  if (!page) notFound();

  // Each section lists only what is actually published; an empty section
  // renders the reference's neutral state rather than sample listings.
  const items: LibraryItem[] =
    slug === "blog"
      ? BLOG_POSTS.map((p) => ({
          title: p.title,
          summary: p.excerpt,
          href: `/resources/blog/${p.slug}`,
          topic: p.topic,
          date: p.date,
        }))
      : resourceListing(slug);

  const topicNames = page.topics.map(([t]) => t);

  return (
    <>
      <Crumb items={["Home", "Resources", page.name]} />

      <section className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
        <div>
          <Eyebrow>{page.eyebrow}</Eyebrow>
          <h1 className="m-0 mb-4 text-[32px] font-extrabold leading-[1.05] tracking-[-1.5px] text-site-ink sm:text-[40px] lg:text-[48px]">
            {page.h1}
          </h1>
          <p className="m-0 mb-6 max-w-[1000px] text-[16px] leading-[1.55] text-site-muted sm:text-[18px]">
            {page.lead}
          </p>
          {/* A plain GET form: works without JavaScript and hands ?q= to the library. */}
          <form action="#library" method="get" className="flex flex-col gap-2.5 sm:flex-row" role="search">
            <label className="min-w-0 flex-1">
              <span className="sr-only">{page.library.heroPlaceholder}</span>
              <input
                type="search"
                name="q"
                placeholder={page.library.heroPlaceholder}
                className="h-12 w-full rounded-[10px] border border-[#DCE2EF] bg-white px-4 text-[14px] text-site-ink focus:border-site-purple focus:outline-none"
              />
            </label>
            <button type="submit" className={`${btnPrimary} px-6 py-3 text-[15px]`}>
              Search
            </button>
          </form>
        </div>
        <HeroVisual title={page.visualTitle} items={page.visualItems} />
      </section>

      <Section title={page.topicsTitle} lead={page.topicsLead}>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {page.topics.map(([title, body], i) => (
            <article key={title} className="flex flex-col rounded-2xl border border-site-line bg-white p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#EEF1FF] to-[#F8ECFF] text-[13px] font-black text-site-purple">
                {i + 1}
              </div>
              <h3 className="m-0 mb-1.5 text-[15px] font-extrabold text-site-ink">{title}</h3>
              <p className="m-0 flex-1 text-[12.8px] leading-[1.5] text-site-muted">{body}</p>
              <Link
                href={`?topic=${encodeURIComponent(title)}#library`}
                className="mt-3 text-[13px] font-bold text-site-purple hover:underline"
              >
                Explore →
              </Link>
            </article>
          ))}
        </div>
      </Section>

      {/* useSearchParams needs a Suspense boundary to keep the page static;
          the unfiltered view is the fallback so the HTML carries the listing. */}
      <Suspense
        fallback={<LibraryView items={items} topics={topicNames} config={page.library} empty={page.empty} />}
      >
        <ResourceLibrary items={items} topics={topicNames} config={page.library} empty={page.empty} />
      </Suspense>
    </>
  );
}
