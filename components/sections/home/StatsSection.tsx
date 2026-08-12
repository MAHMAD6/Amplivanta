import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { STATS } from "@/lib/constants";

export function StatsSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="text-center">
            <SectionLabel label="Track Record" variant="lime" />
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-bold leading-tight text-[#14121f] md:text-5xl">
              Proven Performance in Driving{" "}
              <span className="relative inline-block px-1">
                <span className="relative z-10 text-[#14121f]">Business Scale</span>
                <span className="absolute bottom-1.5 left-0 h-3.5 w-full bg-[#6D3BF5] -z-0 rounded-sm" />
              </span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1}>
              <div className="group rounded-2xl border border-[#e9e7f0]/90 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0d0b18]/30 hover:shadow-md">
                <p className="font-mono text-4xl font-extrabold text-[#14121f] md:text-5xl">
                  <AnimatedCounter value={parseInt(stat.value, 10)} suffix={stat.suffix} />
                </p>
                <p className="mt-3 text-sm font-medium text-[#4a4756]">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
