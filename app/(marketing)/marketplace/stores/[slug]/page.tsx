import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Store } from "lucide-react";
import { btn } from "@/components/marketing/site-buttons";
import { AutoSubmitSelect } from "@/components/marketing/auto-submit-select";
import { CatalogueEmpty, IconTile, ProductGrid } from "@/components/marketing/storefront";
import { SharePopover } from "@/components/marketplace/share-popover";
import { SORTS, paramOne } from "@/lib/marketplace/storefront";
import { loadPublicCatalogue, loadPublicStore } from "@/lib/server/public-marketplace";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

async function safeStore(slug: string) {
  try {
    return await loadPublicStore(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await safeStore(slug);
  return s ? { title: `${s.storeName} · Marketplace`, description: s.headline ?? undefined } : {};
}

export default async function SellerStorePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const store = await safeStore(slug);
  if (!store) notFound();

  const sp = await searchParams;
  const q = paramOne(sp.q);
  const sort = paramOne(sp.sort) || "newest";
  const { connected, products } = await loadPublicCatalogue({ sellerSlug: slug, q, sort, take: 120 });
  const inAppStore = `/app/marketplace/stores/${slug}`;

  const facts: [string, React.ReactNode][] = [
    ["Location", "Not specified"],
    [
      "Member since",
      store.approvedAt
        ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(store.approvedAt)
        : "Not displayed until available",
    ],
    ["Products", "Live catalog"],
    [
      "Contact",
      <Link key="c" href="/contact" className="text-site-purple hover:underline">
        Use Marketplace support/contact flow
      </Link>,
    ],
  ];

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 text-[12.5px] text-site-muted">
        Marketplace / Seller Store
      </nav>

      <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <IconTile className="h-[72px] w-[72px] rounded-2xl">
          <Store aria-hidden className="h-7 w-7" />
        </IconTile>
        <div>
          <h1 className="m-0 text-[30px] font-extrabold tracking-[-0.6px] text-site-ink sm:text-[36px]">
            {store.storeName}
          </h1>
          <p className="m-0 mt-1 text-[15px] text-site-muted">
            {store.headline || "Seller description appears here when provided."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/login?next=${encodeURIComponent(inAppStore)}`} className={`${btn} px-10 py-2.5 text-[13px]`}>
              Follow
            </Link>
            <SharePopover url={`${SITE_URL}/marketplace/stores/${slug}`} title={store.storeName} />
          </div>
        </div>
      </header>

      <nav aria-label="Store sections" className="mt-8 flex gap-8 border-b border-site-line text-[14px] font-semibold">
        <a href="#products" className="-mb-px border-b-2 border-site-purple pb-3 text-site-purple">Products</a>
        <a href="#about" className="pb-3 text-site-muted hover:text-site-ink">About</a>
        <a href="#policy" className="pb-3 text-site-muted hover:text-site-ink">Store Policy</a>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside id="about" className="h-fit scroll-mt-6 rounded-2xl border border-site-line bg-white p-6">
          <h2 className="m-0 text-[16px] font-extrabold text-site-ink">About Store</h2>
          <p className="m-0 mt-3 whitespace-pre-line text-[12.5px] leading-relaxed text-site-muted">
            {store.bio || "Seller profile information appears here when the seller has provided it."}
          </p>
          <dl className="m-0 mt-8 space-y-6">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[100px_1fr] gap-3 text-[12px]">
                <dt className="text-site-muted">{k}</dt>
                <dd className="m-0 text-site-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <div id="policy" className="mt-8 scroll-mt-6 rounded-xl bg-[#F8F8FD] p-5">
            <h3 className="m-0 text-[13.5px] font-extrabold text-site-ink">Store Policy</h3>
            <p className="m-0 mt-2 text-[12px] leading-relaxed text-site-muted">
              Any seller-specific policy is shown only when it has been configured and does not override{" "}
              <Link href="/legal/marketplace-terms" className="text-site-purple hover:underline">Marketplace terms</Link>.
            </p>
          </div>
        </aside>

        <section id="products" className="min-w-0 scroll-mt-6">
          <form method="get" className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_230px]">
            <label>
              <span className="sr-only">Search products in this store</span>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search products in this store..."
                className="h-12 w-full rounded-xl border border-site-line bg-white px-5 text-[13px] text-site-ink focus:border-site-purple focus:outline-none"
              />
            </label>
            <AutoSubmitSelect
              name="sort"
              defaultValue={sort}
              aria-label="Sort"
              className="h-12 rounded-xl border border-site-line bg-white px-5 text-[12.5px] font-bold text-site-ink focus:border-site-purple focus:outline-none"
            >
              {SORTS.filter(([v]) => v !== "relevance").map(([v, l]) => (
                <option key={v} value={v}>Sort: {l}</option>
              ))}
            </AutoSubmitSelect>
          </form>
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <CatalogueEmpty connected={connected} filtering={Boolean(q)} clearHref={`/marketplace/stores/${slug}`} />
          )}
        </section>
      </div>
    </>
  );
}
