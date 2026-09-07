import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { LEGAL_DOCS } from "@/lib/legal-docs";
import { MARKETPLACE_LEGAL_DOCS } from "@/lib/marketplace-legal-docs";
import {
  COMPANY_PAGES,
  INDUSTRY_PAGES,
  MODULE_PAGES,
  RESOURCE_PAGES,
  SOLUTION_PAGES,
} from "@/lib/marketing-modules";
import { SOLUTION_DETAIL_PAGES } from "@/lib/solution-pages";
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
  "/solutions/marketing-automation",
  "/solutions/crm-pipeline",
  "/industries",
  "/resources",
  "/company",
  "/blog",
  "/careers",
  "/contact",
  "/demo",
  "/help",
  "/security",
  "/community",
  "/partners",
  "/partners/apply",
  "/partners/terms",
  "/affiliates",
  "/affiliates/apply",
  "/affiliates/terms",
  "/legal",
  "/marketplace",
  "/legal/dpa",
  "/login",
  "/signup",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const dynamic = [
    ...BLOG_POSTS.map((p) => `/blog/${p.slug}`),
    ...Object.keys(SOLUTION_DETAIL_PAGES).map((slug) => `/solutions/${slug}`),
    ...Object.keys(SOLUTION_PAGES).map((slug) => `/solutions/${slug}`),
    ...Object.keys(MODULE_PAGES).map((slug) => `/platform/${slug}`),
    ...Object.keys(INDUSTRY_PAGES).map((slug) => `/industries/${slug}`),
    ...Object.keys(COMPANY_PAGES).map((slug) => `/company/${slug}`),
    ...Object.keys(RESOURCE_PAGES)
      .filter((slug) => slug !== "index")
      .map((slug) => `/resources/${slug}`),
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
