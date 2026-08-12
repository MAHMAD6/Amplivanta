import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Highlight } from "@/components/shared/Highlight";
import { BarChart3, Eye, Zap, Layers } from "lucide-react";

const PHILOSOPHIES = [
  {
    num: "01",
    icon: BarChart3,
    title: "Data Over Assumptions",
    desc: "We eliminate guesswork. Every strategic pivot, audience slice, and media budget allocation is backed by empirical analytics.",
  },
  {
    num: "02",
    icon: Eye,
    title: "Radical Transparency",
    desc: "You own every account, ad asset, and data record. We share unvarnished reporting with full metric visibility.",
  },
  {
    num: "03",
    icon: Zap,
    title: "Continuous Iteration",
    desc: "Static campaigns decay. We run systematic weekly testing cycles to compound micro-gains into major revenue growth.",
  },
  {
    num: "04",
    icon: Layers,
    title: "Unified Execution",
    desc: "Design, code, SEO, and paid media work in complete harmony to deliver an uninterrupted customer journey.",
  },
];

export function PhilosophySection() {
  return (
    <section className="bg-[#f8f7fb] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="inline-block rounded-full bg-[#6D3BF5] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
                Our Philosophy
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[#14121f] md:text-5xl">
                How We <Highlight>Operate & Scale</Highlight>
              </h2>
            </div>
            <p className="max-w-md text-sm text-[#4a4756] leading-relaxed">
              Our operating model combines engineering-grade discipline with human-centered creative direction.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PHILOSOPHIES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.num} delay={idx * 0.1}>
                <div className="group relative flex h-full flex-col justify-between rounded-3xl border border-[#e9e7f0] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#0d0b18]/30 hover:shadow-lg">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-bold text-[#e9e7f0] transition-colors group-hover:text-[#0d0b18]">
                        {item.num}
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f8f7fb] text-[#4a4756] transition-all group-hover:bg-grad-brand-2 group-hover:text-white">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <h3 className="mt-6 font-display text-lg font-bold text-[#14121f]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-xs text-[#4a4756] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-8 h-1 w-0 rounded-full bg-[#6D3BF5] transition-all duration-300 group-hover:w-full" />
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
