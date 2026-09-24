"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectiveAccess, hasPermission } from "@/lib/server/rbac";
import { DATA_FIELDS, canTransition, contentTypeMeta, slugify, validateContent, type ContentInput } from "@/lib/admin/content";

/**
 * Content operations writes: one editor service for every content type, one
 * publishing lifecycle, and a version snapshot whenever published content
 * changes so nothing is overwritten without history.
 */

export type ContentResult = { ok: true; message: string; id?: string } | { ok: false; error: string };

const denied = { ok: false as const, error: "You do not have permission to manage content." };
const str = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);
const list = (fd: FormData, k: string) => str(fd, k, 500).split(",").map((v) => v.trim()).filter(Boolean).slice(0, 20);

async function actor() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return null;
  const access = await getEffectiveAccess(user.id, user.role ?? null);
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
  if (!isAdmin && !hasPermission(access, "content.manage")) return null;
  return user as { id: string };
}

async function audit(actorUserId: string, action: string, resourceId: string | undefined, metadata: Record<string, unknown>) {
  await prisma.platformAuditLog.create({ data: { actorUserId, action, resourceType: "ContentItem", resourceId, metadata: metadata as never } }).catch(() => null);
}

const refresh = (contentType?: string) => {
  revalidatePath("/admin/content-management", "layout");
  const meta = contentType ? contentTypeMeta(contentType) : null;
  if (meta) revalidatePath(meta.href);
};

/** Collects the type-specific fields the editor posted. */
function readData(fd: FormData, contentType: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of DATA_FIELDS[contentType] ?? []) {
    const raw = fd.get(`data.${field}`);
    if (raw == null) continue;
    const value = String(raw).trim();
    if (field === "registrationEnabled" || field === "featured" || field === "allowTeamUse") out[field] = value === "on" || value === "true";
    else if (field === "speakers" || field === "supportedFormats") out[field] = value ? value.split(",").map((v) => v.trim()).filter(Boolean).slice(0, 20) : [];
    else if (value) out[field] = value.slice(0, 2000);
  }
  return out;
}

export async function saveContentItem(fd: FormData): Promise<ContentResult> {
  const a = await actor();
  if (!a) return denied;

  const id = str(fd, "id", 40);
  const contentType = str(fd, "contentType", 40);
  const meta = contentTypeMeta(contentType);
  if (!meta) return { ok: false, error: "Choose a content type." };

  const title = str(fd, "title", 200);
  const scheduledRaw = str(fd, "scheduledAt", 40);
  const input: ContentInput = {
    contentType,
    title,
    slug: slugify(str(fd, "slug", 120) || title),
    excerpt: str(fd, "excerpt", 500) || null,
    body: String(fd.get("body") ?? "").trim().slice(0, 100000) || null,
    status: str(fd, "status", 20) || "DRAFT",
    visibility: str(fd, "visibility", 20) || "public",
    authorName: str(fd, "authorName", 120) || null,
    categories: list(fd, "categories"),
    tags: list(fd, "tags"),
    seoTitle: str(fd, "seoTitle", 200) || null,
    seoDescription: str(fd, "seoDescription", 400) || null,
    scheduledAt: scheduledRaw ? new Date(scheduledRaw) : null,
    data: readData(fd, contentType),
  };
  if (input.scheduledAt && Number.isNaN(input.scheduledAt.getTime())) return { ok: false, error: "Enter a valid schedule time." };

  const problem = validateContent(input);
  if (problem) return { ok: false, error: problem };

  const featuredMediaId = str(fd, "featuredMediaId", 40) || null;
  const clash = await prisma.contentItem.findFirst({ where: { contentType, slug: input.slug, ...(id ? { NOT: { id } } : {}) }, select: { id: true } });
  if (clash) return { ok: false, error: "Another item of this type already uses that slug." };

  const fields = {
    contentType,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    body: input.body,
    status: input.status,
    visibility: input.visibility,
    authorName: input.authorName,
    categories: input.categories,
    tags: input.tags,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    scheduledAt: input.status === "SCHEDULED" ? input.scheduledAt : null,
    publishedAt: input.status === "PUBLISHED" ? new Date() : null,
    featuredMediaId,
    data: input.data as never,
    updatedById: a.id,
  };

  if (id) {
    const existing = await prisma.contentItem.findUnique({ where: { id }, select: { id: true, status: true, title: true, body: true, data: true, publishedAt: true } });
    if (!existing) return { ok: false, error: "That item no longer exists." };
    if (existing.status !== input.status && !canTransition(existing.status, input.status)) {
      return { ok: false, error: `A ${existing.status.toLowerCase()} item cannot move straight to ${input.status.toLowerCase()}.` };
    }
    // Published content is versioned before it is overwritten.
    if (existing.status === "PUBLISHED") await snapshot(existing.id, a.id);
    const row = await prisma.contentItem.update({
      where: { id },
      data: { ...fields, publishedAt: input.status === "PUBLISHED" ? existing.publishedAt ?? new Date() : input.status === "ARCHIVED" ? existing.publishedAt : fields.publishedAt },
    });
    await audit(a.id, "content.updated", row.id, { contentType, status: row.status });
    refresh(contentType);
    return { ok: true, message: `${meta.label} saved`, id: row.id };
  }

  const row = await prisma.contentItem.create({ data: { ...fields, createdById: a.id } });
  await audit(a.id, "content.created", row.id, { contentType, status: row.status });
  refresh(contentType);
  return { ok: true, message: `${meta.label} created`, id: row.id };
}

/** Stores an immutable snapshot of the current state. */
async function snapshot(contentItemId: string, userId: string) {
  const item = await prisma.contentItem.findUnique({ where: { id: contentItemId } });
  if (!item) return;
  const last = await prisma.contentVersion.findFirst({ where: { contentItemId }, orderBy: { version: "desc" }, select: { version: true } });
  await prisma.contentVersion
    .create({ data: { contentItemId, version: (last?.version ?? 0) + 1, title: item.title, body: item.body, data: item.data ?? undefined, status: item.status, createdById: userId } })
    .catch(() => null);
}

export async function setContentStatus(id: string, status: string, scheduledAt?: string): Promise<ContentResult> {
  const a = await actor();
  if (!a) return denied;
  const item = await prisma.contentItem.findUnique({ where: { id } });
  if (!item) return { ok: false, error: "That item no longer exists." };
  if (!canTransition(item.status, status)) return { ok: false, error: `A ${item.status.toLowerCase()} item cannot move straight to ${status.toLowerCase()}.` };

  const when = scheduledAt ? new Date(scheduledAt) : null;
  if (status === "SCHEDULED" && (!when || Number.isNaN(when.getTime()) || when.getTime() < Date.now() - 60000)) {
    return { ok: false, error: "Choose a schedule time in the future." };
  }
  const problem = validateContent({
    contentType: item.contentType,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    body: item.body,
    status,
    visibility: item.visibility,
    categories: item.categories,
    tags: item.tags,
    scheduledAt: when,
    data: (item.data as Record<string, unknown>) ?? {},
  });
  if (problem) return { ok: false, error: problem };

  if (item.status === "PUBLISHED") await snapshot(id, a.id);
  await prisma.contentItem.update({
    where: { id },
    data: {
      status,
      scheduledAt: status === "SCHEDULED" ? when : null,
      publishedAt: status === "PUBLISHED" ? item.publishedAt ?? new Date() : item.publishedAt,
      updatedById: a.id,
    },
  });
  await audit(a.id, `content.${status.toLowerCase()}`, id, { contentType: item.contentType, from: item.status });
  refresh(item.contentType);
  return { ok: true, message: `Moved to ${status.toLowerCase().replace("_", " ")}` };
}

export async function deleteContentItem(id: string): Promise<ContentResult> {
  const a = await actor();
  if (!a) return denied;
  const item = await prisma.contentItem.findUnique({ where: { id }, select: { id: true, status: true, contentType: true, title: true } });
  if (!item) return { ok: false, error: "That item no longer exists." };
  if (item.status === "PUBLISHED") return { ok: false, error: "Archive the item before deleting it, so published content is never removed by accident." };
  await prisma.contentItem.delete({ where: { id } });
  await audit(a.id, "content.deleted", id, { contentType: item.contentType, title: item.title });
  refresh(item.contentType);
  return { ok: true, message: "Item deleted" };
}

/** Publishes scheduled content that is due; called by the platform scheduler. */
export async function publishDueContent(limit = 25) {
  const due = await prisma.contentItem.findMany({ where: { status: "SCHEDULED", scheduledAt: { lte: new Date() } }, select: { id: true, publishedAt: true }, take: limit });
  for (const d of due) {
    await prisma.contentItem.update({ where: { id: d.id }, data: { status: "PUBLISHED", publishedAt: d.publishedAt ?? new Date(), scheduledAt: null } }).catch(() => null);
  }
  return due.length;
}

/* ---------------------------------------------------------------- media */

export async function saveMediaAsset(fd: FormData): Promise<ContentResult> {
  const a = await actor();
  if (!a) return denied;
  const id = str(fd, "id", 40);
  const fileName = str(fd, "fileName", 200);
  if (!fileName) return { ok: false, error: "Enter a file name." };
  const data = {
    fileName,
    altText: str(fd, "altText", 300) || null,
    caption: str(fd, "caption", 300) || null,
    description: str(fd, "description", 1000) || null,
    folder: str(fd, "folder", 80) || null,
    tags: list(fd, "tags"),
  };
  if (id) {
    const exists = await prisma.mediaAsset.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return { ok: false, error: "That media asset no longer exists." };
    await prisma.mediaAsset.update({ where: { id }, data });
    await audit(a.id, "media.updated", id, { fileName });
    revalidatePath("/admin/content-management/media-library");
    return { ok: true, message: "Media details saved", id };
  }

  const url = str(fd, "url", 600);
  const storageKey = str(fd, "storageKey", 400) || url;
  const mimeType = str(fd, "mimeType", 120);
  const fileSize = Number(str(fd, "fileSize", 20)) || 0;
  if (!url || !mimeType) return { ok: false, error: "Upload a file first." };
  const row = await prisma.mediaAsset.create({ data: { ...data, url, storageKey, mimeType, fileSize, createdById: a.id } });
  await audit(a.id, "media.uploaded", row.id, { fileName, mimeType, fileSize });
  revalidatePath("/admin/content-management/media-library");
  return { ok: true, message: "Media uploaded", id: row.id };
}

export async function deleteMediaAsset(id: string): Promise<ContentResult> {
  const a = await actor();
  if (!a) return denied;
  const [usages, featured] = await Promise.all([
    prisma.mediaUsage.count({ where: { mediaId: id } }),
    prisma.contentItem.count({ where: { featuredMediaId: id } }),
  ]);
  const used = usages + featured;
  if (used > 0) return { ok: false, error: `That file is used in ${used} place${used === 1 ? "" : "s"}. Replace it there before deleting.` };
  const row = await prisma.mediaAsset.findUnique({ where: { id }, select: { fileName: true } });
  if (!row) return { ok: false, error: "That media asset no longer exists." };
  await prisma.mediaAsset.delete({ where: { id } });
  await audit(a.id, "media.deleted", id, { fileName: row.fileName });
  revalidatePath("/admin/content-management/media-library");
  return { ok: true, message: "Media deleted" };
}
