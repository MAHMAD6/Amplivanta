import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Package } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { AddToCartButton } from "@/components/marketplace/purchase-ui";
import { ProductReviewsSection } from "@/components/marketplace/reviews";
import { loadProductReviews } from "@/app/(app)/app/marketplace/actions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Product" };

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;

  let product: Awaited<ReturnType<typeof load>> = null;
  let reachable = true;
  async function load() {
    return prisma.marketplaceProduct.findFirst({
      // Only published products are publicly addressable.
      where: { slug: productSlug, status: "PUBLISHED" },
      select: {
        id: true, title: true, summary: true, description: true, tags: true,
        seller: { select: { storeName: true, slug: true } },
        category: { select: { name: true, slug: true } },
        versions: { orderBy: { version: "desc" }, take: 1, select: { priceCents: true, currency: true, licenseVersion: true } },
      },
    });
  }
  try {
    product = await load();
  } catch {
    reachable = false;
  }
  if (reachable && !product) notFound();

  const version = product?.versions[0];
  const reviews = product ? await loadProductReviews(product.id) : null;

  return (
    <>
      <MpHeader
        title={product?.title ?? "Product"}
        description={product?.summary ?? undefined}
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "Browse Products", href: "/app/marketplace/products" },
          { label: product?.title ?? productSlug },
        ]}
      />

      {product && version ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <MpCard className="p-6">
            <div className="text-[12.5px] text-ink-muted">
              By {product.seller.storeName}
              {product.category ? ` · ${product.category.name}` : ""}
            </div>
            {product.description ? (
              <p className="mt-4 whitespace-pre-line text-[14px] leading-relaxed text-ink-soft">{product.description}</p>
            ) : (
              <p className="mt-4 text-[13.5px] text-ink-muted">No detailed description provided.</p>
            )}
            {product.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <span key={t} className="rounded-lg border border-line px-2.5 py-1 text-[11.5px] text-ink-soft">{t}</span>
                ))}
              </div>
            )}
          </MpCard>

          <MpCard className="h-fit p-6">
            <div className="text-[24px] font-extrabold text-deep-navy">
              {version.priceCents === 0
                ? "Free"
                : new Intl.NumberFormat("en-US", { style: "currency", currency: version.currency }).format(version.priceCents / 100)}
            </div>
            <div className="mt-1 text-[12px] text-ink-muted">Licence {version.licenseVersion}</div>
            <div className="mt-5">
              <AddToCartButton productId={product.id} priceCents={version.priceCents} currency={version.currency} />
            </div>
          </MpCard>
        </div>
      ) : (
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
      )}

      {product && reviews && <ProductReviewsSection productId={product.id} data={reviews} />}

      <MpNote title="Versions and licences">
        Every purchase records the exact product version and licence version bought. Later seller
        updates publish a new version and never replace files already purchased.
      </MpNote>
    </>
  );
}
