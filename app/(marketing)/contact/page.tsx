import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Users, ShieldCheck, Mail, CalendarCheck, LifeBuoy, HelpCircle, ArrowRight, Rocket, Handshake } from "lucide-react";
import { MarketingContactForm } from "@/components/amplivanta/marketing-contact-form";
import { LogoMark } from "@/components/layout/LogoMark";

export const metadata: Metadata = { title: "Contact" };

const POINTS = [
  { icon: MessageSquare, title: "Here to Help", desc: "We're here to support you at every step." },
  { icon: Users, title: "Human Support", desc: "Real people ready to help you succeed." },
  { icon: ShieldCheck, title: "Your Privacy Matters", desc: "We handle your information in accordance with our Privacy Policy." },
];
const REACH = [
  { icon: Mail, title: "Email Us", desc: "Send us an email and our team will reach out.", link: null },
  { icon: CalendarCheck, title: "Book a Demo", desc: "See Amplivanta in action.", link: ["Schedule a demo", "/demo"] as const },
  { icon: LifeBuoy, title: "Visit our Help Center", desc: "Find answers to common questions and get support.", link: ["Go to Help Center", "/help"] as const },
  { icon: HelpCircle, title: "General Inquiries", desc: "Have a question about pricing, features, or our platform?", link: ["Contact our team", "#form"] as const },
];
const JOURNEY = [
  { icon: Rocket, title: "Explore Solutions", desc: "Discover how our platform and solutions can help you engineer growth.", link: ["View Solutions", "/solutions"] as const },
  { icon: Handshake, title: "Partner With Us", desc: "Interested in becoming a partner or referral partner?", link: ["Learn More", "/company"] as const },
  { icon: HelpCircle, title: "General Inquiries", desc: "Questions about pricing, features, or Amplivanta in general?", link: ["Contact Sales", "#form"] as const },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-royal-tint/60 to-white">
        <div className="mx-auto grid grid-cols-1 max-w-[1200px] items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-royal-blue">Contact Us</span>
            <h1 className="mt-3 font-display text-[44px] font-extrabold leading-[1.05] text-deep-navy lg:text-[52px]">
              Let&apos;s Engineer<br /><span className="text-royal-blue">Growth Together.</span>
            </h1>
            <p className="mt-5 max-w-[440px] text-[15px] leading-relaxed text-ink-soft">
              Have a question, need a demo, or want to explore how Amplivanta can help your business grow? Our team is here to listen and help.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {POINTS.map((p) => (
                <div key={p.title}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><p.icon className="h-5 w-5" /></span>
                  <div className="mt-3 text-[13.5px] font-bold text-deep-navy">{p.title}</div>
                  <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Envelope illustration */}
          <div className="relative hidden justify-center lg:flex">
            <div className="relative h-64 w-80">
              <div className="absolute inset-x-6 bottom-0 h-40 rounded-2xl bg-gradient-to-br from-royal-blue to-royal-soft shadow-card-lg" />
              <div className="absolute inset-x-12 bottom-8 h-32 rounded-xl bg-white shadow-card">
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <LogoMark className="h-10 w-10" />
                  <div className="h-1.5 w-28 rounded bg-line" />
                  <div className="h-1.5 w-20 rounded bg-line" />
                </div>
              </div>
              <div className="absolute inset-x-6 bottom-0 h-24" style={{ clipPath: "polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)", background: "linear-gradient(135deg,#1D5FD6,#3D7DEA)" }} />
              <div className="absolute -right-2 bottom-6 flex h-14 w-14 items-center justify-center rounded-full bg-royal-blue text-white shadow-card-lg"><ArrowRight className="h-6 w-6 -rotate-45" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Form + reach */}
      <section id="form" className="bg-white py-14">
        <div className="mx-auto grid grid-cols-1 max-w-[1200px] gap-6 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <MarketingContactForm />
          <div className="rounded-3xl border border-line bg-white p-6 shadow-card lg:p-8">
            <h2 className="font-display text-2xl font-extrabold text-deep-navy">Other ways to reach us</h2>
            <div className="mt-5 divide-y divide-line">
              {REACH.map((r) => (
                <div key={r.title} className="flex gap-3 py-4 first:pt-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><r.icon className="h-5 w-5" /></span>
                  <div>
                    <div className="text-[14px] font-bold text-deep-navy">{r.title}</div>
                    <p className="mt-0.5 text-[12.5px] text-ink-soft">{r.desc}</p>
                    {r.link && <Link href={r.link[1]} className="mt-1 inline-flex items-center gap-1 text-[12.5px] font-semibold text-royal-blue">{r.link[0]} <ArrowRight className="h-3.5 w-3.5" /></Link>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey band */}
      <section className="bg-white pb-16">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
          <div className="rounded-3xl bg-royal-tint/50 p-8">
            <h3 className="text-center font-display text-2xl font-extrabold text-deep-navy">We&apos;re here for every stage of your journey.</h3>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {JOURNEY.map((j) => (
                <div key={j.title} className="text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-royal-blue shadow-card"><j.icon className="h-5 w-5" /></span>
                  <div className="mt-3 text-[14px] font-bold text-deep-navy">{j.title}</div>
                  <p className="mt-1 text-[12.5px] text-ink-soft">{j.desc}</p>
                  <Link href={j.link[1]} className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-royal-blue">{j.link[0]} <ArrowRight className="h-3.5 w-3.5" /></Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
