"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import { submitReview } from "@/app/(app)/app/marketplace/actions";
import type { ProductReviews } from "@/app/(app)/app/marketplace/actions";
import { cn } from "@/lib/utils";
import { MpCard } from "./ui";

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("h-4 w-4", i <= n ? "fill-orange-cta text-orange-cta" : "text-line")} />
      ))}
    </span>
  );
}

export function ProductReviewsSection({ productId, data }: { productId: string; data: ProductReviews }) {
  const [m, setM] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (!data.enabled) return null;

  return (
    <MpCard className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
        <h2 className="text-[15px] font-bold text-deep-navy">Reviews</h2>
        {data.count > 0 && data.average !== null ? (
          <span className="flex items-center gap-2 text-[13px] text-ink-soft">
            <Stars n={Math.round(data.average)} />
            {data.average.toFixed(1)} · {data.count} review{data.count === 1 ? "" : "s"}
          </span>
        ) : (
          <span className="text-[13px] text-ink-muted">No reviews yet</span>
        )}
      </div>

      {data.canReview && (
        <form
          className="border-b border-line px-6 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            start(async () => {
              const res = await submitReview(productId, fd);
              setM(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error });
              if (res.ok) {
                form.reset();
                router.refresh();
              }
            });
          }}
        >
          <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)]">
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-bold text-deep-navy">Rating</span>
              <select name="rating" required defaultValue="5" className="h-11 w-full rounded-xl border border-line px-3 text-[13.5px]">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-bold text-deep-navy">Title</span>
              <input name="title" className="h-11 w-full rounded-xl border border-line px-3 text-[13.5px]" />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-deep-navy">Your review</span>
            <textarea name="body" rows={3} className="w-full rounded-xl border border-line px-3 py-2.5 text-[13.5px]" />
          </label>
          {m && (
            <p role="status" className={cn("mt-3 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold", m.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
              {m.text}
            </p>
          )}
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-royal-blue px-4 text-[13.5px] font-bold text-white hover:bg-royal-soft disabled:opacity-60">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />} Post review
            </button>
          </div>
        </form>
      )}

      {data.reviews.length > 0 ? (
        <div className="divide-y divide-line">
          {data.reviews.map((r) => (
            <div key={r.id} className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Stars n={r.rating} />
                {r.title && <span className="text-[13.5px] font-bold text-deep-navy">{r.title}</span>}
                <span className="ml-auto text-[12px] text-ink-muted">{r.when}</span>
              </div>
              {r.body && <p className="mt-1.5 text-[13px] text-ink-soft">{r.body}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="px-6 py-6 text-[13px] text-ink-soft">
          Only buyers with an active purchase can review this product.
        </p>
      )}
    </MpCard>
  );
}
