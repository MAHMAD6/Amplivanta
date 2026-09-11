"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

/**
 * One-time credit purchase. Sends only the pack code; the server fixes the
 * quantity and price and Stripe's webhook adds the credits. Returning from
 * Stripe grants nothing by itself.
 */
export function BuyCredits({ packs }: { packs: { code: string; label: string; credits: number }[] }) {
  const [code, setCode] = useState(packs[0]?.code ?? "");
  const [pending, start] = useTransition();

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-line p-4">
      <label className="min-w-0 flex-1">
        <span className="mb-1 block text-[12px] font-bold text-deep-navy">Buy credits</span>
        <select
          value={code}
          onChange={(e) => setCode(e.currentTarget.value)}
          className="h-10 w-full rounded-xl border border-line bg-white px-3 text-[13px] text-deep-navy"
        >
          {packs.map((p) => (
            <option key={p.code} value={p.code}>{p.label}</option>
          ))}
        </select>
      </label>
      <button
        type="button"
        disabled={pending || !code}
        onClick={() =>
          start(async () => {
            try {
              const res = await fetch("/api/billing/credits/checkout", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ packCode: code }),
              });
              const data = (await res.json()) as { url?: string; error?: string };
              if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout could not be started.");
              window.location.assign(data.url);
            } catch (err) {
              toast.error("Credit purchase unavailable", { description: (err as Error).message });
            }
          })
        }
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-royal-blue px-4 text-[13px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Continue to payment
      </button>
    </div>
  );
}
