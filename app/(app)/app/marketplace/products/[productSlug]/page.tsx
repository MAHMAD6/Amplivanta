import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Package } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Product" };

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;

  let product: { title: string; summary: string | null; seller: { storeName: string } } | null = null;
  let reachable = true;
  try {
    product = await prisma.marketplaceProduct.findFirst({
      // Only published products are publicly addressable.
      where: { slug: productSlug, status: "PUBLISHED" },
      select: { title: true, summary: true, seller: { select: { storeName: true } } },
    });
  } catch {
    reachable = false;
  }
  if (reachable && !product) notFound();

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
      <MpNote title="Versions and licences">
        Every purchase records the exact product version and licence version bought. Later seller
        updates publish a new version and never replace files already purchased.
      </MpNote>
    </>
  );
}
