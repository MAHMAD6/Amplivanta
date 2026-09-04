"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Toaster } from "sonner";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";
import { RouteAnalytics } from "./route-analytics";
import { LogoMark } from "@/components/layout/LogoMark";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  navVisibility,
  workspaces,
  user,
}: {
  children: React.ReactNode;
  navVisibility?: Record<string, boolean>;
  workspaces?: { id: string; name: string; plan: string }[];
  user?: { name?: string | null; email?: string | null };
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-soft">
      <Toaster position="top-right" richColors closeButton />
      <RouteAnalytics />
      {/* Mobile topbar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <LogoMark className="h-7 w-7" />
          <span className="text-[14px] font-bold text-ink">Amplivanta</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-ink" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AppSidebar navVisibility={navVisibility} workspaces={workspaces} />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[280px]">
            <AppSidebar navVisibility={navVisibility} workspaces={workspaces} />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-50 rounded-lg bg-white/10 p-1.5 text-white"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-[248px]">
        <div className="hidden lg:block">
          <AppTopbar user={user} />
        </div>
        <main className={cn("p-4 sm:p-6 lg:p-8")}>{children}</main>
      </div>
    </div>
  );
}
