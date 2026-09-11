import type { Metadata } from "next";
import Link from "next/link";
import { CollectionIcon, IconTile, StoreHead, StoreSearchBar } from "@/components/marketing/storefront";
import { STORE_COLLECTIONS } from "@/lib/marketplace/storefront";
import { loadPublicCatalogue } from "@/lib/server/public-marketplace";

export const metadata: Metadata = {
  title: "Marketplace Categories",
  description: "Browse Amplivanta Marketplace products by category.",
};

export const dynamic = "force-dynamic";

export default async function MarketplaceCategoriesPage() {
  // Operator-configured categories, when any exist, are offered as extra filters.
  const { categories } = await loadPublicCatalogue({ take: 1 });

  return (
    <>
      <StoreHead
        crumbs={["Marketplace", "Categories"]}
        title="Categories"
        lead="Browse Marketplace products by type."
      />
      <StoreSearchBar />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STORE_COLLECTIONS.map((c) => (
          <Link
            key={c.slug}
            href={`/marketplace/categories/${c.slug}`}
            className="flex gap-4 rounded-2xl border border-site-line bg-white p-5 transition hover:border-site-purple/40"
          >
            <IconTile>
              <CollectionIcon icon={c.icon} className="h-5 w-5" />
            </IconTile>
            <div>
              <h2 className="m-0 text-[16px] font-extrabold text-site-ink">{c.name}</h2>
              <p className="m-0 mt-1 text-[12.8px] text-site-muted">{c.blurb}</p>
            </div>
          </Link>
        ))}
      </div>

      {categories.length > 0 && (
        <section className="mt-10">
          <h2 className="m-0 mb-3 text-[18px] font-extrabold text-site-ink">More categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/marketplace/products?category=${c.slug}`}
                className="rounded-full border border-site-line px-3.5 py-1.5 text-[12.5px] font-bold text-site-ink hover:border-site-purple/40"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
