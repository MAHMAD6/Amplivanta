"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sparkles, Search, Target, Layers, Brain, Wand2, Share2, Workflow, Users, BarChart3, Plug,
  Folder, Image as ImageIcon, Megaphone, Settings, HelpCircle, ChevronDown, ChevronsUpDown, Check,
  Newspaper, BookOpen, Compass, Video, Presentation, LayoutTemplate, LifeBuoy, UserCog, Palette,
  CreditCard, Bell, ScrollText, Store, ShoppingBag, Tag,
} from "lucide-react";
import { LogoMark } from "@/components/layout/LogoMark";
import { APP_NAV } from "@/lib/app-nav";
import { cn } from "@/lib/utils";

const iconMap = {
  sparkles: Sparkles, search: Search, target: Target, layers: Layers, brain: Brain,
  wand: Wand2, share: Share2, workflow: Workflow, users: Users, "bar-chart": BarChart3, plug: Plug,
  folder: Folder, image: ImageIcon, megaphone: Megaphone, settings: Settings, help: HelpCircle,
  newspaper: Newspaper, book: BookOpen, compass: Compass, video: Video,
  presentation: Presentation, template: LayoutTemplate, "life-buoy": LifeBuoy,
  "user-cog": UserCog, palette: Palette, "credit-card": CreditCard, bell: Bell, scroll: ScrollText,
  store: Store, bag: ShoppingBag, tag: Tag,
} as const;

export type ShellWorkspace = { id: string; name: string; plan: string };

export function AppSidebar({
  navVisibility,
  workspaces = [],
}: {
  navVisibility?: Record<string, boolean>;
  workspaces?: ShellWorkspace[];
}) {
  const pathname = usePathname();
  const [wsOpen, setWsOpen] = useState(false);
  const [activeWs, setActiveWs] = useState<ShellWorkspace | null>(workspaces[0] ?? null);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[248px] flex-col border-r border-navy-border bg-[#0d0b18] text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <LogoMark className="h-8 w-8" />
        <div>
          <div className="text-[15px] font-bold leading-none">Amplivanta</div>
          <div className="mt-1 text-[9px] font-medium uppercase tracking-wider text-white/50">We Engineer Growth</div>
        </div>
      </div>

      {/* Workspace switcher */}
      <div className="relative px-3 pb-3">
        <button
          onClick={() => setWsOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left hover:bg-white/10"
        >
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-semibold">{activeWs?.name ?? "No workspace"}</div>
            <div className="text-[10px] text-white/50">{activeWs ? `${activeWs.plan} plan` : "None available"}</div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-white/50" />
        </button>
        {wsOpen && (
          <div className="absolute left-3 right-3 top-full z-40 mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#181528] shadow-card-lg">
            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => { setActiveWs(w); setWsOpen(false); }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-[12.5px] hover:bg-white/5"
              >
                <div>
                  <div className="font-semibold text-white">{w.name}</div>
                  <div className="text-[10px] text-white/40">{w.plan}</div>
                </div>
                {activeWs?.id === w.id && <Check className="h-3.5 w-3.5 text-violet" />}
              </button>
            ))}
            {workspaces.length === 0 && (
              <div className="px-3 py-2 text-[12px] text-white/50">No workspaces available</div>
            )}
            <div className="border-t border-white/10">
              <Link href="/app/settings" className="block px-3 py-2 text-[12px] font-semibold text-violet hover:bg-white/5">
                + New workspace
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {/* Dashboard root */}
        <Link
          href="/app"
          className={cn(
            "mb-3 flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition",
            pathname === "/app"
              ? "bg-grad-brand-2 text-white shadow-violet"
              : "text-white/80 hover:bg-white/5 hover:text-white"
          )}
        >
          <Layers className="h-4 w-4" /> Dashboard
        </Link>

        {APP_NAV.map((section) => {
          const items = section.items.filter(
            (i) => !i.visibility || navVisibility?.[i.visibility] === true,
          );
          if (items.length === 0) return null;
          return (
          <div key={section.label} className="mb-4">
            <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[13px] transition",
                        active
                          ? "bg-grad-brand-2 text-white shadow-violet"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.badge && (
                        <span className="rounded-full bg-orange-brand/20 px-1.5 py-0.5 text-[9px] font-bold text-orange-brand">
                          {item.badge}
                        </span>
                      )}
                    </Link>

                    {/* Sub-destinations expand once the parent section is active */}
                    {item.children && active && (
                      <div className="ml-[26px] mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                        {item.children.map((child) => {
                          const childActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "block rounded-md px-2.5 py-1.5 text-[12.5px] transition",
                                childActive
                                  ? "bg-white/10 font-semibold text-white"
                                  : "text-white/55 hover:bg-white/5 hover:text-white"
                              )}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          );
        })}
      </nav>

      {/* AI credits: shown only once a real balance is connected. */}
      <div className="mx-3 mb-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">Your AI Credits</div>
        <div className="mt-1 text-[12px] text-white/50">No balance available yet</div>
        <Link href="/app/settings/billing" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-violet hover:text-white">
          Manage Credits →
        </Link>
      </div>
    </aside>
  );
}
