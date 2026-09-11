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

export const metadata: Metadata = {
  title: "Company",
  description:
    "About Amplivanta, careers, the Partner Program, the Affiliate Program, and how to get in touch.",
};

const DESTINATIONS: [string, string, string][] = [
  ["About Us", "What Amplivanta is building and the principles behind the product work.", "/company/about"],
  ["Careers", "Roles are published here when they are actually open.", "/company/careers"],
  ["Partners", "Services, implementation, technology and go-to-market partnerships.", "/partners"],
  ["Affiliate Program", "Refer Amplivanta under the current affiliate terms.", "/affiliate-program"],
  ["Contact Us", "Product questions, demos, support, partnership and affiliate routes.", "/contact"],
  ["Trust Center", "Security and privacy practices, and how to request documentation.", "/trust"],
];

export default function CompanyIndexPage() {
  return (
    <>
      <Crumb items={["Home", "Company"]} />
      <Hero
        eyebrow="COMPANY"
        title="The company behind the platform."
        lead="Amplivanta builds a connected system for growth work. These pages cover what the product is for, how to work with us, and how to reach the right route for your question."
        actions={
          <>
            <Link className={btnPrimary} href="/company/about">About Amplivanta</Link>
            <Link className={btn} href="/contact">Contact Us</Link>
          </>
        }
        aside={
          <HeroVisual
            title="Where to go next"
            items={[
              "About the product",
              "Open roles",
              "Partnerships",
              "Affiliate program",
              "Contact routes",
              "Security & trust",
            ]}
          />
        }
      />

      <Section title="Company pages">
        <CardGrid cols={3}>
          {DESTINATIONS.map(([title, body, href], i) => (
            <Card key={href} icon={i + 1} title={title} link={{ label: "Open", href }}>
              {body}
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Panel>
        <InfoCard title="Three separate programs">
          The Partner Program, the Affiliate Program and Marketplace selling are distinct. Being
          approved for one does not enroll a business or individual in another, and each has its own
          terms and eligibility.
        </InfoCard>
        <Note>
          Company announcements, press materials and leadership updates appear only once they are
          verified and published through the content system.
        </Note>
      </Panel>
    </>
  );
}
