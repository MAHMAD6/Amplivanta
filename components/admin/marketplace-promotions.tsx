"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Database, Loader2 } from "lucide-react";
import { CouponForm } from "@/components/marketplace/extension-ui";
import { endSponsoredPlacement, setCouponActive, createSponsoredPlacement } from "@/app/(admin)/admin/marketplace-promo-actions";
import { toastResult } from "@/lib/action-toast";
import { SuperCard, SuperEmptyState } from "./primitives";

const btn =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12.5px] font-bold text-admin-navy transition hover:bg-bg-soft disabled:opacity-50";
const btnPrimary =
  "inline-flex h-9 items-center gap-1.5 rounded-lg bg-royal-blue px-3 text-[12.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-50";
const field = "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[13.5px] focus:border-royal-blue focus:outline-none";

type Coupon = {
  id: string; code: string; percentOff: number | null; amountOffCents: number | null; currency: string | null;
  isActive: boolean; redemptions: number; maxRedemptions: number | null;
};
type Placement = {
  id: string; label: string; endsAt: Date | null;
  product: { title: string; slug: string } | null;
};

/**
 * Marketplace promotions: platform-wide coupons and labeled placements.
 * Both are commercial decisions, so nothing is preconfigured and every change
 * is audited. Placements always carry a visible label.
 */
export function MarketplacePromotionsPanel({
  coupons,
  placements,
  connected,
}: {
  coupons: Coupon[];
  placements: Placement[];
  connected: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  if (!connected) {
    return (
      <SuperCard>
        <SuperEmptyState
          icon={Database}
          title="Data source unavailable"
          description="The platform database could not be reached, so promotions cannot be shown or changed."
        />
      </SuperCard>
    );
  }

  const money = (c: number, cur: string) => new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);

  return (
    <>
      <SuperCard className="mb-4 p-5">
        <h2 className="mb-4 text-[15px] font-bold text-admin-navy">Platform coupon</h2>
        <CouponForm action="admin" />
        <p className="mt-3 text-[12px] text-ink-muted">
          A platform coupon discounts every eligible item in a buyer&apos;s cart. Seller coupons are managed by
          each seller and only affect their own products.
        </p>
      </SuperCard>

      <SuperCard className="mb-4">
        <div className="border-b border-line px-6 py-4 text-[14px] font-bold text-admin-navy">Platform coupons</div>
        {coupons.length === 0 ? (
          <SuperEmptyState icon={Database} title="No platform coupons" description="Coupons you create appear here." />
        ) : (
          <div className="divide-y divide-line">
            {coupons.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-admin-navy">
                    {c.code} · {c.percentOff ? `${c.percentOff}%` : money(c.amountOffCents ?? 0, c.currency ?? "USD")} off
                  </div>
                  <div className="text-[12px] text-ink-muted">
                    {c.isActive ? "active" : "inactive"} · used {c.redemptions}
                    {c.maxRedemptions ? ` of ${c.maxRedemptions}` : ""}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  className={btn}
                  onClick={() => start(async () => { if (toastResult(await setCouponActive(c.id, !c.isActive))) router.refresh(); })}
                >
                  {c.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            ))}
          </div>
        )}
      </SuperCard>

      <SuperCard className="mb-4 p-5">
        <h2 className="mb-4 text-[15px] font-bold text-admin-navy">Labeled placement</h2>
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            start(async () => {
              if (toastResult(await createSponsoredPlacement(fd))) { form.reset(); router.refresh(); }
            });
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Published product slug</span>
            <input name="productSlug" required className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Label shown to buyers</span>
            <input name="label" defaultValue="Sponsored" className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">Ends (optional)</span>
            <input name="endsAt" type="date" className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-admin-navy">
              Reason <span className="text-orange-cta">(required)</span>
            </span>
            <input name="reason" required placeholder="Recorded in the audit log" className={field} />
          </label>
          <div className="md:col-span-2">
            <button type="submit" disabled={pending} className={btnPrimary}>
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Create placement
            </button>
          </div>
        </form>
      </SuperCard>

      <SuperCard>
        <div className="border-b border-line px-6 py-4 text-[14px] font-bold text-admin-navy">Active placements</div>
        {placements.length === 0 ? (
          <SuperEmptyState icon={Database} title="No active placements" description="Placements appear on the public Marketplace home, always with their label." />
        ) : (
          <div className="divide-y divide-line">
            {placements.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-[14px] font-bold text-admin-navy">{p.product?.title ?? "Unknown product"}</div>
                  <div className="text-[12px] text-ink-muted">
                    {p.label} · {p.endsAt ? `ends ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(p.endsAt)}` : "no end date"}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  className={btn}
                  onClick={() => start(async () => { if (toastResult(await endSponsoredPlacement(p.id))) router.refresh(); })}
                >
                  End
                </button>
              </div>
            ))}
          </div>
        )}
      </SuperCard>
    </>
  );
}
