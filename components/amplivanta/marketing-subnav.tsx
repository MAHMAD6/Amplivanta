"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Dashboard", href: "/app/marketing" },
  { label: "Campaigns", href: "/app/marketing/campaigns" },
  { label: "Workflows", href: "/app/marketing/workflows" },
  { label: "Emails", href: "/app/marketing/emails" },
  { label: "Composer", href: "/app/marketing/email-composer" },
  { label: "Forms", href: "/app/marketing/forms" },
  { label: "Pages", href: "/app/marketing/landing-pages" },
  { label: "Builder", href: "/app/marketing/page-builder" },
  { label: "Segments", href: "/app/marketing/segments" },
  { label: "Scoring", href: "/app/marketing/lead-scoring" },
  { label: "Templates", href: "/app/marketing/templates" },
  { label: "A/B Testing", href: "/app/marketing/ab-testing" },
  { label: "Analytics", href: "/app/marketing/analytics" },
  { label: "Conversion", href: "/app/marketing/conversion-settings" },
  { label: "Deliverability", href: "/app/marketing/deliverability" },
  { label: "Triggers", href: "/app/marketing/triggers" },
  { label: "Form Analytics", href: "/app/marketing/form-analytics" },
  { label: "Logs", href: "/app/marketing/execution-logs" },
  { label: "Domains", href: "/app/marketing/domains" },
  { label: "Publishing", href: "/app/marketing/publishing" },
];

export function MarketingSubnav() {
  const pathname = usePathname();
  return (
    <div className="no-scrollbar mb-6 flex gap-1 overflow-x-auto border-b border-line">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "relative shrink-0 px-3 py-2.5 text-[12.5px] font-semibold transition",
              active ? "text-violet" : "text-ink-soft hover:text-ink"
            )}
          >
            {t.label}
            {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-grad-brand" />}
          </Link>
        );
      })}
    </div>
  );
}
