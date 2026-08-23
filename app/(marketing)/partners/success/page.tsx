import type { Metadata } from "next";
import Link from "next/link";
import { Check, FileSearch, Mail, UserCheck, ChevronRight, Headphones } from "lucide-react";
import { MarketingBreadcrumb } from "@/components/amplivanta/marketing-breadcrumb";

export const metadata: Metadata = { title: "Application Received — Amplivanta" };

const STEPS = [
  { icon: FileSearch, title: "Review", desc: "Our team reviews your application for program eligibility and fit." },
  { icon: Mail, title: "Response", desc: "We'll email you with an update as soon as our review is complete." },
  { icon: UserCheck, title: "Get Started", desc: "Once approved, you'll get access to your dashboard and program resources." },
];

export default function ApplicationSuccessPage() {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-[900px] px-4 lg:px-8">
        <MarketingBreadcrumb items={[["Home", "/"], ["Partners & Affiliates", "/partners"], ["Application Success", null]]} />
        <div className="mt-10 text-center">
          <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50"><span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500 text-emerald-600"><Check className="h-8 w-8" /></span></span>
          <h1 className="mt-6 font-display text-[40px] font-extrabold text-deep-navy">Application Received!</h1>
          <p className="mt-3 text-[16px] text-ink-soft">Thank you for your interest in the Amplivanta <span className="font-semibold text-royal-blue">Partner or Affiliate Program.</span></p>
          <p className="mx-auto mt-2 max-w-lg text-[14px] leading-relaxed text-ink-soft">We&apos;ve received your application and our team will review it carefully. You&apos;ll hear from us at the email you provided.</p>
        </div>

        <div className="mt-12">
          <h2 className="text-center text-[18px] font-bold text-deep-navy">What happens next?</h2>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex items-center gap-4">
                <div className="max-w-[190px] text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><s.icon className="h-6 w-6" /></span>
                  <div className="mt-2 text-[13.5px] font-bold text-deep-navy">{i + 1}. {s.title}</div>
                  <p className="mt-1 text-[12px] text-ink-soft">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && <ChevronRight className="hidden h-5 w-5 shrink-0 text-ink-muted sm:block" />}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex gap-3 rounded-2xl bg-royal-tint/40 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-royal-blue shadow-card"><Headphones className="h-5 w-5" /></span>
          <div><div className="text-[14px] font-bold text-deep-navy">Need help?</div><p className="mt-0.5 text-[13px] text-ink-soft">If you have any questions in the meantime, we&apos;re here for you. Email us at <span className="font-semibold text-royal-blue">support@amplivanta.com</span> or visit our <Link href="/help" className="font-semibold text-royal-blue">Help Center</Link>.</p></div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/partners" className="inline-flex h-12 items-center gap-2 rounded-xl bg-royal-blue px-6 text-[14px] font-bold text-white hover:bg-royal-soft">Back to Partners &amp; Affiliates <ChevronRight className="h-4 w-4" /></Link>
          <div className="mt-3"><Link href="/" className="inline-flex items-center gap-1 text-[13px] font-semibold text-royal-blue">Explore Amplivanta <ChevronRight className="h-4 w-4" /></Link></div>
        </div>
      </div>
    </section>
  );
}
