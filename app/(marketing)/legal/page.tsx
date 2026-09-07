import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { MarketingBreadcrumb } from "@/components/amplivanta/marketing-breadcrumb";
import { LEGAL_DOCS } from "@/lib/legal-docs";
import { MARKETPLACE_LEGAL_DOCS } from "@/lib/marketplace-legal-docs";

export const metadata: Metadata = {
  title: "Legal",
  description: "Amplivanta's platform, marketplace and partner-program legal documents.",
};

/**
 * Index for /legal.
 *
 * Every legal document breadcrumb points here, so this page is built from the
 * same document registries the individual pages render from — a document can
 * never be published without appearing in this list.
 */

/** Program agreements live in LEGAL_DOCS too; they are grouped separately here. */
const PROGRAM_SLUGS = new Set(["partner-terms", "affiliate-terms"]);

const asDocs = (source: typeof LEGAL_DOCS) =>
  Object.entries(source).map(([slug, doc]) => ({ slug, title: doc.breadcrumbLabel ?? doc.title }));

const PLATFORM = [
  ...asDocs(LEGAL_DOCS).filter((d) => !PROGRAM_SLUGS.has(d.slug)),
  // Rendered by the [slug] route's SIMPLE_DOCS map rather than a registry.
  { slug: "cookies", title: "Cookie Policy" },
  { slug: "compliance", title: "Compliance" },
];

const MARKETPLACE = asDocs(MARKETPLACE_LEGAL_DOCS);

const PROGRAMS = asDocs(LEGAL_DOCS).filter((d) => PROGRAM_SLUGS.has(d.slug));

function DocGroup({ title, docs }: { title: string; docs: { slug: string; title: string }[] }) {
  if (docs.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-extrabold text-deep-navy">{title}</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {docs.map((d) => (
          <Link
            key={d.slug}
            href={`/legal/${d.slug}`}
            className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-white px-5 py-4 shadow-card transition hover:-translate-y-0.5 hover:border-royal-blue/30 hover:shadow-card-lg"
          >
            <span className="flex items-center gap-3">
              <FileText aria-hidden className="h-4 w-4 shrink-0 text-royal-blue" />
              <span className="text-[14.5px] font-bold text-deep-navy">{d.title}</span>
            </span>
            <ArrowRight
              aria-hidden
              className="h-4 w-4 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-royal-blue"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function LegalIndexPage() {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-[900px] px-4 lg:px-8">
        <MarketingBreadcrumb items={[["Home", "/"], ["Legal", null]]} />
        <h1 className="mt-6 font-display text-4xl font-extrabold text-deep-navy">Legal</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          The agreements and policies that govern use of the Amplivanta platform, the Marketplace,
          and our partner and affiliate programs.
        </p>

        <DocGroup title="Platform" docs={PLATFORM} />
        <DocGroup title="Marketplace" docs={MARKETPLACE} />
        <DocGroup title="Programs" docs={PROGRAMS} />

        <p className="mt-12 border-t border-line pt-6 text-[13.5px] leading-relaxed text-ink-muted">
          Questions about any of these documents can go to our team via the{" "}
          <Link href="/contact" className="font-semibold text-royal-blue hover:underline">
            contact page
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
