"use client";

import { useMemo, useState } from "react";
import { ReviewCard } from "@/components/shared/ReviewCard";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

const FILTERS = [
  { label: "All", value: 0 },
  { label: "5 Stars", value: 5 },
  { label: "4 Stars", value: 4 },
];

export function ReviewsGrid({ reviews }: { reviews: Review[] }) {
  const [active, setActive] = useState(0);

  const filtered = useMemo(
    () => (active === 0 ? reviews : reviews.filter((r) => r.rating === active)),
    [active, reviews]
  );

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap gap-3">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActive(f.value)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                active === f.value
                  ? "bg-[#B5FF2D] text-black"
                  : "border border-[#E3E3E3] text-[#5A5A5A] hover:bg-[#F4F4F4]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </section>
  );
}
