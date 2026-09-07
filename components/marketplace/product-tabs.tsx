"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type ProductTab = { id: string; label: string; content: React.ReactNode };

/**
 * Overview / What's Included / License / Reviews / Seller Info.
 *
 * Every panel is rendered server-side and hidden with `hidden` rather than
 * unmounted, so tab content is present for search engines and for a reader
 * using find-in-page.
 */
export function ProductTabs({ tabs }: { tabs: ProductTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div className="mt-8">
      <div role="tablist" aria-label="Product information" className="flex flex-wrap gap-6 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setActive(t.id)}
            className={cn(
              "-mb-px border-b-2 px-0.5 pb-3 text-[14px] font-bold transition",
              active === t.id
                ? "border-royal-blue text-royal-blue"
                : "border-transparent text-ink-muted hover:text-deep-navy",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          hidden={active !== t.id}
          className="pt-7"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
