import type { Metadata } from "next";
import { Search } from "lucide-react";
import { MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Browse Products" };

export default async function BrowseProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let total: number | null = null;
  try {
    total = await prisma.marketplaceProduct.count({
      where: { status: "PUBLISHED", ...(q ? { title: { contains: q, mode: "insensitive" } } : {}) },
    });
  } catch {
    total = null;
  }

  return (
    <>
      <MpHeader
        title="Browse Products"
        description="Search and filter every published Marketplace product."
        breadcrumb={[{ label: "Marketplace", href: "/app/marketplace" }, { label: "Browse Products" }]}
      />

      <MpCard>
        <MpEmpty
          icon={Search}
          title={total === null ? "Catalogue unavailable" : "No products found"}
          description={
            total === null
              ? "The platform database could not be reached, so the catalogue cannot be listed right now."
              : q
                ? `No published products match "${q}".`
                : "No products have been published yet. Approved seller products appear here once published."
          }
        />
      </MpCard>

      <MpNote title="How listings appear">
        A product becomes discoverable only after it reaches the published state through moderation.
        Drafts, submissions and unpublished versions are never listed.
      </MpNote>
    </>
  );
}
