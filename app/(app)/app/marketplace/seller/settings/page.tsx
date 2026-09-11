import type { Metadata } from "next";
import { MpCard, MpDenied, MpHeader, MpNote } from "@/components/marketplace/ui";
import { SellerSettingsForm } from "@/components/marketplace/seller-settings-form";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";
import { PayoutOnboardingButton } from "@/components/marketplace/payout-onboarding-button";
import { CONNECT_PROVIDER, isConnectEnabled, payoutAccountStatus } from "@/lib/stripe-connect";

export const metadata: Metadata = { title: "Seller Settings" };

export default async function SellerSettingsPage() {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.settings.manage",
    requireApprovedSeller: true,
  });
  if (!gate.ok) return <MpDenied denial={gate} />;

  let seller: {
    storeName: string;
    slug: string;
    headline: string | null;
    bio: string | null;
    payoutProvider: string | null;
    payoutAccountRef: string | null;
  } | null = null;
  try {
    seller = await prisma.marketplaceSeller.findUnique({
      where: { id: viewer.seller!.id },
      select: { storeName: true, slug: true, headline: true, bio: true, payoutProvider: true, payoutAccountRef: true },
    });
  } catch {
    seller = null;
  }

  const connectOn = isConnectEnabled();
  const accountRef = seller?.payoutProvider === CONNECT_PROVIDER ? seller.payoutAccountRef : null;
  const payout = await payoutAccountStatus(accountRef);

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
      <MpCard className="mt-6 flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div>
          <div className="text-[15px] font-bold text-deep-navy">Payout account</div>
          <p className="mt-1 max-w-[560px] text-[12.5px] leading-relaxed text-ink-soft">
            {!connectOn
              ? "Seller payouts are not enabled yet. They open once payout onboarding, reconciliation and dispute handling are ready."
              : !accountRef
                ? "Set up your payout account with Stripe to receive earnings. Bank and identity details are held by Stripe, not Amplivanta."
                : payout?.payoutsEnabled
                  ? "Your payout account is set up and can receive payouts."
                  : "Your payout account needs more details before payouts can be sent."}
          </p>
        </div>
        {connectOn && !payout?.payoutsEnabled && (
          <PayoutOnboardingButton label={accountRef ? "Continue payout setup" : "Set up payouts"} />
        )}
      </MpCard>
      <MpNote title="Payout account">
        Payout account details are held with the payout provider, not in Amplivanta. Only a provider
        reference is stored here.
      </MpNote>
    </>
  );
}
