"use server";

import { prisma } from "@/lib/prisma";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";
import { CONNECT_PROVIDER, createOnboardingLink, isConnectEnabled } from "@/lib/stripe-connect";

export type PayoutOnboardingResult = { ok: true; url: string } | { ok: false; error: string };

/** Starts (or resumes) Stripe Connect onboarding for the signed-in approved seller. */
export async function startPayoutOnboarding(): Promise<PayoutOnboardingResult> {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.settings.manage",
    requireApprovedSeller: true,
  });
  if (!gate.ok) return { ok: false, error: "Only approved sellers can set up payouts." };
  if (!isConnectEnabled()) return { ok: false, error: "Seller payouts are not enabled yet." };

  try {
    const seller = await prisma.marketplaceSeller.findUnique({
      where: { id: viewer.seller!.id },
      select: { id: true, payoutProvider: true, payoutAccountRef: true, user: { select: { email: true } } },
    });
    if (!seller) return { ok: false, error: "Seller profile not found." };

    const res = await createOnboardingLink({
      id: seller.id,
      email: seller.user.email,
      payoutProvider: seller.payoutProvider,
      payoutAccountRef: seller.payoutAccountRef,
    });
    if (res.created) {
      await prisma.marketplaceSeller.update({
        where: { id: seller.id },
        data: { payoutProvider: CONNECT_PROVIDER, payoutAccountRef: res.accountId },
      });
      await prisma.platformAuditLog.create({
        data: {
          actorUserId: viewer.userId ?? null,
          action: "marketplace.seller.payout_account.created",
          resourceType: "MarketplaceSeller",
          resourceId: seller.id,
        },
      });
    }
    return { ok: true, url: res.url };
  } catch {
    return { ok: false, error: "Could not start payout setup. Please try again." };
  }
}
