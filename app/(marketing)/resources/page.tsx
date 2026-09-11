import type { Metadata } from "next";
import Link from "next/link";
import { btn, btnPrimary } from "@/components/marketing/site-buttons";
import {
  Card,
  CardGrid,
  Crumb,
  Hero,
  HeroVisual,
  Note,
  Panel,
  Section,
} from "@/components/marketing/site-ui";
import { RESOURCE_PAGES } from "@/lib/site-resources";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Articles, videos, webinars, templates and help content for growth operators using Amplivanta.",
};

export default function ResourcesIndexPage() {
  const latest = BLOG_POSTS.slice(0, 3);

  return (
    <>
      <Crumb items={["Home", "Resources"]} />
      <Hero
        eyebrow="RESOURCES"
        title="Practical material for growth work."
        lead="Written and recorded material on strategy, automation, CRM, creative, analytics and AI-assisted workflows. Every section publishes only what actually exists — nothing here is a placeholder for content that has not been produced."
        actions={
          <>
            <Link className={btnPrimary} href="/resources/blog">Read the blog</Link>
            <Link className={btn} href="/resources/help-center">Help Center</Link>
          </>
        }
        aside={
          <HeroVisual
            title="What you will find"
            items={[
              "Articles and playbooks",
              "Recorded walkthroughs",
              "Live and recorded webinars",
              "Reusable templates",
              "Product help content",
              "Release and product notes",
            ]}
          />
        }
      />

      <Section title="Browse resources">
        <CardGrid cols={3}>
          {RESOURCE_PAGES.map((p, i) => (
            <Card
              key={p.slug}
              icon={i + 1}
              title={p.name}
              link={{ label: "Open", href: `/resources/${p.slug}` }}
            >
              {p.lead}
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Section
        title="Latest from the blog"
        lead="The most recent published articles."
        action={
          <Link href="/resources/blog" className="text-[13px] font-bold text-site-purple hover:underline">
            View all articles
          </Link>
        }
      >
        <CardGrid cols={3}>
          {latest.map((p) => (
            <Card
              key={p.slug}
              title={p.title}
              link={{ label: "Read", href: `/resources/blog/${p.slug}` }}
            >
              {p.excerpt}
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Panel>
        <Note>
          Videos, webinars and templates show a neutral state until real content is published through
          the content system. They are not filled with sample entries.
        </Note>
      </Panel>
    </>
  );
}
