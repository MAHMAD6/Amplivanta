import type { Metadata } from "next";
import { CreditCard } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <>
      <MpHeader
        title="Checkout"
        description="Complete your Marketplace purchase."
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "Cart", href: "/app/marketplace/cart" },
          { label: "Checkout" },
        ]}
      />
      <MpCard>
        <MpEmpty
          icon={CreditCard}
          title="Checkout is not available yet"
          description="No payment provider is connected for the Marketplace, so no charge can be taken."
          action={<MpButton href="/app/marketplace/cart">Back to cart</MpButton>}
        />
      </MpCard>
      <MpNote title="Why this is unavailable">
        Marketplace payment architecture — the provider and whether Amplivanta is merchant of record,
        payment facilitator or another role — is a launch decision that must be confirmed rather than
        assumed. Checkout stays disabled until it is.
      </MpNote>
    </>
  );
}
