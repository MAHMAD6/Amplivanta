"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/app", icon: Home, label: "Home" },
  { href: "/app/my-tasks", icon: BarChart3, label: "Tasks" },
  { href: "/app/earnings", icon: Wallet, label: "Wallet", center: true },
  { href: "/app/profile", icon: User, label: "Profile" },
];

const HIDDEN = ["/app/login", "/app/signup"];

export function BottomNav() {
  const pathname = usePathname();
  if (HIDDEN.includes(pathname)) return null;
  return (
    <nav className="sticky bottom-0 z-20 mt-auto flex items-center justify-around border-t border-[#e9e7f0] bg-white/95 px-2 py-3 backdrop-blur">
      {ITEMS.map(({ href, icon: Icon, label, center }) => {
        const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
        if (center) {
          return (
            <Link key={href} href={href} aria-label={label} className="relative -mt-8">
              <span className="bg-grad-brand-2 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[0_10px_24px_-6px_rgba(109,59,245,0.6)]">
                <Icon className="h-6 w-6" />
              </span>
            </Link>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-4 py-1 transition-colors",
              active ? "text-[#6D3BF5]" : "text-[#a8a4b8] hover:text-[#6D3BF5]"
            )}
          >
            <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
          </Link>
        );
      })}
    </nav>
  );
}
