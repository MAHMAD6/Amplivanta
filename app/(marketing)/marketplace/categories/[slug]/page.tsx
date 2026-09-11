import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AutoSubmitSelect } from "@/components/marketing/auto-submit-select";
import {
  CatalogueEmpty,
  CollectionIcon,
  IconTile,
  ProductGrid,
  StoreFootnote,
  StoreHead,
  StoreSearchBar,
} from "@/components/marketing/storefront";
import { CONTENT_CREATION, CONTENT_CREATION_LABEL } from "@/lib/marketplace/content-creation";
import { COLLECTION_BY_SLUG, LICENSE_FILTERS, SORTS, paramOne } from "@/lib/marketplace/storefront";
import { loadPublicCatalogue } from "@/lib/server/public-marketplace";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = COLLECTION_BY_SLUG.get(slug);
  return c ? { title: `${c.name} · Marketplace`, description: c.lead } : {};
}

const chip =
  "h-9 rounded-full border border-site-line bg-white px-3 text-[12px] font-bold text-site-ink focus:border-site-purple focus:outline-none";

export default async function CategoryCollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const collection = COLLECTION_BY_SLUG.get(slug);
  if (!collection) notFound();

  const sp = await searchParams;
  const q = paramOne(sp.q);
  const license = paramOne(sp.license);
  const creation = paramOne(sp.creation);
  const seller = paramOne(sp.seller);
  const sort = paramOne(sp.sort) || "newest";

  const [all, filtered] = await Promise.all([
    loadPublicCatalogue({ types: [collection.type], take: 200 }),
    loadPublicCatalogue({
      types: [collection.type],
      q,
      licenses: license ? [license] : [],
      creation: creation ? [creation] : [],
      sellerSlug: seller || undefined,
      sort,
      take: 120,
    }),
  ]);
  // The seller filter lists only sellers who actually have products here.
  const sellers = [...new Map(all.products.map((p) => [p.sellerSlug, p.sellerName])).entries()];
  const filtering = Boolean(q || license || creation || seller);

  return (
    <>
      <StoreHead
        crumbs={["Marketplace", "Categories", collection.name]}
        title={collection.name}
        lead={collection.lead}
        aside={
          <IconTile className="hidden h-20 w-20 rounded-2xl sm:inline-flex">
            <CollectionIcon icon={collection.icon} className="h-7 w-7" />
          </IconTile>
        }
      />
      <StoreSearchBar
        action={`/marketplace/categories/${collection.slug}`}
        placeholder={`Search within ${collection.name}...`}
        q={q}
        showType={false}
      />

      <form method="get" className="mt-5 flex flex-wrap items-center gap-2.5" aria-label="Filters">
        {q && <input type="hidden" name="q" value={q} />}
        <AutoSubmitSelect name="license" defaultValue={license} className={chip} aria-label="License type">
          <option value="">All License Types</option>
          {LICENSE_FILTERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </AutoSubmitSelect>
        <AutoSubmitSelect name="seller" defaultValue={seller} className={chip} aria-label="Seller">
          <option value="">All Sellers</option>
          {sellers.map(([s, n]) => <option key={s} value={s}>{n}</option>)}
        </AutoSubmitSelect>
        <AutoSubmitSelect name="creation" defaultValue={creation} className={chip} aria-label="Creation type">
          <option value="">Creation Type</option>
          {CONTENT_CREATION.map((c) => <option key={c} value={c}>{CONTENT_CREATION_LABEL[c]}</option>)}
        </AutoSubmitSelect>
        <AutoSubmitSelect name="sort" defaultValue={sort} className={chip} aria-label="Sort">
          {SORTS.filter(([v]) => v !== "relevance").map(([v, l]) => <option key={v} value={v}>Sort: {l}</option>)}
        </AutoSubmitSelect>
        <button type="submit" className="text-[12.5px] font-bold text-site-purple hover:underline">
          Apply
        </button>
      </form>

      <section className="mt-8">
        <h2 className="m-0 mb-4 text-[20px] font-extrabold text-site-ink">{collection.singular} listings</h2>
        {filtered.products.length > 0 ? (
          <ProductGrid products={filtered.products} cols={4} />
        ) : (
          <CatalogueEmpty
            connected={filtered.connected}
            filtering={filtering}
            clearHref={`/marketplace/categories/${collection.slug}`}
          />
        )}
        <StoreFootnote>Listings and filters reflect the live catalog; no product counts are hard-coded.</StoreFootnote>
      </section>
    </>
  );
}
