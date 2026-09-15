"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  ["General Settings", "/app/settings"],
  ["Billing & Subscription", "/app/settings/billing"],
  ["Security & 2FA", "/app/settings/security"],
  ["Notifications", "/app/settings/notifications"],
  ["Roles & Permissions", "/app/settings/users"],
  ["Data Management", "/app/settings/data"],
  ["API & Domains", "/app/settings/api-domains"],
  ["Audit Log", "/app/settings/audit"],
] as const;

/** Settings section tabs (boxed active tab, per the Settings designs). */
export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Settings sections" className="no-scrollbar mb-5 flex gap-2 overflow-x-auto border-b border-line pb-1.5">
      {TABS.map(([label, href]) => {
        const on = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={cn("shrink-0 rounded-md px-5 py-2 text-[13px] font-semibold", on ? "border border-[#0B5CFF] bg-royal-tint/40 text-[#0B5CFF]" : "border border-transparent text-deep-navy hover:bg-bg-soft")}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
