import { ServiceCard } from "@/components/shared/ServiceCard";
import type { Service } from "@/types";

export function ServicesGrid({ services }: { services: Service[] }) {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
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
    </section>
  );
}
