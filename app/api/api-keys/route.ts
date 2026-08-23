import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";
import { route, parseBody, listParams, requireRole } from "@/lib/tenant";
import { writeAudit } from "@/lib/audit";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  scopes: z.array(z.string()).optional(),
  expiresAt: z.coerce.date().optional(),
});

// GET — never returns secrets, only metadata.
export const GET = route(async (ctx, req) => {
  const { take, skip, page } = listParams(req);
  const where = { workspaceId: ctx.workspaceId };
  const [rows, total] = await Promise.all([
    db.apiKey.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }),
    db.apiKey.count({ where }),
  ]);
  const items = rows.map(({ keyHash, ...rest }) => ({ ...rest, keyPreview: `amp_...${keyHash.slice(-4)}` }));
  return NextResponse.json({ items, total, page, pageSize: take });
});

// POST — returns the raw key exactly once; only its SHA-256 hash is stored.
export const POST = route(async (ctx, req) => {
  requireRole(ctx, "ADMIN");
  const data = await parseBody(req, createSchema);
  const raw = `amp_${randomBytes(24).toString("hex")}`;
  const keyHash = createHash("sha256").update(raw).digest("hex");
  const key = await db.apiKey.create({
    data: {
      name: data.name,
      prefix: raw.slice(0, 12),
      scopes: data.scopes ?? [],
      expiresAt: data.expiresAt,
      keyHash,
      workspaceId: ctx.workspaceId,
    },
  });
  await writeAudit(ctx, "apikey.create", { resourceType: "ApiKey", resourceId: key.id, metadata: { name: key.name } });
  return NextResponse.json({ id: key.id, name: key.name, key: raw, note: "Store this key now — it won't be shown again." }, { status: 201 });
});
