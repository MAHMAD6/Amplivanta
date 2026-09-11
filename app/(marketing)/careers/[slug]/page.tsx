import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { btn, btnPrimary } from "@/components/marketing/site-buttons";
import { Crumb, Eyebrow, InfoCard, Note, Section } from "@/components/marketing/site-ui";
import { prisma } from "@/lib/prisma";

// Openings are published from the careers console at any time.
export const dynamic = "force-dynamic";

/** Only an OPEN role is public; drafts and closed roles are never addressable. */
function loadOpening(slug: string) {
  return prisma.jobOpening.findFirst({
    where: { slug, status: "OPEN" },
    select: {
      title: true, department: true, location: true, employment: true,
      description: true, publishedAt: true,
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const job = await loadOpening((await params).slug);
    return job ? { title: `${job.title} · Careers` } : { title: "Careers" };
  } catch {
    return { title: "Careers" };
  }
}

/**
 * A published role. Replaces a page that read a static list of sample jobs,
 * which meant a real opening's link from /company/careers had nothing behind it.
 */
export default async function CareerOpeningPage({ params }: { params: Promise<{ slug: string }> }) {
  const job = await loadOpening((await params).slug).catch(() => undefined);
  if (job === undefined) {
    return (
      <p className="py-16 text-center text-[14px] text-site-muted">
        This role could not be loaded right now. Please try again shortly.
      </p>
    );
  }
  if (!job) notFound();

  const meta = [job.department, job.location, job.employment].filter(Boolean);

  return (
    <>
      <Crumb items={["Home", "Company", "Careers", job.title]} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <Eyebrow>CAREERS · OPEN ROLE</Eyebrow>
          <h1 className="m-0 mb-4 text-[32px] font-extrabold leading-[1.08] tracking-[-1.2px] text-site-ink sm:text-[42px]">
            {job.title}
          </h1>
          {meta.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {meta.map((m) => (
                <span key={m} className="rounded-full border border-site-line bg-white px-3 py-1 text-[12.5px] font-semibold text-site-muted">
                  {m}
                </span>
              ))}
            </div>
          )}

          <Section title="About the role">
            {job.description ? (
              <p className="m-0 whitespace-pre-line text-[15px] leading-[1.7] text-[#2E3B55]">{job.description}</p>
            ) : (
              <p className="m-0 text-[14px] text-site-muted">The full description has not been published yet.</p>
            )}
          </Section>
        </article>

        <aside className="h-fit space-y-4">
          <InfoCard title="How to apply">
            <p className="m-0 mb-3">
              Get in touch through the contact page and mention this role. Include the details the
              description asks for.
            </p>
            <div className="flex flex-col gap-2">
              <Link className={`${btnPrimary} px-4 py-[11px] text-[13px]`} href="/contact">Contact us about this role</Link>
              <Link className={`${btn} px-4 py-[11px] text-[13px]`} href="/company/careers">All open positions</Link>
            </div>
          </InfoCard>
          <Note>Compensation and benefits are listed only where they are confirmed for this role.</Note>
        </aside>
      </div>
    </>
  );
}
