import type { Metadata } from "next";
import { ShoppingCart } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader } from "@/components/marketplace/ui";
import { CartLines } from "@/components/marketplace/purchase-ui";
import { getCheckoutQuote } from "@/app/(app)/app/marketplace/actions";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const quote = await getCheckoutQuote();

  return (
    <>
      <MpHeader
        title="Cart"
        description="Review the products you are about to buy."
        breadcrumb={[{ label: "Marketplace", href: "/app/marketplace" }, { label: "Cart" }]}
        action={quote.lines.length > 0 ? <MpButton href="/app/marketplace/checkout" variant="primary">Checkout</MpButton> : undefined}
      />
      <MpCard>
        {quote.lines.length > 0 ? (
          <CartLines lines={quote.lines} currency={quote.currency} subtotalCents={quote.subtotalCents} />
        ) : (
          <MpEmpty
            icon={ShoppingCart}
            title={quote.connected ? "Your cart is empty" : "Cart unavailable"}
            description={
              quote.connected
                ? "Products you add from the catalogue appear here."
                : "The platform database could not be reached, so your cart cannot be shown right now."
            }
            action={<MpButton href="/app/marketplace/products" variant="primary">Browse products</MpButton>}
          />
        )}
      </MpCard>
    </>
  );
}
