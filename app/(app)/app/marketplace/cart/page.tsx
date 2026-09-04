import type { Metadata } from "next";
import { ShoppingCart } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader } from "@/components/marketplace/ui";
import { getMarketplaceViewer } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const viewer = await getMarketplaceViewer();

  let items = 0;
  let reachable = true;
  try {
    items = viewer.userId
      ? await prisma.marketplaceCartItem.count({ where: { userId: viewer.userId } })
      : 0;
  } catch {
    reachable = false;
  }

  return (
    <>
      <MpHeader
        title="Cart"
        description="Review the products you are about to buy."
        breadcrumb={[{ label: "Marketplace", href: "/app/marketplace" }, { label: "Cart" }]}
      />
      <MpCard>
        <MpEmpty
          icon={ShoppingCart}
          title={!reachable ? "Cart unavailable" : items > 0 ? "Cart pricing unavailable" : "Your cart is empty"}
          description={
            !reachable
              ? "The platform database could not be reached, so your cart cannot be shown right now."
              : items > 0
                ? "Totals are calculated by a server-side checkout quote, which is not connected yet."
                : "Products you add from the catalogue appear here."
          }
          action={<MpButton href="/app/marketplace/products" variant="primary">Browse products</MpButton>}
        />
      </MpCard>
    </>
  );
}
