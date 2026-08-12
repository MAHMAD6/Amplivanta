"use client";

import { useState } from "react";
import { Info, Plus, Check } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { WalletCard } from "@/components/app/WalletCard";
import { WALLET, WITHDRAW_PRESETS, PAYMENT_METHODS } from "@/lib/app-data";
import { cn } from "@/lib/utils";

export default function WithdrawPage() {
  const [amount, setAmount] = useState(78);
  const [method, setMethod] = useState("bank");

  return (
    <div className="flex flex-col gap-5 px-5 pb-8">
      <AppHeader title="Withdraw Request" right={<Info className="h-5 w-5 text-[#14121f]" />} />

      <WalletCard
        balance={WALLET.balance}
        pending={WALLET.pending}
        secondaryLabel="Min Withdraw"
        secondaryValue={`$${WALLET.minWithdraw.toFixed(2)}`}
      />

      {/* amount */}
      <div className="text-center">
        <p className="text-left font-display text-base font-extrabold text-[#14121f]">Amount</p>
        <p className="mt-4 font-display text-4xl font-extrabold text-[#14121f]">${amount.toFixed(2)}</p>
        <p className="mt-1 text-xs text-[#a8a4b8]">Your Balance ${WALLET.balance.toFixed(2)}</p>
        <input
          type="range"
          min={WALLET.minWithdraw}
          max={WALLET.balance}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-4 w-full accent-[#6D3BF5]"
        />
      </div>

      {/* presets */}
      <div className="grid grid-cols-4 gap-3">
        {WITHDRAW_PRESETS.map((p) => {
          const on = amount === p;
          return (
            <button
              key={p}
              onClick={() => setAmount(p)}
              className={cn(
                "rounded-xl border py-3 text-sm font-bold transition",
                on ? "bg-grad-brand-2 border-transparent text-white shadow-md" : "border-[#e9e7f0] bg-white text-[#14121f]"
              )}
            >
              ${p >= 1000 ? "1k" : p < 10 ? `0${p}` : p}
            </button>
          );
        })}
      </div>

      <button className="bg-grad-cta mx-auto w-48 rounded-xl py-3.5 font-bold uppercase tracking-wide text-white shadow-[0_8px_20px_-6px_rgba(109,59,245,0.5)]">
        Withdraw
      </button>

      {/* payment method */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-extrabold text-[#14121f]">Payment Method</h2>
        <button className="flex items-center gap-1 text-sm font-bold text-[#6D3BF5]"><Plus className="h-4 w-4" /> Add</button>
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
    </div>
  );
}
