import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Package } from "lucide-react";
import { btn, btnPrimary } from "@/components/marketing/site-buttons";
import { ProductGallery, type GalleryImage } from "@/components/marketplace/product-gallery";
import { SharePopover } from "@/components/marketplace/share-popover";
import { loadPublicProduct, publicProductUrl } from "@/lib/server/public-marketplace";
import { CONTENT_CREATION_LABEL } from "@/lib/marketplace/content-creation";
import { COLLECTION_BY_TYPE, STANDARD_LICENSE, type StoreType } from "@/lib/marketplace/storefront";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  TEMPLATE: "Template", DOCUMENT: "Playbook / document", TOOL_KIT: "Tool or kit",
  GRAPHIC: "Graphic", IMAGE: "Image", VIDEO: "Video",
};

const fileSize = (bytes: number) => {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const signIn = (next: string) => `/login?next=${encodeURIComponent(next)}`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await loadPublicProduct(slug);
    if (!p) return { title: "Product" };
    const title = p.seoTitle || p.title;
    const description = p.metaDescription || p.summary || undefined;
    return {
      title,
      description,
      alternates: { canonical: publicProductUrl(p.slug) },
      robots: p.allowIndexing ? undefined : { index: false, follow: false },
      openGraph: {
        title,
        description,
        type: "website",
        url: publicProductUrl(p.slug),
        images: p.coverImage ? [{ url: p.coverImage, alt: p.coverImageAlt ?? p.title }] : undefined,
      },
      twitter: {
        card: p.coverImage ? "summary_large_image" : "summary",
        title,
        description,
        images: p.coverImage ? [p.coverImage] : undefined,
      },
    };
  } catch {
    return { title: "Product" };
  }
}

function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 border-t border-site-line py-7 first:border-t-0 first:pt-2">
      {children}
    </section>
  );
}

const h2 = "m-0 mb-3 text-[19px] font-extrabold text-site-ink";
const body = "m-0 text-[13.5px] leading-relaxed text-site-muted";

export default async function PublicProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let product: Awaited<ReturnType<typeof loadPublicProduct>> = null;
  let reachable = true;
  try {
    product = await loadPublicProduct(slug);
  } catch {
    reachable = false;
  }

  if (!reachable) {
    return (
      <div className="py-10 text-center">
        <Package aria-hidden className="mx-auto h-7 w-7 text-site-muted" />
        <h1 className="mt-3 text-2xl font-extrabold text-site-ink">Marketplace unavailable</h1>
        <p className="mt-2 text-[14px] text-site-muted">
          This listing could not be loaded right now. Please try again shortly.
        </p>
      </div>
    );
  }
  if (!product) notFound();

  const version = product.versions[0];
  const images: GalleryImage[] = [
    ...(product.coverImage ? [{ src: product.coverImage, alt: product.coverImageAlt ?? "" }] : []),
    ...product.galleryImages.map((src, i) => ({ src, alt: product.galleryImageAlts[i] ?? "" })),
  ];
  const assets = version?.assets ?? [];
  const totalBytes = assets.reduce((n, a) => n + (a.sizeBytes ?? 0), 0);
  const url = publicProductUrl(product.slug);
  const inApp = `/app/marketplace/products/${product.slug}`;
  const collection = COLLECTION_BY_TYPE.get(product.type as StoreType);

  const price = !version
    ? "Unavailable"
    : version.priceCents === 0
      ? "Free"
      : new Intl.NumberFormat("en-US", { style: "currency", currency: version.currency }).format(
          version.priceCents / 100,
        );
  const licenseName = !version
    ? "Shown before purchase"
    : version.licenseVersion === STANDARD_LICENSE
      ? "Standard Marketplace License"
      : version.licenseVersion;

  const facts: [string, string][] = [
    ["Type", TYPE_LABEL[product.type] ?? product.type],
    [
      "File details",
      assets.length
        ? `${assets.length} file${assets.length === 1 ? "" : "s"}${totalBytes ? ` · ${fileSize(totalBytes)}` : ""}`
        : "As listed",
    ],
    ["Creation", product.contentCreation ? CONTENT_CREATION_LABEL[product.contentCreation] : "Not declared"],
    ["License", licenseName],
    ["Language", product.language],
  ];

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 text-[12.5px] text-site-muted">
        <Link href="/marketplace" className="hover:text-site-purple">Marketplace</Link>
        {collection && (
          <>
            {" / "}
            <Link href={`/marketplace/categories/${collection.slug}`} className="hover:text-site-purple">
              {collection.name}
            </Link>
          </>
        )}
        {" / "}
        {product.title}
      </nav>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <ProductGallery images={images} title={product.title} />

            <div>
              <p className="m-0 text-[12.5px] font-bold text-site-purple">
                {product.category?.name ?? "Digital Product"}
              </p>
              <h1 className="m-0 mt-3 text-[30px] font-extrabold leading-tight tracking-[-0.6px] text-site-ink sm:text-[38px]">
                {product.title}
              </h1>
              <p className="m-0 mt-2 text-[13.5px] text-site-muted">
                by{" "}
                <Link href={`/marketplace/stores/${product.seller.slug}`} className="font-semibold text-site-purple hover:underline">
                  {product.seller.storeName}
                </Link>
              </p>
              {product.summary && <p className="m-0 mt-5 text-[15px] leading-relaxed text-site-muted">{product.summary}</p>}

              <dl className="m-0 mt-7 space-y-3.5">
                {facts.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[130px_1fr] gap-3 text-[12.5px]">
                    <dt className="text-site-muted">{k}</dt>
                    <dd className="m-0 font-semibold text-site-ink">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={signIn("/app/marketplace/favorites")} className={`${btn} px-7 py-2.5 text-[13px]`}>
                  Add to Wishlist
                </Link>
                <SharePopover url={url} title={product.title} />
                <a href="#promote" className={`${btn} px-7 py-2.5 text-[13px]`}>Promote Product</a>
              </div>
            </div>
          </div>

          <nav aria-label="Product sections" className="mt-10 flex gap-7 overflow-x-auto border-b border-site-line text-[13.5px] font-semibold">
            {[
              ["overview", "Overview"],
              ["included", "What’s Included"],
              ["license", "License"],
              ["reviews", "Reviews"],
              ["seller", "Seller Info"],
            ].map(([id, label], i) => (
              <a
                key={id}
                href={`#${id}`}
                className={
                  i === 0
                    ? "-mb-px shrink-0 border-b-2 border-site-purple pb-3 text-site-purple"
                    : "shrink-0 pb-3 text-site-muted hover:text-site-ink"
                }
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="mt-6">
            <Tab id="overview">
              <h2 className={h2}>About this product</h2>
              <p className={`${body} whitespace-pre-line`}>
                {product.description ||
                  "The seller has not added a longer description. Review the included files, creation disclosure, and license information before purchasing."}
              </p>
              {product.perfectFor.length > 0 && (
                <>
                  <h3 className="m-0 mb-2 mt-6 text-[15px] font-extrabold text-site-ink">Perfect for</h3>
                  <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
                    {product.perfectFor.map((h) => (
                      <li key={h} className="flex gap-2.5 text-[13.5px] text-site-muted">
                        <BadgeCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-site-purple" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Tab>

            <Tab id="included">
              <h2 className={h2}>What’s Included</h2>
              {product.highlights.length > 0 || assets.length > 0 ? (
                <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
                  {product.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 text-[13.5px] text-site-muted">
                      <BadgeCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-site-purple" />
                      {h}
                    </li>
                  ))}
                  {assets.map((a) => (
                    <li key={a.fileName} className="flex gap-2.5 text-[13.5px] text-site-muted">
                      <Package aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-site-purple" />
                      {a.fileName}
                      {a.sizeBytes ? ` · ${fileSize(a.sizeBytes)}` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={body}>Included files are listed by the seller on the published version.</p>
              )}
            </Tab>

            <Tab id="license">
              <h2 className={h2}>License</h2>
              <p className={body}>
                This version is sold under the <strong className="text-site-ink">{licenseName}</strong>. The license
                terms determine whether the product may be used inside or outside Amplivanta, and your order records the
                exact license version you bought. Read the{" "}
                <Link href="/legal/marketplace-terms" className="text-site-purple hover:underline">Marketplace terms</Link>.
              </p>
            </Tab>

            <Tab id="reviews">
              <h2 className={h2}>Reviews</h2>
              <p className={body}>Reviews appear here only when the feature is enabled and verified buyers have left them.</p>
            </Tab>

            <Tab id="seller">
              <h2 className={h2}>Seller Info</h2>
              <p className={body}>{product.seller.bio || "Seller profile information appears here when the seller has provided it."}</p>
              <Link href={`/marketplace/stores/${product.seller.slug}`} className="mt-3 inline-block text-[13px] font-bold text-site-purple hover:underline">
                Visit {product.seller.storeName} →
              </Link>
            </Tab>
          </div>
        </div>

        <div className="space-y-5 xl:sticky xl:top-6 xl:h-fit">
          <aside className="rounded-2xl border border-site-line bg-[#FBFBFE] p-7">
            <p className="m-0 text-[12.5px] font-bold text-site-ink">Price</p>
            <p className="m-0 mt-3 text-[26px] font-extrabold text-site-ink">{price}</p>
            <p className="m-0 mt-1 text-[11.5px] text-site-muted">Set by seller. Current price and license are shown from the live listing.</p>
            <Link href={signIn(inApp)} className={`${btnPrimary} mt-7 flex w-full justify-center py-3.5`}>Buy Now</Link>
            <Link href={signIn(inApp)} className={`${btn} mt-3 flex w-full justify-center py-3.5`}>Add to Cart</Link>
            <p className="m-0 mt-5 text-[11.5px] text-site-muted">
              Sign in is required to purchase. Checkout details appear according to configuration.
            </p>
          </aside>

          <aside id="promote" className="scroll-mt-6 rounded-2xl border border-site-line bg-white p-6">
            <h2 className="m-0 text-[15px] font-extrabold text-site-ink">Promote with Amplivanta</h2>
            <p className="m-0 mt-3 text-[12.5px] leading-relaxed text-site-muted">
              For eligible signed-in users, open Social Publishing to share this listing with its product link.
            </p>
            <p className="m-0 mt-5 text-[11.5px] font-bold text-site-purple">AI assistance can suggest post copy when enabled.</p>
            <Link href={signIn("/app/social/compose")} className={`${btnPrimary} mt-4 flex w-full justify-center py-3 text-[13px]`}>
              Open in Social Publishing
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}
