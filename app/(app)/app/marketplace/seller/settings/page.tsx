import type { Metadata } from "next";
import { MpCard, MpDenied, MpHeader, MpNote } from "@/components/marketplace/ui";
import { SellerSettingsForm } from "@/components/marketplace/seller-settings-form";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Seller Settings" };

export default async function SellerSettingsPage() {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.settings.manage",
    requireApprovedSeller: true,
  });
  if (!gate.ok) return <MpDenied denial={gate} />;

  let seller: { storeName: string; slug: string; headline: string | null; bio: string | null } | null = null;
  try {
    seller = await prisma.marketplaceSeller.findUnique({
      where: { id: viewer.seller!.id },
      select: { storeName: true, slug: true, headline: true, bio: true },
    });
  } catch {
    seller = null;
  }

  return (
    <>
      <MpHeader
        title="Seller Profile & Settings"
        description="Your public store profile and selling preferences."
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "Seller Dashboard", href: "/app/marketplace/seller" },
          { label: "Profile & Settings" },
        ]}
      />
      {seller ? (
        <SellerSettingsForm
          storeName={seller.storeName}
          slug={seller.slug}
          headline={seller.headline ?? ""}
          bio={seller.bio ?? ""}
        />
      ) : (
        <MpCard className="px-6 py-8 text-[13.5px] text-ink-soft">
          Your seller profile could not be loaded because the platform database was unreachable.
        </MpCard>
      )}
      <MpNote title="Payout account">
        Payout account details are held with the configured payout provider, not in Amplivanta. Only a
        provider reference is stored here.
      </MpNote>
    </>
  );
}
