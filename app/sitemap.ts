import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getServices, getPortfolio, getPosts } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/about", "/services", "/portfolio", "/reviews", "/blog", "/contact"].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
    })
  );

  const [services, portfolio, posts] = await Promise.all([
    getServices(),
    getPortfolio(),
    getPosts(),
  ]);

  const dynamicRoutes = [
    ...services.map((s) => ({ url: `${SITE_URL}/services/${s.slug}`, lastModified: new Date() })),
    ...portfolio.map((p) => ({ url: `${SITE_URL}/portfolio/${p.slug}`, lastModified: new Date() })),
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: new Date() })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
