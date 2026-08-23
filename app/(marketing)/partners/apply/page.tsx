import type { Metadata } from "next";
import Link from "next/link";
import { Users2, TrendingUp, GraduationCap, DollarSign, Mail } from "lucide-react";
import { PartnerApplicationForm } from "@/components/amplivanta/partner-application-form";
import { MarketingBreadcrumb } from "@/components/amplivanta/marketing-breadcrumb";

export const metadata: Metadata = { title: "Partner Application — Amplivanta" };

const WHY = [
  { icon: Users2, title: "Pursue New Opportunities", desc: "Help businesses discover new customer opportunities and drive meaningful outcomes with Amplivanta." },
  { icon: TrendingUp, title: "Integrated Growth Platform", desc: "Deliver impact with our AI-powered platform designed to support connected marketing, automation, and growth workflows." },
  { icon: GraduationCap, title: "Resources & Enablement", desc: "Access program resources, guidance, and enablement materials to help you get started." },
  { icon: DollarSign, title: "Grow Together", desc: "Build a sustainable, long-term partnership focused on shared success." },
];
const NEXT = [
  { title: "Application Review", desc: "Our team will review your application and be in touch." },
  { title: "Intro Call (If needed)", desc: "We may schedule a short call to learn more about your business." },
  { title: "Approval & Onboarding", desc: "Once approved, we'll onboard you and help you get started." },
];

export default function PartnerApplyPage() {
  return (
    <>
      <section className="bg-deep-navy text-white">
        <div className="mx-auto max-w-[1200px] px-4 pt-6 lg:px-8">
          <MarketingBreadcrumb items={[["Home", "/"], ["Partners & Affiliates", "/partners"], ["Partner Program", "/partners"], ["Partner Application", null]]} />
        </div>
        <div className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8">
          <h1 className="font-display text-[40px] font-extrabold leading-[1.05] lg:text-[46px]">Apply to Become an <span className="bg-gradient-to-r from-royal-soft to-pink-brand bg-clip-text text-transparent">Amplivanta Partner</span></h1>
          <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-white/70">Join a global network of agencies, consultants, and technology experts helping businesses engineer growth with Amplivanta. Tell us about your business and how you&apos;d like to work with us.</p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-[1200px] gap-6 px-4 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
          <PartnerApplicationForm />
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <h2 className="text-[15px] font-bold text-deep-navy">Why Partner with Amplivanta?</h2>
              <div className="mt-4 space-y-4">
                {WHY.map((w) => (
                  <div key={w.title} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><w.icon className="h-5 w-5" /></span>
                    <div><div className="text-[13px] font-bold text-deep-navy">{w.title}</div><p className="mt-0.5 text-[11.5px] text-ink-soft">{w.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <h2 className="text-[15px] font-bold text-deep-navy">What happens next?</h2>
              <div className="mt-4 space-y-4">
                {NEXT.map((n, i) => (
                  <div key={n.title} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-royal-blue text-[12px] font-bold text-white">{i + 1}</span>
                    <div><div className="text-[13px] font-bold text-deep-navy">{n.title}</div><p className="mt-0.5 text-[11.5px] text-ink-soft">{n.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <h2 className="text-[14px] font-bold text-deep-navy">Questions?</h2>
              <p className="mt-1 text-[12.5px] text-ink-soft">We&apos;re here to help.</p>
              <Link href="/contact" className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-royal-blue"><Mail className="h-4 w-4" /> support@amplivanta.com</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
