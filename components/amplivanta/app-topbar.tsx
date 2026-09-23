"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CircleUserRound, HelpCircle, Search } from "lucide-react";
import { NotificationBell } from "./notification-ui";
import { logOut } from "@/app/(app)/shell-actions";

/** Top bar from the approved shell: global search, help, notifications and the account menu. */
export function AppTopbar({ user, unreadNotifications }: { user?: { name?: string | null; email?: string | null }; unreadNotifications?: number | null }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !menu.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const iconBtn = "relative flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-deep-navy transition hover:bg-bg-soft";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-line bg-white px-4 sm:px-6 lg:px-8">
      <form action="/app/search" method="get" role="search" className="min-w-0 w-full max-w-[490px]">
        <label className="relative block">
          <span className="sr-only">Search Amplivanta</span>
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            name="q"
            defaultValue={pathname === "/app/search" ? params.get("q") ?? "" : ""}
            placeholder="Search Amplivanta..."
            className="h-11 w-full rounded-lg border border-line bg-white pl-10 pr-3 text-[13.5px] text-deep-navy placeholder:text-ink-muted focus:border-[#0B5CFF] focus:outline-none"
          />
        </label>
      </form>

      <div className="flex shrink-0 items-center gap-2.5">
        <Link href="/app/help" aria-label="Help & Support" className={iconBtn}>
          <HelpCircle className="h-4 w-4" />
        </Link>
        <div className="rounded-lg border border-line bg-white">
          <NotificationBell unread={unreadNotifications ?? null} />
        </div>
        <div className="relative" ref={menu}>
          <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label="Account menu" onClick={() => setOpen((v) => !v)} className={iconBtn}>
            <CircleUserRound className="h-4 w-4" />
          </button>
          {open && (
            <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-white shadow-card">
              <div className="border-b border-line px-4 py-3">
                <div className="truncate text-[13px] font-semibold text-deep-navy">{user?.name || "Signed-in user"}</div>
                <div className="truncate text-[12px] text-ink-soft">{user?.email || ""}</div>
              </div>
              {[
                ["General Settings", "/app/settings"],
                ["Security & 2FA", "/app/settings/security"],
                ["Notification Settings", "/app/settings/notifications"],
                ["Billing & Subscription", "/app/settings/billing"],
                ["Usage & Credits", "/app/usage-credits"],
              ].map(([l, h]) => (
                <Link key={h} role="menuitem" href={h} className="block px-4 py-2 text-[13px] text-deep-navy hover:bg-bg-soft">{l}</Link>
              ))}
              <form action={logOut} className="border-t border-line">
                <button type="submit" role="menuitem" className="block w-full px-4 py-2.5 text-left text-[13px] font-semibold text-deep-navy hover:bg-bg-soft">Log out</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
