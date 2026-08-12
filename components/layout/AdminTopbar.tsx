"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, Menu, Command, LayoutDashboard, Layers, Briefcase, BookOpen, Users, Star, MessageSquare, Settings } from "lucide-react";
import { AdminNotificationsPopover } from "@/components/admin/AdminNotificationsPopover";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { CommandKModal } from "@/components/admin/CommandKModal";

const ICON_MAP: Record<string, typeof LayoutDashboard> = {
  "/admin": LayoutDashboard,
  "/admin/services": Layers,
  "/admin/portfolio": Briefcase,
  "/admin/blog": BookOpen,
  "/admin/team": Users,
  "/admin/reviews": Star,
  "/admin/messages": MessageSquare,
  "/admin/settings": Settings,
};

function titleFromPath(path: string): string {
  if (path === "/admin") return "Dashboard Overview";
  const seg = path.split("/").filter(Boolean);
  const last = seg[seg.length - 1];
  if (last === "new") return `Add New ${seg[seg.length - 2] ?? ""}`.trim();
  return (seg[1] ?? "Admin").replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function AdminTopbar({ onOpenMobile }: { onOpenMobile?: () => void }) {
  const pathname = usePathname();
  const [commandKOpen, setCommandKOpen] = useState(false);

  // Global hotkey listener for Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandKOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const RouteIcon = ICON_MAP[pathname] || LayoutDashboard;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e9e7f0] bg-white/90 px-4 sm:px-6 backdrop-blur-md transition-all">
        {/* Left Section: Mobile Menu + Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobile}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8f7fb] text-[#14121f] hover:bg-[#e9e7f0] lg:hidden transition"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14121f] text-[#6D3BF5]">
              <RouteIcon className="h-4 w-4" />
            </span>
            <div>
              <h1 className="font-display text-base sm:text-lg font-extrabold capitalize text-[#14121f] leading-tight">
                {titleFromPath(pathname)}
              </h1>
              <p className="hidden md:block text-[11px] text-[#767287]">
                Impressa Digital Management Console
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Command K, Quick Create, Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Command-K Search Trigger Button */}
          <button
            onClick={() => setCommandKOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-[#e9e7f0] bg-[#f8f7fb] px-3 py-1.5 text-xs text-[#4a4756] transition hover:border-[#6D3BF5] hover:bg-white hover:text-[#14121f] shadow-sm"
          >
            <Search className="h-3.5 w-3.5 text-[#767287]" />
            <span className="hidden md:inline">Search studio...</span>
            <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-[#e9e7f0] bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#14121f]">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>

          {/* Quick Create Dropdown */}
          <AdminQuickActions />

          {/* Notifications Popover */}
          <AdminNotificationsPopover />
        </div>
      </header>

      {/* Global Command K Modal */}
      <CommandKModal isOpen={commandKOpen} onClose={() => setCommandKOpen(false)} />
    </>
  );
}
