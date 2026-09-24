import "server-only";
import { prisma } from "@/lib/prisma";
import { CONTENT_TYPES, type ContentType } from "@/lib/admin/content";

/** Reads for the content operations screens; each one reports whether the database answered. */

const dt = (d: Date | null) => (d ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(d) : null);

export type ContentRow = {
  id: string;
  contentType: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  visibility: string;
  authorName: string | null;
  categories: string[];
  tags: string[];
  publishedAt: string | null;
  scheduledAt: string | null;
  updatedAt: string;
  versions: number;
};

export async function loadContentItems(contentType?: ContentType, take = 200) {
  try {
    const rows = await prisma.contentItem.findMany({
      where: contentType ? { contentType } : {},
      orderBy: { updatedAt: "desc" },
      take,
      include: { _count: { select: { versions: true } } },
    });
    return {
      connected: true,
      rows: rows.map((r): ContentRow => ({
        id: r.id,
        contentType: r.contentType,
        title: r.title,
        slug: r.slug,
        excerpt: r.excerpt,
        status: r.status,
        visibility: r.visibility,
        authorName: r.authorName,
        categories: r.categories,
        tags: r.tags,
        publishedAt: dt(r.publishedAt),
        scheduledAt: dt(r.scheduledAt),
        updatedAt: dt(r.updatedAt) ?? "",
        versions: r._count.versions,
      })),
    };
  } catch {
    return { connected: false, rows: [] as ContentRow[] };
  }
}

export async function loadContentItem(id: string) {
  try {
    const row = await prisma.contentItem.findUnique({ where: { id }, include: { versions: { orderBy: { version: "desc" }, take: 10 }, featuredMedia: true } });
    if (!row) return null;
    return {
      id: row.id,
      contentType: row.contentType,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt ?? "",
      body: row.body ?? "",
      status: row.status,
      visibility: row.visibility,
      authorName: row.authorName ?? "",
      categories: row.categories,
      tags: row.tags,
      seoTitle: row.seoTitle ?? "",
      seoDescription: row.seoDescription ?? "",
      scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString().slice(0, 16) : "",
      featuredMediaId: row.featuredMediaId,
      featuredMediaUrl: row.featuredMedia?.url ?? null,
      data: (row.data as Record<string, unknown>) ?? {},
      versions: row.versions.map((v) => ({ version: v.version, status: v.status, createdAt: dt(v.createdAt) ?? "" })),
    };
  } catch {
    return null;
  }
}

/** Counts per content type and status for the Content Overview screen. */
export async function loadContentOverview() {
  try {
    const grouped = await prisma.contentItem.groupBy({ by: ["contentType", "status"], _count: true });
    const media = await prisma.mediaAsset.count();
    const byType = CONTENT_TYPES.map((t) => {
      const rows = grouped.filter((g) => g.contentType === t.value);
      const total = rows.reduce((a, r) => a + r._count, 0);
      const count = (s: string) => rows.find((r) => r.status === s)?._count ?? 0;
      return { ...t, total, published: count("PUBLISHED"), draft: count("DRAFT") + count("IN_REVIEW"), scheduled: count("SCHEDULED"), archived: count("ARCHIVED") };
    });
    return { connected: true, byType, media };
  } catch {
    return { connected: false, byType: [], media: 0 };
  }
}

export async function loadMediaAssets(take = 200) {
  try {
    const rows = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take, include: { _count: { select: { usages: true, featuredOn: true } } } });
    return {
      connected: true,
      rows: rows.map((m) => ({
        id: m.id,
        fileName: m.fileName,
        url: m.url,
        mimeType: m.mimeType,
        fileSize: m.fileSize,
        altText: m.altText ?? "",
        caption: m.caption ?? "",
        description: m.description ?? "",
        folder: m.folder ?? "",
        tags: m.tags,
        usedIn: m._count.usages + m._count.featuredOn,
        createdAt: dt(m.createdAt) ?? "",
      })),
    };
  } catch {
    return { connected: false, rows: [] };
  }
}

/** Lead capture forms and landing pages a lead magnet can point at. */
export async function loadConversionTargets() {
  try {
    const [forms, pages] = await Promise.all([
      prisma.form.findMany({ where: { status: "active" }, orderBy: { name: "asc" }, take: 200, select: { id: true, name: true } }),
      prisma.landingPage.findMany({ where: { isPublished: true }, orderBy: { title: "asc" }, take: 200, select: { id: true, title: true } }),
    ]);
    return { forms, pages: pages.map((p) => ({ id: p.id, name: p.title })) };
  } catch {
    return { forms: [], pages: [] };
  }
}
