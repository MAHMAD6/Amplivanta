"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Home", href: "/app/integrations" },
  { label: "Connected Apps", href: "/app/integrations/connected" },
  { label: "HubSpot Setup", href: "/app/integrations/hubspot" },
  { label: "Webhooks", href: "/app/integrations/webhooks" },
  { label: "API Keys", href: "/app/integrations/api-keys" },
  { label: "Import / Export", href: "/app/integrations/import-export" },
];

export function IntegrationsSubnav() {
  const pathname = usePathname();
  return (
    <div className="no-scrollbar mb-6 flex gap-1 overflow-x-auto border-b border-line">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link key={t.href} href={t.href} className={cn("relative shrink-0 px-3.5 py-2.5 text-[13px] font-semibold transition", active ? "text-violet" : "text-ink-soft hover:text-ink")}>
            {t.label}
            {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-grad-brand" />}
          </Link>
        );
      })}
    </div>
  );
}
