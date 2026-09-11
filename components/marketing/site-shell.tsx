"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/layout/LogoMark";
import { cn } from "@/lib/utils";
import { SiteMobileNav } from "./site-mobile-nav";
import { btn, btnPrimary, btnSmall } from "./site-buttons";

/**
 * Public marketing shell, rebuilt in Tailwind from the approved design
 * reference: 112px header, purple active underline, navy footer with a
 * gradient CTA band, six link columns and seven social marks.
 */

export type NavKey =
  | "platform"
  | "solutions"
  | "industries"
  | "marketplace"
  | "pricing"
  | "resources"
  | "company"
  | "help"
  | null;

// Order and items follow the locked master header in the handoff. Industries
// is not in it; those pages stay reachable from the homepage and sitemap.
export const PRIMARY_NAV: { key: Exclude<NavKey, null>; label: string; href: string }[] = [
  { key: "platform", label: "Platform", href: "/platform" },
  { key: "solutions", label: "Solutions", href: "/solutions" },
  { key: "marketplace", label: "Marketplace", href: "/marketplace" },
  { key: "resources", label: "Resources", href: "/resources" },
  { key: "pricing", label: "Pricing", href: "/pricing" },
  { key: "company", label: "Company", href: "/company" },
  { key: "help", label: "Help", href: "/resources/help-center" },
];

export { btn, btnPrimary, btnSmall, btnDisabled } from "./site-buttons";

function Brand({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Amplivanta home" className={cn("flex items-center gap-4", className)}>
      <LogoMark className="h-[58px] w-[58px] shrink-0 rounded-xl" gradientId="amp-mark-site" />
      <span className="min-w-0">
        <span className="block text-[28px] font-extrabold leading-none tracking-[0.2px] text-site-ink">
          AMPLIVANTA
        </span>
        <span className="mt-2 block text-[11px] font-bold tracking-[2.8px] text-[#29395D]">
          ENGINEERING GROWTH
        </span>
      </span>
    </Link>
  );
}

/** Which primary nav item owns a given path. */
export function navKeyForPath(pathname: string): NavKey {
  if (pathname.startsWith("/platform")) return "platform";
  if (pathname.startsWith("/solutions")) return "solutions";
  if (pathname.startsWith("/industries")) return "industries";
  if (pathname.startsWith("/marketplace")) return "marketplace";
  if (pathname.startsWith("/pricing")) return "pricing";
  if (pathname.startsWith("/resources/help-center")) return "help";
  if (pathname.startsWith("/resources")) return "resources";
  // Partners, the affiliate program and contact all sit under Company.
  if (/^\/(company|partners|affiliate-program|contact|careers)/.test(pathname)) return "company";
  return null;
}

export function SiteHeader() {
  const active = navKeyForPath(usePathname());
  return (
    <header className="relative z-20 border-b border-site-line bg-white">
      <div className="flex h-[72px] items-center gap-6 px-4 sm:px-6 lg:h-[112px] lg:gap-11 lg:px-[92px]">
        <Brand className="shrink-0 [&_span.block:first-child]:text-[20px] lg:[&_span.block:first-child]:text-[28px] [&_svg]:h-10 [&_svg]:w-10 lg:[&_svg]:h-[58px] lg:[&_svg]:w-[58px]" />

        <nav className="hidden flex-1 items-center gap-5 xl:gap-7 lg:flex" aria-label="Primary navigation">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active === item.key ? "page" : undefined}
              className={cn(
                "relative text-[15px] font-semibold text-[#30405F] transition hover:text-site-purple",
                active === item.key &&
                  "text-site-purple after:absolute after:inset-x-0 after:-bottom-[17px] after:h-[3px] after:rounded-[3px] after:bg-site-purple",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <Link href="/login" className={cn(btn, btnSmall)}>
            Sign in
          </Link>
          <Link href="/signup" className={cn(btnPrimary, btnSmall)}>
            Start Engineering Growth
          </Link>
        </div>

        <SiteMobileNav active={active} />
      </div>
    </header>
  );
}

const FOOTER_COLUMNS: { label: string; links: [string, string][] }[] = [
  {
    label: "Platform",
    links: [
      ["AI Advisor", "/platform/ai-advisor"],
      ["Growth Audit™", "/platform/growth-audit"],
      ["Marketing Automation", "/platform/marketing-automation"],
      ["CRM & Pipelines", "/platform/crm-pipelines"],
      ["Social Publishing", "/platform/social-publishing"],
      ["Creative Studio", "/platform/creative-studio"],
      ["Analytics & Reports", "/platform/analytics-reports"],
      ["Integrations", "/platform/integrations"],
    ],
  },
  {
    label: "Solutions",
    links: [
      ["Growth Marketing", "/solutions/growth-marketing"],
      ["Revenue Acceleration", "/solutions/revenue-acceleration"],
      ["AI Workflows", "/solutions/ai-workflows"],
      ["Brand Intelligence", "/solutions/brand-intelligence"],
    ],
  },
  {
    label: "Marketplace",
    links: [
      ["Marketplace", "/marketplace"],
      ["Browse Products", "/marketplace/products"],
      ["Categories", "/marketplace/categories"],
      ["Sell on Amplivanta", "/marketplace/sell"],
    ],
  },
  {
    label: "Resources",
    links: [
      ["Blog", "/resources/blog"],
      ["Videos", "/resources/videos"],
      ["Webinars", "/resources/webinars"],
      ["Templates", "/resources/templates"],
      ["Help Center", "/resources/help-center"],
    ],
  },
  {
    label: "Company",
    links: [
      ["About Us", "/company/about"],
      ["Careers", "/company/careers"],
      ["Partners", "/partners"],
      ["Affiliate Program", "/affiliate-program"],
      ["Contact Us", "/contact"],
    ],
  },
  {
    label: "Legal",
    links: [
      ["Privacy Policy", "/legal/privacy"],
      ["Terms of Service", "/legal/terms"],
      ["Cookie Policy", "/legal/cookies"],
      ["Security / Trust Center", "/trust"],
    ],
  },
];

/**
 * Seven social marks. Rendered as non-linking glyphs until each official
 * profile URL is confirmed — the reference is explicit that these must not
 * ship as links before then.
 */
const SOCIALS: [string, string, string, string][] = [
  ["linkedin", "LinkedIn", "in", "bg-[#11386d]"],
  ["youtube", "YouTube", "▶", "bg-[#c62828]"],
  ["x", "X", "X", "bg-[#11386d]"],
  ["instagram", "Instagram", "◎", "bg-[#7840c9]"],
  ["facebook", "Facebook", "f", "bg-[#2458b8]"],
  ["tiktok", "TikTok", "♪", "bg-[#11386d]"],
  ["pinterest", "Pinterest", "P", "bg-[#bd2031]"],
];

export function SiteFooter() {
  return (
    <footer className="mt-[42px] bg-site-navy text-white" aria-label="Amplivanta public footer">
      <section
        aria-labelledby="footer-cta-title"
        className="relative flex flex-col items-start justify-between gap-7 overflow-hidden bg-gradient-to-r from-site-cta-from via-site-cta-mid to-site-cta-to px-4 py-9 sm:px-6 lg:flex-row lg:items-center lg:px-[92px] lg:py-[42px]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-10 right-[3%] text-[130px] font-black leading-none text-[rgba(126,91,255,0.22)] lg:text-[180px]"
        >
          ↗
        </span>
        <div className="relative z-10">
          <h2 id="footer-cta-title" className="m-0 text-[26px] font-extrabold tracking-[-0.7px] sm:text-[34px]">
            Ready to Engineer Smarter Growth?
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[#D2DCF2]">
            Turn ideas into measurable progress with AI-powered marketing, automation, and analytics.
          </p>
        </div>
        <div className="relative z-10 flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href="/signup" className={cn(btnPrimary, "w-full sm:w-auto")}>
            Start Engineering Growth →
          </Link>
          <Link
            href="/book-demo"
            className={cn(btn, "w-full border-white/25 bg-transparent text-white hover:bg-white/10 sm:w-auto")}
          >
            Book a Demo
          </Link>
        </div>
      </section>

      <div className="px-4 pb-[26px] pt-[38px] sm:px-6 lg:px-[92px]">
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-[1.55fr_repeat(6,1fr)]">
          <div className="lg:border-r lg:border-white/20 lg:pr-7">
            <div className="flex items-center gap-3">
              <LogoMark className="h-[54px] w-[54px] shrink-0 rounded-[10px]" gradientId="amp-mark-site-footer" />
              <div>
                <div className="text-[22px] font-extrabold tracking-[0.3px]">AMPLIVANTA</div>
                <div className="mt-1 text-[9px] font-bold tracking-[2.1px] text-[#C9D5EC]">
                  ENGINEERING GROWTH
                </div>
              </div>
            </div>
            <p className="my-4 text-[13px] leading-relaxed text-[#C6D2E9]">
              Amplivanta helps businesses plan, create, and grow with AI-powered marketing,
              automation, and analytics.
            </p>
            <div className="flex flex-wrap gap-[7px]" aria-label="Amplivanta social channels">
              {SOCIALS.map(([network, label, glyph, tone]) => (
                <span
                  key={network}
                  role="img"
                  aria-label={label}
                  className={cn(
                    "inline-flex h-[29px] w-[29px] items-center justify-center rounded-full border border-white/15 text-[12px] font-extrabold text-white",
                    tone,
                  )}
                >
                  {glyph}
                </span>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.label} aria-label={`${col.label} links`}>
              <h3 className="mb-3.5 mt-1 text-[12px] font-bold uppercase tracking-[0.8px] text-white">
                {col.label}
              </h3>
              {col.links.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="mb-2 block text-[12.5px] leading-snug text-[#CBD7EB] transition hover:text-white hover:underline hover:underline-offset-[3px]"
                >
                  {label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="mt-[26px] flex flex-col items-start justify-between gap-5 border-t border-white/15 pt-5 text-[11.5px] text-[#AFC0DC] sm:flex-row sm:items-center">
          <span>© 2026 Amplivanta Inc. All rights reserved.</span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:flex sm:gap-[18px]">
            {[
              ["Your Privacy Choices", "/privacy-choices"],
              ["Sitemap", "/sitemap"],
              ["Accessibility", "/accessibility"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="text-[#C9D5E8] transition hover:text-white hover:underline">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Page gutter. The header and footer come from the marketing layout, so every
 * public page carries them whether or not it uses this wrapper.
 */
export function SitePage({ children }: { active?: NavKey; children: React.ReactNode }) {
  return <>{children}</>;
}
