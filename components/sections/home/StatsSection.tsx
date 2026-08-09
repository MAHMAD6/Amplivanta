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
            <SectionLabel label="Achievement" variant="lime" />
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-bold leading-tight text-[#0A0A0A] md:text-5xl">
              Proven Success in <span className="text-[#B5FF2D]">Driving Business Growth</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1}>
              <div className="rounded-2xl border border-[#E3E3E3] bg-white p-8 text-center">
                <p className="font-mono text-4xl font-bold text-[#0A0A0A] md:text-5xl">
                  <AnimatedCounter value={parseInt(stat.value, 10)} suffix={stat.suffix} />
                </p>
                <p className="mt-3 text-sm text-[#5A5A5A]">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
