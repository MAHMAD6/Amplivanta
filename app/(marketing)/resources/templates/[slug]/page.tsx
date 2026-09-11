import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { btn, btnPrimary } from "@/components/marketing/site-shell";
import { Crumb, Eyebrow, InfoCard, Note, Section } from "@/components/marketing/site-ui";
import { RESOURCE_TEMPLATES } from "@/lib/site-resource-items";

const BY_SLUG = new Map(RESOURCE_TEMPLATES.map((t) => [t.slug, t]));

export function generateStaticParams() {
  return RESOURCE_TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = BY_SLUG.get((await params).slug);
  return t ? { title: t.title, description: t.summary } : {};
}

/**
 * Amplivanta-owned resource template, on the reference's Template Detail page.
 * Marketplace products are deliberately not shown here: no seller, price,
 * reviews or purchase controls, which belong to the Marketplace.
 */
export default async function TemplateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = BY_SLUG.get((await params).slug);
  if (!t) notFound();

  return (
    <>
      <Crumb items={["Home", "Resources", "Templates", "Template"]} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <Eyebrow>RESOURCE TEMPLATE</Eyebrow>
          <h1 className="m-0 mb-4 text-[32px] font-extrabold leading-[1.08] tracking-[-1.2px] text-site-ink sm:text-[42px]">
            {t.title}
          </h1>
          <p className="m-0 text-[16px] leading-[1.6] text-site-muted">{t.summary}</p>

          <Section title="Template details">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {[
                ["Destination", t.moduleLabel ?? (t.downloadUrl ? "Download" : "Configured module")],
                ["Format", t.format ?? "Shown when available"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-site-line bg-white p-4">
                  <div className="text-[12px] font-bold uppercase tracking-[0.6px] text-site-muted">{k}</div>
                  <div className="mt-1 text-[14px] font-semibold text-site-ink">{v}</div>
                </div>
              ))}
            </div>
            {t.instructions && t.instructions.length > 0 && (
              <ol className="mt-5 list-decimal space-y-1.5 pl-5 text-[14.5px] text-site-ink">
                {t.instructions.map((i) => <li key={i}>{i}</li>)}
              </ol>
            )}
          </Section>
        </div>

        <aside className="h-fit space-y-4">
          <InfoCard title="Template actions">
            <div className="mt-1 flex flex-col gap-2">
              {t.moduleHref && (
                <Link className={`${btnPrimary} px-4 py-[11px] text-[13px]`} href={t.moduleHref}>
                  Open in {t.moduleLabel ?? "Amplivanta"}
                </Link>
              )}
              {t.downloadUrl && (
                <a className={`${btn} px-4 py-[11px] text-[13px]`} href={t.downloadUrl}>Download</a>
              )}
              <Link className={`${btn} px-4 py-[11px] text-[13px]`} href="/resources/templates">Browse Templates</Link>
            </div>
          </InfoCard>
          <Note>
            Resource templates and Marketplace products are separate. Looking for seller products?{" "}
            <Link href="/marketplace/products" className="font-semibold text-site-purple hover:underline">
              Browse the Marketplace
            </Link>
            .
          </Note>
        </aside>
      </div>
    </>
  );
}
