"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PortfolioCard } from "@/components/shared/PortfolioCard";
import { cn } from "@/lib/utils";
import type { Portfolio } from "@/types";

const FILTERS = ["All", "Social Media", "SEO", "Content", "Video Production", "PPC", "Web Design"];

export function PortfolioExplorer({ items }: { items: Portfolio[] }) {
  const [active, setActive] = useState("All");

  const filtered = useMemo(() => {
    if (active === "All") return items;
    return items.filter((p) => p.tags.includes(active));
  }, [active, items]);

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap gap-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                active === f
                  ? "bg-[#6D3BF5] text-white"
                  : "border border-[#e9e7f0] text-[#4a4756] hover:bg-[#f8f7fb]"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <PortfolioCard
                  title={p.title}
                  client={p.client}
                  description={p.description}
                  coverImage={p.coverImage}
                  tags={p.tags}
                  href={`/portfolio/${p.slug}`}
                  index={i}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <p className="py-16 text-center text-[#767287]">No case studies in this category yet.</p>
        )}
      </div>
    </section>
  );
}
