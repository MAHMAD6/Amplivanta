import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, FileText, Globe, Package, ScrollText, ShieldCheck } from "lucide-react";
import { MarketingBreadcrumb } from "@/components/amplivanta/marketing-breadcrumb";
import { ProductGallery, type GalleryImage } from "@/components/marketplace/product-gallery";
import { SharePopover } from "@/components/marketplace/share-popover";
import { loadPublicProduct, publicProductUrl } from "@/lib/server/public-marketplace";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  TEMPLATE: "Template", DOCUMENT: "Document", TOOL_KIT: "Tool or kit",
  GRAPHIC: "Graphic", IMAGE: "Image", VIDEO: "Video",
};

const fileSize = (bytes: number) => {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

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
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[900px] px-4 text-center lg:px-8">
          <Package aria-hidden className="mx-auto h-7 w-7 text-ink-muted" />
          <h1 className="mt-3 font-display text-2xl font-extrabold text-deep-navy">
            Marketplace unavailable
          </h1>
          <p className="mt-2 text-[14px] text-ink-soft">
            This listing could not be loaded right now. Please try again shortly.
          </p>
        </div>
      </section>
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

  const price = !version
    ? "Unavailable"
    : version.priceCents === 0
      ? "Free"
      : new Intl.NumberFormat("en-US", { style: "currency", currency: version.currency }).format(
          version.priceCents / 100,
        );

  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <MarketingBreadcrumb
          items={[
            ["Home", "/"],
            ["Marketplace", "/marketplace"],
            ...(product.category
              ? ([[product.category.name, `/marketplace?category=${product.category.slug}`]] as [string, string][])
              : []),
            [product.title, null],
          ]}
        />

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
              <ProductGallery images={images} title={product.title} />

              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-royal-tint px-3 py-1 text-[11.5px] font-bold text-royal-blue">
                  <BadgeCheck aria-hidden className="h-3.5 w-3.5" />
                  {TYPE_LABEL[product.type] ?? product.type}
                </span>
                <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-deep-navy">
                  {product.title}
                </h1>
                {product.summary && (
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{product.summary}</p>
                )}
                <p className="mt-3 text-[12.5px] text-ink-muted">
                  By{" "}
                  <Link href={`/marketplace?seller=${product.seller.slug}`} className="font-semibold text-royal-blue hover:underline">
                    {product.seller.storeName}
                  </Link>
                </p>

                {product.tags.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {product.tags.map((t) => (
                      <span key={t} className="rounded-lg border border-line px-2.5 py-1 text-[11.5px] text-ink-soft">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-6">
                  <SharePopover url={url} title={product.title} />
                </div>
              </div>
            </div>

            {product.description && (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-extrabold text-deep-navy">About this product</h2>
                <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
                  {product.description}
                </p>
              </div>
            )}

            {product.highlights.length > 0 && (
              <div className="mt-9">
                <h2 className="font-display text-xl font-extrabold text-deep-navy">What&apos;s included</h2>
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {product.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 text-[14px] text-ink-soft">
                      <BadgeCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-royal-blue" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.perfectFor.length > 0 && (
              <div className="mt-9">
                <h2 className="font-display text-xl font-extrabold text-deep-navy">Perfect for</h2>
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {product.perfectFor.map((h) => (
                    <li key={h} className="flex gap-2.5 text-[14px] text-ink-soft">
                      <BadgeCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-royal-blue" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-line bg-white p-6 shadow-card lg:sticky lg:top-6">
            <div className="text-[12.5px] font-bold uppercase tracking-wide text-ink-muted">Price</div>
            <div className="mt-1.5 text-[30px] font-extrabold leading-none text-deep-navy">{price}</div>
            <div className="mt-1.5 text-[12px] text-ink-muted">Set by seller</div>

            <Link
              href={`/login?next=${encodeURIComponent(`/app/marketplace/products/${product.slug}`)}`}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-royal-blue text-[14px] font-bold text-white transition hover:bg-royal-soft"
            >
              Sign in to buy
            </Link>
            <p className="mt-2.5 text-center text-[11.5px] text-ink-muted">
              New to Amplivanta?{" "}
              <Link href="/signup" className="font-semibold text-royal-blue hover:underline">
                Create an account
              </Link>
            </p>

            <dl className="mt-6 space-y-3.5 border-t border-line pt-5">
              {(
                [
                  [FileText, "File size", totalBytes > 0 ? fileSize(totalBytes) : "Varies by file"],
                  [Globe, "Language", product.language],
                  [Package, "Category", product.category?.name ?? "Uncategorised"],
                  [ScrollText, "Licence", version?.licenseVersion ?? "Set by seller"],
                ] as [React.ComponentType<{ className?: string }>, string, string][]
              ).map(([Icon, label, value]) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
                  <dt className="w-[74px] shrink-0 text-[12.5px] font-bold text-deep-navy">{label}</dt>
                  <dd className="min-w-0 text-[12.5px] text-ink-soft">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex gap-3 border-t border-line pt-5">
              <ShieldCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-royal-blue" />
              <div>
                <div className="text-[13px] font-bold text-deep-navy">Delivered securely</div>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
                  Access is issued after a confirmed payment, on the seller&apos;s terms.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
