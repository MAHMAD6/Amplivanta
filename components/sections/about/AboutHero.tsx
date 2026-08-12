import Image from "next/image";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { Highlight } from "@/components/shared/Highlight";
import { SITE_IMAGES } from "@/lib/mock-data";
import { Target, Users, TrendingUp, Sparkles, Award } from "lucide-react";

const PILLARS = [
  {
    icon: Target,
    title: "Precision Strategy",
    desc: "Bespoke growth models engineered around your unique unit economics.",
  },
  {
    icon: Users,
    title: "Senior Execution",
    desc: "Direct access to senior marketing strategists with multi-million dollar scale experience.",
  },
  {
    icon: TrendingUp,
    title: "Transparent Attribution",
    desc: "Real-time analytics dashboards tracking verified ROI, CAC, and LTV metrics.",
  },
];

export function AboutHero() {
  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:px-6 lg:px-8 bg-gradient-to-b from-[#f8f7fb]/80 via-white to-white">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:items-center">
        <ScrollReveal className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e9e7f0] bg-[#f8f7fb] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#14121f]">
            <span className="h-2 w-2 rounded-full bg-[#6D3BF5] animate-pulse" />
            About Amplivanta
          </div>

          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-[#14121f] sm:text-5xl md:text-6xl lg:leading-[1.12]">
            Architecting <Highlight>Data-Driven Growth</Highlight> for Modern Brands
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-[#4a4756] leading-relaxed font-normal">
            We are a collective of strategists, performance engineers, and creative thinkers. 
            We bridge the gap between creative storytelling and rigorous analytical marketing to build compound brand equity.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {PILLARS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="group rounded-2xl border border-[#e9e7f0]/90 bg-white p-4 shadow-sm transition-all duration-300 hover:border-[#d9d5ea] hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-grad-brand-2 text-white transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-display text-base font-bold text-[#14121f]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#767287] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="left" className="lg:col-span-5">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border border-[#e9e7f0] bg-[#f8f7fb] shadow-xl lg:max-w-none">
            <Image
              src={SITE_IMAGES.aboutMain}
              alt="Amplivanta team collaborating"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Floating Glass Stats Card */}
            <div className="absolute bottom-6 inset-x-6 rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-md text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6D3BF5] text-white">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 font-mono text-sm font-bold text-white">
                    <span>99.4% Client Satisfaction</span>
                  </div>
                  <p className="text-xs text-[#d9d5ea]">
                    Trusted by 120+ high-growth brands globally
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

