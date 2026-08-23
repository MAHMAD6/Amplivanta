"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Dashboard", href: "/app/social" },
  { label: "Compose", href: "/app/social/compose" },
  { label: "Calendar", href: "/app/social/calendar" },
  { label: "Posts", href: "/app/social/posts" },
  { label: "Approvals", href: "/app/social/approvals" },
  { label: "Analytics", href: "/app/social/analytics" },
  { label: "Queue", href: "/app/social/queue" },
  { label: "Accounts", href: "/app/social/accounts" },
  { label: "Team", href: "/app/social/team" },
  { label: "Hashtags", href: "/app/social/hashtags" },
  { label: "Templates", href: "/app/social/templates" },
  { label: "Activity", href: "/app/social/activity" },
  { label: "Integrations", href: "/app/social/integrations" },
  { label: "Settings", href: "/app/social/settings" },
  { label: "Platform", href: "/app/social/platform-settings" },
];

export function SocialSubnav() {
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
              "relative shrink-0 px-3.5 py-2.5 text-[13px] font-semibold transition",
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
