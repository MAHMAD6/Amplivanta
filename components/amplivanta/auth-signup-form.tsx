"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Building2, Check, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const FREE_FEATURES = ["1 user", "250 contacts", "500 emails/month", "1 landing page", "1 subdomain", "Basic reports", "Basic templates"];

export function AuthSignupForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"Individual" | "Company">("Individual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const name = email.split("@")[0] || "New user";
    const { error: authError } = await authClient.signUp.email({ name, email, password: String(fd.get("password")) });
    if (authError) {
      setLoading(false);
      setError(authError.message || "Signup failed");
      return;
    }
    setLoading(false);
    router.push("/app");
  }

  return (
    <div>
      <h1 className="font-display text-[40px] font-extrabold leading-none text-deep-navy">Create your account</h1>
      <p className="mt-2 text-[15px] text-ink-soft">Get started with Amplivanta for free.</p>

      {/* Account type */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {(["Individual", "Company"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-xl border-2 px-4 py-3 text-center transition ${mode === m ? "border-royal-blue bg-royal-blue text-white" : "border-line bg-white text-deep-navy hover:border-royal-blue/40"}`}>
            <div className="flex items-center justify-center gap-2 text-[15px] font-bold">{m === "Individual" ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />} {m}</div>
            <div className={`text-[11.5px] ${mode === m ? "text-white/80" : "text-ink-muted"}`}>{m === "Individual" ? "For me" : "For my business"}</div>
          </button>
        ))}
      </div>

      {/* Free plan card */}
      <div className="mt-4 rounded-2xl border border-line bg-bg-soft/40 p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[17px] font-bold text-deep-navy">Free Plan</div>
            <div className="text-[12.5px] text-ink-soft">Explore the platform and get started.</div>
          </div>
          <div className="text-right"><span className="text-[28px] font-extrabold text-deep-navy">$0</span><span className="text-[12px] text-ink-muted">/month</span><div className="text-[11px] text-ink-muted">No credit card required</div></div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
          {FREE_FEATURES.map((f) => <div key={f} className="flex items-center gap-2 text-[12.5px] text-ink-soft"><Check className="h-3.5 w-3.5 shrink-0 text-royal-blue" /> {f}</div>)}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">{error}</div>}
        <input type="hidden" name="accountType" value={mode} />
        <div>
          <label className="mb-1 block text-[13px] font-semibold text-deep-navy">Email Address</label>
          <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/20" />
        </div>
        <div>
          <label className="mb-1 block text-[13px] font-semibold text-deep-navy">Password</label>
          <input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="Create a strong password" className="h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/20" />
          <p className="mt-1 text-[11.5px] text-ink-muted">8+ characters with a mix of letters, numbers &amp; symbols</p>
        </div>
        <label className="flex items-start gap-2 text-[13px] text-ink-soft">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-royal-blue" />
          <span>I agree to the <Link href="/legal/terms" className="font-semibold text-royal-blue hover:underline">Terms of Service</Link> and acknowledge the <Link href="/legal/privacy" className="font-semibold text-royal-blue hover:underline">Privacy Policy</Link>.</span>
        </label>
        <button type="submit" disabled={loading} className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-emerald-600 text-[15px] font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create My Free Account"}
        </button>
        <p className="text-center text-[13px] text-ink-soft">Already have an account? <Link href="/login" className="font-bold text-royal-blue hover:underline">Sign in</Link></p>
      </form>
    </div>
  );
}
