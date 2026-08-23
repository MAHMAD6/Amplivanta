"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Users, Palette, CreditCard, ShieldCheck, Bell, Database, Globe, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "General", href: "/app/settings", icon: Building2 },
  { label: "Users & Permissions", href: "/app/settings/users", icon: Users },
  { label: "Brand Settings", href: "/app/settings/brand", icon: Palette },
  { label: "Billing & Subscription", href: "/app/settings/billing", icon: CreditCard },
  { label: "Security & 2FA", href: "/app/settings/security", icon: ShieldCheck },
  { label: "Notifications", href: "/app/settings/notifications", icon: Bell },
  { label: "Data Management", href: "/app/settings/data", icon: Database },
  { label: "API & Domains", href: "/app/settings/api-domains", icon: Globe },
  { label: "Audit Log", href: "/app/settings/audit", icon: ClipboardList },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <aside className="rounded-2xl border border-line bg-white p-2 shadow-card lg:sticky lg:top-20 lg:h-fit">
      <nav className="space-y-0.5">
        {NAV.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition",
                active ? "bg-violet/10 text-violet" : "text-ink-soft hover:bg-bg-soft hover:text-ink"
              )}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
