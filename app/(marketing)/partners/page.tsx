import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Layers, GraduationCap, ShieldCheck, Users2, Briefcase, Code2, Puzzle, ArrowRight, Check, Info } from "lucide-react";
import { LogoMark } from "@/components/layout/LogoMark";
import { MarketingBreadcrumb } from "@/components/amplivanta/marketing-breadcrumb";

export const metadata: Metadata = { title: "Partner Program" };

const WHY = [
  { icon: TrendingUp, title: "Growth Enablement", desc: "Access our capabilities, tools, and resources to create new collaboration and customer opportunities." },
  { icon: Layers, title: "Integrated Growth Platform", desc: "Leverage our platform, automation, and intelligence to deliver greater value for your clients." },
  { icon: GraduationCap, title: "Partner Support", desc: "Get training, resources, and ongoing support to help you succeed." },
  { icon: ShieldCheck, title: "Sustainable Success", desc: "Build lasting relationships based on trust, transparency, and shared success." },
];
const OPPS = [
  { icon: Users2, title: "Agency Partners", desc: "Digital marketing, creative, and performance agencies looking to deliver more value to clients." },
  { icon: Briefcase, title: "Consulting Partners", desc: "Strategy and management consultants helping businesses transform and grow." },
  { icon: Code2, title: "Technology Partners", desc: "Platforms and technology providers integrating or building on Amplivanta." },
  { icon: Puzzle, title: "Solution Partners", desc: "System integrators and solution experts delivering end-to-end implementations." },
];
const STEPS = [
  { title: "Apply", desc: "Submit your application and tell us about your business and expertise." },
  { title: "Review & Approve", desc: "Our team reviews your application and confirms the best partnership fit." },
  { title: "Onboard & Enable", desc: "We onboard you, provide training, resources, and tools to get you started." },
  { title: "Grow Together", desc: "Collaborate, deliver value, and pursue shared growth opportunities together." },
];
const REQS = ["A proven track record of delivering value to clients", "Alignment with Amplivanta's mission and values", "Commitment to customer success and growth", "Willingness to collaborate and co-innovate"];

export default function PartnersPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-4 pt-6 lg:px-8">
          <MarketingBreadcrumb items={[["Home", "/"], ["Company", "/company"], ["Partners & Affiliates", "/partners"], ["Partner Program", null]]} />
        </div>
        <div className="mx-auto grid grid-cols-1 max-w-[1200px] items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-royal-blue">Partner Program</span>
            <h1 className="mt-3 font-display text-[40px] font-extrabold leading-[1.05] text-deep-navy lg:text-[48px]">Build More. Deliver More. Engineer Growth Together.</h1>
            <p className="mt-5 max-w-[460px] text-[15px] leading-relaxed text-ink-soft">Amplivanta partners with agencies, consultants, technology providers, and solution experts to create new collaboration and customer opportunities. Together, we help businesses engineer sustainable growth through marketing, automation, and intelligence.</p>
            <Link href="/partners/apply" className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-deep-navy px-6 text-[14px] font-bold text-white transition hover:bg-deep-panel">Apply to Become a Partner <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="hidden justify-center lg:flex">
            <div className="relative flex h-72 w-72 items-center justify-center rounded-full border border-line bg-bg-soft/40">
              <LogoMark className="h-20 w-20" />
              {[["Growth Enablement", TrendingUp, "6%", "0%"], ["Innovation Together", GraduationCap, "6%", "72%"], ["Co-Sell & Deliver", Users2, "70%", "2%"], ["Global Reach", ShieldCheck, "70%", "74%"]].map(([label, Icon, top, left], i) => (
                <div key={i} className="absolute flex flex-col items-center" style={{ top: top as string, left: left as string }}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-royal-blue shadow-card">{typeof Icon !== "string" && <Icon className="h-5 w-5" />}</span>
                  <span className="mt-1 text-[10px] font-semibold text-ink-soft">{label as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why partner */}
      <Section title="Why Partner with Amplivanta?">
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-line bg-white p-6 shadow-card md:grid-cols-2 lg:grid-cols-4">
          {WHY.map((w) => (
            <div key={w.title} className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><w.icon className="h-6 w-6" /></span>
              <div className="mt-3 text-[14px] font-bold text-deep-navy">{w.title}</div>
              <p className="mt-1 text-[12px] leading-snug text-ink-soft">{w.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Opportunities */}
      <Section title="Partner Opportunities" sub="Choose the partnership path that aligns with your expertise.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {OPPS.map((o) => (
            <div key={o.title} className="rounded-2xl border border-line bg-white p-5 text-center shadow-card">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><o.icon className="h-6 w-6" /></span>
              <div className="mt-3 text-[14px] font-bold text-deep-navy">{o.title}</div>
              <p className="mt-1 text-[12px] leading-snug text-ink-soft">{o.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <section className="bg-white py-6">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
          <div className="rounded-2xl bg-royal-tint/40 p-8">
            <h2 className="text-center font-display text-2xl font-extrabold text-deep-navy">How the Partner Program Works</h2>
            <p className="mt-1 text-center text-[13px] text-ink-soft">A simple and collaborative path to partnership.</p>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
              {STEPS.map((s, i) => (
                <div key={s.title} className="text-center">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-deep-navy text-[14px] font-bold text-white">{i + 1}</span>
                  <div className="mt-3 text-[13.5px] font-bold text-deep-navy">{s.title}</div>
                  <p className="mt-1 text-[12px] text-ink-soft">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Requirements + CTA */}
      <section className="bg-white py-10">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-6 rounded-2xl border border-line bg-white p-6 shadow-card md:grid-cols-2">
            <div>
              <h3 className="text-[15px] font-bold text-deep-navy">Partnership Requirements</h3>
              <ul className="mt-3 space-y-2">
                {REQS.map((r) => <li key={r} className="flex items-start gap-2 text-[13px] text-ink-soft"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {r}</li>)}
              </ul>
            </div>
            <div className="flex flex-col items-start justify-center border-line md:border-l md:pl-6">
              <h3 className="text-[15px] font-bold text-deep-navy">Ready to Partner with Amplivanta?</h3>
              <p className="mt-1 text-[13px] text-ink-soft">Join our global partner network and help businesses engineer growth with marketing, automation, and intelligence.</p>
              <Link href="/partners/apply" className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-deep-navy px-5 text-[13px] font-bold text-white hover:bg-deep-panel">Apply to Become a Partner <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-bg-soft/50 px-4 py-3 text-[12px] text-ink-soft">
            <span className="flex items-center gap-2"><Info className="h-4 w-4 text-royal-blue" /> By applying, you agree to our <Link href="/partners/terms" className="font-semibold text-royal-blue">Partner Program Terms &amp; Conditions</Link> and <Link href="/legal/privacy" className="font-semibold text-royal-blue">Privacy Policy</Link>.</span>
            <span>Have questions? <Link href="/contact" className="font-semibold text-royal-blue">Contact Us →</Link></span>
          </div>
        </div>
      </section>
    </>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <h2 className="text-center font-display text-2xl font-extrabold text-deep-navy">{title}</h2>
        {sub && <p className="mt-1 text-center text-[13px] text-ink-soft">{sub}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
