"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { toggleFavorite } from "@/app/(app)/app/marketplace/actions";
import { toastResult } from "@/lib/action-toast";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  productId,
  initialSaved,
  className,
}: {
  productId: string;
  initialSaved: boolean;
  className?: string;
}) {
  // Optimistic so the heart responds immediately; reverted if the write fails.
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className={className}>
      <button
        type="button"
        disabled={pending}
        aria-pressed={saved}
        onClick={() => {
          const next = !saved;
          setSaved(next);
          start(async () => {
            const res = await toggleFavorite(productId);
            if (toastResult(res)) router.refresh();
            else setSaved(!next);
          });
        }}
        className="inline-flex h-12 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13.5px] font-bold text-deep-navy transition hover:bg-bg-soft disabled:opacity-60"
      >
        {pending ? (
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        ) : (
          <Heart aria-hidden className={cn("h-4 w-4", saved && "fill-rose-500 text-rose-500")} />
        )}
        {saved ? "Saved to wishlist" : "Add to wishlist"}
      </button>
    </div>
  );
}
