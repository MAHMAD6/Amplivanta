import type { Metadata } from "next";
import Link from "next/link";
import { SitePage } from "@/components/marketing/site-shell";
import { btn, btnPrimary } from "@/components/marketing/site-shell";
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
  Split,
} from "@/components/marketing/site-ui";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn how Amplivanta connects growth intelligence, marketing execution, CRM, creative work, social publishing, analytics and marketplace workflows in one platform.",
};

const AREAS = [
  ["Growth Intelligence", "Bring planning, recommendations, saved insights, and action plans closer to execution."],
  ["Marketing Execution", "Coordinate campaigns, automation, email, landing pages, creative work, and social publishing."],
  ["CRM & Measurement", "Connect contacts, companies, deals, pipeline activity, reporting, and analytics where supported."],
  ["Marketplace & Ecosystem", "Support downloadable marketing resources and seller workflows without turning the marketplace into a separate product silo."],
];

export default function AboutPage() {
  return (
    <SitePage active="company">
      <Crumb items={["Home", "Company", "About Us"]} />
      <Hero
        eyebrow="COMPANY / ABOUT US"
        title="Building a connected system for growth work."
        lead="Amplivanta brings planning, content creation, marketing automation, CRM, social publishing, analytics, and AI-assisted workflows into one connected platform. The goal is to reduce fragmentation between strategy, execution, and measurement."
        actions={
          <>
            <Link className={btnPrimary} href="/platform">Explore the Platform</Link>
            <Link className={btn} href="/contact">Contact Us</Link>
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
        title="What Amplivanta is designed to connect"
        lead="Core product areas are presented without customer counts, performance claims, or invented milestones."
      >
        <CardGrid cols={4}>
          {AREAS.map(([title, body], i) => (
            <Card key={title} icon={i + 1} title={title}>{body}</Card>
          ))}
        </CardGrid>
      </Section>

      <Panel>
        <Split>
          <InfoCard title="Product principles">
            <ul>
              <li>Connected workflows over isolated tools.</li>
              <li>Human review and control around AI-assisted work.</li>
              <li>Production data instead of fabricated examples or vanity metrics.</li>
              <li>Modular capabilities with consistent identity, permissions, and measurement.</li>
            </ul>
          </InfoCard>
          <EmptyState title="No company announcements published yet">
            Leadership updates, company milestones, press materials, or other time-sensitive company
            information should appear only when they are verified and published through the content
            system.
          </EmptyState>
        </Split>
      </Panel>
    </SitePage>
  );
}
