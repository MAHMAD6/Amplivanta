import type { Metadata } from "next";
import { Store } from "lucide-react";
import { MpCard, MpDenied, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { SellerApplicationForm } from "@/components/marketplace/seller-application-form";
import { MARKETPLACE_FLAGS } from "@/lib/marketplace/config";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";

export const metadata: Metadata = { title: "Sell on Amplivanta" };

export default async function SellOnAmplivantaPage() {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.apply",
    flag: MARKETPLACE_FLAGS.sellerApplications,
  });
  if (!gate.ok) return <MpDenied denial={gate} />;

  // Already a seller (or mid-review): show status instead of the form.
  if (viewer.seller) {
    const s = viewer.seller.status;
    return (
      <>
        <MpHeader
          title="Sell on Amplivanta"
          breadcrumb={[{ label: "Marketplace", href: "/app/marketplace" }, { label: "Sell on Amplivanta" }]}
        />
        <MpCard>
          <MpEmpty
            icon={Store}
            title={
              s === "APPROVED"
                ? "You are an approved seller"
                : s === "REJECTED"
                  ? "Your application was not approved"
                  : s === "SUSPENDED" || s === "CLOSED"
                    ? "Your seller account is not active"
                    : "Your application is under review"
            }
            description={
              s === "APPROVED"
                ? "Manage your products, orders and earnings from the Seller Dashboard."
                : s === "REJECTED"
                  ? "Contact support if you would like to discuss the decision."
                  : s === "SUSPENDED" || s === "CLOSED"
                    ? "Selling is paused for this account. Existing orders and payout records are preserved."
                    : "We will let you know as soon as it has been reviewed."
            }
          />
        </MpCard>
      </>
    );
  }

  return (
    <>
      <MpHeader
        title="Sell on Amplivanta"
        description="Apply to sell downloadable marketing products to Amplivanta customers."
        breadcrumb={[{ label: "Marketplace", href: "/app/marketplace" }, { label: "Sell on Amplivanta" }]}
      />
      <SellerApplicationForm />
      <MpNote title="What happens next">
        Applications move through review before approval. Identity and business verification
        requirements, eligible countries and prohibited product categories are set by the Marketplace
        operator and confirmed before launch.
      </MpNote>
    </>
  );
}
