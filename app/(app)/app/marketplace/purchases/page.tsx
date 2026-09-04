import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { getMarketplaceViewer } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "My Purchases" };

export default async function MyPurchasesPage() {
  const viewer = await getMarketplaceViewer();

  let orders = 0;
  let reachable = true;
  try {
    orders = viewer.userId
      ? await prisma.marketplaceOrder.count({ where: { buyerUserId: viewer.userId } })
      : 0;
  } catch {
    reachable = false;
  }

  return (
    <>
      <MpHeader
        title="My Purchases"
        description="Your Marketplace purchases, licences and downloads."
        breadcrumb={[{ label: "Marketplace", href: "/app/marketplace" }, { label: "My Purchases" }]}
      />
      <MpCard>
        <MpEmpty
          icon={ShoppingBag}
          title={!reachable ? "Purchases unavailable" : orders > 0 ? "Purchase list unavailable" : "No purchases yet"}
          description={
            !reachable
              ? "The platform database could not be reached, so your purchases cannot be shown right now."
              : orders > 0
                ? "Your orders exist but their line items are not ready to display yet."
                : "Products you buy appear here with their licence and download history."
          }
          action={<MpButton href="/app/marketplace/products" variant="primary">Browse products</MpButton>}
        />
      </MpCard>
      <MpNote title="How downloads work">
        A paid order is not enough on its own: each download is issued against an active entitlement
        for the exact product version you purchased, and every issued link is recorded.
      </MpNote>
    </>
  );
}
