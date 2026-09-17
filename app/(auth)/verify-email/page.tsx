import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/layout/LogoMark";
import { VerifyEmailPanel } from "@/components/amplivanta/auth-flow-forms";

export const metadata: Metadata = { title: "Confirm your email" };

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-soft px-4 py-12">
      <Link href="/" className="mb-6 flex items-center gap-2.5 text-deep-navy">
        <LogoMark className="h-10 w-10" gradientId="amp-mark-verify-email" />
        <span className="text-[18px] font-extrabold tracking-wide">AMPLIVANTA</span>
      </Link>
      <div className="w-full max-w-[460px]">
        <Suspense fallback={<div className="rounded-2xl border border-line bg-white p-8 text-[14px] text-ink-soft">Loading…</div>}>
          <VerifyEmailPanel />
        </Suspense>
      </div>
      <p className="mt-6 text-[12px] text-ink-muted">© {new Date().getFullYear()} Amplivanta Inc.</p>
    </div>
  );
}
