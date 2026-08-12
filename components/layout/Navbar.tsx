"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

// Amplivanta system is light throughout — no dark inner-page heroes.
const DARK_HERO_ROUTES: string[] = [];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Only blog articles keep a dark image-cover hero; everything else is light.
  const hasDarkHero =
    DARK_HERO_ROUTES.includes(pathname) || pathname.startsWith("/blog/");

  const onDark = hasDarkHero && !isScrolled;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-500",
          isScrolled ? "py-2" : "py-4"
        )}
      >
        <nav
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-5 transition-all duration-500 sm:px-6",
            isScrolled
              ? "h-14 border border-[#e9e7f0]/80 bg-white/80 shadow-lg shadow-black/[0.04] backdrop-blur-xl mx-4 sm:mx-6 lg:mx-auto"
              : "h-16 bg-transparent"
          )}
        >
          <Logo dark={onDark} />

          {/* Desktop nav */}
          <ul className="hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((link) => (
              <li
                key={link.label}
                className="relative"
                onMouseEnter={() =>
                  setActiveDropdown(link.children ? link.label : null)
                }
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-1 rounded-lg px-3.5 py-2 text-[13px] font-medium tracking-wide transition-all duration-200",
                    onDark
                      ? isActive(link.href)
                        ? "text-white"
                        : "text-white/70 hover:text-white"
                      : isActive(link.href)
                        ? "text-[#14121f]"
                        : "text-[#4a4756] hover:text-[#14121f]"
                  )}
                >
                  {link.label}
                  {link.children && (
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform duration-200",
                        activeDropdown === link.label && "rotate-180"
                      )}
                    />
                  )}
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="nav-indicator"
                      className={cn(
                        "absolute inset-0 rounded-lg",
                        onDark ? "bg-white/10" : "bg-[#f8f7fb]"
                      )}
                      style={{ zIndex: -1 }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>

                {/* Dropdown */}
                <AnimatePresence>
                  {link.children && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="absolute left-0 top-full w-60 pt-2"
                    >
                      <div className="rounded-xl border border-[#e9e7f0]/80 bg-white/95 p-1.5 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center justify-between rounded-lg px-3.5 py-2.5 text-[13px] font-medium transition-all duration-150",
                              isActive(child.href)
                                ? "bg-[#0d0b18] text-white"
                                : "text-[#4a4756] hover:bg-[#f8f7fb] hover:text-[#14121f]"
                            )}
                          >
                            {child.label}
                            <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-xl bg-grad-brand-2 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(109,59,245,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_-6px_rgba(109,59,245,0.6)]"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors lg:hidden",
              onDark ? "hover:bg-white/10" : "hover:bg-[#f8f7fb]"
            )}
            onClick={() => setIsMobileOpen((v) => !v)}
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          >
            <AnimatePresence mode="wait">
              {isMobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className={cn("h-5 w-5", onDark ? "text-white" : "text-[#14121f]")} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className={cn("h-5 w-5", onDark ? "text-white" : "text-[#14121f]")} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-[70] w-[85%] max-w-sm overflow-y-auto bg-white px-6 py-6 shadow-2xl lg:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <Logo />
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#f8f7fb]"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3.5 font-display text-lg font-semibold transition-colors",
                        isActive(link.href)
                          ? "bg-[#f8f7fb] text-[#14121f]"
                          : "text-[#4a4756] hover:bg-[#f8f7fb] hover:text-[#14121f]"
                      )}
                    >
                      {link.label}
                      {isActive(link.href) && (
                        <span className="h-1.5 w-1.5 rounded-full bg-grad-brand-2" />
                      )}
                    </Link>
                    {link.children && (
                      <div className="mb-1 ml-4 flex flex-col gap-0.5 border-l-2 border-[#e9e7f0] pl-4">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                              isActive(child.href)
                                ? "text-[#14121f]"
                                : "text-[#767287] hover:text-[#14121f]"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8 border-t border-[#e9e7f0] pt-6">
                <Link
                  href="/contact"
                  onClick={() => setIsMobileOpen(false)}
                  className="group flex items-center justify-center gap-2 rounded-xl bg-grad-brand-2 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(109,59,245,0.5)] transition-all hover:-translate-y-0.5"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
