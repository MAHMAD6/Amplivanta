import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, BarChart3, ShieldCheck, Star, CalendarDays, Users2, MonitorPlay, ArrowRight, Mail, CalendarCheck } from "lucide-react";
import { MarketingDemoForm } from "@/components/amplivanta/marketing-demo-form";

export const metadata: Metadata = { title: "Book a Demo — Amplivanta" };

const POINTS = [
  { icon: Rocket, title: "Personalized Demo", desc: "See how Amplivanta solves your specific business challenges." },
  { icon: BarChart3, title: "Proven Impact", desc: "Explore real use cases and measurable results across industries." },
  { icon: ShieldCheck, title: "Expert Guidance", desc: "Get answers to your questions from our growth engineering experts." },
];
const EXPECT = [
  { icon: CalendarDays, title: "Schedule", desc: "Pick a time that works for you." },
  { icon: Users2, title: "Discover", desc: "We learn about your goals and challenges." },
  { icon: MonitorPlay, title: "Demo", desc: "See Amplivanta in action customized for you." },
  { icon: Rocket, title: "Grow", desc: "Get a roadmap to engineer your growth." },
];

export default function DemoPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-royal-tint/50 to-white py-14">
        <div className="mx-auto grid max-w-[1200px] items-start gap-8 px-4 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-royal-blue">Contact Sales / Book a Demo</span>
            <h1 className="mt-3 font-display text-[42px] font-extrabold leading-[1.05] text-deep-navy lg:text-[50px]">See Amplivanta in Action.</h1>
            <p className="mt-3 text-[19px] font-semibold text-royal-blue">Let&apos;s Engineer Growth—Together.</p>
            <p className="mt-5 max-w-[420px] text-[15px] leading-relaxed text-ink-soft">Book a personalized demo and discover how Amplivanta&apos;s AI-powered platform and automation tools can help you attract, convert and retain more customers—faster.</p>
            <div className="mt-8 space-y-5">
              {POINTS.map((p) => (
                <div key={p.title} className="flex gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-royal-tint text-royal-blue"><p.icon className="h-5 w-5" /></span>
                  <div><div className="text-[14px] font-bold text-deep-navy">{p.title}</div><p className="mt-0.5 text-[12.5px] text-ink-soft">{p.desc}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><ShieldCheck className="h-5 w-5" /></span>
              <div>
                <div className="text-[12.5px] font-semibold text-deep-navy">A demo tailored to your goals</div>
                <div className="text-[12px] text-ink-soft">We handle your information in accordance with our Privacy Policy.</div>
              </div>
            </div>
          </div>
          <MarketingDemoForm />
        </div>
      </section>

      {/* What to expect + talk now */}
      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-[18px] font-bold text-deep-navy">What to Expect</h2>
            <p className="mt-0.5 text-[13px] text-ink-soft">A demo built around your goals.</p>
            <div className="mt-6 flex items-center gap-2">
              {EXPECT.map((s, i) => (
                <div key={s.title} className="flex items-center gap-2">
                  <div className="flex flex-col items-center text-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-royal-blue"><s.icon className="h-5 w-5" /></span>
                    <div className="mt-1.5 text-[12px] font-bold text-deep-navy">{i + 1}. {s.title}</div>
                    <p className="mt-0.5 max-w-[110px] text-[10.5px] text-ink-muted">{s.desc}</p>
                  </div>
                  {i < EXPECT.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted" />}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-deep-navy">Prefer to Talk Now?</h2>
            <p className="mt-0.5 text-[13px] text-ink-soft">Reach out directly to our team.</p>
            <div className="mt-6 space-y-4">
              <Contact icon={Mail} title="sales@amplivanta.com" desc="Send us a note and our team will get back to you by email." />
              <Contact icon={CalendarCheck} title="Schedule a Call" desc="Choose a time that works for you." />
            </div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-white pb-16">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-deep-navy px-8 py-6">
            <div><div className="text-[18px] font-bold text-white">Ready to Engineer Growth?</div><div className="text-[13px] text-white/70">Book your demo today and take the guesswork out of growth.</div></div>
            <div className="flex gap-3">
              <Link href="#form" className="inline-flex h-11 items-center rounded-xl bg-orange-cta px-5 text-[13px] font-bold text-white hover:bg-orange-cta-hover">Book My Demo</Link>
              <Link href="/platform" className="inline-flex h-11 items-center rounded-xl border border-white/30 px-5 text-[13px] font-bold text-white hover:bg-white/10">Explore Platform</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Contact({ icon: Icon, title, desc }: { icon: typeof Mail; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><Icon className="h-5 w-5" /></span>
      <div><div className="text-[13.5px] font-bold text-deep-navy">{title}</div><p className="text-[12px] text-ink-soft">{desc}</p></div>
    </div>
  );
}
