"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MarketingNav() {
  const [openMobile, setOpenMobile] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <div
              key={link.label}
              className="relative"
              onMouseEnter={() => link.children && setOpenMenu(link.label)}
              onMouseLeave={() => setOpenMenu(null)}
              onFocus={() => link.children && setOpenMenu(link.label)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenMenu(null);
              }}
            >
              <Link
                href={link.href}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-[13.5px] font-medium text-deep-navy transition hover:text-royal-blue"
                aria-expanded={link.children ? openMenu === link.label : undefined}
              >
                {link.label}
                {link.children && <ChevronDown className="h-3.5 w-3.5 opacity-70" />}
              </Link>
              {link.children && openMenu === link.label && (
                <div className="absolute left-0 top-full min-w-[240px] pt-2">
                  <div className="rounded-2xl border border-line bg-white p-2 shadow-card-lg">
                    {link.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block rounded-lg px-3 py-2 text-sm text-ink-soft transition hover:bg-bg-soft hover:text-ink"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-[13.5px] font-medium text-deep-navy transition hover:text-royal-blue"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-orange-cta px-5 text-[13.5px] font-semibold text-white transition hover:bg-orange-cta-hover"
          >
            Start Engineering Growth
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-ink lg:hidden"
          onClick={() => setOpenMobile((v) => !v)}
          aria-label={openMobile ? "Close menu" : "Open menu"}
          aria-expanded={openMobile}
        >
          {openMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {openMobile && (
        <div className={cn("border-t border-line bg-white lg:hidden")}>
          <div className="mx-auto max-w-[1280px] space-y-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <div key={link.label}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-ink"
                  onClick={() => setOpenMobile(false)}
                >
                  {link.label}
                </Link>
                {link.children?.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="block rounded-lg px-6 py-1.5 text-[13px] text-ink-soft"
                    onClick={() => setOpenMobile(false)}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="flex gap-2 pt-3">
              <Link
                href="/login"
                className="flex-1 rounded-lg border border-line py-2 text-center text-sm font-medium text-deep-navy"
                onClick={() => setOpenMobile(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="flex-1 rounded-lg bg-orange-cta py-2 text-center text-sm font-semibold text-white"
                onClick={() => setOpenMobile(false)}
              >
                Start Engineering Growth
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
