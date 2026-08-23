import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { ResetShell } from "@/components/amplivanta/reset-shell";

export const metadata: Metadata = {
  title: "Create a new password — Amplivanta",
  description: "Choose a new, secure password to regain access to your account.",
};

const RULES = [
  "At least 8 characters",
  "One uppercase and one lowercase letter",
  "At least one number",
  "At least one symbol",
];

export default function ResetPasswordPage() {
  return (
    <ResetShell heading="Set a new password with" accent="confidence.">
      <h2 className="font-display text-[30px] font-extrabold text-ink">Create new password</h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
        Choose a strong password you haven&apos;t used before to secure your account.
      </p>

      <form className="mt-7 space-y-5">
        <div>
          <label htmlFor="new-password" className="mb-1.5 block text-[12.5px] font-bold text-ink">
            New Password
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-3 focus-within:border-violet">
            <Lock className="h-4 w-4 text-ink-muted" />
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter a new password"
              className="min-w-0 flex-1 bg-transparent text-[13.5px] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirm-password" className="mb-1.5 block text-[12.5px] font-bold text-ink">
            Confirm Password
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-3 focus-within:border-violet">
            <Lock className="h-4 w-4 text-ink-muted" />
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              className="min-w-0 flex-1 bg-transparent text-[13.5px] focus:outline-none"
            />
          </div>
        </div>

        <ul className="space-y-1.5 rounded-xl border border-line bg-bg-soft p-3.5">
          {RULES.map((r) => (
            <li key={r} className="flex items-center gap-2 text-[12px] text-ink-soft">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                <Check className="h-3 w-3" />
              </span>
              {r}
            </li>
          ))}
        </ul>

        <button
          type="submit"
          className="flex w-full items-center justify-between rounded-xl bg-orange-cta px-5 py-3.5 text-[14px] font-bold text-white transition hover:bg-orange-cta-hover"
        >
          Set New Password
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>

        <Link href="/login" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-royal-blue">
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
        </Link>
      </form>
    </ResetShell>
  );
}
