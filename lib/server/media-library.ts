import "server-only";
import { db } from "@/lib/db";
import { isStorageConfigured, objectUrl } from "@/lib/storage";
import { mediaTaskCatalogue } from "@/lib/server/media-jobs";

/** Library data for the Creative Studio Images and Video screens. */

export type LibraryAsset = { id: string; name: string; url: string | null; size: number; createdAt: Date; favorite: boolean; draft: boolean; ai: boolean };
export type ActiveJob = { id: string; task: string; createdAt: Date };

export const formatBytes = (n: number) =>
  n >= 1024 ** 3 ? `${(n / 1024 ** 3).toFixed(1)} GB` : n >= 1024 ** 2 ? `${(n / 1024 ** 2).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

export async function loadMediaLibrary(workspaceId: string | null, kind: "image" | "video", view: string) {
  const tasks = mediaTaskCatalogue(kind);
  const imageTasks = kind === "video" ? mediaTaskCatalogue("image") : tasks;
  const storageReady = isStorageConfigured();
  const empty = {
    reachable: Boolean(workspaceId),
    tasks,
    storageReady,
    assets: [] as LibraryAsset[],
    images: [] as { id: string; name: string }[],
    brandKits: [] as { id: string; name: string }[],
    jobs: [] as ActiveJob[],
    counts: { total: 0, ai: 0, favorites: 0, bytes: 0 },
    imageTasks,
  };
  if (!workspaceId) return empty;

  try {
    const base = { workspaceId, mimeType: { startsWith: `${kind}/` } };
    const where =
      view === "ai" ? { ...base, tags: { has: "ai-generated" } } : view === "favorites" ? { ...base, tags: { has: "favorite" } } : base;
    const [rows, total, ai, favorites, bytes, images, brandKits, jobs] = await Promise.all([
      view === "stock" || view === "trash" || view === "templates" ? Promise.resolve([]) : db.asset.findMany({ where, orderBy: { createdAt: "desc" }, take: 48 }),
      db.asset.count({ where: base }),
      db.asset.count({ where: { ...base, tags: { has: "ai-generated" } } }),
      db.asset.count({ where: { ...base, tags: { has: "favorite" } } }),
      db.asset.aggregate({ where: base, _sum: { fileSize: true } }),
      db.asset.findMany({ where: { workspaceId, mimeType: { startsWith: "image/" } }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, name: true } }),
      db.brandKit.findMany({ where: { workspaceId }, orderBy: { createdAt: "asc" }, take: 20, select: { id: true, name: true } }),
      db.mediaGenerationJob.findMany({
        where: { workspaceId, kind, status: { in: ["queued", "processing", "finalizing"] }, createdAt: { gt: new Date(Date.now() - 6 * 60 * 60 * 1000) } },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, task: true, createdAt: true },
      }),
    ]);
    const assets = await Promise.all(
      rows.map(async (a) => ({
        id: a.id,
        name: a.name,
        url: storageReady ? await objectUrl(a.fileUrl).catch(() => null) : null,
        size: a.fileSize,
        createdAt: a.createdAt,
        favorite: a.tags.includes("favorite"),
        draft: a.tags.includes("draft"),
        ai: a.tags.includes("ai-generated"),
      })),
    );
    return { ...empty, assets, images, brandKits, jobs, counts: { total, ai, favorites, bytes: bytes._sum.fileSize ?? 0 } };
  } catch {
    return { ...empty, reachable: false };
  }
}
