"use client";

import { useMemo, useState } from "react";
import { MessageSquareDashed } from "lucide-react";
import { ReviewCard } from "@/components/shared/ReviewCard";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { Highlight } from "@/components/shared/Highlight";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

export function ReviewsGrid({ reviews }: { reviews: Review[] }) {
  const [active, setActive] = useState(0);

  const filters = useMemo(
    () => [
      { label: "All", value: 0, count: reviews.length },
      { label: "5 Stars", value: 5, count: reviews.filter((r) => r.rating === 5).length },
      { label: "4 Stars", value: 4, count: reviews.filter((r) => r.rating === 4).length },
    ],
    [reviews]
  );

  const filtered = useMemo(
    () => (active === 0 ? reviews : reviews.filter((r) => r.rating === active)),
    [active, reviews]
  );

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel label="Client Stories" variant="lime" />
            <h2 className="mt-4 max-w-xl font-display text-4xl font-bold leading-tight text-[#14121f] md:text-5xl">
              What People <Highlight>Are Saying</Highlight>
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActive(f.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                  active === f.value
                    ? "bg-[#6D3BF5] text-white"
                    : "border border-[#e9e7f0] text-[#4a4756] hover:border-[#6D3BF5] hover:bg-[#f8f7fb]"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs font-semibold tabular-nums",
                    active === f.value ? "bg-black/10 text-black" : "bg-[#f8f7fb] text-[#4a4756]"
                  )}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
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
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e9e7f0] bg-[#f8f7fb] py-20 text-center">
            <MessageSquareDashed className="h-10 w-10 text-[#a8a4b8]" />
            <p className="mt-4 font-medium text-[#14121f]">No reviews in this range yet</p>
            <p className="mt-1 text-sm text-[#4a4756]">Try another filter or be the first to leave one.</p>
          </div>
        )}
      </div>
    </section>
  );
}
