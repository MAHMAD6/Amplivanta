"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Briefcase,
  BookOpen,
  Users,
  Star,
  MessageSquare,
  Settings,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { SITE_SHORT } from "@/lib/constants";
import { LogoMark } from "./LogoMark";

const SECTIONS = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/services", label: "Services", icon: Layers },
      { href: "/admin/portfolio", label: "Portfolio", icon: Briefcase },
      { href: "/admin/blog", label: "Blog", icon: BookOpen },
      { href: "/admin/team", label: "Team", icon: Users },
    ],
  },
  {
    title: "Engagement",
    items: [
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/messages", label: "Messages", icon: MessageSquare },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/", label: "View Site", icon: ExternalLink },
    ],
  },
];

export function AdminSidebar({ userName, userRole }: { userName?: string; userRole?: string }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col bg-[#0A0A0A] lg:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <LogoMark className="h-8 w-8" />
        <span className="font-display text-xl font-bold tracking-tight text-white">{SITE_SHORT}</span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-white/40">
              {section.title}
            </p>
            <ul className="mt-2 space-y-1">
              {section.items.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href) && item.href !== "/";
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                        active ? "bg-[#B5FF2D] text-black" : "text-white/60 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B5FF2D] text-sm font-bold text-black">
            {userName?.charAt(0) ?? "A"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{userName ?? "Admin"}</p>
            <p className="truncate text-xs text-white/40">{userRole ?? "ADMIN"}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Sign out"
            className="text-white/60 transition hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
