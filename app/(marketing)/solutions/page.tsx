import type { Metadata } from "next";
import Link from "next/link";
import { btn, btnPrimary } from "@/components/marketing/site-shell";
import {
  Card,
  CardGrid,
  Crumb,
  Hero,
  HeroVisual,
  InfoCard,
  Panel,
  Section,
  Split,
} from "@/components/marketing/site-ui";
import { SOLUTION_PAGES } from "@/lib/site-solutions";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Growth marketing, revenue acceleration, AI workflows and brand intelligence — the same Amplivanta capabilities organised around the outcome you are working towards.",
};

export default function SolutionsIndexPage() {
  return (
    <>
      <Crumb items={["Home", "Solutions"]} />
      <Hero
        size="lg"
        eyebrow="SOLUTIONS"
        title="Organised around the outcome, not the tool."
        lead="A solution is a way through the platform rather than a separate product. Each one connects the planning, creative, campaign, CRM, automation and analytics capabilities that a particular objective actually needs."
        actions={
          <>
            <Link className={btnPrimary} href="/signup">Start Engineering Growth</Link>
            <Link className={btn} href="/book-demo">Book a Demo</Link>
          </>
        }
        aside={
          <HeroVisual
            title="A shared operating pattern"
            items={["Plan", "Create", "Execute", "Measure"]}
          />
        }
      />

      <Section
        title="Four ways in"
        lead="Each page shows the capabilities that apply and the operating pattern behind them."
      >
        <CardGrid cols={4}>
          {SOLUTION_PAGES.map((p, i) => (
            <Card
              key={p.slug}
              icon={i + 1}
              title={p.name}
              link={{ label: "View solution", href: `/solutions/${p.slug}` }}
            >
              {p.lead}
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Panel>
        <Split>
          <InfoCard title="How to choose">
            Pick the outcome you are working towards rather than the module you already know. The
            pages overlap on purpose — the same CRM and analytics capabilities appear under more than
            one solution, because the work does too.
          </InfoCard>
          <InfoCard title="Looking for something specific?">
            If you know which capability you need, the{" "}
            <Link href="/platform" className="font-semibold text-site-purple hover:underline">
              Platform section
            </Link>{" "}
            describes each module directly. If you want to see how this applies to a particular kind
            of business, start with{" "}
            <Link href="/industries" className="font-semibold text-site-purple hover:underline">
              Industries
            </Link>
            .
          </InfoCard>
        </Split>
      </Panel>
    </>
  );
}
