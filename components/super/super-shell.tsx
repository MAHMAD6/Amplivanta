"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronsLeft,
  Circle,
  Contact,
  CreditCard,
  FolderOpen,
  Globe,
  Globe2,
  Handshake,
  Headphones,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  Lightbulb,
  Mail,
  Megaphone,
  Palette,
  Plug,
  ScrollText,
  Search,
  Server,
  Settings,
  Share2,
  ShieldCheck,
  Siren,
  Sparkles,
  Store,
  Tags,
  Users,
  Zap,
} from "lucide-react";
import { LogoMark } from "@/components/layout/LogoMark";
import { SUPER_NAV, SUPER_PAGE_BY_HREF, type SuperNavGroup } from "@/lib/super/registry";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Siren, Building2, Users, Tags, CreditCard, Globe, LifeBuoy, Lightbulb,
  Contact, FolderOpen, Palette, Share2, Mail, Sparkles, Plug, Handshake, Store, BarChart3,
  Globe2, Server, ShieldCheck, Headphones, ScrollText, Megaphone, Settings, Zap, Circle,
};

/** Groups flagged in the approved dashboard design. */
const GROUP_BADGE: Record<string, "New" | "Soon"> = {
  "Growth Intelligence": "New",
  CRM: "New",
  "Affiliate Management": "New",
  "Partner Marketplace": "Soon",
};

/** Groups rendered as a single top-level link rather than an expandable tree. */
const FLAT_GROUPS = new Set(["Dashboard", "Command Center"]);

function Badge({ kind }: { kind: "New" | "Soon" }) {
  return (
    <span
      className={cn(
        "ml-auto rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide",
        kind === "New" ? "bg-emerald-400/20 text-emerald-300" : "bg-white/10 text-white/50",
      )}
    >
      {kind}
    </span>
  );
}

function NavGroup({
  group,
  pathname,
  collapsed,
}: {
  group: SuperNavGroup;
  pathname: string;
  collapsed: boolean;
}) {
  const Icon = ICONS[group.icon] ?? Circle;
  const containsActive = group.items.some((i) => i.href === pathname);
  const [open, setOpen] = useState(containsActive);
  const badge = GROUP_BADGE[group.group];

  // Dashboard / Command Center render as a single destination.
  if (FLAT_GROUPS.has(group.group)) {
    const primary = group.items[0];
    const active = pathname === primary.href;
    return (
      <Link
        href={primary.href}
        title={collapsed ? group.group : undefined}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition",
          active ? "bg-royal-blue text-white shadow-sm" : "text-white/75 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && <span className="truncate">{group.group}</span>}
      </Link>
    );
  }

  if (collapsed) {
    return (
      <Link
        href={group.items[0].href}
        title={group.group}
        className={cn(
          "flex items-center justify-center rounded-xl px-3 py-2.5 transition",
          containsActive ? "bg-royal-blue text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-semibold transition",
          containsActive ? "bg-royal-blue/90 text-white" : "text-white/75 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        <span className="truncate">{group.group}</span>
        {badge && <Badge kind={badge} />}
        <ChevronDown
          className={cn("ml-auto h-4 w-4 shrink-0 transition-transform", open && "rotate-180", badge && "ml-1.5")}
        />
      </button>

      {open && (
        <div className="mt-0.5 space-y-0.5 pb-1 pl-4">
          {group.items.map((item) => {
            const active = item.href === pathname;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg py-1.5 pl-4 pr-2 text-[12.5px] transition",
                  active
                    ? "bg-royal-blue text-white font-semibold"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <span className="truncate">{item.page}</span>
                {item.external && (
                  <ArrowUpRight
                    className="ml-auto h-3.5 w-3.5 shrink-0 text-white/35"
                    aria-label="Opens the existing product screen"
                  />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SuperShell({
  children,
  adminName,
  adminEmail,
}: {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const sections = useMemo(() => SUPER_NAV, []);

  // The header title mirrors the approved route registry so every destination
  // is labelled consistently without each page repeating itself.
  const current = SUPER_PAGE_BY_HREF.get(pathname);
  const title = current?.page ?? "Super Admin";
  const subtitle = current ? current.objective.split(/(?<=\.)\s/)[0] : "Overview and control for your platform";

  return (
    <div className="min-h-screen bg-bg-soft">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-admin-navy text-white transition-[width] duration-200",
          collapsed ? "w-[76px]" : "w-[280px]",
        )}
      >
        {/* Brand */}
        <div className="flex h-[78px] shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <LogoMark className="h-9 w-9 shrink-0" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15.5px] font-extrabold tracking-wide">AMPLIVANTA</div>
              <div className="text-[8.5px] font-semibold uppercase tracking-[0.22em] text-white/45">
                Engineering Growth
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.section} className="mb-5">
              {!collapsed && (
                <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                  {section.section}
                </div>
              )}
              <div className="space-y-0.5">
                {section.groups.map((group) => (
                  <NavGroup key={group.group} group={group} pathname={pathname} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11.5px] font-semibold text-white/70 hover:bg-white/10 hover:text-white"
          >
            <ChevronsLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      <div className={cn("transition-[padding] duration-200", collapsed ? "pl-[76px]" : "pl-[280px]")}>
        <header className="sticky top-0 z-30 border-b border-line bg-white">
          <div className="flex h-[78px] items-center gap-6 px-8">
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-[26px] font-extrabold leading-tight text-admin-navy">
                {title}
              </h1>
              {subtitle && <p className="truncate text-[13.5px] text-ink-soft">{subtitle}</p>}
            </div>

            <label className="hidden h-11 w-full max-w-[380px] items-center gap-2.5 rounded-xl border border-line bg-white px-3.5 lg:flex">
              <Search className="h-4 w-4 shrink-0 text-ink-muted" />
              <input
                type="search"
                placeholder="Search..."
                className="min-w-0 flex-1 bg-transparent text-[13.5px] placeholder:text-ink-muted focus:outline-none"
              />
              <kbd className="shrink-0 rounded-md border border-line px-1.5 py-0.5 font-mono text-[10.5px] text-ink-muted">
                Ctrl K
              </kbd>
            </label>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                aria-label="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft hover:bg-bg-soft"
              >
                <Bell className="h-[18px] w-[18px]" />
              </button>
              <button
                type="button"
                aria-label="Help"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft hover:bg-bg-soft"
              >
                <HelpCircle className="h-[18px] w-[18px]" />
              </button>
              <div className="ml-1 flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-royal-blue text-[12px] font-bold text-white">
                  {adminName.slice(0, 2).toUpperCase()}
                </span>
                <div className="hidden leading-tight xl:block">
                  <div className="text-[13px] font-bold text-admin-navy">{adminName}</div>
                  <div className="text-[11px] text-ink-muted">{adminEmail}</div>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-ink-muted xl:block" />
              </div>
            </div>
          </div>
        </header>

        <main className="px-8 py-7">{children}</main>

        <footer className="mt-4 border-t border-line bg-white px-8 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-ink-muted">
            <span>© {new Date().getFullYear()} Amplivanta Inc. All rights reserved.</span>
            <div className="flex flex-wrap items-center gap-5">
              <Link href="/legal/privacy" className="hover:text-royal-blue">Privacy Policy</Link>
              <Link href="/legal/terms" className="hover:text-royal-blue">Terms of Service</Link>
              <Link href="/super/system-management/system-health" className="hover:text-royal-blue">System Status</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
