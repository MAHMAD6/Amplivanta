import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ResetShell } from "@/components/amplivanta/reset-shell";
import { ResetPasswordForm } from "@/components/amplivanta/auth-flow-forms";

export const metadata: Metadata = {
  title: "Create a new password",
  description: "Choose a new, secure password to regain access to your account.",
};

export default function ResetPasswordPage() {
  return (
    <ResetShell heading="Set a new password with" accent="confidence.">
      <Suspense fallback={<p className="text-[13.5px] text-ink-soft">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>

      <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-line p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 text-violet" />
        <p className="text-[11.5px] leading-relaxed text-ink-soft">
          <b className="text-ink">Use at least 8 characters</b> and a password you have not used before. Longer passphrases are stronger than short, complex ones.
        </p>
      </div>

      <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-royal-blue">
        <ArrowLeft className="h-4 w-4" /> Back to Sign In
      </Link>
    </ResetShell>
  );
}
