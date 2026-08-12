import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { ReviewCard } from "@/components/shared/ReviewCard";
import type { Review } from "@/types";

export function TestimonialsSection({ reviews }: { reviews: Review[] }) {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <SectionLabel label="Client Reviews" variant="lime" />
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight text-[#14121f] md:text-5xl">
            Trusted by Founders &{" "}
            <span className="relative inline-block px-1">
              <span className="relative z-10 text-[#14121f]">Growth Leaders</span>
              <span className="absolute bottom-1.5 left-0 h-3.5 w-full bg-[#6D3BF5] -z-0 rounded-sm" />
            </span>
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <ScrollReveal key={r.id} delay={i * 0.08}>
              <ReviewCard
                name={r.name}
                company={r.company}
                role={r.role}
                content={r.content}
                rating={r.rating}
              />
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#14121f] hover:text-[#5B2FE0]"
          >
            Read All Reviews <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
