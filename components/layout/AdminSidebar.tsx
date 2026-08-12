"use client";

import { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { SITE_SHORT } from "@/lib/constants";
import { LogoMark } from "./LogoMark";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badgeKey: string | null;
  isExternal?: boolean;
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, badgeKey: null }],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/services", label: "Services", icon: Layers, badgeKey: "services" },
      { href: "/admin/portfolio", label: "Portfolio", icon: Briefcase, badgeKey: "portfolio" },
      { href: "/admin/blog", label: "Blog Posts", icon: BookOpen, badgeKey: "posts" },
      { href: "/admin/team", label: "Team Members", icon: Users, badgeKey: "team" },
    ],
  },
  {
    title: "Engagement",
    items: [
      { href: "/admin/reviews", label: "Reviews", icon: Star, badgeKey: "pendingReviews" },
      { href: "/admin/messages", label: "Messages", icon: MessageSquare, badgeKey: "newMessages" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings, badgeKey: null },
      { href: "/", label: "View Website", icon: ExternalLink, badgeKey: null, isExternal: true },
    ],
  },
];

interface AdminSidebarProps {
  userName?: string;
  userRole?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({
  userName,
  userRole,
  isMobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : { counts: {} }))
      .then((data: { counts?: Record<string, number> }) => setCounts(data.counts || {}))
      .catch(() => {});
  }, [pathname]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0d0b18] border-r border-white/10 text-white transition-all duration-300 ease-in-out",
          // Mobile state: slide in/out
          isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
          // Desktop state: collapsed or expanded
          collapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {/* Header Branding */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-grad-brand-2 shadow-lg shadow-[#6D3BF5]/20">
              <LogoMark variant="flat" className="h-5 w-5" />
            </div>
            {(!collapsed || isMobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="font-display text-base font-extrabold tracking-tight text-white truncate">
                  {SITE_SHORT}
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-[#6D3BF5] uppercase flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Admin Studio
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition"
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Mobile Close Toggle */}
          <button
            onClick={onMobileClose}
            className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-none">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              {(!collapsed || isMobileOpen) && (
                <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-white/30">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href) && item.href !== "/";
                  const Icon = item.icon;
                  const badgeValue = item.badgeKey ? counts[item.badgeKey] : null;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        target={item.isExternal ? "_blank" : undefined}
                        onClick={onMobileClose}
                        title={collapsed && !isMobileOpen ? item.label : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                          active
                            ? "bg-grad-brand-2 text-white shadow-md shadow-[#6D3BF5]/30"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                            active ? "text-white" : "text-white/60 group-hover:text-white"
                          )}
                        />
                        {(!collapsed || isMobileOpen) && (
                          <span className="flex-1 truncate">{item.label}</span>
                        )}

                        {/* Badges */}
                        {badgeValue !== undefined && badgeValue !== null && badgeValue > 0 && (
                          <span
                            className={cn(
                              "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[11px] font-bold shadow-sm",
                              active
                                ? "bg-white/25 text-white"
                                : item.badgeKey === "newMessages" || item.badgeKey === "pendingReviews"
                                ? "bg-amber-400 text-black animate-pulse"
                                : "bg-white/20 text-white"
                            )}
                          >
                            {badgeValue}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Footer Card */}
        <div className="border-t border-white/10 p-3 bg-black/40">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2 border border-white/5">
            <div className="relative">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-grad-brand-2 font-display text-sm font-bold text-white shadow-inner">
                {userName?.charAt(0) ?? "A"}
              </span>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0d0b18]" />
            </div>

            {(!collapsed || isMobileOpen) && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">{userName ?? "Admin User"}</p>
                <p className="truncate text-[10px] font-medium text-[#6D3BF5] uppercase tracking-wider">
                  {userRole ?? "ADMIN"}
                </p>
              </div>
            )}

            {(!collapsed || isMobileOpen) && (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                aria-label="Sign out"
                title="Sign Out"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-red-500/20 hover:text-red-400 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
