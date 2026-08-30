"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export function AuthSignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Accept `next` (also legacy `callbackUrl`), but only allow same-site paths —
  // reject absolute/protocol-relative URLs to prevent open-redirect.
  const rawNext = params.get("next") || params.get("callbackUrl") || "/app";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/app";
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const { error: authError } = await authClient.signIn.email({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setLoading(false);
    if (authError) {
      setError(authError.message || "Invalid email or password.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-card lg:p-8">
      <h2 className="text-[20px] font-bold text-deep-navy">Sign in to your account</h2>
      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">{error}</div>}

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-deep-navy">Email address</label>
          <div className="flex h-12 items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-royal-blue focus-within:ring-2 focus-within:ring-royal-blue/20">
            <Mail className="h-4 w-4 text-ink-muted" />
            <input name="email" type="email" required autoComplete="email" placeholder="Enter your email address" className="min-w-0 flex-1 bg-transparent text-[14px] focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-deep-navy">Password</label>
          <div className="flex h-12 items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-royal-blue focus-within:ring-2 focus-within:ring-royal-blue/20">
            <Lock className="h-4 w-4 text-ink-muted" />
            <input name="password" type={showPw ? "text" : "password"} required autoComplete="current-password" placeholder="Enter your password" className="min-w-0 flex-1 bg-transparent text-[14px] focus:outline-none" />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="text-ink-muted hover:text-ink" aria-label="Toggle password">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-1.5 text-right">
            <Link href="/forgot-password" className="text-[12.5px] font-semibold text-royal-blue hover:underline">Forgot password?</Link>
          </div>
        </div>

        <label className="flex items-center gap-2 text-[13px] text-ink-soft">
          <input type="checkbox" name="remember" className="h-4 w-4 accent-royal-blue" /> Remember me
        </label>

        <button type="submit" className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-royal-blue text-[15px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-60" disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
        </button>

        <div className="flex items-center gap-2 pt-1">
          <span className="h-px flex-1 bg-line" />
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-deep-navy"><ShieldCheck className="h-4 w-4 text-royal-blue" /> Secure authentication</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <p className="text-center text-[12px] leading-relaxed text-ink-muted">We use industry-leading security to keep your account and data safe.</p>
      </form>
    </div>
  );
}
