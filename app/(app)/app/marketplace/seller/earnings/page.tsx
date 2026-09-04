import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { MpCard, MpDenied, MpEmpty, MpHeader, MpNote, MpStat } from "@/components/marketplace/ui";
import { WithdrawalRequestDrawer } from "@/components/marketplace/withdrawal-request-drawer";
import { MARKETPLACE_FLAGS } from "@/lib/marketplace/config";
import { getMarketplaceViewer, guardMarketplace, flagEnabled } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Earnings and Payouts" };

export default async function SellerEarningsPage() {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.earnings.read_own",
    requireApprovedSeller: true,
  });
  if (!gate.ok) return <MpDenied denial={gate} />;

  const sellerId = viewer.seller!.id;
  let ledger: { availableCents: number; lifetimeCents: number; entries: number } | null = null;
  try {
    const [avail, lifetime, entries] = await Promise.all([
      prisma.marketplaceLedgerEntry.aggregate({
        where: { sellerId, payoutId: null, availableAt: { lte: new Date() } },
        _sum: { netCents: true },
      }),
      prisma.marketplaceLedgerEntry.aggregate({ where: { sellerId }, _sum: { netCents: true } }),
      prisma.marketplaceLedgerEntry.count({ where: { sellerId } }),
    ]);
    ledger = {
      availableCents: avail._sum.netCents ?? 0,
      lifetimeCents: lifetime._sum.netCents ?? 0,
      entries,
    };
  } catch {
    ledger = null;
  }

  const money = (c?: number) =>
    ledger && c !== undefined ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c / 100) : null;

  // Payout eligibility is calculated, never assumed by the UI.
  const payoutsEnabled = flagEnabled(viewer, MARKETPLACE_FLAGS.payouts);
  const withdrawalsEnabled = flagEnabled(viewer, MARKETPLACE_FLAGS.withdrawalRequests);
  const providerConfigured = Boolean(viewer.seller && false); // no payout provider connected yet
  const hasBalance = (ledger?.availableCents ?? 0) > 0;
  const canRequest = payoutsEnabled && withdrawalsEnabled && providerConfigured && hasBalance;

  return (
    <>
      <MpHeader
        title="Earnings & Payouts"
        description="Your earnings ledger and payout history."
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "Seller Dashboard", href: "/app/marketplace/seller" },
          { label: "Earnings & Payouts" },
        ]}
        action={
          <WithdrawalRequestDrawer
            canRequest={canRequest}
            availableLabel={money(ledger?.availableCents) ?? "—"}
            blockedReason={
              !payoutsEnabled || !withdrawalsEnabled
                ? "Payout processing is not enabled for this Marketplace yet."
                : !providerConfigured
                  ? "No payout provider is connected to your seller account yet."
                  : !hasBalance
                    ? "You do not have an eligible balance to withdraw."
                    : null
            }
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MpStat label="Available balance" value={money(ledger?.availableCents)} />
        <MpStat label="Lifetime earnings" value={money(ledger?.lifetimeCents)} />
        <MpStat label="Ledger entries" value={ledger ? ledger.entries.toLocaleString("en-US") : null} />
      </div>

      <MpCard className="mt-6">
        <MpEmpty
          icon={Wallet}
          title={ledger === null ? "Earnings unavailable" : "No earnings yet"}
          description={
            ledger === null
              ? "The platform database could not be reached, so your earnings cannot be shown right now."
              : "Each sale writes an entry to your earnings ledger. Payout eligibility is calculated from that ledger."
          }
        />
      </MpCard>

      <MpNote title="How payout eligibility is decided">
        Request Payout only appears when the Marketplace module and payout flags are on, your seller
        account is approved, a payout provider is connected, you hold an eligible balance, and
        threshold, compliance and risk requirements are met.
      </MpNote>
    </>
  );
}
