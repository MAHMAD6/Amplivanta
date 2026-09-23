import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { ResetShell } from "@/components/amplivanta/reset-shell";
import { ForgotPasswordForm } from "@/components/amplivanta/auth-flow-forms";

export const metadata: Metadata = {
  title: "Forgot your password?",
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
      <ForgotPasswordForm />

      <div className="mt-8">
        <div className="flex items-center gap-3 text-[11.5px] text-ink-muted">
          <span className="h-px flex-1 bg-line" /> How it works <span className="h-px flex-1 bg-line" />
        </div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center">
              <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-royal-tint text-[12px] font-bold text-royal-blue">{s.n}</span>
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
            <b className="text-ink">Didn&apos;t receive the email?</b> Check your spam folder, then request another link — each new link replaces the previous one.
          </p>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl border border-line p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-violet" />
          <p className="text-[11.5px] leading-relaxed text-ink-soft">
            <b className="text-ink">Reset links are single use.</b> They expire after one hour, and using one signs out other sessions on the account.
          </p>
        </div>
      </div>

      <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-royal-blue">
        <ArrowLeft className="h-4 w-4" /> Back to Sign In
      </Link>
    </ResetShell>
  );
}
