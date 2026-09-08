"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, type NavKey } from "./site-shell";

/**
 * The primary nav below lg. Uses the same Sheet as the admin console, so it
 * brings the focus trap, Escape handling and scroll lock rather than
 * reimplementing them.
 */
export function SiteMobileNav({ active }: { active?: NavKey }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className="ml-auto rounded-lg p-2 text-site-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-purple lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </SheetTrigger>

      <SheetContent side="right" className="w-[300px] p-0 lg:hidden">
        <SheetTitle className="border-b border-site-line px-5 py-4 text-[15px] font-extrabold text-site-ink">
          Menu
        </SheetTitle>

        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Primary navigation">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active === item.key ? "page" : undefined}
              className={cn(
                "block rounded-xl px-3 py-3 text-[15px] font-semibold text-[#30405F] transition hover:bg-site-soft",
                active === item.key && "bg-[#F2EFFF] text-site-purple",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-2.5 border-t border-site-line p-4">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="flex h-12 items-center justify-center rounded-[10px] border border-[#D7DDF0] bg-white text-[15px] font-bold text-site-ink"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            onClick={() => setOpen(false)}
            className="flex h-12 items-center justify-center rounded-[10px] bg-gradient-to-r from-site-blue to-site-purple-2 text-[15px] font-bold text-white"
          >
            Start Engineering Growth
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
