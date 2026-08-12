"use client";

import { useState } from "react";
import { Info, Plus, Check, CreditCard } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { PAYMENT_METHODS } from "@/lib/app-data";
import { cn } from "@/lib/utils";

function Field({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[#767287]">{label}</span>
      <input
        defaultValue={value}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#e9e7f0] bg-white px-4 py-3 text-sm text-[#14121f] outline-none focus:border-[#6D3BF5]"
      />
    </label>
  );
}

export default function AddPaymentPage() {
  const [method, setMethod] = useState("bank");
  const [save, setSave] = useState(true);

  return (
    <div className="flex flex-col gap-5 px-5 pb-8">
      <AppHeader title="Add Payment Method" back="/app/checkout" right={<Info className="h-5 w-5 text-[#14121f]" />} />

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

      {/* card art */}
      <div className="relative mx-auto flex h-28 w-44 items-center justify-center rounded-2xl bg-[#e7e9fb]">
        <div className="bg-grad-brand-2 h-16 w-32 rounded-lg shadow-md" />
        <CreditCard className="absolute h-8 w-8 text-white/90" />
        <span className="bg-grad-brand-2 absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full text-white"><Plus className="h-4 w-4" /></span>
      </div>

      {/* card form */}
      <div className="space-y-3">
        <Field label="Card Number" placeholder="0000 0000 0000 0000" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Expire Date" placeholder="MM/YY" />
          <Field label="CVC/CVV" placeholder="123" />
        </div>
        <Field label="Cardholder Name" placeholder="Full name" />
        <Field label="Address" placeholder="Billing address" />
      </div>

      <button onClick={() => setSave(!save)} className="flex items-center gap-2 text-sm font-bold text-[#14121f]">
        <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border", save ? "bg-grad-brand-2 border-transparent" : "border-[#d9d5ea]")}>
          {save && <Check className="h-3 w-3 text-white" />}
        </span>
        Save card
      </button>

      <button className="bg-grad-cta rounded-xl py-3.5 font-bold uppercase tracking-wide text-white shadow-[0_8px_20px_-6px_rgba(109,59,245,0.5)]">
        Add Card
      </button>
    </div>
  );
}
