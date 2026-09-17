"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toastResult } from "@/lib/action-toast";
import { recalculateGrowth } from "@/app/(app)/app/growth-actions";

/** Recalculates the Growth Score and refreshes detected opportunities. */
export function RecalculateScoreButton({ className, label = "Recalculate" }: { className?: string; label?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => { if (toastResult(await recalculateGrowth())) router.refresh(); })}
      className={className ?? "inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-white px-3.5 text-[12.5px] font-semibold text-deep-navy hover:bg-bg-soft disabled:opacity-60"}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} {label}
    </button>
  );
}
