import "server-only";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";
import { isContentCreation } from "@/lib/marketplace/content-creation";
import { STANDARD_LICENSE, type StoreType } from "@/lib/marketplace/storefront";

/**
 * Public, unauthenticated view of the Marketplace catalogue.
 *
 * Only PUBLISHED products are addressable here, and a product whose seller
 * turned indexing off is still reachable by direct link but is excluded from
 * the sitemap and marked noindex — the seller controls discovery, not access.
 *
 * These loaders never throw: an unreachable database returns an empty result
 * with `connected: false` so the page can say so rather than showing a
 * catalogue that looks empty.
 */

export const publicProductUrl = (slug: string) => `${SITE_URL}/marketplace/products/${slug}`;

export type PublicProductCard = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  categoryName: string | null;
  sellerName: string;
  sellerSlug: string;
  priceLabel: string;
  priceCents: number | null;
};

export type CatalogueQuery = {
  categorySlug?: string;
  take?: number;
  q?: string;
  types?: StoreType[];
  creation?: string[];
  /** "standard" | "other" — matched against the latest version's licence. */
  licenses?: string[];
  sellerSlug?: string;
  sort?: string;
};

const priceLabel = (v: { priceCents: number; currency: string } | undefined) => {
  if (!v) return "Unavailable";
  if (v.priceCents === 0) return "Free";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: v.currency }).format(
    v.priceCents / 100,
  );
};

export async function loadPublicCatalogue(opts: CatalogueQuery = {}) {
  const q = opts.q?.trim();
  const creation = (opts.creation ?? []).filter(isContentCreation);
  try {
    const [rows, categories] = await Promise.all([
      prisma.marketplaceProduct.findMany({
        where: {
          status: "PUBLISHED",
          ...(opts.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
          ...(opts.types?.length ? { type: { in: opts.types } } : {}),
          ...(creation.length ? { contentCreation: { in: creation } } : {}),
          ...(opts.sellerSlug ? { seller: { slug: opts.sellerSlug } } : {}),
          ...(q
            ? {
                OR: [
                  { title: { contains: q, mode: "insensitive" as const } },
                  { summary: { contains: q, mode: "insensitive" as const } },
                  { seller: { storeName: { contains: q, mode: "insensitive" as const } } },
                  { category: { name: { contains: q, mode: "insensitive" as const } } },
                ],
              }
            : {}),
        },
        orderBy: { publishedAt: "desc" },
        take: opts.take ?? 48,
        select: {
          id: true, slug: true, title: true, summary: true,
          coverImage: true, coverImageAlt: true,
          category: { select: { name: true } },
          seller: { select: { storeName: true, slug: true } },
          versions: {
            orderBy: { version: "desc" },
            take: 1,
            select: { priceCents: true, currency: true, licenseVersion: true },
          },
        },
      }),
      prisma.marketplaceCategory.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: { name: true, slug: true },
      }),
    ]);

    // Licence lives on the version, so it is filtered after the query.
    const licenses = opts.licenses ?? [];
    const licensed = licenses.length
      ? rows.filter((r) => {
          const standard = r.versions[0]?.licenseVersion === STANDARD_LICENSE;
          return (standard && licenses.includes("standard")) || (!standard && licenses.includes("other"));
        })
      : rows;

    const products: PublicProductCard[] = licensed.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      summary: r.summary,
      coverImage: r.coverImage,
      coverImageAlt: r.coverImageAlt,
      categoryName: r.category?.name ?? null,
      sellerName: r.seller.storeName,
      sellerSlug: r.seller.slug,
      priceLabel: priceLabel(r.versions[0]),
      priceCents: r.versions[0]?.priceCents ?? null,
    }));

    // Prices can be in different currencies; this orders by amount only,
    // which is the best available without an exchange-rate source.
    if (opts.sort === "price-asc" || opts.sort === "price-desc") {
      const dir = opts.sort === "price-asc" ? 1 : -1;
      products.sort((a, b) => ((a.priceCents ?? Infinity) - (b.priceCents ?? Infinity)) * dir);
    }

    return { connected: true, products, categories };
  } catch {
    return { connected: false, products: [] as PublicProductCard[], categories: [] as { name: string; slug: string }[] };
  }
}

export function loadPublicProduct(slug: string) {
  return prisma.marketplaceProduct.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true, slug: true, title: true, summary: true, description: true, tags: true, type: true,
      coverImage: true, coverImageAlt: true, galleryImages: true, galleryImageAlts: true,
      language: true, highlights: true, perfectFor: true, contentCreation: true,
      seoTitle: true, metaDescription: true, allowIndexing: true,
      seller: { select: { storeName: true, slug: true, bio: true, createdAt: true } },
      category: { select: { name: true, slug: true } },
      versions: {
        orderBy: { version: "desc" },
        take: 1,
        select: {
          version: true, priceCents: true, currency: true, licenseVersion: true,
          assets: { select: { fileName: true, sizeBytes: true } },
        },
      },
    },
  });
}

/**
 * A seller's public store. Only approved sellers have one; applicants,
 * suspended and closed stores are not addressable.
 */
export async function loadPublicStore(slug: string) {
  return prisma.marketplaceSeller.findFirst({
    where: { slug, status: "APPROVED" },
    select: { storeName: true, slug: true, headline: true, bio: true, approvedAt: true },
  });
}

/** Slugs safe to advertise in the sitemap: published and indexable. */
export async function indexablePublicProductSlugs(): Promise<string[]> {
  try {
    const rows = await prisma.marketplaceProduct.findMany({
      where: { status: "PUBLISHED", allowIndexing: true },
      select: { slug: true },
      take: 5000,
    });
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
}
