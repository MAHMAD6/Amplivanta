import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { btn, btnPrimary } from "@/components/marketing/site-shell";
import { Crumb, Eyebrow, InfoCard, Section } from "@/components/marketing/site-ui";
import { HELP_ARTICLES } from "@/lib/site-resource-items";

const BY_SLUG = new Map(HELP_ARTICLES.map((a) => [a.slug, a]));

// Every valid slug is known at build time from the registry, so refuse
// anything else at routing. Without this, an unknown slug streamed a 200
// with the not-found page — a soft 404 that search engines index.
export const dynamicParams = false;

export function generateStaticParams() {
  return HELP_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = BY_SLUG.get((await params).slug);
  return a ? { title: a.title, description: a.summary } : {};
}

/** Help Center article, on the reference's Help Article template. */
export default async function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = BY_SLUG.get((await params).slug);
  if (!a) notFound();

  return (
    <>
      <Crumb items={["Home", "Resources", "Help Center", "Article"]} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <Eyebrow>HELP CENTER</Eyebrow>
          <h1 className="m-0 mb-4 text-[32px] font-extrabold leading-[1.08] tracking-[-1.2px] text-site-ink sm:text-[40px]">
            {a.title}
          </h1>
          <p className="m-0 text-[16px] leading-[1.6] text-site-muted">{a.summary}</p>
          {a.updatedLabel && (
            <p className="mt-3 text-[12.5px] font-semibold text-site-muted">Updated {a.updatedLabel}</p>
          )}

          {a.prerequisites && a.prerequisites.length > 0 && (
            <Section title="Before you begin">
              <ul className="list-disc space-y-1.5 pl-5 text-[14.5px] text-site-ink">
                {a.prerequisites.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </Section>
          )}

          <Section title="Steps">
            <ol className="space-y-3">
              {a.steps.map((s, i) => (
                <li key={s} className="flex gap-3 rounded-2xl border border-site-line bg-white p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-[#F0ECFF] text-[12.5px] font-black text-site-purple">
                    {i + 1}
                  </span>
                  <span className="text-[14.5px] leading-[1.55] text-site-ink">{s}</span>
                </li>
              ))}
            </ol>
          </Section>

          {a.troubleshooting && a.troubleshooting.length > 0 && (
            <Section title="If something does not work">
              <ul className="list-disc space-y-1.5 pl-5 text-[14.5px] text-site-ink">
                {a.troubleshooting.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </Section>
          )}
        </article>

        <aside className="h-fit space-y-4">
          <InfoCard title="Still need help?">
            <p className="m-0 mb-3">Contact options reflect the support channels available to your plan.</p>
            <div className="flex flex-col gap-2">
              <Link className={`${btnPrimary} px-4 py-[11px] text-[13px]`} href="/contact">Contact Us</Link>
              <Link className={`${btn} px-4 py-[11px] text-[13px]`} href="/resources/help-center">Back to Help Center</Link>
            </div>
          </InfoCard>
        </aside>
      </div>
    </>
  );
}
