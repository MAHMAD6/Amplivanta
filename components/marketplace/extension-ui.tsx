"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Package, Tag, X } from "lucide-react";
import {
  addBundleToCart,
  applyCouponCode,
  createBundle,
  createSellerCoupon,
  removeCouponCode,
  setBundleStatus,
  setSellerCouponActive,
  toggleFollow,
} from "@/app/(app)/app/marketplace/extension-actions";
import { toastResult } from "@/lib/action-toast";

const btn =
  "inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-bold text-deep-navy transition hover:bg-bg-soft disabled:opacity-50";
const btnPrimary =
  "inline-flex h-10 items-center gap-2 rounded-xl bg-royal-blue px-4 text-[13px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-50";
const field =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[13.5px] focus:border-royal-blue focus:outline-none";

export function FollowButton({ sellerId, following, count }: { sellerId: string; following: boolean; count: number }) {
  const [state, setState] = useState({ following, count });
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={state.following ? btn : btnPrimary}
      onClick={() =>
        start(async () => {
          const res = await toggleFollow(sellerId);
          if (toastResult(res) && typeof res.following === "boolean") {
            setState((s) => ({ following: res.following!, count: s.count + (res.following ? 1 : -1) }));
          }
        })
      }
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
      {state.following ? "Following" : "Follow"} · {state.count.toLocaleString("en-US")}
    </button>
  );
}

export function CouponBox({ code, error }: { code: string | null; error: string | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (code && !error) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-bg-soft px-3 py-2 text-[12.5px]">
        <span className="inline-flex items-center gap-1.5 font-bold text-deep-navy"><Tag className="h-3.5 w-3.5" /> {code}</span>
        <button type="button" disabled={pending} onClick={() => start(async () => { toastResult(await removeCouponCode()); router.refresh(); })} aria-label="Remove coupon" className="text-ink-muted hover:text-deep-navy">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const value = String(new FormData(e.currentTarget).get("code") ?? "");
        start(async () => {
          if (toastResult(await applyCouponCode(value))) router.refresh();
        });
      }}
    >
      <label className="min-w-0 flex-1">
        <span className="sr-only">Coupon code</span>
        <input name="code" placeholder="Coupon code" defaultValue={code ?? ""} className="h-10 w-full rounded-xl border border-line px-3 text-[13px] uppercase focus:border-royal-blue focus:outline-none" />
      </label>
      <button type="submit" disabled={pending} className={btn}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}Apply</button>
      {error && <p className="sr-only" role="alert">{error}</p>}
    </form>
  );
}

export function AddBundleButton({ bundleId }: { bundleId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={btnPrimary}
      onClick={() => start(async () => { if (toastResult(await addBundleToCart(bundleId))) router.push("/app/marketplace/cart"); })}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />} Add bundle to cart
    </button>
  );
}

function CouponFields() {
  return (
    <>
      <label className="block">
        <span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Code</span>
        <input name="code" required placeholder="SPRING25" className={`${field} uppercase`} />
      </label>
      <div className="grid grid-cols-[120px_minmax(0,1fr)_90px] gap-2">
        <label className="block">
          <span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Type</span>
          <select name="kind" className={field}><option value="percent">% off</option><option value="amount">Amount off</option></select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Value</span>
          <input name="value" type="number" min="0.01" step="0.01" required className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Currency</span>
          <input name="currency" defaultValue="USD" maxLength={3} className={`${field} uppercase`} />
        </label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label className="block"><span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Starts</span><input name="startsAt" type="date" className={field} /></label>
        <label className="block"><span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Ends</span><input name="endsAt" type="date" className={field} /></label>
        <label className="block"><span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Max uses</span><input name="maxRedemptions" type="number" min="1" className={field} /></label>
      </div>
    </>
  );
}

export function CouponForm({ action }: { action: "seller" | "admin" }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        start(async () => {
          const res =
            action === "seller"
              ? await createSellerCoupon(fd)
              : await (await import("@/app/(admin)/admin/marketplace-promo-actions")).createPlatformCoupon(fd);
          if (toastResult(res)) { form.reset(); router.refresh(); }
        });
      }}
    >
      <CouponFields />
      <div><button type="submit" disabled={pending} className={btnPrimary}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}Create coupon</button></div>
    </form>
  );
}

export function SellerCouponToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} className={btn} onClick={() => start(async () => { if (toastResult(await setSellerCouponActive(id, !isActive))) router.refresh(); })}>
      {isActive ? "Deactivate" : "Activate"}
    </button>
  );
}

export function BundleForm({ products }: { products: { id: string; title: string; priceLabel: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        start(async () => { if (toastResult(await createBundle(fd))) { form.reset(); router.refresh(); } });
      }}
    >
      <label className="block"><span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Bundle title</span><input name="title" required minLength={3} className={field} /></label>
      <label className="block"><span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Summary (optional)</span><input name="summary" className={field} /></label>
      <fieldset className="rounded-xl border border-line p-3">
        <legend className="px-1 text-[12.5px] font-bold text-deep-navy">Products (at least two)</legend>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-[13px] text-ink-soft">
              <input type="checkbox" name="productIds" value={p.id} className="h-4 w-4 accent-royal-blue" />
              {p.title} <span className="text-ink-muted">· {p.priceLabel}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block max-w-[220px]"><span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Bundle price</span><input name="price" type="number" min="0" step="0.01" required className={field} /></label>
      <p className="text-[12px] text-ink-muted">The bundle price must be lower than buying the products separately.</p>
      <div><button type="submit" disabled={pending} className={btnPrimary}>{pending && <Loader2 className="h-4 w-4 animate-spin" />}Save bundle as draft</button></div>
    </form>
  );
}

export function BundleStatusButton({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const next = status === "PUBLISHED" ? "ARCHIVED" : "PUBLISHED";
  return (
    <button type="button" disabled={pending} className={next === "PUBLISHED" ? btnPrimary : btn} onClick={() => start(async () => { if (toastResult(await setBundleStatus(id, next))) router.refresh(); })}>
      {next === "PUBLISHED" ? "Publish" : "Archive"}
    </button>
  );
}
