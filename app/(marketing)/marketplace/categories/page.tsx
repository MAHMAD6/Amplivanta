import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { Crumb, EmptyState, Hero, Section } from "@/components/marketing/site-ui";
import { btnPrimary } from "@/components/marketing/site-shell";
import { loadPublicCatalogue } from "@/lib/server/public-marketplace";

export const metadata: Metadata = {
  title: "Marketplace Categories",
  description: "Browse Amplivanta Marketplace products by category.",
};

export const dynamic = "force-dynamic";

export default async function MarketplaceCategoriesPage() {
  const { connected, categories, products } = await loadPublicCatalogue({ take: 200 });
  const counts = new Map<string, number>();
  for (const p of products) {
    if (p.categoryName) counts.set(p.categoryName, (counts.get(p.categoryName) ?? 0) + 1);
  }

  return (
    <>
      <Crumb items={["Home", "Marketplace", "Categories"]} />
      <Hero
        eyebrow="MARKETPLACE"
        title="Browse by category."
        lead="Categories are configured by Marketplace operators. Each one lists the products currently published against it."
      />

      <Section>
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/marketplace?category=${c.slug}`}
                className="rounded-2xl border border-site-line bg-white p-5 transition hover:border-site-purple/40"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#EEF1FF] to-[#F8ECFF]">
                  <Package aria-hidden className="h-4 w-4 text-site-purple" />
                </div>
                <h2 className="m-0 mb-1 text-[16px] font-extrabold text-site-ink">{c.name}</h2>
                <p className="m-0 text-[12.8px] text-site-muted">
                  {counts.get(c.name) ?? 0} published product{(counts.get(c.name) ?? 0) === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="◫"
            title={connected ? "No categories configured yet" : "Marketplace unavailable"}
            actions={<Link className={btnPrimary} href="/marketplace">Browse the catalogue</Link>}
          >
            {connected
              ? "Categories appear here once a Marketplace operator configures them."
              : "The catalogue could not be loaded right now. Please try again shortly."}
          </EmptyState>
        )}
      </Section>
    </>
  );
}
