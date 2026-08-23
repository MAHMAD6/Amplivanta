import type { Metadata } from "next";
import Link from "next/link";
import { Percent, CalendarClock, BarChart3, TrendingUp, RefreshCw, ShieldCheck, Layers, Headphones, PieChart, Users2, UserPlus, Link2, UserCheck, DollarSign, Gift, PenSquare, Megaphone, Building2, ArrowRight, Check } from "lucide-react";
import { LogoMark } from "@/components/layout/LogoMark";
import { MarketingBreadcrumb } from "@/components/amplivanta/marketing-breadcrumb";

export const metadata: Metadata = { title: "Affiliate Program — Amplivanta" };

const WHY = [
  { icon: TrendingUp, title: "Growth Focused", desc: "Help businesses improve marketing, automate workflows, and drive sustainable growth." },
  { icon: RefreshCw, title: "Recurring Earnings", desc: "Earn 20% commission on eligible paid subscriptions for up to 12 months." },
  { icon: ShieldCheck, title: "Built with Care", desc: "We follow industry standards to help protect data and maintain reliability." },
  { icon: Layers, title: "All-in-One Platform", desc: "Powerful marketing, sales, and automation tools businesses use every day." },
  { icon: Headphones, title: "Affiliate Support", desc: "Helpful guidance and program support when you need it." },
  { icon: PieChart, title: "Performance Insights", desc: "Track referrals, sign-ups, and earnings in your affiliate dashboard." },
];
const STEPS = [
  { icon: UserPlus, title: "Join", desc: "Sign up for free and get instant access to your affiliate dashboard." },
  { icon: Link2, title: "Share", desc: "Get your unique affiliate link and share it with your audience." },
  { icon: UserCheck, title: "They Sign Up", desc: "When someone subscribes to a paid plan, you earn commission." },
  { icon: DollarSign, title: "You Get Paid", desc: "Earn 20% commission on eligible paid subscriptions for up to 12 months." },
];
const WHO = [
  { icon: Megaphone, title: "Marketing Affiliates", desc: "Recommend Amplivanta to your audience and earn." },
  { icon: Users2, title: "Consultants & Coaches", desc: "Share the platform you trust and get rewarded." },
  { icon: PenSquare, title: "Content Creators & Bloggers", desc: "Create content your audience loves — and earn." },
  { icon: ShieldCheck, title: "SaaS Reviewers & Influencers", desc: "Help your audience discover the right tools." },
  { icon: Building2, title: "Business Owners", desc: "Refer other businesses and earn recurring income." },
];
const FAQ = ["How much commission can I earn?", "When and how do I get paid?", "What products are eligible?", "How does the 90-day referral tracking window work?", "Can I promote Amplivanta in paid ads?"];
const GUIDELINES = ["Promote Amplivanta honestly and ethically.", "Do not use misleading claims or unauthorized brand terms.", "You may not bid on Amplivanta's brand keywords or trademarks.", "Payouts are subject to valid referrals, refunds, and chargebacks."];

export default function AffiliatesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-deep-navy text-white">
        <div className="mx-auto max-w-[1200px] px-4 pt-6 lg:px-8">
          <MarketingBreadcrumb items={[["Home", "/"], ["Partners & Affiliates", "/affiliates"], ["Affiliate Program", null]]} />
        </div>
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:px-8">
          <div>
            <h1 className="font-display text-[42px] font-extrabold leading-[1.05] lg:text-[50px]">Amplivanta <span className="bg-gradient-to-r from-royal-soft to-pink-brand bg-clip-text text-transparent">Affiliate Program</span></h1>
            <p className="mt-4 max-w-[440px] text-[15px] leading-relaxed text-white/70">Refer businesses to Amplivanta and earn commission when they grow with our all-in-one growth platform.</p>
            <div className="mt-6 flex flex-wrap gap-6">
              {[[Percent, "Earn 20% commission on eligible paid subscriptions for up to 12 months."], [CalendarClock, "90-day referral tracking window."], [BarChart3, "Payouts with clear reporting."]].map(([Icon, t], i) => (
                <div key={i} className="flex max-w-[180px] items-start gap-2 text-[12px] text-white/70">{typeof Icon !== "string" && <Icon className="mt-0.5 h-5 w-5 shrink-0 text-royal-soft" />}<span>{t as string}</span></div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/affiliates/apply" className="inline-flex h-12 items-center gap-2 rounded-xl bg-royal-blue px-6 text-[14px] font-bold text-white hover:bg-royal-soft">Join the Affiliate Program</Link>
              <Link href="/login" className="inline-flex h-12 items-center rounded-xl border border-white/30 px-6 text-[14px] font-bold text-white hover:bg-white/10">Log in to Your Account</Link>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-[12px] text-white/60"><ShieldCheck className="h-4 w-4" /> The program is free to join. There are no minimum traffic or sales requirements.</p>
          </div>
          <div className="hidden justify-center lg:flex">
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-16">
                <Node icon={Users2} label="You Refer" />
                <Node icon={Building2} label="They Grow" />
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/15 bg-white/5"><LogoMark className="h-12 w-12" /></div>
              <Node icon={DollarSign} label="You Earn" />
            </div>
          </div>
        </div>
      </section>

      {/* Why promote */}
      <Section title="Why Promote Amplivanta?" sub="A complete growth platform businesses rely on — and an affiliate program that rewards you.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.title} className="rounded-2xl border border-line bg-white p-5 text-center shadow-card">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><w.icon className="h-6 w-6" /></span>
              <div className="mt-3 text-[14px] font-bold text-deep-navy">{w.title}</div>
              <p className="mt-1 text-[12px] leading-snug text-ink-soft">{w.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* How it works + who can join */}
      <section className="bg-white py-8">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-deep-navy">How It Works</h2>
            <p className="mt-1 text-[13px] text-ink-soft">Simple steps to start earning.</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {STEPS.map((s, i) => (
                <div key={s.title}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal-tint text-royal-blue"><s.icon className="h-5 w-5" /></span>
                  <div className="mt-2 text-[13px] font-bold text-deep-navy">{i + 1}. {s.title}</div>
                  <p className="mt-0.5 text-[11.5px] text-ink-soft">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-royal-tint/40 p-4"><Gift className="h-5 w-5 shrink-0 text-royal-blue" /><div><div className="text-[12.5px] font-bold text-deep-navy">Affiliate Resources</div><p className="text-[11.5px] text-ink-soft">Access banners, emails, templates, and helpful content to promote Amplivanta and grow your earnings.</p></div></div>
          </div>
          <div>
            <h2 className="font-display text-2xl font-extrabold text-deep-navy">Who Can Join?</h2>
            <p className="mt-1 text-[13px] text-ink-soft">Our program is open to a variety of affiliates, including:</p>
            <div className="mt-6 space-y-3">
              {WHO.map((w) => (
                <div key={w.title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-royal-tint text-royal-blue"><w.icon className="h-4 w-4" /></span>
                  <div><div className="text-[13px] font-bold text-deep-navy">{w.title}</div><p className="text-[11.5px] text-ink-soft">{w.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ + guidelines + CTA */}
      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-[1200px] gap-4 px-4 lg:grid-cols-3 lg:px-8">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <h3 className="text-[15px] font-bold text-deep-navy">Frequently Asked Questions</h3>
            <div className="mt-3 divide-y divide-line">
              {FAQ.map((q) => <div key={q} className="flex items-center justify-between py-2.5 text-[12.5px] text-ink-soft">{q}<span className="text-ink-muted">⌄</span></div>)}
            </div>
            <Link href="#" className="mt-2 inline-block text-[12px] font-semibold text-royal-blue">View all FAQs →</Link>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <h3 className="text-[15px] font-bold text-deep-navy">Program Guidelines</h3>
            <ul className="mt-3 space-y-2.5">
              {GUIDELINES.map((g) => <li key={g} className="flex items-start gap-2 text-[12.5px] text-ink-soft"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {g}</li>)}
            </ul>
            <Link href="/affiliates/terms" className="mt-3 inline-block text-[12px] font-semibold text-royal-blue">Read Full Terms &amp; Conditions →</Link>
          </div>
          <div className="rounded-2xl bg-deep-navy p-6 text-white">
            <h3 className="font-display text-xl font-extrabold">Ready to Earn with Amplivanta?</h3>
            <p className="mt-2 text-[13px] text-white/70">Join our affiliate program today and turn your influence into recurring income.</p>
            <Link href="/affiliates/apply" className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-royal-blue px-5 text-[13px] font-bold text-white hover:bg-royal-soft">Join the Affiliate Program <ArrowRight className="h-4 w-4" /></Link>
            <p className="mt-3 text-[12px] text-white/60">Already an affiliate? <Link href="/login" className="font-semibold text-royal-soft">Log in to your account →</Link></p>
          </div>
        </div>
      </section>
    </>
  );
}

function Node({ icon: Icon, label }: { icon: typeof Users2; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/5 text-royal-soft"><Icon className="h-6 w-6" /></span>
      <span className="text-[11px] font-semibold text-white/70">{label}</span>
    </div>
  );
}
function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="bg-bg-soft/40 py-10">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <h2 className="text-center font-display text-2xl font-extrabold text-deep-navy">{title}</h2>
        {sub && <p className="mx-auto mt-1 max-w-2xl text-center text-[13px] text-ink-soft">{sub}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
