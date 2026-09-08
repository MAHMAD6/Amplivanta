import type { Metadata } from "next";
import Link from "next/link";
import { SitePage, btn, btnPrimary } from "@/components/marketing/site-shell";
import {
  Card,
  CardGrid,
  Crumb,
  EmptyState,
  Hero,
  HeroVisual,
  InfoCard,
  Panel,
  Section,
} from "@/components/marketing/site-ui";

export const metadata: Metadata = {
  title: "Affiliate Program",
  description:
    "Refer Amplivanta through a dedicated affiliate program. Commission rates, attribution windows, eligible products and payout rules come from the current Affiliate Terms.",
};

const STEPS = [
  ["Apply", "Enrollment begins through the configured affiliate application process when applications are open."],
  ["Use approved links", "Approved affiliates receive referral identifiers or links according to the tracking configuration."],
  ["Follow program terms", "Promotions should comply with disclosure, brand-use, channel, and eligibility requirements in the active terms."],
  ["Review eligible earnings", "Commission and payout status should come from validated attribution, refunds, reversals, and program rules."],
];

export default function AffiliateProgramPage() {
  return (
    <SitePage active="company">
      <Crumb items={["Home", "Company", "Affiliate Program"]} />
      <Hero
        eyebrow="COMPANY / AFFILIATE PROGRAM"
        title="Refer Amplivanta through a dedicated affiliate program."
        lead="The Affiliate Program is designed for eligible participants who refer Amplivanta using approved tracking and promotional practices. Commission rates, attribution windows, eligible products, payout rules, and enrollment requirements should always come from the current Affiliate Terms and program configuration."
        actions={
          <>
            <Link className={btnPrimary} href="/legal/affiliate-terms">Read Affiliate Terms</Link>
            <Link className={btn} href="/partners">Explore Partnerships</Link>
          </>
        }
        aside={
          <HeroVisual
            title="Program components"
            items={[
              "Application & eligibility",
              "Referral tracking",
              "Attribution rules",
              "Commission rules",
              "Payout eligibility",
              "Disclosure requirements",
            ]}
          />
        }
      />

      <Section
        title="How the program should work"
        lead="No hard-coded commission percentage, cookie duration, payout threshold, or payout schedule is shown here."
      >
        <CardGrid cols={4}>
          {STEPS.map(([title, body], i) => (
            <Card key={title} icon={i + 1} title={title}>{body}</Card>
          ))}
        </CardGrid>
      </Section>

      <Panel>
        <EmptyState
          icon="A"
          title="Affiliate enrollment is not currently presented as open"
          actions={
            <>
              <Link className={btnPrimary} href="/legal/affiliate-terms">Review Affiliate Terms</Link>
              <Link className={btn} href="/contact">Contact Us</Link>
            </>
          }
        >
          When enrollment is enabled, this section can switch to the live application CTA and display
          the verified commission, attribution, eligibility, and payout terms from the program
          configuration.
        </EmptyState>
      </Panel>

      <Panel white>
        <InfoCard title="Program integrity">
          <ul>
            <li>Use accurate, non-misleading promotional claims.</li>
            <li>Disclose the affiliate relationship where required.</li>
            <li>Use only approved brand assets and messaging.</li>
            <li>Do not infer commissions from Marketplace seller fees or SaaS pricing plans.</li>
          </ul>
        </InfoCard>
      </Panel>
    </SitePage>
  );
}
