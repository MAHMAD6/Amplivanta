import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { btn, btnPrimary } from "@/components/marketing/site-shell";
import { Card, CardGrid, Crumb, Hero, HeroVisual, Section } from "@/components/marketing/site-ui";
import { PLATFORM_BY_SLUG, PLATFORM_PAGES } from "@/lib/site-platform";

// Every valid slug is known at build time from the registry, so refuse
// anything else at routing. Without this, an unknown slug streamed a 200
// with the not-found page — a soft 404 that search engines index.
export const dynamicParams = false;

export function generateStaticParams() {
  return PLATFORM_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = PLATFORM_BY_SLUG.get(slug);
  if (!page) return {};
  return { title: page.name, description: page.lead };
}

export default async function PlatformDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PLATFORM_BY_SLUG.get(slug);
  if (!page) notFound();

  return (
    <>
      <Crumb items={["Home", "Platform", page.name]} />
      <Hero
        size="lg"
        eyebrow={page.eyebrow}
        title={page.h1}
        lead={page.lead}
        actions={
          <>
            <Link className={btnPrimary} href="/signup">
              {page.actionLabels[0]}
            </Link>
            <Link className={btn} href="/book-demo">
              {page.actionLabels[1]}
            </Link>
          </>
        }
        aside={<HeroVisual title={page.visualTitle} items={page.visualItems} />}
      />

      <Section title={page.sectionTitle} lead={page.sectionLead}>
        <CardGrid cols={3}>
          {page.cards.map(([title, body], i) => (
            <Card key={title} icon={i + 1} title={title}>
              {body}
            </Card>
          ))}
        </CardGrid>
      </Section>

      <section className="mt-8 flex flex-col items-start justify-between gap-5 rounded-[18px] border border-[#E5E7F5] bg-gradient-to-r from-[#F8FAFF] to-[#F4F0FF] p-[22px] lg:flex-row lg:items-center">
        <div>
          <h3 className="m-0 mb-1.5 text-[20px] font-extrabold text-site-ink">{page.band[0]}</h3>
          <p className="m-0 text-[14px] leading-[1.5] text-site-muted">{page.band[1]}</p>
        </div>
        <Link href="/signup" className={`${btnPrimary} shrink-0 px-4 py-[11px] text-[13px]`}>
          Get started
        </Link>
      </section>
    </>
  );
}
