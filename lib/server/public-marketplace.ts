import "server-only";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";

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
  priceLabel: string;
};

const priceLabel = (v: { priceCents: number; currency: string } | undefined) => {
  if (!v) return "Unavailable";
  if (v.priceCents === 0) return "Free";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: v.currency }).format(
    v.priceCents / 100,
  );
};

export async function loadPublicCatalogue(opts: { categorySlug?: string; take?: number } = {}) {
  try {
    const [rows, categories] = await Promise.all([
      prisma.marketplaceProduct.findMany({
        where: {
          status: "PUBLISHED",
          ...(opts.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
        },
        orderBy: { publishedAt: "desc" },
        take: opts.take ?? 48,
        select: {
          id: true, slug: true, title: true, summary: true,
          coverImage: true, coverImageAlt: true,
          category: { select: { name: true } },
          seller: { select: { storeName: true } },
          versions: { orderBy: { version: "desc" }, take: 1, select: { priceCents: true, currency: true } },
        },
      }),
      prisma.marketplaceCategory.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: { name: true, slug: true },
      }),
    ]);

    const products: PublicProductCard[] = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      summary: r.summary,
      coverImage: r.coverImage,
      coverImageAlt: r.coverImageAlt,
      categoryName: r.category?.name ?? null,
      sellerName: r.seller.storeName,
      priceLabel: priceLabel(r.versions[0]),
    }));

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
