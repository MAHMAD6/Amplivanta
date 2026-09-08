import type { Metadata } from "next";
import Link from "next/link";
import { btn, btnPrimary } from "@/components/marketing/site-shell";
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
  title: "Security / Trust Center",
  description:
    "How Amplivanta approaches security, privacy and data handling, and where to request current documentation.",
};

const PRACTICES = [
  ["Encryption", "Data is encrypted in transit and at rest using industry-standard mechanisms."],
  ["Access control", "Role-based access, scoped permissions and tenant isolation govern who can reach what."],
  ["Auditability", "Administrative actions are recorded to an append-only log with the actor and reason."],
  ["Data handling", "Personal data is processed in line with the Privacy Policy and the Data Processing Agreement."],
];

export default function TrustPage() {
  return (
    <>
      <Crumb items={["Home", "Trust Center"]} />
      <Hero
        eyebrow="TRUST CENTER"
        title="Security, privacy and data handling."
        lead="This page describes the practices Amplivanta applies today. Certifications, audit reports and regional data-residency options are published here only once they are in place — nothing on this page is a forward-looking claim."
        actions={
          <>
            <Link className={btnPrimary} href="/legal/privacy">Privacy Policy</Link>
            <Link className={btn} href="/legal/dpa">Data Processing Agreement</Link>
          </>
        }
        aside={
          <HeroVisual
            title="What this covers"
            items={[
              "Encryption in transit and at rest",
              "Role-based access control",
              "Tenant isolation",
              "Append-only audit logging",
              "Consent-aware data handling",
              "Sub-processor disclosure",
            ]}
          />
        }
      />

      <Section
        title="Current practices"
        lead="Described as implemented, without certification claims that are not yet held."
      >
        <CardGrid cols={4}>
          {PRACTICES.map(([title, body], i) => (
            <Card key={title} icon={i + 1} title={title}>{body}</Card>
          ))}
        </CardGrid>
      </Section>

      <Panel>
        <EmptyState
          icon="◆"
          title="No certifications are published yet"
          actions={<Link className={btnPrimary} href="/contact">Request documentation</Link>}
        >
          Formal certifications, penetration-test summaries and regional data-residency options will
          appear here when they are held and verifiable. Current sub-processor lists and security
          documentation are available on request.
        </EmptyState>
      </Panel>

      <Panel white>
        <InfoCard title="Reporting a vulnerability">
          If you believe you have found a security issue, contact us through the contact form and
          describe the problem and how to reproduce it. Please do not include real customer data in
          the report.
        </InfoCard>
        <Note>
          Response-time commitments and bug-bounty terms are not published until a programme is
          actually operating.
        </Note>
      </Panel>
    </>
  );
}
