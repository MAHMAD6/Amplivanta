import type { Metadata } from "next";
import Link from "next/link";
import { Check, Mail } from "lucide-react";

export const metadata: Metadata = { title: "Application Submitted" };

export default function AppliedPage() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[640px] px-4 text-center lg:px-8">
        <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50"><span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500 text-emerald-600"><Check className="h-8 w-8" /></span></span>
        <h1 className="mt-8 font-display text-[40px] font-extrabold text-deep-navy">Application Submitted!</h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">Thank you for your interest in joining Amplivanta. We&apos;ve received your application and our team will review it carefully.</p>
        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-line bg-white p-5 text-left shadow-card">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Mail className="h-5 w-5" /></span>
            <div><div className="text-[14px] font-bold text-deep-navy">What happens next?</div><p className="mt-0.5 text-[13px] text-ink-soft">We&apos;ll be in touch if your experience matches our current needs.</p></div>
          </div>
        </div>
        <Link href="/careers" className="mt-8 inline-flex h-12 items-center rounded-xl bg-deep-navy px-6 text-[14px] font-bold text-white hover:bg-deep-panel">Back to Careers</Link>
      </div>
    </section>
  );
}
