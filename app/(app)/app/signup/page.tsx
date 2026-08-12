"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-[#767287]">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#e9e7f0] bg-white px-4 py-3.5 text-sm text-[#14121f] outline-none focus:border-[#6D3BF5]"
      />
    </label>
  );
}

export default function AppSignupPage() {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-1 flex-col px-6 pb-8 pt-8">
      <Link href="/app/login" aria-label="Back" className="mb-6 flex h-9 w-9 items-center justify-center rounded-full text-[#14121f] hover:bg-[#f8f7fb]">
        <ChevronLeft className="h-5 w-5" />
      </Link>

      <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#14121f]">Sign up</h1>
      <p className="mt-2 text-sm text-[#767287]">Create an account to continue!</p>

      <div className="mt-6 space-y-4">
        <Field label="Full Name" placeholder="Your name" />
        <Field label="Email" placeholder="you@example.com" type="email" />
        <Field label="Phone Number" placeholder="(454) 726-0592" type="tel" />
        <label className="block">
          <span className="mb-1 block text-sm text-[#767287]">Set Password</span>
          <div className="flex items-center rounded-xl border border-[#e9e7f0] bg-white px-4 focus-within:border-[#6D3BF5]">
            <input
              type={show ? "text" : "password"}
              placeholder="••••••••"
              className="flex-1 bg-transparent py-3.5 text-sm text-[#14121f] outline-none"
            />
            <button onClick={() => setShow(!show)} aria-label="Toggle password" className="text-[#a8a4b8]">
              {show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
        </label>
      </div>

      <Link href="/app" className="bg-grad-cta mt-6 rounded-xl py-3.5 text-center font-bold text-white shadow-[0_8px_20px_-6px_rgba(109,59,245,0.5)]">
        Register
      </Link>

      <p className="mt-8 text-center text-sm text-[#767287]">
        Already have an account? <Link href="/app/login" className="font-bold text-[#6D3BF5]">Login</Link>
      </p>
    </div>
  );
}
