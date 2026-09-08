import type { Metadata } from "next";
import Link from "next/link";
import { btn, btnPrimary } from "@/components/marketing/site-shell";
import { Card, CardGrid, Crumb, Hero, HeroVisual, Section } from "@/components/marketing/site-ui";
import { INDUSTRY_OVERVIEW, INDUSTRY_PAGES } from "@/lib/site-industries";

export const metadata: Metadata = {
  title: "Industries",
  description: INDUSTRY_OVERVIEW.lead,
};

export default function IndustriesPage() {
  const o = INDUSTRY_OVERVIEW;
  return (
    <>
      <Crumb items={["Home", "Industries"]} />
      <Hero
        size="lg"
        eyebrow={o.eyebrow}
        title={o.h1}
        lead={o.lead}
        actions={o.actions.map(([label, href], i) => (
          <Link key={href} className={i === 0 ? btnPrimary : btn} href={href}>{label}</Link>
        ))}
        aside={<HeroVisual title={o.visualTitle} items={[...o.visualItems]} />}
      />

      <Section
        title="Browse by industry"
        lead="Each page shows the workflows and capabilities that apply to that kind of business."
      >
        <CardGrid cols={3}>
          {INDUSTRY_PAGES.map((p) => (
            <Card key={p.slug} title={p.name} link={{ label: "View industry", href: `/industries/${p.slug}` }}>
              {p.lead}
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Section title={o.useTitle} lead={o.useLead}>
        <CardGrid cols={3}>
          {o.useCards.map(([title, body], i) => (
            <Card key={title} icon={i + 1} title={title}>{body}</Card>
          ))}
        </CardGrid>
      </Section>

      <Section title={o.capTitle} lead={o.capLead}>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {o.capCards.map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-site-line bg-white p-5">
              <h3 className="m-0 mb-2 text-[15.5px] font-extrabold text-site-ink">{title}</h3>
              <p className="m-0 text-[13px] leading-[1.5] text-site-muted">{body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title={o.flowTitle} lead={o.flowLead}>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {o.steps.map(([label, body], i) => (
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
