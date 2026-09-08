import type { Metadata } from "next";
import Link from "next/link";
import { Crumb, Hero, Section } from "@/components/marketing/site-ui";
import { PLATFORM_PAGES } from "@/lib/site-platform";
import { SOLUTION_PAGES } from "@/lib/site-solutions";
import { INDUSTRY_PAGES } from "@/lib/site-industries";
import { RESOURCE_PAGES } from "@/lib/site-resources";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Every public page on amplivanta.com, grouped by section.",
};

/**
 * Human-readable sitemap.
 *
 * Built from the same registries the pages render from, so it cannot list a
 * route that does not exist — the machine-readable sitemap.xml is generated
 * from those registries too.
 */
const GROUPS: { title: string; links: [string, string][] }[] = [
  {
    title: "Platform",
    links: [["Platform overview", "/platform"], ...PLATFORM_PAGES.map((p) => [p.name, `/platform/${p.slug}`] as [string, string])],
  },
  {
    title: "Solutions",
    links: [["Solutions overview", "/solutions"], ...SOLUTION_PAGES.map((p) => [p.name, `/solutions/${p.slug}`] as [string, string])],
  },
  {
    title: "Industries",
    links: [["Industries overview", "/industries"], ...INDUSTRY_PAGES.map((p) => [p.name, `/industries/${p.slug}`] as [string, string])],
  },
  {
    title: "Resources",
    links: [["Resources overview", "/resources"], ...RESOURCE_PAGES.map((p) => [p.name, `/resources/${p.slug}`] as [string, string])],
  },
  {
    title: "Marketplace",
    links: [
      ["Marketplace", "/marketplace"],
      ["Browse Products", "/marketplace/products"],
      ["Categories", "/marketplace/categories"],
      ["Sell on Amplivanta", "/marketplace/sell"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Company", "/company"],
      ["About Us", "/company/about"],
      ["Careers", "/company/careers"],
      ["Partners", "/partners"],
      ["Affiliate Program", "/affiliate-program"],
      ["Contact Us", "/contact"],
      ["Pricing", "/pricing"],
      ["Book a Demo", "/book-demo"],
    ],
  },
  {
    title: "Legal & trust",
    links: [
      ["Legal index", "/legal"],
      ["Privacy Policy", "/legal/privacy"],
      ["Terms of Service", "/legal/terms"],
      ["Cookie Policy", "/legal/cookies"],
      ["Data Processing Agreement", "/legal/dpa"],
      ["Security / Trust Center", "/trust"],
      ["Your Privacy Choices", "/privacy-choices"],
      ["Accessibility", "/accessibility"],
    ],
  },
  {
    title: "Account",
    links: [
      ["Sign in", "/login"],
      ["Create an account", "/signup"],
      ["Forgot password", "/forgot-password"],
    ],
  },
];

export default function SitemapPage() {
  return (
    <>
      <Crumb items={["Home", "Sitemap"]} />
      <Hero
        eyebrow="SITEMAP"
        title="Everything on this site, in one list."
        lead="Grouped by section. This page is generated from the same registries the pages themselves use, so it cannot drift out of date."
      />

      <Section>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.8px] text-site-purple">
                {g.title}
              </h2>
              {g.links.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="mb-2 block text-[13.5px] text-site-muted transition hover:text-site-purple hover:underline"
                >
                  {label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
      </Section>
    </>
  );
}
