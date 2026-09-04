import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { MpCard, MpDenied, MpEmpty, MpHeader } from "@/components/marketplace/ui";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Orders and Sales" };

export default async function SellerOrdersPage() {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.orders.read_own",
    requireApprovedSeller: true,
  });
  if (!gate.ok) return <MpDenied denial={gate} />;

  // Seller-ownership scoping is mandatory.
  let count = 0;
  let reachable = true;
  try {
    count = await prisma.marketplaceOrderItem.count({ where: { sellerId: viewer.seller!.id } });
  } catch {
    reachable = false;
  }

  return (
    <>
      <MpHeader
        title="Orders & Sales"
        description="Orders placed for your products."
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "Seller Dashboard", href: "/app/marketplace/seller" },
          { label: "Orders & Sales" },
        ]}
      />
      <MpCard>
        <MpEmpty
          icon={ShoppingBag}
          title={!reachable ? "Orders unavailable" : count > 0 ? "Order list unavailable" : "No orders yet"}
          description={
            !reachable
              ? "The platform database could not be reached, so your orders cannot be shown right now."
              : count > 0
                ? "Your orders exist but are not ready to display yet."
                : "When customers buy your products, their orders appear here."
          }
        />
      </MpCard>
    </>
  );
}
