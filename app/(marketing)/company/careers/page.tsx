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
  Note,
  Section,
} from "@/components/marketing/site-ui";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Amplivanta career opportunities are published here when roles are actively open, with real location, employment type and application route.",
};

// Openings change whenever someone publishes one in the careers console.
export const dynamic = "force-dynamic";

const PRINCIPLES = [
  ["Product-minded", "Start with a user problem, define the workflow, and connect the work to a clear outcome."],
  ["Cross-functional", "Marketing, product, data, design, engineering, and operations often intersect in one workflow."],
  ["Evidence-driven", "Prefer production data, testable assumptions, and measurable behavior over unsupported claims."],
  ["Responsible AI", "Use AI as assistance within defined workflows while preserving human review and control."],
];

export default async function CareersPage() {
  // Only genuinely published roles are shown. The reference is explicit that
  // sample jobs and placeholder compensation must never appear here.
  let openings: { id: string; title: string; department: string | null; location: string | null; employment: string | null; slug: string }[] = [];
  let reachable = true;
  try {
    openings = await prisma.jobOpening.findMany({
      // OPEN is the published state in the careers console; DRAFT and CLOSED never show.
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, department: true, location: true, employment: true, slug: true },
    });
  } catch {
    reachable = false;
  }

  return (
    <SitePage active="company">
      <Crumb items={["Home", "Company", "Careers"]} />
      <Hero
        eyebrow="COMPANY / CAREERS"
        title="Help build the systems behind smarter growth work."
        lead="Amplivanta career opportunities are published here when roles are actively open. Each listing should use its real location, employment type, requirements, compensation details when applicable, and application route."
        actions={
          <>
            <Link className={btnPrimary} href="/company/about">About Amplivanta</Link>
            <Link className={btn} href="/contact">Contact Us</Link>
          </>
        }
        aside={
          <HeroVisual
            title="How career content is handled"
            items={[
              "Published roles only",
              "Real job metadata",
              "Clear application route",
              "No invented benefits",
              "No fake team profiles",
              "CMS-driven updates",
            ]}
          />
        }
      />

      <Section
        title="Open positions"
        lead="Jobs appear here only when they are published in the careers management system."
      >
        {openings.length > 0 ? (
          <div className="grid gap-2.5">
            {openings.map((job) => (
              <Link
                key={job.id}
                href={`/careers/${job.slug}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-[#E3E8F2] bg-white p-[17px] transition hover:border-site-purple/40"
              >
                <span>
                  <strong className="mb-1 block text-[16px] font-extrabold text-site-ink">{job.title}</strong>
                  <span className="block text-[12.8px] text-site-muted">
                    {[job.department, job.location, job.employment].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="font-extrabold text-site-purple">View role</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title={reachable ? "No positions are published right now" : "Openings are unavailable"}
            actions={
              <>
                <Link className={btnPrimary} href="/resources">Explore Amplivanta Resources</Link>
                <Link className={btn} href="/company/about">Learn About Amplivanta</Link>
              </>
            }
          >
            {reachable
              ? "When an opening becomes available, this page will show the actual role title, location, employment type, and application details. We do not display sample jobs or placeholder compensation."
              : "The careers source could not be reached, so open positions cannot be listed right now."}
          </EmptyState>
        )}
      </Section>

      <Section
        title="Working principles"
        lead="These describe how the product work is approached, not employment guarantees or benefit promises."
      >
        <CardGrid cols={4}>
          {PRINCIPLES.map(([title, body], i) => (
            <Card key={title} icon={i + 1} title={title}>{body}</Card>
          ))}
        </CardGrid>
        <Note>
          Benefits, compensation bands and team profiles are published only when they are confirmed
          for a specific role.
        </Note>
      </Section>
    </SitePage>
  );
}
