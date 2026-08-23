import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus, DollarSign, CalendarClock, BarChart3, Gift, ShieldCheck, Check } from "lucide-react";
import { AffiliateApplicationForm } from "@/components/amplivanta/affiliate-application-form";
import { MarketingBreadcrumb } from "@/components/amplivanta/marketing-breadcrumb";

export const metadata: Metadata = { title: "Affiliate Application — Amplivanta" };

const BENEFITS = [
  { icon: DollarSign, title: "Earn 20% Commission", desc: "Earn 20% commission on eligible paid subscriptions for up to 12 months." },
  { icon: CalendarClock, title: "90-Day Tracking Window", desc: "We track referrals for 90 days from the first click." },
  { icon: BarChart3, title: "Transparent Reporting", desc: "Access your dashboard to see clicks, sign-ups, and earnings in real time." },
  { icon: Gift, title: "Affiliate Resources", desc: "Get banners, templates, and content to help you promote and succeed." },
  { icon: ShieldCheck, title: "Privacy-Conscious", desc: "We promote with confidence. Your privacy and data security are our priority." },
];
const NEXT = ["We review your application.", "You'll receive an email once our review is complete.", "Once approved, you'll get access to your affiliate dashboard and resources."];

export default function AffiliateApplyPage() {
  return (
    <>
      <section className="bg-white pt-6">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
          <MarketingBreadcrumb items={[["Home", "/"], ["Partners & Affiliates", "/affiliates"], ["Affiliate Program", "/affiliates"], ["Affiliate Application", null]]} />
          <div className="mt-6 text-center">
            <h1 className="font-display text-[44px] font-extrabold leading-tight text-deep-navy">Affiliate Application</h1>
            <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">Join the Amplivanta Affiliate Program and earn commission by referring businesses to the all-in-one growth platform they trust to scale.</p>
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-[1200px] gap-6 px-4 lg:grid-cols-[1.35fr_0.65fr] lg:px-8">
          <AffiliateApplicationForm />
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-white p-5 text-center shadow-card">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><UserPlus className="h-6 w-6" /></span>
              <div className="mt-2 text-[15px] font-bold text-deep-navy">Become an Affiliate</div>
              <p className="text-[12px] text-ink-soft">It&apos;s free to apply. No minimum traffic or sales requirements.</p>
              <div className="mt-4 space-y-3 border-t border-line pt-4 text-left">
                {BENEFITS.map((b) => (
                  <div key={b.title} className="flex gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><b.icon className="h-4 w-4" /></span>
                    <div><div className="text-[12.5px] font-bold text-deep-navy">{b.title}</div><p className="text-[11px] text-ink-soft">{b.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-royal-tint/40 p-5">
              <h3 className="text-[14px] font-bold text-deep-navy">What Happens Next?</h3>
              <ul className="mt-3 space-y-2">
                {NEXT.map((n) => <li key={n} className="flex items-start gap-2 text-[12px] text-ink-soft"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {n}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <h3 className="text-[14px] font-bold text-deep-navy">Questions?</h3>
              <p className="mt-1 text-[12.5px] text-ink-soft">Email us at <span className="font-semibold text-royal-blue">support@amplivanta.com</span> or visit our <Link href="/help" className="font-semibold text-royal-blue">Help Center</Link>.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
