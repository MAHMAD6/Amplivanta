import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  FileText,
  Globe,
  Infinity as InfinityIcon,
  Layers,
  Package,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { AddToCartButton, BuyNowButton } from "@/components/marketplace/purchase-ui";
import { ProductGallery, type GalleryImage } from "@/components/marketplace/product-gallery";
import { ProductTabs } from "@/components/marketplace/product-tabs";
import { ProductReviewsSection } from "@/components/marketplace/reviews";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { SharePopover } from "@/components/marketplace/share-popover";
import { PromotePopover } from "@/components/marketplace/promote-popover";
import { isFavorited, loadProductReviews } from "@/app/(app)/app/marketplace/actions";
import { publicProductUrl } from "@/lib/server/public-marketplace";
import { getMarketplaceViewer } from "@/lib/server/marketplace-access";
import { MARKETPLACE_FLAGS } from "@/lib/marketplace/config";
import { MARKETPLACE_LEGAL_DOCS } from "@/lib/marketplace-legal-docs";
import { prisma } from "@/lib/prisma";

const TYPE_LABEL: Record<string, string> = {
  TEMPLATE: "Template",
  DOCUMENT: "Document",
  TOOL_KIT: "Tool or kit",
  GRAPHIC: "Graphic",
  IMAGE: "Image",
  VIDEO: "Video",
};

const money = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);

const fileSize = (bytes: number) => {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

/** Distinct file extensions across the version's deliverables. */
function fileTypes(assets: { fileName: string }[]) {
  const exts = new Set(
    assets
      .map((a) => a.fileName.split(".").pop()?.toUpperCase())
      .filter((e): e is string => Boolean(e && e.length <= 5)),
  );
  return exts.size > 0 ? Array.from(exts).sort().join(", ") : null;
}

function load(productSlug: string) {
  return prisma.marketplaceProduct.findFirst({
    // Only published products are publicly addressable.
    where: { slug: productSlug, status: "PUBLISHED" },
    select: {
      id: true, slug: true, title: true, summary: true, description: true, tags: true, type: true,
      coverImage: true, coverImageAlt: true, galleryImages: true, galleryImageAlts: true,
      language: true, highlights: true, perfectFor: true, categoryId: true,
      seoTitle: true, metaDescription: true, allowIndexing: true,
      seller: { select: { storeName: true, slug: true, bio: true, createdAt: true } },
      category: { select: { name: true, slug: true } },
      versions: {
        orderBy: { version: "desc" },
        take: 1,
        select: {
          version: true, priceCents: true, currency: true, licenseVersion: true, changelog: true,
          assets: { select: { fileName: true, sizeBytes: true, mimeType: true } },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}): Promise<Metadata> {
  const { productSlug } = await params;
  try {
    const p = await load(productSlug);
    if (!p) return { title: "Product" };
    return {
      title: p.seoTitle || p.title,
      description: p.metaDescription || p.summary || undefined,
      robots: p.allowIndexing ? undefined : { index: false, follow: false },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;

  let product: Awaited<ReturnType<typeof load>> = null;
  let reachable = true;
  try {
    product = await load(productSlug);
  } catch {
    reachable = false;
  }
  if (reachable && !product) notFound();

  const version = product?.versions[0];

  let related: { id: string; slug: string; title: string; coverImage: string | null; categoryName: string | null }[] = [];
  if (product) {
    try {
      const rows = await prisma.marketplaceProduct.findMany({
        where: {
          status: "PUBLISHED",
          id: { not: product.id },
          ...(product.categoryId ? { categoryId: product.categoryId } : {}),
        },
        orderBy: { publishedAt: "desc" },
        take: 4,
        select: { id: true, slug: true, title: true, coverImage: true, category: { select: { name: true } } },
      });
      related = rows.map((r) => ({
        id: r.id, slug: r.slug, title: r.title, coverImage: r.coverImage,
        categoryName: r.category?.name ?? null,
      }));
    } catch {
      related = [];
    }
  }

  const reviews = product ? await loadProductReviews(product.id) : null;
  const saved = product ? await isFavorited(product.id) : false;
  const viewer = await getMarketplaceViewer();
  const favoritesEnabled = viewer.flags[MARKETPLACE_FLAGS.favorites] === true;
  // Sharing always points at the public listing, never this signed-in route.
  const shareUrl = product ? publicProductUrl(product.slug) : "";

  if (!product || !version) {
    return (
      <>
        <MpHeader
          title={product?.title ?? "Product"}
          breadcrumb={[
            { label: "Marketplace", href: "/app/marketplace" },
            { label: "Browse Products", href: "/app/marketplace/products" },
            { label: product?.title ?? productSlug },
          ]}
        />
        <MpCard>
          <MpEmpty
            icon={Package}
            title={reachable ? "Product details unavailable" : "Marketplace unavailable"}
            description={
              reachable
                ? "This product has no published version with pricing and licence details attached yet."
                : "The platform database could not be reached, so this product cannot be shown right now."
            }
            action={<MpButton href="/app/marketplace/products">Back to catalogue</MpButton>}
          />
        </MpCard>
      </>
    );
  }

  const images: GalleryImage[] = [
    ...(product.coverImage ? [{ src: product.coverImage, alt: product.coverImageAlt ?? "" }] : []),
    ...product.galleryImages.map((src, i) => ({ src, alt: product.galleryImageAlts[i] ?? "" })),
  ];

  const assets = version.assets;
  const totalBytes = assets.reduce((n, a) => n + (a.sizeBytes ?? 0), 0);
  const licenseDoc = MARKETPLACE_LEGAL_DOCS["marketplace-product-license"];

  const specs: [React.ComponentType<{ className?: string }>, string, string][] = [
    [FileText, "File Type", fileTypes(assets) ?? "Set by seller"],
    [Layers, "File Size", totalBytes > 0 ? fileSize(totalBytes) : "Varies by file"],
    [Globe, "Language", product.language],
    [Package, "Category", product.category?.name ?? "Uncategorised"],
    [ScrollText, "License", version.licenseVersion],
  ];

  const attributes = [
    { icon: Layers, label: TYPE_LABEL[product.type] ?? product.type, sub: product.category?.name ?? null },
    { icon: FileText, label: assets.length > 0 ? `${assets.length} file(s)` : "Files pending", sub: fileTypes(assets) },
    { icon: ScrollText, label: "Licence", sub: version.licenseVersion },
    { icon: InfinityIcon, label: "Ongoing use", sub: "as defined by seller" },
  ];

  return (
    <>
      <MpHeader
        title={product.title}
        description={product.summary ?? undefined}
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "Browse Products", href: "/app/marketplace/products" },
          ...(product.category
            ? [{ label: product.category.name, href: `/app/marketplace/categories/${product.category.slug}` }]
            : []),
          { label: product.title },
        ]}
      />

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="grid gap-7 md:grid-cols-2">
            <ProductGallery images={images} title={product.title} />

            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-royal-tint px-3 py-1 text-[11.5px] font-bold text-royal-blue">
                <BadgeCheck aria-hidden className="h-3.5 w-3.5" />
                {TYPE_LABEL[product.type] ?? product.type}
              </span>

              {product.description && (
                <p className="mt-4 whitespace-pre-line text-[14px] leading-relaxed text-ink-soft">
                  {product.description}
                </p>
              )}

              <dl className="mt-6 grid grid-cols-2 gap-4">
                {attributes.map((a) => (
                  <div key={a.label} className="flex gap-2.5">
                    <a.icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-royal-blue" />
                    <div className="min-w-0">
                      <dt className="text-[12.5px] font-bold text-deep-navy">{a.label}</dt>
                      {a.sub && <dd className="text-[11.5px] text-ink-muted">{a.sub}</dd>}
                    </div>
                  </div>
                ))}
              </dl>

              {product.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {product.tags.map((t) => (
                    <span key={t} className="rounded-lg border border-line px-2.5 py-1 text-[11.5px] text-ink-soft">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-start gap-3">
                <AddToCartButton
                  productId={product.id}
                  priceCents={version.priceCents}
                  currency={version.currency}
                />
                {favoritesEnabled && <FavoriteButton productId={product.id} initialSaved={saved} />}
                <SharePopover url={shareUrl} title={product.title} />
                <PromotePopover productId={product.id} />
              </div>
            </div>
          </div>

          <ProductTabs
            tabs={[
              {
                id: "overview",
                label: "Overview",
                content: (
                  <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_320px]">
                    <div>
                      <h2 className="text-[17px] font-extrabold text-deep-navy">About This Product</h2>
                      <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-ink-soft">
                        {product.description ?? "The seller has not added a detailed description yet."}
                      </p>

                      {product.perfectFor.length > 0 && (
                        <>
                          <h3 className="mt-7 text-[15px] font-extrabold text-deep-navy">Perfect For</h3>
                          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                            {product.perfectFor.map((item) => (
                              <li key={item} className="flex gap-2.5 text-[13.5px] text-ink-soft">
                                <BadgeCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-royal-blue" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>

                    <MpCard className="h-fit p-5">
                      <dl className="space-y-3.5">
                        {specs.map(([Icon, label, value]) => (
                          <div key={label} className="flex items-start gap-3">
                            <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
                            <dt className="w-[86px] shrink-0 text-[12.5px] font-bold text-deep-navy">{label}</dt>
                            <dd className="min-w-0 text-[12.5px] text-ink-soft">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </MpCard>
                  </div>
                ),
              },
              {
                id: "included",
                label: "What's Included",
                content:
                  product.highlights.length > 0 || assets.length > 0 ? (
                    <div className="grid gap-7 md:grid-cols-2">
                      {product.highlights.length > 0 && (
                        <div>
                          <h2 className="text-[15px] font-extrabold text-deep-navy">In this product</h2>
                          <ul className="mt-3 space-y-2">
                            {product.highlights.map((h) => (
                              <li key={h} className="flex gap-2.5 text-[13.5px] text-ink-soft">
                                <BadgeCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-royal-blue" />
                                {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {assets.length > 0 && (
                        <div>
                          <h2 className="text-[15px] font-extrabold text-deep-navy">Files you receive</h2>
                          <ul className="mt-3 space-y-2">
                            {assets.map((a) => (
                              <li key={a.fileName} className="flex justify-between gap-4 border-b border-line pb-2 text-[13px]">
                                <span className="min-w-0 truncate text-ink-soft">{a.fileName}</span>
                                <span className="shrink-0 text-ink-muted">
                                  {a.sizeBytes ? fileSize(a.sizeBytes) : "—"}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[13.5px] text-ink-muted">
                      The seller has not listed the contents of this product yet.
                    </p>
                  ),
              },
              {
                id: "license",
                label: "License",
                content: (
                  <div className="max-w-2xl">
                    <h2 className="text-[15px] font-extrabold text-deep-navy">
                      Licence {version.licenseVersion}
                    </h2>
                    <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
                      Your purchase records the exact product version and licence version bought. A
                      later seller update publishes a new version and never alters what you already
                      own.
                    </p>
                    {licenseDoc && (
                      <Link
                        href="/legal/marketplace-product-license"
                        className="mt-4 inline-block text-[13px] font-bold text-royal-blue hover:underline"
                      >
                        Read the {licenseDoc.title}
                      </Link>
                    )}
                  </div>
                ),
              },
              {
                id: "reviews",
                label: "Reviews",
                content: reviews ? (
                  <ProductReviewsSection productId={product.id} data={reviews} />
                ) : (
                  <p className="text-[13.5px] text-ink-muted">Reviews are unavailable right now.</p>
                ),
              },
              {
                id: "seller",
                label: "Seller Info",
                content: (
                  <div className="max-w-2xl">
                    <h2 className="text-[15px] font-extrabold text-deep-navy">{product.seller.storeName}</h2>
                    <p className="mt-1 text-[12.5px] text-ink-muted">
                      Selling on Amplivanta since{" "}
                      {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
                        product.seller.createdAt,
                      )}
                    </p>
                    {product.seller.bio && (
                      <p className="mt-4 text-[13.5px] leading-relaxed text-ink-soft">{product.seller.bio}</p>
                    )}
                    <Link
                      href={`/app/marketplace/stores/${product.seller.slug}`}
                      className="mt-4 inline-block text-[13px] font-bold text-royal-blue hover:underline"
                    >
                      Visit this store
                    </Link>
                  </div>
                ),
              },
            ]}
          />
        </div>

        <MpCard className="h-fit p-6 lg:sticky lg:top-6">
          <div className="text-[12.5px] font-bold uppercase tracking-wide text-ink-muted">Price</div>
          <div className="mt-1.5 text-[30px] font-extrabold leading-none text-deep-navy">
            {version.priceCents === 0 ? "Free" : money(version.priceCents, version.currency)}
          </div>
          <div className="mt-1.5 text-[12px] text-ink-muted">Set by seller</div>

          <div className="mt-5">
            <BuyNowButton productId={product.id} />
          </div>
          <p className="mt-3 text-center text-[11.5px] text-ink-muted">
            Checkout details shown at purchase
          </p>

          <div className="mt-5 flex gap-3 border-t border-line pt-5">
            <ShieldCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-royal-blue" />
            <div>
              <div className="text-[13px] font-bold text-deep-navy">Digital product delivered securely</div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
                Access is issued after a confirmed payment, on the seller&apos;s terms.
              </p>
            </div>
          </div>
        </MpCard>
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-extrabold text-deep-navy">Related Products</h2>
            <Link
              href="/app/marketplace/products"
              className="text-[13px] font-bold text-royal-blue hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/app/marketplace/products/${r.slug}`}
                className="flex gap-3 rounded-2xl border border-line bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-royal-blue/30 hover:shadow-card-lg"
              >
                {r.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.coverImage} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-bg-soft">
                    <Package aria-hidden className="h-5 w-5 text-ink-muted" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-bold text-deep-navy">{r.title}</div>
                  <div className="truncate text-[11.5px] text-ink-muted">{r.categoryName ?? "Uncategorised"}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <MpNote title="Versions and licences">
        Every purchase records the exact product version and licence version bought. Later seller
        updates publish a new version and never replace files already purchased.
      </MpNote>
    </>
  );
}
