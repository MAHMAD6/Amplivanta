"use client";

import { useState } from "react";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thanks for subscribing!");
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
        className="w-full rounded-full border border-[#2A4A38] bg-[#0F2A1D] px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#B5FF2D] focus:outline-none"
      />
      <button
        type="submit"
        className="whitespace-nowrap rounded-full bg-[#B5FF2D] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#a0e828]"
      >
        Subscribe
      </button>
    </form>
  );
}
