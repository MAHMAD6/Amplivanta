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

export type TaxonomyRow = { name: string; count: number; types: string[] };

/** Categories or tags in use, with how many items carry each. */
export async function loadTaxonomy(kind: "categories" | "tags") {
  try {
    const rows = await prisma.contentItem.findMany({ select: { contentType: true, categories: true, tags: true } });
    const map = new Map<string, { count: number; types: Set<string> }>();
    for (const r of rows) {
      for (const value of kind === "categories" ? r.categories : r.tags) {
        const entry = map.get(value) ?? { count: 0, types: new Set<string>() };
        entry.count++;
        entry.types.add(r.contentType);
        map.set(value, entry);
      }
    }
    const list: TaxonomyRow[] = [...map.entries()]
      .map(([name, v]) => ({ name, count: v.count, types: [...v.types] }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return { connected: true, rows: list, items: rows.length };
  } catch {
    return { connected: false, rows: [] as TaxonomyRow[], items: 0 };
  }
}

export type AuthorRow = { name: string; total: number; published: number; lastUpdated: string | null };

/** Authors credited on content, with their counts. */
export async function loadAuthors() {
  try {
    const rows = await prisma.contentItem.findMany({ where: { authorName: { not: null } }, select: { authorName: true, status: true, updatedAt: true } });
    const map = new Map<string, { total: number; published: number; last: Date }>();
    for (const r of rows) {
      const name = (r.authorName ?? "").trim();
      if (!name) continue;
      const e = map.get(name) ?? { total: 0, published: 0, last: r.updatedAt };
      e.total++;
      if (r.status === "PUBLISHED") e.published++;
      if (r.updatedAt > e.last) e.last = r.updatedAt;
      map.set(name, e);
    }
    const list: AuthorRow[] = [...map.entries()]
      .map(([name, v]) => ({ name, total: v.total, published: v.published, lastUpdated: dt(v.last) }))
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
    return { connected: true, rows: list };
  } catch {
    return { connected: false, rows: [] as AuthorRow[] };
  }
}

/** Publishing queue: what is scheduled, and what went live recently. */
export async function loadPublishingQueue() {
  try {
    const [scheduled, published, drafts] = await Promise.all([
      prisma.contentItem.findMany({ where: { status: "SCHEDULED" }, orderBy: { scheduledAt: "asc" }, take: 50 }),
      prisma.contentItem.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 20 }),
      prisma.contentItem.count({ where: { status: { in: ["DRAFT", "IN_REVIEW"] } } }),
    ]);
    const map = (r: { id: string; contentType: string; title: string; status: string; scheduledAt: Date | null; publishedAt: Date | null }) => ({
      id: r.id,
      contentType: r.contentType,
      title: r.title,
      status: r.status,
      scheduledAt: dt(r.scheduledAt),
      publishedAt: dt(r.publishedAt),
    });
    return { connected: true, scheduled: scheduled.map(map), published: published.map(map), drafts };
  } catch {
    return { connected: false, scheduled: [], published: [], drafts: 0 };
  }
}

/** Items published without SEO fields, so the gaps are visible rather than assumed. */
export async function loadSeoGaps() {
  try {
    const rows = await prisma.contentItem.findMany({ orderBy: { updatedAt: "desc" }, take: 300, select: { id: true, contentType: true, title: true, slug: true, status: true, seoTitle: true, seoDescription: true, excerpt: true } });
    return {
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        contentType: r.contentType,
        title: r.title,
        slug: r.slug,
        status: r.status,
        hasTitle: Boolean(r.seoTitle?.trim()),
        hasDescription: Boolean(r.seoDescription?.trim() || r.excerpt?.trim()),
      })),
    };
  } catch {
    return { connected: false, rows: [] };
  }
}

/** Content analytics from records that exist: counts, cadence and taxonomy spread. */
export async function loadContentAnalytics(months = 6) {
  try {
    const since = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - (months - 1), 1));
    const [items, published] = await Promise.all([
      prisma.contentItem.findMany({ select: { contentType: true, status: true, categories: true, authorName: true } }),
      prisma.contentItem.findMany({ where: { status: "PUBLISHED", publishedAt: { gte: since } }, select: { publishedAt: true, contentType: true } }),
    ]);
    const cadence = new Map<string, number>();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - i, 1));
      cadence.set(d.toISOString().slice(0, 7), 0);
    }
    for (const p of published) {
      const key = p.publishedAt?.toISOString().slice(0, 7);
      if (key && cadence.has(key)) cadence.set(key, (cadence.get(key) ?? 0) + 1);
    }
    const categories = new Map<string, number>();
    for (const i of items) for (const c of i.categories) categories.set(c, (categories.get(c) ?? 0) + 1);
    return {
      connected: true,
      total: items.length,
      publishedTotal: items.filter((i) => i.status === "PUBLISHED").length,
      byType: [...new Set(items.map((i) => i.contentType))].map((t) => ({ contentType: t, count: items.filter((i) => i.contentType === t).length })),
      cadence: [...cadence.entries()] as [string, number][],
      topCategories: [...categories.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8) as [string, number][],
      authors: new Set(items.map((i) => (i.authorName ?? "").trim()).filter(Boolean)).size,
    };
  } catch {
    return { connected: false, total: 0, publishedTotal: 0, byType: [], cadence: [], topCategories: [], authors: 0 };
  }
}
