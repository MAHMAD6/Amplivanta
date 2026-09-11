import type { Metadata } from "next";
import Link from "next/link";
import { btn, btnPrimary } from "@/components/marketing/site-buttons";
import {
  Card,
  CardGrid,
  Crumb,
  Hero,
  HeroVisual,
  InfoCard,
  Note,
  Panel,
  Section,
} from "@/components/marketing/site-ui";
import { PLATFORM_PAGES } from "@/lib/site-platform";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "The Amplivanta platform: AI Advisor, Growth Audit, marketing automation, CRM, social publishing, creative studio, analytics and integrations in one connected workspace.",
};

export default function PlatformIndexPage() {
  return (
    <>
      <Crumb items={["Home", "Platform"]} />
      <Hero
        size="lg"
        eyebrow="PLATFORM"
        title="One connected workspace for growth work."
        lead="Each module handles a part of the work — planning, execution, relationships, creative, publishing and measurement — and shares the same identity, permissions and data so the work stays connected as it moves between them."
        actions={
          <>
            <Link className={btnPrimary} href="/signup">Start Engineering Growth</Link>
            <Link className={btn} href="/book-demo">Book a Demo</Link>
          </>
        }
        aside={
          <HeroVisual
            title="How the modules connect"
            items={[
              "Plan with context",
              "Create the work",
              "Execute across channels",
              "Manage relationships",
              "Measure what happened",
              "Feed it back into planning",
            ]}
          />
        }
      />

      <Section
        title="Explore the platform"
        lead="Eight modules. Each page describes what the module does today, without claiming capabilities that are not built."
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

      <Panel>
        <InfoCard title="What connects the modules">
          <ul>
            <li>One workspace identity, so the same permissions apply everywhere.</li>
            <li>Shared contact, company and campaign context rather than per-module copies.</li>
            <li>Consistent module controls, so an operator can enable or disable a capability in one place.</li>
            <li>Human review around AI-assisted work, in every module that offers it.</li>
          </ul>
        </InfoCard>
        <Note>
          Modules are individually gated. A capability that is not enabled for your workspace is
          shown as unavailable rather than hidden, so it is clear what exists and what is switched
          off.
        </Note>
      </Panel>
    </>
  );
}
