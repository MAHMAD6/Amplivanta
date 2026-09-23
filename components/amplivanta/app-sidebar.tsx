"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { APP_NAV } from "@/lib/app-nav";
import { logOut } from "@/app/(app)/shell-actions";
import { cn } from "@/lib/utils";

/**
 * User Dashboard sidebar from the approved handoff: approved logo, #071F45
 * shell, manifest navigation groups, active item in the primary blue, and
 * Log out at the foot. Sub-destinations expand under the active item.
 */
export function AppSidebar({
  navVisibility,
  onNavigate,
  className,
}: {
  navVisibility?: Record<string, boolean>;
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const allItems = APP_NAV.flatMap((s) => s.items).filter((i) => !i.visibility || navVisibility?.[i.visibility] === true);
  // A page listed as a sub-destination belongs to that parent; otherwise the most specific prefix wins.
  const owner = allItems.find((i) => i.children?.some((c) => c.href === pathname && c.href !== "/app"));
  const best = allItems
    .filter((i) => pathname === i.href || (i.href !== "/app" && pathname.startsWith(i.href + "/")))
    .sort((a, b) => b.href.length - a.href.length)[0];
  const activeHref = owner?.href ?? best?.href;

  return (
    <aside className={cn("flex w-[248px] flex-col bg-[#071F45] text-white", className ?? "fixed inset-y-0 left-0 z-30")}>
      <Link href="/app" onClick={onNavigate} className="flex items-center gap-3 border-b border-white/10 px-4 py-4 pr-10 lg:pr-4">
        <Image src="/brand/amplivanta-approved-logo-96.png" alt="" width={42} height={42} className="h-[42px] w-[42px] rounded-lg" priority />
        <span className="leading-none">
          <span className="block text-[18px] font-extrabold tracking-wide">AMPLIVANTA</span>
          <span className="mt-1 block text-[8.5px] font-semibold uppercase tracking-[0.12em] text-white/80">Engineering Growth</span>
        </span>
      </Link>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-2 py-3">
        {APP_NAV.map((section, si) => {
          const items = section.items.filter((i) => !i.visibility || navVisibility?.[i.visibility] === true);
          if (!items.length) return null;
          return (
            <div key={section.label ?? `root-${si}`} className={section.label ? "mt-2.5" : undefined}>
              {section.label && <div className="mb-1 px-2 text-[9.5px] font-semibold uppercase tracking-wider text-white/60">{section.label}</div>}
              <ul>
                {items.map((item) => {
                  const active = item.href === activeHref;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active && pathname === item.href ? "page" : undefined}
                        className={cn("flex items-center gap-2 rounded-md px-2 py-[5px] text-[12.5px] transition", active ? "bg-[#0B5CFF] font-medium text-white" : "text-white/90 hover:bg-white/10")}
                      >
                        <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-current opacity-80" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                      {item.children && active && (
                        <ul className="mb-1 ml-3.5 mt-0.5 space-y-px border-l border-white/15 pl-2">
                          {item.children.map((c) => (
                            <li key={c.href}>
                              <Link
                                href={c.href}
                                onClick={onNavigate}
                                aria-current={pathname === c.href ? "page" : undefined}
                                className={cn("block rounded px-2 py-1 text-[11.5px]", pathname === c.href ? "bg-white/15 font-semibold text-white" : "text-white/70 hover:bg-white/10 hover:text-white")}
                              >
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <form action={logOut} className="border-t border-white/10 px-3 py-3">
        <button type="submit" className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-[12.5px] text-white/90 hover:bg-white/10">
          <LogOut aria-hidden className="h-4 w-4" /> Log out
        </button>
      </form>
    </aside>
  );
}
