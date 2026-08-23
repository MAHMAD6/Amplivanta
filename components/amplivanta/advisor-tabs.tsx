"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADVISOR_TABS } from "@/lib/advisor-data";
import { cn } from "@/lib/utils";

export function AdvisorTabs() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex flex-wrap gap-5 border-b border-line">
      {ADVISOR_TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "relative pb-2.5 text-[13.5px] font-semibold transition",
              active ? "text-violet" : "text-ink-muted hover:text-ink"
            )}
          >
            {t.label}
            {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-violet" />}
          </Link>
        );
      })}
    </div>
  );
}

/** Small icon resolver shared by the advisor pages. */
export { AdvisorIcon } from "./advisor-icon";
