"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function AppLoginPage() {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-1 flex-col px-6 pb-8 pt-16">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#14121f]">
        Social<span className="text-gradient">Earn</span>
      </h1>
      <h2 className="mt-6 font-display text-3xl font-extrabold leading-tight text-[#14121f]">
        Sign in to your Account
      </h2>
      <p className="mt-2 text-sm text-[#767287]">Enter your email and password to log in</p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-[#767287]">Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-[#e9e7f0] bg-white px-4 py-3.5 text-sm text-[#14121f] outline-none focus:border-[#6D3BF5]"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-[#767287]">Password</span>
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
        <div className="text-right">
          <button className="text-sm font-bold text-[#6D3BF5]">Forgot Password?</button>
        </div>
      </div>

      <Link href="/app" className="bg-grad-cta mt-4 rounded-xl py-3.5 text-center font-bold text-white shadow-[0_8px_20px_-6px_rgba(109,59,245,0.5)]">
        Log In
      </Link>

      <div className="my-6 flex items-center gap-3 text-xs text-[#a8a4b8]">
        <span className="h-px flex-1 bg-[#e9e7f0]" /> Or <span className="h-px flex-1 bg-[#e9e7f0]" />
      </div>

      <div className="space-y-3">
        {["Continue with Google", "Continue with Facebook"].map((label) => (
          <button key={label} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e9e7f0] bg-white py-3.5 text-sm font-bold text-[#14121f]">
            {label}
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-[#767287]">
        Don&apos;t have an account? <Link href="/app/signup" className="font-bold text-[#6D3BF5]">Sign Up</Link>
      </p>
    </div>
  );
}
