import Link from "next/link";
import { Mail, ShieldCheck, Globe } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import {
  FOOTER_PLATFORM,
  FOOTER_INDUSTRIES,
  FOOTER_SOLUTIONS,
  FOOTER_RESOURCES,
  FOOTER_COMPANY,
  FOOTER_LEGAL,
  FOOTER_CONTACTS,
  SOCIAL_TILES,
} from "@/lib/constants";
import { SocialGlyph } from "./social-glyph";

const columns = [
  { title: "Platform", links: FOOTER_PLATFORM },
  { title: "Solutions", links: FOOTER_SOLUTIONS },
  { title: "Industries", links: FOOTER_INDUSTRIES },
  { title: "Resources", links: FOOTER_RESOURCES },
  { title: "Company", links: FOOTER_COMPANY },
  { title: "Legal", links: FOOTER_LEGAL },
];

export function MarketingFooter() {
  return (
    <footer className="bg-deep-navy text-white/80">
      <div className="mx-auto max-w-[1280px] px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 lg:grid-cols-[1.25fr_repeat(6,_minmax(0,0.86fr))_1.35fr]">
          {/* Brand */}
          <div>
            <Logo dark />
            <p className="mt-4 max-w-[240px] text-[12px] leading-relaxed text-white/60">
              Amplivanta is the AI-powered growth engineering platform that helps businesses
              discover opportunities, execute with precision, and measure real results.
            </p>
            <p className="mt-5 text-[11.5px] text-white/50">
              © {new Date().getFullYear()} Amplivanta. All rights reserved.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/60">
              <ShieldCheck aria-hidden className="h-3.5 w-3.5" /> Security-first by design
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-[12.5px] font-bold text-white">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={`${col.title}-${l.href}-${l.label}`}>
                    <Link
                      href={l.href}
                      className="text-[11.5px] text-white/60 transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 className="mb-3 text-[12.5px] font-bold text-white">Stay Ahead of Growth</h4>
            <p className="mb-3 text-[11.5px] leading-relaxed text-white/60">
              Get growth-ready product updates and strategies straight to your inbox.
            </p>
            <form className="flex overflow-hidden rounded-md">
              <input
                type="email"
                name="email"
                aria-label="Email address"
                autoComplete="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 bg-white px-3 py-2.5 text-[12px] text-ink placeholder:text-ink-muted focus:outline-none"
              />
              <button
                type="submit"
                className="bg-royal-blue px-4 text-[12px] font-semibold text-white transition hover:bg-royal-soft"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-white/60">
              <ShieldCheck aria-hidden className="h-3.5 w-3.5" /> No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Security practices (no unverified certification claims) */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1280px] px-4 py-8 lg:px-8">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.25em] text-white/50">Built with security &amp; privacy in mind</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {PRACTICES.map((c) => (
              <div key={c.title} className="flex items-center gap-2 text-white/70">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20"><ShieldCheck aria-hidden className="h-4 w-4" /></span>
                <div className="leading-tight"><div className="text-[12.5px] font-bold text-white">{c.title}</div><div className="text-[10.5px] text-white/50">{c.tag}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar — Follow Us + contact addresses */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-[11.5px] font-semibold text-white/70">Follow Us</span>
            {SOCIAL_TILES.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={s.label}
                className="text-white/60 transition hover:text-white"
              >
                <SocialGlyph name={s.key} className="h-4 w-4" />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {FOOTER_CONTACTS.map((c) => (
              <a
                key={c.href}
                href={c.href}
                className="flex items-center gap-1.5 text-[11.5px] text-white/60 transition hover:text-white"
              >
                <Mail aria-hidden className="h-3.5 w-3.5" /> {c.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Locale bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span className="text-[11.5px] text-white/60">Built for growth teams that <span className="font-semibold text-royal-soft">engineer results.</span></span>
          <div className="flex items-center gap-2 text-[11.5px] text-white/60">
            <Globe aria-hidden className="h-3.5 w-3.5" /> Worldwide <span className="text-white/30">•</span> English (US)
          </div>
        </div>
      </div>
    </footer>
  );
}

// Practice-based statements only — no certification/compliance claims until
// those certifications and contracts are actually held (see launch audit).
const PRACTICES = [
  { title: "Encryption", tag: "In transit & at rest" },
  { title: "Access controls", tag: "Role-based permissions" },
  { title: "Tenant isolation", tag: "Workspace-scoped data" },
  { title: "Privacy by design", tag: "Consent-aware handling" },
];
