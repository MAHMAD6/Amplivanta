import type { Metadata } from "next";
import Link from "next/link";
import { Package, Store } from "lucide-react";
import { MarketingBreadcrumb } from "@/components/amplivanta/marketing-breadcrumb";
import { loadPublicCatalogue } from "@/lib/server/public-marketplace";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Templates, graphics, documents and toolkits from Amplivanta sellers. Browse the catalogue and buy what you need.",
};

// Catalogue contents change whenever an admin publishes a listing.
export const dynamic = "force-dynamic";

export default async function PublicMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const { connected, products, categories } = await loadPublicCatalogue({ categorySlug: category });

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <MarketingBreadcrumb items={[["Home", "/"], ["Marketplace", null]]} />

        <div className="mt-6 max-w-2xl">
          <h1 className="font-display text-4xl font-extrabold text-deep-navy sm:text-5xl">
            The Amplivanta Marketplace.
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
            Templates, graphics, documents and toolkits built by Amplivanta sellers. Every listing is
            reviewed before it goes live, and every purchase records the exact version you bought.
          </p>
        </div>

        {categories.length > 0 && (
          <nav aria-label="Categories" className="mt-8 flex flex-wrap gap-2">
            <Link
              href="/marketplace"
              className={
                category
                  ? "rounded-xl border border-line px-3.5 py-2 text-[13px] font-semibold text-ink-soft hover:border-royal-blue/40"
                  : "rounded-xl bg-royal-blue px-3.5 py-2 text-[13px] font-bold text-white"
              }
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/marketplace?category=${c.slug}`}
                className={
                  category === c.slug
                    ? "rounded-xl bg-royal-blue px-3.5 py-2 text-[13px] font-bold text-white"
                    : "rounded-xl border border-line px-3.5 py-2 text-[13px] font-semibold text-ink-soft hover:border-royal-blue/40"
                }
              >
                {c.name}
              </Link>
            ))}
          </nav>
        )}

        {products.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/marketplace/products/${p.slug}`}
                className="group flex flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-royal-blue/30 hover:shadow-card-lg"
              >
                {p.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.coverImage}
                    alt={p.coverImageAlt ?? ""}
                    className="aspect-[16/10] w-full rounded-xl border border-line object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl bg-bg-soft">
                    <Package aria-hidden className="h-6 w-6 text-ink-muted" />
                  </div>
                )}
                <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-royal-blue">
                  {p.categoryName ?? "Marketplace"}
                </div>
                <h2 className="mt-1.5 text-[15.5px] font-bold leading-snug text-deep-navy">{p.title}</h2>
                {p.summary && (
                  <p className="mt-1.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-ink-soft">
                    {p.summary}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted">
                    <Store aria-hidden className="h-3.5 w-3.5" />
                    {p.sellerName}
                  </span>
                  <span className="text-[14px] font-extrabold text-deep-navy">{p.priceLabel}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-line bg-bg-soft px-6 py-14 text-center">
            <Package aria-hidden className="mx-auto h-7 w-7 text-ink-muted" />
            <h2 className="mt-3 text-[16px] font-bold text-deep-navy">
              {connected ? "No published listings yet" : "Marketplace unavailable"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-soft">
              {connected
                ? "Products appear here once a seller submits a listing and it passes review."
                : "The catalogue could not be loaded right now. Please try again shortly."}
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-royal-blue px-5 text-[13.5px] font-bold text-white transition hover:bg-royal-soft"
            >
              Create an account to sell
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
