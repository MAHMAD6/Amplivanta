import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Store } from "lucide-react";
import { MpCard, MpDenied, MpEmpty, MpHeader } from "@/components/marketplace/ui";
import { MARKETPLACE_FLAGS } from "@/lib/marketplace/config";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Seller Store" };

export default async function SellerStorePage({
  params,
}: {
  params: Promise<{ sellerSlug: string }>;
}) {
  const viewer = await getMarketplaceViewer();
  // Storefronts are behind their own feature flag.
  const gate = guardMarketplace(viewer, { flag: MARKETPLACE_FLAGS.sellerStorefronts });
  if (!gate.ok) return <MpDenied denial={gate} />;

  const { sellerSlug } = await params;
  let seller: { storeName: string; headline: string | null } | null = null;
  let reachable = true;
  try {
    seller = await prisma.marketplaceSeller.findFirst({
      where: { slug: sellerSlug, status: "APPROVED" },
      select: { storeName: true, headline: true },
    });
  } catch {
    reachable = false;
  }
  if (reachable && !seller) notFound();

  return (
    <>
      <MpHeader
        title={seller?.storeName ?? "Seller Store"}
        description={seller?.headline ?? undefined}
        breadcrumb={[{ label: "Marketplace", href: "/app/marketplace" }, { label: seller?.storeName ?? sellerSlug }]}
      />
      <MpCard>
        <MpEmpty
          icon={Store}
          title={reachable ? "No published products yet" : "Store unavailable"}
          description={
            reachable
              ? "Products this seller publishes will be listed on their store page."
              : "The platform database could not be reached, so this store cannot be shown right now."
          }
        />
      </MpCard>
    </>
  );
}
