"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

// Routes whose hero sits on a dark green background — nav needs light text there.
const LIGHT_HERO_ROUTES = ["/", "/about"];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const overDarkHero = !LIGHT_HERO_ROUTES.includes(pathname);
  // Use light (white) nav chrome only when over a dark hero and not yet scrolled.
  const light = overDarkHero && !isScrolled;

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
          isScrolled
            ? "border-b border-[#E3E3E3] bg-white/90 shadow-sm backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo dark={light} />

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li
                key={link.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(link.children ? link.label : null)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    light ? "text-white/90 hover:text-[#B5FF2D]" : "text-[#0A0A0A] hover:text-[#8fd620]"
                  )}
                >
                  {link.label}
                  {link.children && <ChevronDown className="h-3.5 w-3.5" />}
                </Link>

                <AnimatePresence>
                  {link.children && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full w-64 pt-3"
                    >
                      <div className="rounded-2xl border border-[#E3E3E3] bg-white p-2 shadow-xl">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block rounded-xl px-4 py-2.5 text-sm text-[#5A5A5A] transition hover:bg-[#F4F4F4] hover:text-[#0A0A0A]"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>

          <div className="hidden lg:block">
            <Link
              href="/contact"
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-semibold transition-all",
                light
                  ? "bg-[#B5FF2D] text-black hover:bg-[#a0e828]"
                  : "bg-[#0A0A0A] text-white hover:bg-[#1A1A1A]"
              )}
            >
              Contact Us
            </Link>
          </div>

          <button
            className={cn("lg:hidden", light ? "text-white" : "text-[#0A0A0A]")}
            onClick={() => setIsMobileOpen((v) => !v)}
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-20 z-40 overflow-y-auto bg-white px-6 py-8 lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className="block py-3 font-display text-2xl font-semibold text-[#0A0A0A]"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="mb-2 ml-4 flex flex-col gap-1 border-l border-[#E3E3E3] pl-4">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setIsMobileOpen(false)}
                          className="py-1.5 text-sm text-[#5A5A5A]"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              onClick={() => setIsMobileOpen(false)}
              className="mt-6 block rounded-full bg-[#0A0A0A] px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Contact Us
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
