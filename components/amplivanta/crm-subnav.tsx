"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Dashboard", href: "/app/crm" },
  { label: "Companies", href: "/app/crm/companies" },
  { label: "Contacts", href: "/app/crm/contacts" },
  { label: "Deals", href: "/app/crm/deals" },
  { label: "Activities", href: "/app/crm/activities" },
  { label: "Tasks", href: "/app/crm/tasks" },
  { label: "Reports", href: "/app/crm/reports" },
];

export function CrmSubnav() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex gap-1 border-b border-line">
      {TABS.map((t) => {
        const active = pathname === t.href || (t.href !== "/app/crm" && pathname.startsWith(t.href));
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "relative px-4 py-2.5 text-[13px] font-semibold transition",
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
