import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CircleCheck, Image as ImageIcon, PlaySquare, Repeat, Search, ShoppingBag, ShoppingCart } from "lucide-react";
import { btn, btnPrimary } from "@/components/marketing/site-buttons";
import { CollectionIcon, IconTile, ProductGrid, StoreSearchBar } from "@/components/marketing/storefront";
import { STORE_COLLECTIONS } from "@/lib/marketplace/storefront";
import { loadPublicCatalogue } from "@/lib/server/public-marketplace";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Discover templates, images, videos, graphics, playbooks, and tools published by Amplivanta Marketplace sellers.",
};

// Catalogue contents change whenever an admin publishes a listing.
export const dynamic = "force-dynamic";

const INFO: [React.ComponentType<{ className?: string }>, string, string][] = [
  [CircleCheck, "Marketplace listings", "Products appear after applicable seller and listing review steps."],
  [ShoppingCart, "Checkout configuration", "Available payment methods and purchase details appear according to current configuration."],
  [Repeat, "Use your way", "License terms determine whether a product may be used inside or outside Amplivanta."],
];

export default async function MarketplaceHomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  // Old catalogue links filtered here; the catalogue now lives at /marketplace/products.
  const { category } = await searchParams;
  if (category) redirect(`/marketplace/products?category=${encodeURIComponent(category)}`);

  const { products } = await loadPublicCatalogue({ take: 8 });

  return (
    <>
      <p className="m-0 mb-3 text-[17px] font-extrabold text-site-purple">Marketplace</p>
      <StoreSearchBar />

      <section className="mt-8 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <h1 className="m-0 max-w-[560px] text-[34px] font-extrabold leading-[1.12] tracking-[-1px] text-site-ink sm:text-[46px]">
            Find Digital Assets to Support Your Growth
          </h1>
          <p className="m-0 mt-4 text-[15px] text-site-muted sm:text-[16.5px]">
            Discover templates, images, videos, graphics, playbooks, and tools published by marketplace sellers.
          </p>
          <div className="mt-10 flex flex-wrap gap-3.5">
            <Link href="/marketplace/products" className={`${btnPrimary} px-9 py-4`}>Browse All Products</Link>
            <Link href="/marketplace/sell" className={`${btn} px-9 py-4`}>Sell on Amplivanta</Link>
          </div>
        </div>

        {/* Decorative: a shopping bag among asset glyphs, as in the reference. */}
        <div aria-hidden className="relative hidden h-[300px] overflow-hidden rounded-[24px] bg-[#F6F4FE] sm:block">
          <IconTile className="absolute left-[12%] top-[34%] bg-white/60 text-site-purple">
            <ImageIcon className="h-5 w-5" />
          </IconTile>
          <IconTile className="absolute left-[36%] top-[12%] bg-white/60 text-site-purple">
            <Search className="h-5 w-5" />
          </IconTile>
          <IconTile className="absolute right-[10%] top-[22%] bg-white/60 text-site-purple">
            <PlaySquare className="h-5 w-5" />
          </IconTile>
          <div className="absolute left-1/2 top-[8%] h-[70px] w-[130px] -translate-x-1/2 rounded-t-full border-[10px] border-b-0 border-site-navy" />
          <div className="absolute left-1/2 top-[30%] flex h-[190px] w-[250px] -translate-x-1/2 items-center justify-center rounded-[26px] bg-gradient-to-br from-site-blue to-site-purple-2">
            <ShoppingBag className="h-12 w-12 text-white/30" />
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="m-0 text-[24px] font-extrabold text-site-ink">Browse by Category</h2>
          <Link href="/marketplace/categories" className="inline-flex items-center gap-1 text-[13px] font-bold text-site-purple hover:underline">
            View all categories <ArrowRight aria-hidden className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-6">
          {STORE_COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              href={`/marketplace/categories/${c.slug}`}
              className="flex flex-col items-center rounded-2xl border border-site-line bg-white px-4 py-6 text-center transition hover:border-site-purple/40"
            >
              <IconTile>
                <CollectionIcon icon={c.icon} className="h-5 w-5" />
              </IconTile>
              <h3 className="m-0 mt-3 text-[15px] font-extrabold text-site-ink">{c.name}</h3>
              <p className="m-0 mt-1 text-[12px] text-site-muted">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 rounded-2xl bg-[#F8F8FD] p-6 md:grid-cols-3">
        {INFO.map(([Icon, title, body]) => (
          <div key={title} className="flex gap-4">
            <IconTile className="h-10 w-10 bg-white">
              <Icon aria-hidden className="h-5 w-5" />
            </IconTile>
            <div>
              <h3 className="m-0 text-[14.5px] font-extrabold text-site-ink">{title}</h3>
              <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-site-muted">{body}</p>
            </div>
          </div>
        ))}
      </section>

      {products.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="m-0 text-[24px] font-extrabold text-site-ink">Latest listings</h2>
            <Link href="/marketplace/products?sort=newest" className="inline-flex items-center gap-1 text-[13px] font-bold text-site-purple hover:underline">
              Browse all products <ArrowRight aria-hidden className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ProductGrid products={products} cols={4} />
        </section>
      )}
    </>
  );
}
