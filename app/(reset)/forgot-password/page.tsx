import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { ResetShell } from "@/components/amplivanta/reset-shell";

export const metadata: Metadata = {
  title: "Forgot your password? — Amplivanta",
  description: "Enter your email and we'll send you a secure password reset link.",
};

const STEPS = [
  { n: "1", title: "Enter email", desc: "Provide your registered work email address." },
  { n: "2", title: "Check inbox", desc: "Look for a password reset link in your inbox." },
  { n: "3", title: "Create new password", desc: "Follow the link to set a new, secure password." },
];

export default function ForgotPasswordPage() {
  return (
    <ResetShell heading="Reset your password with" accent="confidence.">
      <h2 className="font-display text-[30px] font-extrabold text-ink">Forgot your password?</h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
        Enter your email address and we&apos;ll send you a secure password reset link.
      </p>

      <form className="mt-7 space-y-5">
        <div>
          <label htmlFor="reset-email" className="mb-1.5 block text-[12.5px] font-bold text-ink">
            Work Email
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-3 focus-within:border-violet">
            <Mail className="h-4 w-4 text-ink-muted" />
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your work email"
              className="min-w-0 flex-1 bg-transparent text-[13.5px] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-between rounded-xl bg-orange-cta px-5 py-3.5 text-[14px] font-bold text-white transition hover:bg-orange-cta-hover"
        >
          Send Reset Link
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>

        <Link href="/login" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-royal-blue">
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
        </Link>
      </form>

      <div className="mt-8">
        <div className="flex items-center gap-3 text-[11.5px] text-ink-muted">
          <span className="h-px flex-1 bg-line" /> How it works <span className="h-px flex-1 bg-line" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center">
              <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-royal-tint text-[12px] font-bold text-royal-blue">
                {s.n}
              </span>
              <div className="mt-2 text-[12px] font-bold text-ink">{s.title}</div>
              <p className="mt-1 text-[10.5px] leading-relaxed text-ink-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex items-start gap-2.5 rounded-xl border border-line p-3">
          <Mail className="mt-0.5 h-4 w-4 text-violet" />
          <p className="text-[11.5px] leading-relaxed text-ink-soft">
            <b className="text-ink">Didn&apos;t receive the email?</b> Check your spam folder, or{" "}
            <button className="font-semibold text-royal-blue">resend the link</button>.
          </p>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl border border-line p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-violet" />
          <p className="text-[11.5px] leading-relaxed text-ink-soft">
            <b className="text-ink">Protected by secure authentication.</b> We use industry-standard
            security protocols to keep your account and data safe and private.
          </p>
        </div>
      </div>
    </ResetShell>
  );
}
