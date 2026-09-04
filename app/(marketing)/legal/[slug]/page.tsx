import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/amplivanta/legal-document";
import { LEGAL_DOCS } from "@/lib/legal-docs";
import { MARKETPLACE_LEGAL_DOCS } from "@/lib/marketplace-legal-docs";
import { MarketingBreadcrumb } from "@/components/amplivanta/marketing-breadcrumb";

const SIMPLE_DOCS: Record<string, { title: string; body: string[] }> = {
  cookies: { title: "Cookie Policy", body: [
    "We use strictly necessary cookies for authentication and session management.",
    "Analytics cookies are opt-in and can be declined without affecting product function.",
    "You can manage cookie preferences from the footer link on any marketing page.",
  ]},
  compliance: { title: "Compliance", body: [
    "Amplivanta is built with security and privacy in mind. We apply industry-standard practices including encryption in transit and at rest, role-based access controls, tenant isolation, and consent-aware data handling.",
    "We are committed to handling personal data in line with applicable data-protection laws. Our Privacy Policy and Data Processing Agreement describe how we process and protect your information.",
    "Our current sub-processor list, DPA, and information about our security practices are available on request via the Trust Center. Formal certifications and regional data-residency options will be published here as they become available.",
  ]},
};

export function generateStaticParams() {
  // "dpa" has its own dedicated rich route at /legal/dpa — exclude it here.
  return [...Object.keys(LEGAL_DOCS), ...Object.keys(MARKETPLACE_LEGAL_DOCS), ...Object.keys(SIMPLE_DOCS)]
    .filter((slug) => slug !== "dpa")
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const rich = LEGAL_DOCS[slug] ?? MARKETPLACE_LEGAL_DOCS[slug];
  if (rich) return { title: `${rich.title} — Amplivanta` };
  const doc = SIMPLE_DOCS[slug];
  return doc ? { title: `${doc.title} — Amplivanta` } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rich = LEGAL_DOCS[slug] ?? MARKETPLACE_LEGAL_DOCS[slug];
  if (rich) return <LegalDocument doc={rich} />;

  const doc = SIMPLE_DOCS[slug];
  if (!doc) notFound();
  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-[900px] px-4 lg:px-8">
        <MarketingBreadcrumb items={[["Home", "/"], ["Legal", "/legal"], [doc.title, null]]} />
        <h1 className="mt-6 font-display text-4xl font-extrabold text-deep-navy">{doc.title}</h1>
        <p className="mt-2 text-sm text-ink-muted">Last updated: August 2026</p>
        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-ink-soft">
          {doc.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
    </section>
  );
}
