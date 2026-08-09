import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionLabel } from "@/components/shared/SectionLabel";

const VALUES = [
  { title: "Transparency", desc: "Clear reporting and honest communication, always." },
  { title: "Results First", desc: "We optimize for outcomes that grow your business." },
  { title: "Creativity", desc: "Ideas that cut through the noise and get noticed." },
  { title: "Partnership", desc: "We work as an extension of your team." },
  { title: "Data-Driven", desc: "Every decision backed by real numbers." },
  { title: "Continuous Learning", desc: "We stay ahead of a fast-moving industry." },
];

export function ValuesSection() {
  return (
    <section className="bg-[#F4F4F4] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="text-center">
            <SectionLabel label="Our Values" variant="lime" />
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-bold text-[#0A0A0A] md:text-5xl">
              What Makes Us <span className="text-[#B5FF2D]">Stand Out</span>
            </h2>
          </div>
        </ScrollReveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v, i) => (
            <ScrollReveal key={v.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-[#E3E3E3] bg-white p-6">
                <h3 className="font-display text-lg font-bold text-[#0A0A0A]">{v.title}</h3>
                <p className="mt-2 text-sm text-[#5A5A5A]">{v.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
