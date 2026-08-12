"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscribed to Impressa Insights!", {
      description: "You'll receive our monthly digital strategy & growth digest.",
    });
    setEmail("");
  };

  return (
    <form onSubmit={onSubmit} className="mt-4 flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        aria-label="Email address"
        className="w-full rounded-full border border-[#26233a] bg-[#0d0b18] px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#6D3BF5] focus:outline-none"
      />
      <button
        type="submit"
        className="whitespace-nowrap rounded-full bg-[#6D3BF5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5B2FE0]"
      >
        Subscribe
      </button>
    </form>
  );
}
