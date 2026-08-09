import { db } from "@/lib/db";
import {
  MOCK_SERVICES,
  MOCK_PORTFOLIO,
  MOCK_BLOG,
  MOCK_REVIEWS,
  MOCK_TEAM,
} from "@/lib/mock-data";
import type { Service, Portfolio, BlogPost, Review, TeamMember } from "@/types";

/**
 * Data-access layer. Attempts to read from the database; if the database is
 * unavailable (e.g. before `docker compose up` + seed), it transparently falls
 * back to mock data so the site always renders during development.
 */

async function tryDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    const result = await fn();
    // Empty DB → use mock so pages aren't blank before seeding.
    if (Array.isArray(result) && result.length === 0) return fallback;
    return result;
  } catch {
    return fallback;
  }
}

// ---------- Services ----------
export async function getServices(): Promise<Service[]> {
  return tryDb(
    () => db.service.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }) as Promise<Service[]>,
    MOCK_SERVICES
  );
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  return tryDb(
    () => db.service.findUnique({ where: { slug } }) as Promise<Service | null>,
    MOCK_SERVICES.find((s) => s.slug === slug) ?? null
  );
}

// ---------- Portfolio ----------
export async function getPortfolio(): Promise<Portfolio[]> {
  return tryDb(
    () =>
      db.portfolio.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
      }) as unknown as Promise<Portfolio[]>,
    MOCK_PORTFOLIO
  );
}

export async function getFeaturedPortfolio(limit = 3): Promise<Portfolio[]> {
  const all = await getPortfolio();
  const featured = all.filter((p) => p.isFeatured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getPortfolioBySlug(slug: string): Promise<Portfolio | null> {
  return tryDb(
    () => db.portfolio.findUnique({ where: { slug } }) as unknown as Promise<Portfolio | null>,
    MOCK_PORTFOLIO.find((p) => p.slug === slug) ?? null
  );
}

// ---------- Blog ----------
export async function getPosts(): Promise<BlogPost[]> {
  return tryDb(
    () =>
      db.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
      }) as Promise<BlogPost[]>,
    MOCK_BLOG
  );
}

export async function getRecentPosts(limit = 3): Promise<BlogPost[]> {
  return (await getPosts()).slice(0, limit);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return tryDb(
    () => db.blogPost.findUnique({ where: { slug } }) as Promise<BlogPost | null>,
    MOCK_BLOG.find((p) => p.slug === slug) ?? null
  );
}

// ---------- Reviews ----------
export async function getReviews(): Promise<Review[]> {
  return tryDb(
    () =>
      db.review.findMany({ where: { isApproved: true }, orderBy: { createdAt: "desc" } }) as Promise<Review[]>,
    MOCK_REVIEWS
  );
}

export async function getFeaturedReviews(limit = 6): Promise<Review[]> {
  const all = await getReviews();
  const featured = all.filter((r) => r.isFeatured);
  return (featured.length ? featured : all).slice(0, limit);
}

// ---------- Team ----------
export async function getTeam(): Promise<TeamMember[]> {
  return tryDb(
    () =>
      db.teamMember.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }) as Promise<TeamMember[]>,
    MOCK_TEAM
  );
}
