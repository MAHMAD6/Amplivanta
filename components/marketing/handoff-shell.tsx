import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Public marketing header and footer, ported from the approved HTML handoff.
 *
 * The markup and class names match the reference so the delivered stylesheet
 * applies unchanged. Every destination here is a route that exists; the
 * handoff's link set is the source of truth for the public information
 * architecture.
 */

export type NavKey =
  | "platform"
  | "solutions"
  | "industries"
  | "marketplace"
  | "pricing"
  | "resources"
  | "company"
  | null;

const PRIMARY_NAV: { key: Exclude<NavKey, null>; label: string; href: string }[] = [
  { key: "platform", label: "Platform", href: "/platform" },
  { key: "solutions", label: "Solutions", href: "/solutions" },
  { key: "industries", label: "Industries", href: "/industries" },
  { key: "marketplace", label: "Marketplace", href: "/marketplace" },
  { key: "pricing", label: "Pricing", href: "/pricing" },
  { key: "resources", label: "Resources", href: "/resources" },
  { key: "company", label: "Company", href: "/company" },
];

export function HandoffHeader({ active }: { active?: NavKey }) {
  return (
    <header className="header">
      <Link className="brand" href="/" aria-label="Amplivanta home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/approved-logo.png" alt="Amplivanta logo" />
        <div>
          <div className="name">AMPLIVANTA</div>
          <div className="tag">ENGINEERING GROWTH</div>
        </div>
      </Link>
      <nav className="nav" aria-label="Primary navigation">
        {PRIMARY_NAV.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={cn(active === item.key && "active")}
            aria-current={active === item.key ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <Link className="btn" href="/login">
          Sign in
        </Link>
        <Link className="btn primary" href="/signup">
          Start Engineering Growth
        </Link>
      </div>
    </header>
  );
}

const FOOTER_COLUMNS: { label: string; aria: string; links: [string, string][] }[] = [
  {
    label: "Platform",
    aria: "Platform links",
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
    aria: "Solutions links",
    links: [
      ["Growth Marketing", "/solutions/growth-marketing"],
      ["Revenue Acceleration", "/solutions/revenue-acceleration"],
      ["AI Workflows", "/solutions/ai-workflows"],
      ["Brand Intelligence", "/solutions/brand-intelligence"],
    ],
  },
  {
    label: "Marketplace",
    aria: "Marketplace links",
    links: [
      ["Marketplace", "/marketplace"],
      ["Browse Products", "/marketplace/products"],
      ["Categories", "/marketplace/categories"],
      ["Sell on Amplivanta", "/marketplace/sell"],
    ],
  },
  {
    label: "Resources",
    aria: "Resources links",
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
    aria: "Company links",
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
    aria: "Legal links",
    links: [
      ["Privacy Policy", "/legal/privacy"],
      ["Terms of Service", "/legal/terms"],
      ["Cookie Policy", "/legal/cookies"],
      ["Security / Trust Center", "/trust"],
    ],
  },
];

/**
 * The handoff ships seven social icons. They are rendered as non-linking marks
 * until each official profile URL is confirmed — the README is explicit that
 * these must not be published as links before then.
 */
const SOCIALS: [string, string, string][] = [
  ["linkedin", "LinkedIn", "in"],
  ["youtube", "YouTube", "▶"],
  ["x", "X", "X"],
  ["instagram", "Instagram", "◎"],
  ["facebook", "Facebook", "f"],
  ["tiktok", "TikTok", "♪"],
  ["pinterest", "Pinterest", "P"],
];

export function HandoffFooter() {
  return (
    <footer className="site-footer" aria-label="Amplivanta public footer">
      <section className="footer-cta" aria-labelledby="footer-cta-title">
        <div className="footer-cta-copy">
          <h2 id="footer-cta-title">Ready to Engineer Smarter Growth?</h2>
          <p>Turn ideas into measurable progress with AI-powered marketing, automation, and analytics.</p>
        </div>
        <div className="footer-cta-actions">
          <Link className="btn primary" href="/signup">
            Start Engineering Growth →
          </Link>
          <Link className="btn" href="/book-demo">
            Book a Demo
          </Link>
        </div>
      </section>

      <div className="footer-body">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-lockup">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/approved-logo.png" alt="Amplivanta logo" />
              <div>
                <div className="footer-wordmark">AMPLIVANTA</div>
                <div className="footer-tag">ENGINEERING GROWTH</div>
              </div>
            </div>
            <p>
              Amplivanta helps businesses plan, create, and grow with AI-powered marketing,
              automation, and analytics.
            </p>
            <div className="social-row" aria-label="Amplivanta social channels">
              {SOCIALS.map(([network, label, glyph]) => (
                <span key={network} className="social-icon" data-network={network} role="img" aria-label={label}>
                  {glyph}
                </span>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.label} className="footer-col" aria-label={col.aria}>
              <h3>{col.label}</h3>
              {col.links.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© 2026 Amplivanta Inc. All rights reserved.</span>
          <div className="footer-bottom-links">
            <Link href="/privacy-choices">Your Privacy Choices</Link>
            <Link href="/sitemap">Sitemap</Link>
            <Link href="/accessibility">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Page wrapper. `section` selects the per-batch scale overrides in the ported
 * stylesheet, so a Platform page renders at its 58px hero and a Resources page
 * at its 48px one, exactly as delivered.
 */
export function HandoffPage({
  section,
  active,
  children,
}: {
  section: "company" | "industries" | "platform" | "resources" | "solutions";
  active?: NavKey;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("page", `pg-${section}`)}>
      <HandoffHeader active={active} />
      <main className="main">{children}</main>
      <HandoffFooter />
    </div>
  );
}
