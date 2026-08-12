"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Toaster } from "sonner";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SITE_SHORT } from "@/lib/constants";
import { LogoMark } from "@/components/layout/LogoMark";
import { toast } from "@/lib/toast";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      toast.error("Authentication Failed", { description: "Invalid credentials. Please verify your email and password." });
      return;
    }
    toast.success("Welcome Back", { description: "Redirecting to your Admin Dashboard..." });
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#26233a] bg-white p-8 shadow-2xl">
      <div className="flex items-center justify-center gap-2.5">
        <LogoMark className="h-9 w-9" />
        <span className="font-display text-2xl font-bold tracking-tight text-[#14121f]">{SITE_SHORT}</span>
      </div>
      <h1 className="mt-6 text-center font-display text-xl font-bold text-[#14121f]">Admin Login</h1>
      <p className="mt-1 text-center text-sm text-[#4a4756]">Sign in to manage your site</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#14121f]">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-3 text-sm focus:border-[#6D3BF5] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#14121f]">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-4 py-3 text-sm focus:border-[#6D3BF5] focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#6D3BF5] px-6 py-3 font-semibold text-white transition hover:bg-[#5B2FE0] disabled:opacity-60"
        >
          {loading && <LoadingSpinner className="text-black" />}
          Sign In
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0b18] px-4">
      <Suspense fallback={<LoadingSpinner />}>
        <LoginForm />
      </Suspense>
      <Toaster position="top-right" theme="dark" closeButton gap={12} />
    </div>
  );
}
