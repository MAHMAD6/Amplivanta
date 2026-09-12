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
  let ledger:
    | { availableCents: number; pendingCents: number; lifetimeCents: number; paidOutCents: number; entries: number }
    | null = null;
  let seller: { payoutProvider: string | null; payoutAccountRef: string | null } | null = null;
  let lastPayoutAt: Date | null = null;
  try {
    const now = new Date();
    const [avail, pending, lifetime, paid, entries, sellerRow, lastPayout] = await Promise.all([
      prisma.marketplaceLedgerEntry.aggregate({
        where: { sellerId, payoutId: null, availableAt: { lte: now } },
        _sum: { netCents: true },
      }),
      // Earned but not yet eligible: no payout, and either unscheduled or future.
      prisma.marketplaceLedgerEntry.aggregate({
        where: { sellerId, payoutId: null, OR: [{ availableAt: null }, { availableAt: { gt: now } }] },
        _sum: { netCents: true },
      }),
      prisma.marketplaceLedgerEntry.aggregate({ where: { sellerId }, _sum: { netCents: true } }),
      prisma.marketplacePayout.aggregate({ where: { sellerId, status: "PAID" }, _sum: { amountCents: true } }),
      prisma.marketplaceLedgerEntry.count({ where: { sellerId } }),
      prisma.marketplaceSeller.findUnique({ where: { id: sellerId }, select: { payoutProvider: true, payoutAccountRef: true } }),
      prisma.marketplacePayout.findFirst({ where: { sellerId, status: "PAID" }, orderBy: { requestedAt: "desc" }, select: { requestedAt: true } }),
    ]);
    ledger = {
      availableCents: avail._sum.netCents ?? 0,
      pendingCents: pending._sum.netCents ?? 0,
      lifetimeCents: lifetime._sum.netCents ?? 0,
      paidOutCents: paid._sum.amountCents ?? 0,
      entries,
    };
    seller = sellerRow;
    lastPayoutAt = lastPayout?.requestedAt ?? null;
  } catch {
    ledger = null;
  }

  const money = (c?: number) =>
    ledger && c !== undefined ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c / 100) : null;

  // Payout eligibility is calculated, never assumed by the UI.
  const payoutsEnabled = flagEnabled(viewer, MARKETPLACE_FLAGS.payouts);
  const withdrawalsEnabled = flagEnabled(viewer, MARKETPLACE_FLAGS.withdrawalRequests);
  // A payout account counts as configured only when the provider returned a reference.
  const providerConfigured = Boolean(seller?.payoutProvider && seller?.payoutAccountRef);
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MpStat label="Eligible balance" value={money(ledger?.availableCents)} hint="Available to withdraw" />
        <MpStat label="Pending balance" value={money(ledger?.pendingCents)} hint="Not yet eligible" />
        <MpStat label="Total earned" value={money(ledger?.lifetimeCents)} hint="All time" />
        <MpStat label="Total paid out" value={money(ledger?.paidOutCents)} hint="Completed payouts" />
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

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MpCard className="p-6">
          <div className="text-[14px] font-bold text-deep-navy">Payout information</div>
          <dl className="mt-4 space-y-3">
            {([
              ["Payout method", providerConfigured ? (seller?.payoutProvider ?? "").replace(/_/g, " ") : "Not configured"],
              ["Payout account", providerConfigured ? "Connected" : "Not connected"],
              ["Minimum payout", "From Marketplace settings"],
              ["Payout schedule", "From Marketplace settings"],
              ["Last payout", lastPayoutAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(lastPayoutAt) : "None yet"],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 text-[12.5px]">
                <dt className="text-ink-muted">{k}</dt>
                <dd className="m-0 font-semibold capitalize text-deep-navy">{v}</dd>
              </div>
            ))}
          </dl>
        </MpCard>

        <MpCard className="p-6">
          <div className="text-[14px] font-bold text-deep-navy">How payouts work</div>
          <ul className="mt-4 space-y-2.5 text-[12.5px] leading-relaxed text-ink-soft">
            <li>Each paid order writes an entry to your earnings ledger; eligibility is calculated from it.</li>
            <li>Thresholds, schedule, fees and currencies come from Marketplace settings, not from this page.</li>
            <li>Payout account details are held by the payout provider; Amplivanta stores only a reference.</li>
          </ul>
        </MpCard>
      </div>

      <MpNote title="How payout eligibility is decided">
        Request Payout only appears when the Marketplace module and payout flags are on, your seller
        account is approved, a payout provider is connected, you hold an eligible balance, and
        threshold, compliance and risk requirements are met.
      </MpNote>
    </>
  );
}
