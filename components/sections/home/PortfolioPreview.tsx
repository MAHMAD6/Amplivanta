import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { PortfolioCard } from "@/components/shared/PortfolioCard";
import type { Portfolio } from "@/types";

export function PortfolioPreview({ items }: { items: Portfolio[] }) {
  return (
    <section className="bg-[#F4F4F4] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <SectionLabel label="Our Work" variant="lime" />
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight text-[#0A0A0A] md:text-5xl">
            Our Services Deliver the <span className="text-[#B5FF2D]">Best Results</span> for Your Business
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <PortfolioCard
              key={p.id}
              title={p.title}
              client={p.client}
              description={p.description}
              coverImage={p.coverImage}
              tags={p.tags}
              href={`/portfolio/${p.slug}`}
              index={i}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-full bg-[#0A0A0A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1A1A1A]"
          >
            View All Case Studies <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
