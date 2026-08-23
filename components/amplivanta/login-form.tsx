"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { GradientButton } from "./brand-gradient";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/app";
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
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink">Email</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-semibold text-ink">Password</label>
          <Link href="/forgot-password" className="text-xs font-semibold text-violet hover:underline">
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <input
            name="password"
            type={showPw ? "text" : "password"}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 pr-10 text-sm focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-muted"
            aria-label="Toggle password visibility"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input type="checkbox" className="h-4 w-4 rounded border-line accent-violet" />
        Keep me signed in
      </label>

      <GradientButton as="button" size="lg" className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
      </GradientButton>

      <p className="text-center text-xs text-ink-muted">
        Demo · <span className="font-mono">owner@amplivanta.com</span> / <span className="font-mono">amplivanta123</span>
      </p>
    </form>
  );
}
