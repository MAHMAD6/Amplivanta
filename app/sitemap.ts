import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { LEGAL_DOCS } from "@/lib/legal-docs";
import { MARKETPLACE_LEGAL_DOCS } from "@/lib/marketplace-legal-docs";
import { COMPANY_PAGES } from "@/lib/marketing-modules";
import { PLATFORM_PAGES } from "@/lib/site-platform";
import { SOLUTION_PAGES } from "@/lib/site-solutions";
import { INDUSTRY_PAGES } from "@/lib/site-industries";
import { RESOURCE_PAGES } from "@/lib/site-resources";
import { indexablePublicProductSlugs } from "@/lib/server/public-marketplace";

/**
 * The sitemap is generated from the same registries the pages render from, so
 * it can only advertise routes that exist. It previously listed the original
 * agency-site IA (/about, /services/*, /portfolio/*), none of which survived
 * the platform rebuild — every one of those URLs was a 404 handed to crawlers.
 *
 * Authenticated surfaces (/app, /admin) are deliberately excluded.
 */

const STATIC_ROUTES = [
  "",
  "/pricing",
  "/platform",
  "/solutions",
  "/industries",
  "/resources",
  "/company",
  "/resources/blog",
  "/company/careers",
  "/contact",
  "/book-demo",
  "/resources/help-center",
  "/trust",
  "/community",
  "/partners",
  "/partners/apply",
  "/partners/terms",
  "/affiliate-program",
  "/legal",
  "/marketplace",
  "/marketplace/categories",
  "/marketplace/sell",
  "/privacy-choices",
  "/accessibility",
  "/sitemap",
  "/legal/dpa",
  "/login",
  "/signup",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const dynamic = [
    ...BLOG_POSTS.map((p) => `/resources/blog/${p.slug}`),
    ...SOLUTION_PAGES.map((p) => `/solutions/${p.slug}`),
    ...PLATFORM_PAGES.map((p) => `/platform/${p.slug}`),
    ...INDUSTRY_PAGES.map((p) => `/industries/${p.slug}`),
    ...RESOURCE_PAGES.map((p) => `/resources/${p.slug}`),
    ...Object.keys(COMPANY_PAGES).map((slug) => `/company/${slug}`),
    ...Object.keys(LEGAL_DOCS).map((slug) => `/legal/${slug}`),
    ...Object.keys(MARKETPLACE_LEGAL_DOCS).map((slug) => `/legal/${slug}`),
    "/legal/cookies",
    "/legal/compliance",
    "/legal/partner-terms",
    "/legal/affiliate-terms",
    // Published listings whose seller allows indexing. A seller who turns
    // indexing off keeps a working link, just not a crawled one.
    ...(await indexablePublicProductSlugs()).map((slug) => `/marketplace/products/${slug}`),
  ];

  // A slug can legitimately appear in two registries; a sitemap must not repeat it.
  const paths = Array.from(new Set([...STATIC_ROUTES, ...dynamic]));

  return paths.map((path) => ({ url: `${SITE_URL}${path}`, lastModified }));
}
