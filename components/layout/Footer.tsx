import Link from "next/link";
import { Instagram, Linkedin, Twitter, Facebook, Youtube } from "lucide-react";
import { FOOTER_SERVICES, FOOTER_COMPANY, SOCIAL_LINKS, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { Logo } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";

const socials = [
  { icon: Instagram, href: SOCIAL_LINKS.instagram, label: "Instagram" },
  { icon: Linkedin, href: SOCIAL_LINKS.linkedin, label: "LinkedIn" },
  { icon: Twitter, href: SOCIAL_LINKS.twitter, label: "Twitter" },
  { icon: Facebook, href: SOCIAL_LINKS.facebook, label: "Facebook" },
  { icon: Youtube, href: SOCIAL_LINKS.youtube, label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-[#0d0b18] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <Logo dark />
            <p className="mt-4 max-w-xs text-sm text-white/70">
              {SITE_NAME} — {SITE_TAGLINE}. We help brands grow through strategy, creativity, and data.
            </p>
            <div className="mt-6 flex gap-4">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-white/70 transition hover:text-[#6D3BF5]"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Services</h4>
            <ul className="mt-4 space-y-2">
              {FOOTER_SERVICES.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/70 transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Company</h4>
            <ul className="mt-4 space-y-2">
              {FOOTER_COMPANY.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/70 transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Newsletter</h4>
            <p className="mt-4 text-sm text-white/70">Get marketing tips in your inbox.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#26233a] pt-6 text-sm text-white/60 md:flex-row">
          <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link>
            <span>|</span>
            <Link href="/terms" className="transition hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
