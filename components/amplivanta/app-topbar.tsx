"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Bell, HelpCircle, Gift, Sparkles } from "lucide-react";
import { NotificationDrawer } from "./notification-drawer";
import { cn } from "@/lib/utils";

export function AppTopbar() {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const crumbs = buildCrumbs(pathname);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white px-6">
        <div className="flex items-center gap-2 text-sm">
          {crumbs.map((c, i) => (
            <span key={c.href} className="flex items-center gap-2">
              {i > 0 && <span className="text-ink-muted">›</span>}
              {i === crumbs.length - 1 ? (
                <span className="font-semibold text-ink">{c.label}</span>
              ) : (
                <Link href={c.href} className="text-ink-muted hover:text-ink">
                  {c.label}
                </Link>
              )}
            </span>
          ))}
        </div>

        <div className="mx-8 hidden max-w-md flex-1 lg:block">
          <div className="flex h-9 items-center gap-2 rounded-xl border border-line bg-bg-soft px-3">
            <Search className="h-3.5 w-3.5 text-ink-muted" />
            <input
              placeholder="Search contacts, campaigns, assets…"
              className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none"
            />
            <kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] font-mono text-ink-muted shadow-sm">⌘K</kbd>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/app/workspace"
            className="mr-2 hidden items-center gap-1.5 rounded-xl bg-grad-cta px-3.5 py-2 text-[12.5px] font-bold text-white shadow-violet transition hover:brightness-105 md:inline-flex"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Workspace
          </Link>
          <IconBtn icon={Gift} />
          <IconBtn icon={Bell} badge="3" onClick={() => setNotifOpen(true)} />
          <IconBtn icon={HelpCircle} />
          <button className="ml-2 flex items-center gap-2 rounded-xl border border-line bg-white p-1 pr-3 transition hover:border-ink/30">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet to-orange-brand" />
            <div className="hidden text-left leading-tight lg:block">
              <div className="text-[12px] font-semibold text-ink">Alex Johnson</div>
              <div className="text-[10px] text-ink-muted">Growth Manager</div>
            </div>
          </button>
        </div>
      </header>
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}

function IconBtn({ icon: Icon, badge, onClick }: { icon: React.ComponentType<{ className?: string }>; badge?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn("relative flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition hover:bg-bg-soft hover:text-ink")}
    >
      <Icon className="h-4 w-4" />
      {badge && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-brand px-1 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function buildCrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let acc = "";
  for (const p of parts) {
    acc += "/" + p;
    crumbs.push({ label: prettify(p), href: acc });
  }
  if (crumbs.length === 0) crumbs.push({ label: "Dashboard", href: "/app" });
  if (crumbs[0].label === "App") crumbs[0].label = "Dashboard";
  return crumbs;
}

function prettify(s: string) {
  return s.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
