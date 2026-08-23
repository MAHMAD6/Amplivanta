import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, requireRole, ApiError } from "@/lib/tenant";
import { isStorageConfigured, objectUrl, deleteObject } from "@/lib/storage";

type Params = { id: string };

async function loadOwned(workspaceId: string, id: string) {
  const asset = await db.asset.findFirst({ where: { id, workspaceId } });
  if (!asset) throw new ApiError(404, "Asset not found");
  return asset;
}

// GET /api/assets/:id — record + resolved URL.
export const GET = route<Params>(async (ctx, _req, { id }) => {
  const asset = await loadOwned(ctx.workspaceId, id);
  const url = isStorageConfigured() ? await objectUrl(asset.fileUrl) : asset.fileUrl;
  return NextResponse.json({ ...asset, url });
});

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  folderId: z.string().nullable().optional(),
  // Client calls this after a successful upload to record the final byte size.
  fileSize: z.number().int().min(0).optional(),
});

export const PATCH = route<Params>(async (ctx, req, { id }) => {
  requireRole(ctx, "EDITOR");
  await loadOwned(ctx.workspaceId, id);
  const data = await parseBody(req, patchSchema);
  const updated = await db.asset.update({ where: { id }, data });
  return NextResponse.json(updated);
});

// DELETE /api/assets/:id — removes the DB record and the R2 object.
export const DELETE = route<Params>(async (ctx, _req, { id }) => {
  requireRole(ctx, "EDITOR");
  const asset = await loadOwned(ctx.workspaceId, id);
  if (isStorageConfigured()) {
    await deleteObject(asset.fileUrl).catch(() => {});
  }
  await db.asset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
