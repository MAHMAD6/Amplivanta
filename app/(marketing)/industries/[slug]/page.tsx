import { notFound } from "next/navigation";
import Link from "next/link";
import { INDUSTRY_PAGES } from "@/lib/marketing-modules";
import { MarketingBreadcrumb } from "@/components/amplivanta/marketing-breadcrumb";
import { Crosshair, Megaphone, Filter, TrendingUp, ShieldCheck, Rocket, Users2, Handshake, Globe, CheckCircle2, BarChart3, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export function generateStaticParams() {
  return Object.keys(INDUSTRY_PAGES).map((slug) => ({ slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = INDUSTRY_PAGES[slug];
  if (!data) return {};
  return { title: `Marketing for ${data.eyebrow}`, description: data.subtitle };
}

const CAPS = [
  { icon: Crosshair, title: "Ideal Buyer Targeting", desc: "Identify and engage the right accounts with precision using firmographic and behavioral insights." },
  { icon: Megaphone, title: "Demand Generation", desc: "Run multi-channel campaigns that build awareness and generate high-quality pipeline." },
  { icon: Filter, title: "Pipeline Acceleration", desc: "Nurture prospects and move them through the pipeline with personalized journeys." },
  { icon: TrendingUp, title: "Revenue Intelligence", desc: "Track performance, prove impact, and optimize investments with real-time analytics." },
  { icon: ShieldCheck, title: "Customer Retention", desc: "Strengthen relationships and expand accounts with lifecycle marketing and insights." },
];
const USE_CASES = [
  { icon: Rocket, title: "Product Launches", desc: "Create market awareness and drive adoption for new products and features." },
  { icon: Users2, title: "Account-Based Marketing", desc: "Engage high-value accounts with tailored campaigns that convert and expand." },
  { icon: Handshake, title: "Partner & Channel Growth", desc: "Enable partners, generate joint demand, and grow through ecosystem collaboration." },
  { icon: Globe, title: "Global Expansion", desc: "Localize campaigns and messages to successfully enter and scale in new markets." },
];
const WHY = [
  { title: "All-in-one platform", desc: "Unify your stack and streamline marketing, sales and data." },
  { title: "Built for scale", desc: "Designed to grow with your team, data and ambitions." },
  { title: "Expert support", desc: "Strategic guidance and hands-on help when you need it." },
  { title: "Built for measurable growth", desc: "Tools and insights that help you measure what matters and improve what's next." },
];

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = INDUSTRY_PAGES[slug];
  if (!data) notFound();
  const name = data.eyebrow;

  return (
    <>
      {/* Hero */}
      <section className="bg-deep-navy text-white">
        <div className="mx-auto max-w-[1200px] px-4 pt-6 lg:px-8">
          <MarketingBreadcrumb items={[["Home", "/"], ["Industries", "/industries"], [name, null]]} />
        </div>
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:px-8">
          <div>
            <h1 className="font-display text-[42px] font-extrabold leading-[1.05] lg:text-[48px]">Marketing for <span className="text-royal-soft">{name}</span> Companies</h1>
            <p className="mt-4 max-w-[440px] text-[15px] leading-relaxed text-white/70">{data.subtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-[14px] font-bold text-deep-navy hover:bg-white/90">Start Engineering Growth</Link>
              <Link href="/demo" className="inline-flex h-12 items-center rounded-xl border border-white/30 px-6 text-[14px] font-bold text-white hover:bg-white/10">Book a Demo</Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="grid h-40 place-items-center rounded-xl bg-gradient-to-br from-royal-blue/40 to-deep-panel"><BarChart3 className="h-16 w-16 text-white/40" /></div>
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-white p-3 text-deep-navy shadow-card">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-royal-tint text-royal-blue"><TrendingUp className="h-5 w-5" /></span>
                <div><div className="text-[12.5px] font-bold">Engineer Growth Outcomes</div><div className="text-[11px] text-ink-soft">Align marketing, sales and product for predictable, measurable revenue.</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for teams */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-[1200px] px-4 text-center lg:px-8">
          <h2 className="font-display text-2xl font-extrabold text-deep-navy">Built for {name.toLowerCase()} teams.</h2>
          <p className="mx-auto mt-2 max-w-2xl text-[13.5px] text-ink-soft">From early-stage startups to established {name.toLowerCase()} companies, Amplivanta helps brands attract the right buyers, engage at every stage, and drive growth that lasts.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {CAPS.map((c) => (
              <div key={c.title}>
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-royal-tint text-royal-blue"><c.icon className="h-6 w-6" /></span>
                <div className="mt-3 text-[13.5px] font-bold text-deep-navy">{c.title}</div>
                <p className="mt-1 text-[11.5px] leading-snug text-ink-soft">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-bg-soft/50 py-12">
        <div className="mx-auto max-w-[1200px] px-4 text-center lg:px-8">
          <h2 className="font-display text-2xl font-extrabold text-deep-navy">Use cases that drive results.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((u) => (
              <div key={u.title} className="rounded-2xl border border-line bg-white p-5 text-left shadow-card">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal-tint text-royal-blue"><u.icon className="h-5 w-5" /></span>
                <div className="mt-3 text-[14px] font-bold text-deep-navy">{u.title}</div>
                <p className="mt-1 text-[12px] text-ink-soft">{u.desc}</p>
                <Link href="/solutions" className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-royal-blue">Learn more <ArrowRight className="h-3 w-3" /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-[1200px] px-4 text-center lg:px-8">
          <h2 className="font-display text-2xl font-extrabold text-deep-navy">Why {name.toLowerCase()} companies choose Amplivanta.</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w) => (
              <div key={w.title} className="flex gap-3 text-left">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-royal-blue" />
                <div><div className="text-[13.5px] font-bold text-deep-navy">{w.title}</div><p className="mt-0.5 text-[12px] text-ink-soft">{w.desc}</p></div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-deep-navy px-8 py-6 text-left">
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"><Rocket className="h-5 w-5" /></span><div><div className="text-[16px] font-bold text-white">Ready to engineer growth for your {name.toLowerCase()} company?</div><div className="text-[13px] text-white/70">See Amplivanta in action and discover what&apos;s possible.</div></div></div>
            <div className="flex gap-3"><Link href="/signup" className="inline-flex h-11 items-center rounded-xl bg-white px-5 text-[13px] font-bold text-deep-navy">Start Engineering Growth</Link><Link href="/demo" className="inline-flex h-11 items-center rounded-xl border border-white/30 px-5 text-[13px] font-bold text-white">Book a Demo</Link></div>
          </div>
        </div>
      </section>
    </>
  );
}
