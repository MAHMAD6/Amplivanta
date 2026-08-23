"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, ShieldAlert, HelpCircle, LogOut, Home, AlertTriangle, BarChart3, Building2 } from "lucide-react";
import { LogoMark } from "@/components/layout/LogoMark";
import { SUPER_NAV_GROUPS } from "@/lib/super-data";
import { cn } from "@/lib/utils";

const PRIMARY = [
  { label: "Dashboard", href: "/super", icon: Home },
  { label: "Organizations", href: "/super/organizations", icon: Building2 },
  { label: "Command Center", href: "/super/command", icon: AlertTriangle },
  { label: "Analytics", href: "/super/analytics", icon: BarChart3 },
];

export function SuperShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Super sidebar (red-tinted to distinguish) */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col border-r border-red-900/40 bg-[#170a12] text-white">
        <div className="flex h-16 items-center gap-2.5 border-b border-red-900/40 px-5">
          <LogoMark className="h-8 w-8" />
          <div>
            <div className="text-[15px] font-bold leading-none">Amplivanta</div>
            <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-red-300">Super Admin</div>
          </div>
        </div>

        <div className="border-b border-red-900/40 p-3">
          <div className="flex items-center gap-2 rounded-xl border border-red-900/40 bg-red-500/10 px-3 py-2 text-[11px] font-semibold text-red-200">
            <ShieldAlert className="h-3.5 w-3.5" />
            Elevated session · logged as Super Admin
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <div className="mb-4 space-y-0.5">
            {PRIMARY.map((n) => {
              const active = pathname === n.href;
              return (
                <Link key={n.href} href={n.href} className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition", active ? "bg-red-500/20 text-white" : "text-white/70 hover:bg-white/5 hover:text-white")}>
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
          </div>

          {SUPER_NAV_GROUPS.map((g) => (
            <div key={g.label} className="mb-4">
              <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-red-300/70">{g.label}</div>
              <div className="space-y-0.5">
                {g.items.map((item) => (
                  <button key={item} className="flex w-full items-center rounded-lg px-3 py-1.5 text-left text-[12.5px] text-white/60 hover:bg-white/5 hover:text-white">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-red-900/40 p-3">
          <button className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11.5px] font-semibold text-white/80 hover:bg-white/10">
            <LogOut className="h-3.5 w-3.5" /> Exit Super Admin
          </button>
        </div>
      </aside>

      <div className="pl-[260px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white px-6">
          <div className="flex h-9 max-w-md flex-1 items-center gap-2 rounded-xl border border-line bg-bg-soft px-3">
            <Search className="h-3.5 w-3.5 text-ink-muted" />
            <input placeholder="Global search — orgs, users, tickets, invoices, domains…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
            <kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] font-mono text-ink-muted shadow-sm">⌘K</kbd>
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-2 inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[10.5px] font-bold text-red-600">
              <ShieldAlert className="h-3 w-3" /> Super Admin
            </span>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft hover:bg-bg-soft">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">5</span>
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft hover:bg-bg-soft"><HelpCircle className="h-4 w-4" /></button>
            <button className="ml-2 flex items-center gap-2 rounded-xl border border-line bg-white p-1 pr-3">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-red-500 to-orange-brand" />
              <div className="hidden text-left leading-tight lg:block">
                <div className="text-[12px] font-semibold text-ink">Amplivanta Super</div>
                <div className="text-[10px] text-red-600">super@amplivanta.com</div>
              </div>
            </button>
          </div>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
