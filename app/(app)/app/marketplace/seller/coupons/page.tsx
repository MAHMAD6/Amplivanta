import type { Metadata } from "next";
import { Tag } from "lucide-react";
import { MpCard, MpDenied, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { CouponForm, SellerCouponToggle } from "@/components/marketplace/extension-ui";
import { MARKETPLACE_FLAGS } from "@/lib/marketplace/config";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Coupons" };

const money = (c: number, cur: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);

export default async function SellerCouponsPage() {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.settings.manage",
    requireApprovedSeller: true,
    flag: MARKETPLACE_FLAGS.coupons,
  });
  if (!gate.ok) return <MpDenied denial={gate} />;

  let coupons: {
    id: string; code: string; percentOff: number | null; amountOffCents: number | null; currency: string | null;
    startsAt: Date | null; endsAt: Date | null; maxRedemptions: number | null; redemptions: number; isActive: boolean;
  }[] = [];
  let reachable = true;
  try {
    coupons = await prisma.marketplaceCoupon.findMany({
      where: { sellerId: viewer.seller!.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    reachable = false;
  }

  const date = (d: Date | null) => (d ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d) : "—");

  return (
    <>
      <MpHeader
        title="Coupons"
        description="Discount codes buyers can apply to your products at checkout."
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "Seller Dashboard", href: "/app/marketplace/seller" },
          { label: "Coupons" },
        ]}
      />

      <MpCard className="mb-6 p-6">
        <h2 className="mb-4 text-[15px] font-bold text-deep-navy">Create a coupon</h2>
        <CouponForm action="seller" />
      </MpCard>

      {!reachable ? (
        <MpCard>
          <MpEmpty icon={Tag} title="Coupons unavailable" description="The platform database could not be reached, so your coupons cannot be shown." />
        </MpCard>
      ) : coupons.length === 0 ? (
        <MpCard>
          <MpEmpty icon={Tag} title="No coupons yet" description="Create a coupon above and share the code with your audience." />
        </MpCard>
      ) : (
        <MpCard>
          <div className="divide-y divide-line">
            {coupons.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-deep-navy">
                    {c.code} · {c.percentOff ? `${c.percentOff}% off` : money(c.amountOffCents ?? 0, c.currency ?? "USD") + " off"}
                  </div>
                  <div className="text-[12px] text-ink-muted">
                    {c.isActive ? "Active" : "Inactive"} · {date(c.startsAt)} – {date(c.endsAt)} · used {c.redemptions}
                    {c.maxRedemptions ? ` of ${c.maxRedemptions}` : ""}
                  </div>
                </div>
                <SellerCouponToggle id={c.id} isActive={c.isActive} />
              </div>
            ))}
          </div>
        </MpCard>
      )}

      <MpNote title="How coupons apply">
        Your coupon only discounts your own products in a buyer&apos;s cart. The discount is calculated on the
        server at checkout and is reflected in the order snapshot and your earnings.
      </MpNote>
    </>
  );
}
