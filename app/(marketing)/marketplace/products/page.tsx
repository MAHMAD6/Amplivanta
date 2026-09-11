import type { Metadata } from "next";
import { AutoSubmitSelect } from "@/components/marketing/auto-submit-select";
import {
  CatalogueEmpty,
  ProductGrid,
  StoreFootnote,
  StoreHead,
  StoreSearchBar,
} from "@/components/marketing/storefront";
import { CONTENT_CREATION, CONTENT_CREATION_LABEL } from "@/lib/marketplace/content-creation";
import {
  LICENSE_FILTERS,
  SORTS,
  STORE_COLLECTIONS,
  isStoreType,
  paramList,
  paramOne,
} from "@/lib/marketplace/storefront";
import { loadPublicCatalogue } from "@/lib/server/public-marketplace";

export const metadata: Metadata = {
  title: "Browse Products",
  description: "Search and filter Amplivanta Marketplace listings.",
};

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

function FilterGroup({
  title,
  name,
  options,
  selected,
}: {
  title: string;
  name: string;
  options: readonly (readonly [string, string])[];
  selected: string[];
}) {
  return (
    <fieldset className="m-0 mb-6 border-0 p-0">
      <legend className="mb-3 p-0 text-[13px] font-extrabold text-site-ink">{title}</legend>
      <div className="space-y-2.5">
        {options.map(([value, label]) => (
          <label key={value} className="flex cursor-pointer items-center gap-2.5 text-[12.5px] text-site-muted">
            <input
              type="checkbox"
              name={name}
              value={value}
              defaultChecked={selected.includes(value)}
              className="h-4 w-4 rounded border-[#C9D0DE] accent-site-purple"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default async function BrowseProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = paramOne(sp.q);
  const types = paramList(sp.type).filter(isStoreType);
  const licenses = paramList(sp.license);
  const creation = paramList(sp.creation);
  const category = paramOne(sp.category);
  const sort = paramOne(sp.sort) || "relevance";

  const { connected, products } = await loadPublicCatalogue({
    q, types, licenses, creation, sort, categorySlug: category || undefined, take: 120,
  });
  const filtering = Boolean(q || types.length || licenses.length || creation.length || category);

  return (
    <>
      <StoreHead
        crumbs={["Marketplace", "Browse Products"]}
        title="Browse Products"
        lead="Search and filter Marketplace listings."
      />
      <StoreSearchBar
        placeholder="Search products, keywords, categories, or sellers..."
        q={q}
        type={types.length === 1 ? types[0] : ""}
      />

      <form
        id="filters"
        method="get"
        className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)]"
      >
        {q && <input type="hidden" name="q" value={q} />}
        {category && <input type="hidden" name="category" value={category} />}

        <aside className="h-fit rounded-2xl border border-site-line bg-white p-6">
          <h2 className="m-0 mb-5 text-[16px] font-extrabold text-site-ink">Filters</h2>
          <FilterGroup
            title="Product Type"
            name="type"
            options={STORE_COLLECTIONS.map((c) => [c.type, c.name] as const)}
            selected={types}
          />
          <FilterGroup title="License" name="license" options={LICENSE_FILTERS} selected={licenses} />
          <FilterGroup
            title="Creation"
            name="creation"
            options={CONTENT_CREATION.map((c) => [c, CONTENT_CREATION_LABEL[c]] as const)}
            selected={creation}
          />
          <button
            type="submit"
            className="h-10 w-full rounded-xl bg-site-purple text-[13px] font-bold text-white transition hover:bg-site-purple-2"
          >
            Apply filters
          </button>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="m-0 text-[20px] font-extrabold text-site-ink">Available products</h2>
            <label>
              <span className="sr-only">Sort</span>
              <AutoSubmitSelect
                name="sort"
                defaultValue={sort}
                className="h-10 min-w-[220px] rounded-xl border border-site-line bg-white px-4 text-[12.5px] font-bold text-site-ink focus:border-site-purple focus:outline-none"
              >
                {SORTS.map(([v, l]) => (
                  <option key={v} value={v}>Sort: {l}</option>
                ))}
              </AutoSubmitSelect>
            </label>
          </div>
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <CatalogueEmpty connected={connected} filtering={filtering} clearHref="/marketplace/products" />
          )}
          <StoreFootnote>Products display from the published Marketplace catalog.</StoreFootnote>
        </section>
      </form>
    </>
  );
}
