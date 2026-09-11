import type { Metadata } from "next";
import Link from "next/link";
import { SitePage } from "@/components/marketing/site-shell";
import { btn, btnPrimary } from "@/components/marketing/site-buttons";
import {
  Card,
  CardGrid,
  Crumb,
  EmptyState,
  Hero,
  HeroVisual,
  InfoCard,
  Note,
  Panel,
  Section,
} from "@/components/marketing/site-ui";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "The Amplivanta Partner Program is for organizations that complement the platform through services, implementation, consulting, integrations or go-to-market collaboration.",
};

const PATHS = [
  ["Services", "Agencies and consultants may support clients using Amplivanta where a suitable program relationship exists."],
  ["Implementation", "Implementation-oriented relationships can focus on setup, workflows, integrations, and adoption where supported."],
  ["Technology", "Integration or technology collaboration can be evaluated based on product fit and technical scope."],
  ["Go-to-market", "Joint marketing or referral activity should use approved terms, messaging, tracking, and disclosure requirements."],
];

export default function PartnersPage() {
  return (
    <SitePage active="company">
      <Crumb items={["Home", "Company", "Partners"]} />
      <Hero
        eyebrow="COMPANY / PARTNERS"
        title="Build a defined partnership around Amplivanta."
        lead="The Partner Program is intended for organizations that can complement Amplivanta through services, implementation, consulting, integrations, or go-to-market collaboration. Partner eligibility, benefits, and program terms should come from the active program configuration."
        actions={
          <>
            <Link className={btnPrimary} href="/affiliate-program">Looking for the Affiliate Program?</Link>
            <Link className={btn} href="/contact">Contact Us</Link>
          </>
        }
        aside={
          <HeroVisual
            title="Potential partner paths"
            items={[
              "Agencies",
              "Consultants",
              "Implementation services",
              "Technology collaborators",
              "Training & enablement",
              "Co-marketing, when approved",
            ]}
          />
        }
      />

      <Section
        title="Partnership structure"
        lead="Program language is deliberately neutral until specific benefits and requirements are approved."
      >
        <CardGrid cols={4}>
          {PATHS.map(([title, body], i) => (
            <Card key={title} icon={i + 1} title={title}>{body}</Card>
          ))}
        </CardGrid>
      </Section>

      <Panel>
        <EmptyState
          icon="P"
          title="Partner applications are not shown until enabled"
          actions={
            <>
              <Link className={btnPrimary} href="/legal/partner-terms">Review Partner Terms</Link>
              <Link className={btn} href="/contact">Contact Us</Link>
            </>
          }
        >
          When partner enrollment is opened, the application route should display the active
          eligibility criteria, terms, required disclosures, and next steps from the production
          program configuration.
        </EmptyState>
      </Panel>

      <Panel white>
        <InfoCard title="Important distinction">
          The Partner Program is separate from the Affiliate Program and from Marketplace selling.
          Participation in one does not automatically enroll a business or individual in another.
        </InfoCard>
        <Note>
          Response-time promises, partner counts, geographic coverage, certification claims, revenue
          claims and guaranteed benefits are not published unless they are verified and currently
          supported.
        </Note>
      </Panel>
    </SitePage>
  );
}
