import type { Metadata } from "next";
import { Package, Plus } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { SellerProductRows, type SellerProduct } from "@/components/marketplace/seller-products";
import { getMarketplaceViewer } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "My Products" };

export default async function SellerProductsPage() {
  const viewer = await getMarketplaceViewer();
  const sellerId = viewer.seller?.id;

  let products: SellerProduct[] = [];
  let categories: { id: string; name: string }[] = [];
  let reachable = true;
  try {
    categories = await prisma.marketplaceCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    const rows = sellerId
      ? await prisma.marketplaceProduct.findMany({
          where: { sellerId },
          orderBy: { updatedAt: "desc" },
          take: 100,
          include: {
            versions: {
              orderBy: { version: "desc" },
              take: 1,
              include: { _count: { select: { assets: true } } },
            },
          },
        })
      : [];

    products = rows.map((r) => {
      const v = r.versions[0];
      return {
        id: r.id,
        title: r.title,
        status: r.status as string,
        updated: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(r.updatedAt),
        version: v?.version ?? null,
        assets: v?._count.assets ?? 0,
        summary: r.summary,
        description: r.description,
        tags: r.tags,
        categoryId: r.categoryId,
        priceValue: v ? v.priceCents / 100 : null,
        priceLabel: v
          ? v.priceCents === 0
            ? "Free"
            : new Intl.NumberFormat("en-US", { style: "currency", currency: v.currency }).format(v.priceCents / 100)
          : "no version",
      };
    });
  } catch {
    reachable = false;
  }

  return (
    <>
      <MpHeader
        title="My Products"
        description="Every product you have drafted, submitted or published."
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "Seller Dashboard", href: "/app/marketplace/seller" },
          { label: "My Products" },
        ]}
        action={
          <MpButton href="/app/marketplace/seller/products/new" variant="primary" icon={Plus}>
            Add product
          </MpButton>
        }
      />

      {products.length > 0 ? (
        <SellerProductRows products={products} categories={categories} />
      ) : (
        <MpCard>
          <MpEmpty
            icon={Package}
            title={reachable ? "No products yet" : "Products unavailable"}
            description={
              reachable
                ? "Create a product, attach its deliverable, then submit it for review. Approved products can be published to the catalogue."
                : "The platform database could not be reached, so your products cannot be listed right now."
            }
            action={
              <MpButton href="/app/marketplace/seller/products/new" variant="primary">
                Add your first product
              </MpButton>
            }
          />
        </MpCard>
      )}

      <MpNote title="Review flow">
        Products move draft → submitted → under review → approved → published. A version referenced by
        a completed order stays addressable forever, so updates publish a new version rather than
        replacing files buyers already own.
      </MpNote>
    </>
  );
}
