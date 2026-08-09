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
          <SectionLabel label="Testimonials" variant="lime" />
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight text-[#0A0A0A] md:text-5xl">
            What Our <span className="text-[#B5FF2D]">Clients Say</span>
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              name={r.name}
              company={r.company}
              role={r.role}
              content={r.content}
              rating={r.rating}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A0A0A] hover:text-[#8fd620]"
          >
            Read All Reviews <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
