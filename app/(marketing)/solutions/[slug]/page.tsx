import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { btn, btnPrimary } from "@/components/marketing/site-shell";
import { Card, CardGrid, Crumb, Hero, HeroVisual, Section } from "@/components/marketing/site-ui";
import { SOLUTION_BY_SLUG, SOLUTION_PAGES } from "@/lib/site-solutions";

export function generateStaticParams() {
  return SOLUTION_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = SOLUTION_BY_SLUG.get(slug);
  return page ? { title: page.name, description: page.lead } : {};
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = SOLUTION_BY_SLUG.get(slug);
  if (!page) notFound();

  return (
    <>
      <Crumb items={["Home", "Solutions", page.name]} />
      <Hero
        size="lg"
        eyebrow={page.eyebrow}
        title={page.h1}
        lead={page.lead}
        actions={
          <>
            <Link className={btnPrimary} href="/signup">{page.actionLabels[0] ?? "Start Engineering Growth"}</Link>
            <Link className={btn} href="/book-demo">{page.actionLabels[1] ?? "Book a Demo"}</Link>
          </>
        }
        aside={<HeroVisual title={page.visualTitle} items={page.visualItems} />}
      />

      <Section title={page.sectionTitle} lead={page.sectionLead}>
        <CardGrid cols={3}>
          {page.cards.map(([title, body], i) => (
            <Card key={title} icon={i + 1} title={title}>{body}</Card>
          ))}
        </CardGrid>
      </Section>

      {page.steps.length > 0 && (
        <Section title={page.stepsTitle}>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {page.steps.map(([label, body]) => (
              <div key={label} className="rounded-2xl border border-site-line bg-white p-5">
                <div className="mb-2 text-[13px] font-extrabold tracking-[0.6px] text-site-purple">{label}</div>
                <p className="m-0 text-[13.2px] leading-[1.5] text-site-muted">{body}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {page.band && (
        <section className="mt-8 flex flex-col items-start justify-between gap-5 rounded-[18px] border border-[#E5E7F5] bg-gradient-to-r from-[#F8FAFF] to-[#F4F0FF] p-[22px] lg:flex-row lg:items-center">
          <div>
            <h3 className="m-0 mb-1.5 text-[20px] font-extrabold text-site-ink">{page.band[0]}</h3>
            <p className="m-0 text-[14px] leading-[1.5] text-site-muted">{page.band[1]}</p>
          </div>
          <Link href="/platform" className={`${btnPrimary} shrink-0 px-4 py-[11px] text-[13px]`}>
            Explore the Platform
          </Link>
        </section>
      )}
    </>
  );
}
