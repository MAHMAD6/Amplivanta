"use client";

import { useState } from "react";
import Link from "next/link";
import { Info, Plus, Check, Pencil } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { PlatformBadge } from "@/components/app/PlatformBadge";
import { PAYMENT_METHODS } from "@/lib/app-data";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const [method, setMethod] = useState("bank");
  const total = 50;

  return (
    <div className="flex flex-col gap-5 px-5 pb-8">
      <AppHeader title="Checkout" back="/app/request" right={<Info className="h-5 w-5 text-[#14121f]" />} />

      {/* order summary */}
      <div className="rounded-2xl border border-[#e9e7f0] bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <PlatformBadge platform="instagram" size="lg" />
          <Pencil className="h-4 w-4 text-[#F5A623]" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
          <span className="font-bold text-[#14121f]">Instagram</span>
          <span className="text-right text-[#767287]">1000 Followers</span>
          <span className="text-[#767287]">Link</span>
          <span className="text-right text-[#14121f]">www.instagram.com</span>
          <span className="text-[#767287]">Price per Unit: $0.05</span>
          <span className="text-right text-[#767287]">Quantity: 1000</span>
          <span className="font-bold text-[#14121f]">Total: ${total.toFixed(2)}</span>
        </div>
      </div>

      {/* payment method */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-extrabold text-[#14121f]">Payment Method</h2>
        <Link href="/app/payment" className="flex items-center gap-1 text-sm font-bold text-[#6D3BF5]"><Plus className="h-4 w-4" /> Add</Link>
      </div>
      <div className="space-y-3">
        {PAYMENT_METHODS.map((m) => {
          const on = method === m.id;
          return (
            <button key={m.id} onClick={() => setMethod(m.id)} className="flex w-full items-center gap-3">
              <span className={`h-11 w-11 rounded-full ${m.tint}`} />
              <span className="flex-1 text-left">
                <span className="block text-sm font-bold text-[#14121f]">{m.label}</span>
                <span className="block text-xs tracking-widest text-[#a8a4b8]">**** *** {m.last4}</span>
              </span>
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border", on ? "bg-grad-brand-2 border-transparent" : "border-[#d9d5ea] bg-[#f1f0f7]")}>
                {on && <Check className="h-3.5 w-3.5 text-white" />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2">
        <button className="bg-grad-cta w-full rounded-xl py-3.5 font-bold text-white shadow-[0_8px_20px_-6px_rgba(109,59,245,0.5)]">
          Pay ${total.toFixed(2)}
        </button>
        <p className="mt-2 text-center text-xs leading-relaxed text-[#a8a4b8]">
          Your payment is secured &amp; encrypted<br />By proceeding, you agree to our Terms &amp; Policies
        </p>
      </div>
    </div>
  );
}
