import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { btn, btnPrimary } from "@/components/marketing/site-shell";
import {
  Card,
  CardGrid,
  Crumb,
  EmptyState,
  Hero,
  HeroVisual,
  Section,
} from "@/components/marketing/site-ui";
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
  const items =
    slug === "blog"
      ? BLOG_POSTS.map((p) => ({ title: p.title, summary: p.excerpt, href: `/resources/blog/${p.slug}` }))
      : resourceListing(slug);

  return (
    <>
      <Crumb items={["Home", "Resources", page.name]} />
      <Hero
        eyebrow={page.eyebrow}
        title={page.h1}
        lead={page.lead}
        actions={page.actions.map(([label, href], i) => (
          <Link key={href} className={i === 0 ? btnPrimary : btn} href={href}>
            {label}
          </Link>
        ))}
        aside={<HeroVisual title={page.visualTitle} items={page.visualItems} />}
      />

      <Section title={`Latest ${page.name.toLowerCase()}`}>
        {items.length > 0 ? (
          <CardGrid cols={3}>
            {items.map((item) => (
              <Card key={item.href} title={item.title} link={{ label: "Open", href: item.href }}>
                {item.summary}
              </Card>
            ))}
          </CardGrid>
        ) : (
          page.empty && (
            <EmptyState
              title={page.empty[0]}
              actions={
                <>
                  <Link className={btnPrimary} href="/resources/blog">
                    Read the blog
                  </Link>
                  <Link className={btn} href="/contact">
                    Contact Us
                  </Link>
                </>
              }
            >
              {page.empty[1]}
            </EmptyState>
          )
        )}
      </Section>

      <Section title={page.topicsTitle} lead={page.topicsLead}>
        <CardGrid cols={3}>
          {page.topics.map(([title, body], i) => (
            <Card key={title} icon={i + 1} title={title}>
              {body}
            </Card>
          ))}
        </CardGrid>
      </Section>
    </>
  );
}
