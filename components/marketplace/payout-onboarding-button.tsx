"use client";

import { useTransition } from "react";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "@/lib/toast";
import { startPayoutOnboarding } from "@/app/(app)/app/marketplace/seller/settings/payout-actions";

/** Sends an approved seller to Stripe Connect onboarding. */
export function PayoutOnboardingButton({ label }: { label: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await startPayoutOnboarding();
          if (res.ok) window.location.assign(res.url);
          else toast.error(res.error);
        })
      }
      className="inline-flex h-11 items-center gap-2 rounded-xl bg-royal-blue px-4 text-[13.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
      {label}
    </button>
  );
}
