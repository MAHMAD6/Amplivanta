"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import {
  addToCart,
  issueDownload,
  placeOrder,
  removeFromCart,
  type CheckoutLine,
} from "@/app/(app)/app/marketplace/actions";
import { toastResult } from "@/lib/action-toast";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const money = (cents: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);

export function AddToCartButton({ productId, priceCents, currency }: { productId: string; priceCents: number; currency: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await addToCart(productId);
            if (toastResult(res)) router.refresh();
          })
        }
        className="inline-flex h-12 items-center gap-2 rounded-xl bg-royal-blue px-5 text-[14px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
        {priceCents === 0 ? "Get for free" : `Add to cart — ${money(priceCents, currency)}`}
      </button>
    </div>
  );
}

/**
 * Buy Now — add to cart, then go straight to checkout.
 *
 * It is deliberately the same code path as Add to Cart: one cart, one
 * checkout, one order-creation route. Nothing here grants access; that only
 * happens once a payment provider confirms.
 */
export function BuyNowButton({ productId }: { productId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await addToCart(productId);
            if (res.ok) {
              router.push("/app/marketplace/checkout");
              return;
            }
            toast.error(res.error);
          })
        }
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet px-5 text-[14px] font-bold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Buy Now
      </button>
    </div>
  );
}

export function CartLines({ lines, currency, subtotalCents }: { lines: CheckoutLine[]; currency: string; subtotalCents: number }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div>
      <div className="divide-y divide-line">
        {lines.map((l) => (
          <div key={l.itemId} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div className="min-w-0">
              <div className="text-[14px] font-bold text-deep-navy">{l.title}</div>
              <div className="text-[12px] text-ink-muted">Licence {l.licenseVersion}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-bold text-deep-navy">{money(l.unitPriceCents, l.currency)}</span>
              <button
                type="button"
                aria-label={`Remove ${l.title}`}
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const res = await removeFromCart(l.itemId);
                    if (toastResult(res)) router.refresh();
                  })
                }
                className="rounded-lg p-2 text-ink-muted hover:bg-bg-soft hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-line px-6 py-4">
        <span className="text-[13px] font-semibold text-ink-soft">Subtotal</span>
        <span className="text-[18px] font-extrabold text-deep-navy">{money(subtotalCents, currency)}</span>
      </div>
      <div className="px-6 pb-6">
      </div>
    </div>
  );
}

export function PlaceOrderButton({
  totalCents,
  currency,
  blocked,
  blockedReason,
}: {
  totalCents: number;
  currency: string;
  blocked: boolean;
  blockedReason: string | null;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div>
      <button
        type="button"
        disabled={blocked || pending}
        onClick={() =>
          start(async () => {
            const res = await placeOrder();
            if (!toastResult(res)) return;
            // Paid orders continue at the payment provider's hosted page.
            if (res.ok && res.redirectUrl) window.location.assign(res.redirectUrl);
            else router.push("/app/marketplace/purchases");
          })
        }
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-royal-blue text-[14px] font-bold text-white transition hover:bg-royal-soft disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {totalCents === 0 ? "Complete free order" : `Pay ${money(totalCents, currency)}`}
      </button>
      {blocked && blockedReason && (
        <p className="mt-3 rounded-xl bg-orange-cta/10 px-4 py-3 text-[12.5px] font-semibold text-orange-cta">
          {blockedReason}
        </p>
      )}
    </div>
  );
}

export function DownloadButton({ entitlementId, label = "Download" }: { entitlementId: string; label?: string }) {
  const [pending, start] = useTransition();

  return (
    <div className="text-right">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await issueDownload(entitlementId);
            if (res.ok) {
              toast.success("Download link issued.");
              window.location.href = res.url;
            } else {
              toast.error(res.error);
            }
          })
        }
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13.5px] font-bold text-deep-navy transition hover:bg-bg-soft disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {label}
      </button>
    </div>
  );
}
