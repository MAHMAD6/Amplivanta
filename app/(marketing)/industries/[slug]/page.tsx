import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { btn, btnPrimary } from "@/components/marketing/site-shell";
import { Card, CardGrid, Crumb, Hero, HeroVisual, Section } from "@/components/marketing/site-ui";
import { INDUSTRY_BY_SLUG, INDUSTRY_PAGES } from "@/lib/site-industries";

// Every valid slug is known at build time from the registry, so refuse
// anything else at routing. Without this, an unknown slug streamed a 200
// with the not-found page — a soft 404 that search engines index.
export const dynamicParams = false;

export function generateStaticParams() {
  return INDUSTRY_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = INDUSTRY_BY_SLUG.get(slug);
  return page ? { title: page.name, description: page.lead } : {};
}

export default async function IndustryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = INDUSTRY_BY_SLUG.get(slug);
  if (!page) notFound();

  return (
    <>
      <Crumb items={["Home", "Industries", page.name]} />
      <Hero
        size="lg"
        eyebrow={page.eyebrow}
        title={page.h1}
        lead={page.lead}
        actions={page.actions.map(([label, href], i) => (
          <Link key={href} className={i === 0 ? btnPrimary : btn} href={href}>{label}</Link>
        ))}
        aside={<HeroVisual title={page.visualTitle} items={page.visualItems} />}
      />

      <Section title={page.useTitle} lead={page.useLead}>
        <CardGrid cols={3}>
          {page.useCards.map(([title, body], i) => (
            <Card key={title} icon={i + 1} title={title}>{body}</Card>
          ))}
        </CardGrid>
      </Section>

      <Section title={page.capTitle} lead={page.capLead}>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {page.capCards.map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-site-line bg-white p-5">
              <h3 className="m-0 mb-2 text-[15.5px] font-extrabold text-site-ink">{title}</h3>
              <p className="m-0 text-[13px] leading-[1.5] text-site-muted">{body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title={page.flowTitle} lead={page.flowLead}>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {page.steps.map(([label, body], i) => (
            <article key={label} className="rounded-2xl border border-site-line bg-white p-5">
              <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#EEF1FF] to-[#F8ECFF] text-[13px] font-black text-site-purple">
                {i + 1}
              </div>
              <h3 className="m-0 mb-1.5 text-[14.5px] font-extrabold text-site-ink">{label}</h3>
              <p className="m-0 text-[12.8px] leading-[1.5] text-site-muted">{body}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
