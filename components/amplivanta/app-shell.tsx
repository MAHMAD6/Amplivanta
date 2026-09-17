"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { Menu, X } from "lucide-react";
import { Toaster } from "sonner";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";
import { RouteAnalytics } from "./route-analytics";

const FOOTER_LINKS: [string, string][] = [
  ["Privacy Policy", "/legal/privacy"],
  ["Terms of Service", "/legal/terms"],
  ["Security", "/security"],
  ["Help & Support", "/app/help"],
];

export function AppShell({
  children,
  navVisibility,
  user,
  unreadNotifications,
}: {
  children: React.ReactNode;
  navVisibility?: Record<string, boolean>;
  user?: { name?: string | null; email?: string | null };
  unreadNotifications?: number | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-soft">
      <Toaster position="top-right" richColors closeButton />
      <RouteAnalytics />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-deep-navy">Skip to content</a>

      {/* Mobile bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-[#071F45] px-4 text-white lg:hidden">
        <Link href="/app" className="flex items-center gap-2">
          <Image src="/brand/amplivanta-approved-logo-96.png" alt="" width={30} height={30} className="rounded-md" />
          <span className="text-[14px] font-extrabold tracking-wide">AMPLIVANTA</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="hidden lg:block">
        <AppSidebar navVisibility={navVisibility} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-deep-navy/50" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[248px]">
            <AppSidebar navVisibility={navVisibility} onNavigate={() => setMobileOpen(false)} />
            <button onClick={() => setMobileOpen(false)} className="absolute right-2 top-2 z-50 rounded-lg p-1.5 text-white" aria-label="Close menu">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-col lg:pl-[248px]">
        <Suspense fallback={<div className="h-16 border-b border-line bg-white" />}>
          <AppTopbar user={user} unreadNotifications={unreadNotifications} />
        </Suspense>
        <main id="main" className="flex-1 p-4 sm:p-6 lg:px-9 lg:py-7">{children}</main>
        <footer className="flex flex-wrap items-center justify-between gap-3 px-4 pb-6 pt-2 text-[12px] text-ink-soft sm:px-6 lg:px-9">
          <span>© {new Date().getFullYear()} Amplivanta Inc. All rights reserved.</span>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-10 gap-y-1">
            {FOOTER_LINKS.map(([l, h]) => <Link key={h} href={h} className="hover:text-[#0B5CFF]">{l}</Link>)}
          </nav>
        </footer>
      </div>
    </div>
  );
}
