import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { ServiceCard } from "@/components/shared/ServiceCard";
import type { Service } from "@/types";

export function ServicesGrid({ services }: { services: Service[] }) {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <SectionLabel label="What We Do" variant="lime" />
              <h2 className="mt-4 font-display text-3xl font-bold text-[#14121f] md:text-4xl">
                End-to-end digital services
              </h2>
            </div>
            <p className="max-w-sm text-sm text-[#4a4756] leading-relaxed">
              Each service is tailored to your goals and integrated into a unified growth strategy.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <ServiceCard
              key={s.id}
              title={s.title}
              description={s.description}
              icon={s.icon}
              href={`/services/${s.slug}`}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
