import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, listParams, requireRole, ApiError } from "@/lib/tenant";
import { isStorageConfigured, buildObjectKey, presignUpload, objectUrl } from "@/lib/storage";

// GET /api/assets — list assets in the workspace, with resolved URLs.
export const GET = route(async (ctx, req) => {
  const url = new URL(req.url);
  const folderId = url.searchParams.get("folderId") ?? undefined;
  const { take, skip, page, q } = listParams(req);
  const where = {
    workspaceId: ctx.workspaceId,
    ...(folderId ? { folderId } : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };
  const [rows, total] = await Promise.all([
    db.asset.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }),
    db.asset.count({ where }),
  ]);
  const items = await Promise.all(
    rows.map(async (a) => ({ ...a, url: isStorageConfigured() ? await objectUrl(a.fileUrl) : a.fileUrl })),
  );
  return NextResponse.json({ items, total, page, pageSize: take, storageReady: isStorageConfigured() });
});

const presignSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(160),
  size: z.number().int().min(0).optional(),
  folderId: z.string().optional(),
});

// POST /api/assets — begin an upload. Returns a presigned PUT URL + creates the
// asset record (storing the object key). The browser PUTs bytes straight to R2.
export const POST = route(async (ctx, req) => {
  requireRole(ctx, "EDITOR");
  if (!isStorageConfigured()) {
    throw new ApiError(503, "Storage is not configured (set R2_* env vars).");
  }
  const data = await parseBody(req, presignSchema);
  const key = buildObjectKey(ctx.workspaceId, data.filename);
  const uploadUrl = await presignUpload(key, data.contentType);
  const asset = await db.asset.create({
    data: {
      workspaceId: ctx.workspaceId,
      folderId: data.folderId ?? null,
      name: data.filename,
      type: data.contentType.split("/")[0] || "file",
      mimeType: data.contentType,
      fileUrl: key,
      fileSize: data.size ?? 0,
      uploadedById: ctx.userId,
    },
  });
  return NextResponse.json({ asset, uploadUrl, key }, { status: 201 });
});
