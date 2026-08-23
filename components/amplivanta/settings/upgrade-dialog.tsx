"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/client/api";
import { cn } from "@/lib/utils";

export interface PlanOption {
  id: string;
  name: string;
  price: number;
  features: string[];
}

/**
 * Plan picker that starts checkout. When Stripe is configured the server returns
 * a Checkout URL and we redirect; otherwise it activates the plan locally (dev /
 * no-charge fallback) and we refresh.
 */
export function UpgradeDialog({
  plans,
  currentPlanId,
  trigger,
}: {
  plans: PlanOption[];
  currentPlanId?: string;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  async function choose(planId: string) {
    setPending(planId);
    try {
      const res = await api.post<{ url?: string; activated?: boolean }>("/api/billing/checkout", { planId });
      if (res.url) {
        window.location.href = res.url; // to Stripe Checkout
        return;
      }
      toast.success("Plan activated");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start checkout");
    } finally {
      setPending(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a plan</DialogTitle>
          <DialogDescription>Upgrade or switch your workspace subscription.</DialogDescription>
        </DialogHeader>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {plans.map((p) => {
            const current = p.id === currentPlanId;
            return (
              <div
                key={p.id}
                className={cn(
                  "flex flex-col rounded-2xl border p-4",
                  current ? "border-violet bg-violet/[0.04]" : "border-line",
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-[14px] font-bold text-ink">{p.name}</span>
                  <span className="text-[13px] font-extrabold text-ink">${p.price}<span className="text-[11px] font-medium text-ink-muted">/mo</span></span>
                </div>
                <ul className="mt-2 flex-1 space-y-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-[11.5px] text-ink-soft">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={current || pending !== null}
                  onClick={() => choose(p.id)}
                  className={cn(
                    "mt-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-4 text-[12.5px] font-bold disabled:opacity-60",
                    current ? "border border-line bg-white text-ink-soft" : "bg-grad-cta text-white shadow-violet",
                  )}
                >
                  {pending === p.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {current ? "Current plan" : "Choose"}
                </button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
