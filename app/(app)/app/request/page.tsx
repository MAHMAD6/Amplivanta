"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { PlatformBadge } from "@/components/app/PlatformBadge";
import { REQUEST_PLATFORMS, REQUEST_SERVICES, type Platform } from "@/lib/app-data";
import { cn } from "@/lib/utils";

const UNIT = 0.05;

export default function RequestServicePage() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [service, setService] = useState<string>("Followers");
  const [qty, setQty] = useState(1000);
  const total = (qty * UNIT).toFixed(2);

  return (
    <div className="flex flex-col gap-5 px-5 pb-8">
      <AppHeader title="Request Service" right={<ShoppingCart className="h-5 w-5 text-[#14121f]" />} />

      {/* platforms */}
      <div>
        <p className="mb-3 font-display text-base font-extrabold text-[#14121f]">Choose Platform</p>
        <div className="flex flex-wrap gap-3">
          {REQUEST_PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={cn("rounded-2xl p-0.5 transition", platform === p && "ring-2 ring-[#6D3BF5] ring-offset-2")}
            >
              <PlatformBadge platform={p} />
            </button>
          ))}
        </div>
      </div>

      {/* services */}
      <div>
        <p className="mb-3 font-display text-base font-extrabold text-[#14121f]">Select Service</p>
        <div className="grid grid-cols-2 gap-3">
          {REQUEST_SERVICES.map((s) => {
            const on = service === s;
            return (
              <button
                key={s}
                onClick={() => setService(s)}
                className={cn(
                  "rounded-xl border py-2.5 text-sm font-bold transition",
                  on ? "bg-grad-brand-2 border-transparent text-white shadow-md" : "border-[#e9e7f0] bg-white text-[#14121f]"
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* qty + link */}
      <div className="space-y-3 border-t border-[#e9e7f0] pt-4">
        <label className="flex items-center justify-between gap-3">
          <span className="font-bold text-[#14121f]">Quantity</span>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(Math.max(0, Number(e.target.value)))}
            className="w-32 rounded-lg border border-[#e9e7f0] px-3 py-2 text-right text-sm font-semibold text-[#14121f] outline-none focus:border-[#6D3BF5]"
          />
        </label>
        <label className="flex items-center justify-between gap-3">
          <span className="font-bold text-[#14121f]">Link</span>
          <input
            placeholder="www.instagram.com"
            className="w-48 rounded-lg border border-[#e9e7f0] px-3 py-2 text-right text-sm text-[#14121f] outline-none focus:border-[#6D3BF5]"
          />
        </label>
      </div>

      {/* price */}
      <div className="space-y-1 border-t border-[#e9e7f0] pt-4 text-sm">
        <div className="flex justify-between"><span className="font-bold text-[#14121f]">Price</span><span className="text-[#4a4756]">${UNIT.toFixed(2)}/unit</span></div>
        <div className="flex justify-between"><span className="font-bold text-[#14121f]">Delivery</span><span className="text-[#4a4756]">24–48 hrs</span></div>
        <div className="flex justify-between"><span className="font-bold text-[#14121f]">Total</span><span className="font-extrabold text-[#6D3BF5]">${total}</span></div>
      </div>

      <Link
        href="/app/checkout"
        className="bg-grad-cta rounded-xl py-3.5 text-center font-bold text-white shadow-[0_8px_20px_-6px_rgba(109,59,245,0.5)]"
      >
        Proceed to Checkout
      </Link>
      <p className="-mt-2 text-center text-xs text-[#a8a4b8]">Make sure account is public before order</p>
    </div>
  );
}
