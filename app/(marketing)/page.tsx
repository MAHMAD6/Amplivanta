import type { Metadata } from "next";
import Link from "next/link";
import { btn, btnPrimary } from "@/components/marketing/site-buttons";
import {
  Card,
  CardGrid,
  Hero,
  HeroVisual,
  InfoCard,
  Note,
  Panel,
  Section,
  Split,
} from "@/components/marketing/site-ui";
import { PLATFORM_PAGES } from "@/lib/site-platform";
import { SOLUTION_PAGES } from "@/lib/site-solutions";
import { INDUSTRY_PAGES } from "@/lib/site-industries";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: { absolute: "Amplivanta: We Engineer Growth" },
  description:
    "Amplivanta brings planning, content, campaigns, CRM, automation, social publishing and analytics into one connected workspace.",
};

const STEPS: [string, string][] = [
  ["Plan", "Set the objective, the audience, and what you already know."],
  ["Create", "Prepare the campaign and creative work in the relevant modules."],
  ["Execute", "Launch or schedule through supported channels and workflows."],
  ["Measure", "Review what happened and decide what to change next."],
];

export default function HomePage() {
  return (
    <>
      <Hero
        size="lg"
        eyebrow="ENGINEERING GROWTH"
        title="Engineer smarter growth."
        lead="Amplivanta connects planning, content creation, marketing automation, CRM, social publishing, analytics and AI-assisted workflows in one platform — so strategy, execution and measurement stop living in separate tools."
        actions={
          <>
            <Link className={btnPrimary} href="/signup">Start Engineering Growth</Link>
            <Link className={btn} href="/book-demo">Book a Demo</Link>
          </>
        }
        aside={
          <HeroVisual
            title="A connected growth-engineering model"
            items={[
              "Plan & prioritize",
              "Create & organize",
              "Execute workflows",
              "Manage relationships",
              "Measure performance",
              "Improve with context",
            ]}
          />
        }
      />

      <Section
        title="The platform"
        lead="Eight modules that share one workspace, one set of permissions, and one view of your data."
        action={
          <Link href="/platform" className="text-[13px] font-bold text-site-purple hover:underline">
            Explore the platform
          </Link>
        }
      >
        <CardGrid cols={4}>
          {PLATFORM_PAGES.map((p, i) => (
            <Card
              key={p.slug}
              icon={i + 1}
              title={p.name}
              link={{ label: "Explore", href: `/platform/${p.slug}` }}
            >
              {p.lead}
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Section
        title="A practical operating pattern"
        lead="The same four moves, whichever capability you are using."
      >
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([label, body], i) => (
            <article key={label} className="rounded-2xl border border-site-line bg-white p-5">
              <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#EEF1FF] to-[#F8ECFF] text-[13px] font-black text-site-purple">
                {i + 1}
              </div>
              <h3 className="m-0 mb-1.5 text-[15px] font-extrabold text-site-ink">{label}</h3>
              <p className="m-0 text-[13px] leading-[1.5] text-site-muted">{body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="Start from an outcome"
        lead="Solutions organise the same capabilities around what you are trying to achieve."
        action={
          <Link href="/solutions" className="text-[13px] font-bold text-site-purple hover:underline">
            View all solutions
          </Link>
        }
      >
        <CardGrid cols={4}>
          {SOLUTION_PAGES.map((p) => (
            <Card key={p.slug} title={p.name} link={{ label: "View", href: `/solutions/${p.slug}` }}>
              {p.lead}
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Section
        title="Built for how your industry works"
        lead="Each industry page shows the workflows and capabilities that actually apply."
        action={
          <Link href="/industries" className="text-[13px] font-bold text-site-purple hover:underline">
            All industries
          </Link>
        }
      >
        <CardGrid cols={3}>
          {INDUSTRY_PAGES.map((p) => (
            <Card key={p.slug} title={p.name} link={{ label: "View industry", href: `/industries/${p.slug}` }}>
              {p.lead}
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Section
        title="From the blog"
        action={
          <Link href="/resources/blog" className="text-[13px] font-bold text-site-purple hover:underline">
            Read the blog
          </Link>
        }
      >
        <CardGrid cols={3}>
          {BLOG_POSTS.slice(0, 3).map((p) => (
            <Card key={p.slug} title={p.title} link={{ label: "Read", href: `/resources/blog/${p.slug}` }}>
              {p.excerpt}
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Panel>
        <Split>
          <InfoCard title="How we present the product">
            <ul>
              <li>Capabilities are described as they exist, not as they are planned.</li>
              <li>No customer counts, performance claims or invented case studies.</li>
              <li>Empty states stay neutral until there is real content behind them.</li>
              <li>AI-assisted work stays reviewable, with a person in control.</li>
            </ul>
          </InfoCard>
          <InfoCard title="Marketplace">
            Downloadable marketing products from Amplivanta sellers, reviewed before they go live.
            Selling does not require a paid plan.{" "}
            <Link href="/marketplace" className="font-semibold text-site-purple hover:underline">
              Browse the Marketplace
            </Link>{" "}
            or{" "}
            <Link href="/marketplace/sell" className="font-semibold text-site-purple hover:underline">
              sell on Amplivanta
            </Link>
            .
          </InfoCard>
        </Split>
        <Note>
          Pricing, plan limits and Marketplace commission are published on the{" "}
          <Link href="/pricing" className="font-semibold text-site-purple hover:underline">
            pricing page
          </Link>{" "}
          rather than summarised here, so there is one source for them.
        </Note>
      </Panel>
    </>
  );
}
