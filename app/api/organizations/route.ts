import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, listParams, ApiError } from "@/lib/tenant";

const createSchema = z.object({
  name: z.string().min(1).max(160),
  plan: z.string().max(40).optional(),
  status: z.string().max(40).optional(),
  userCount: z.number().int().min(0).optional(),
});

/** Platform-level (not workspace-scoped) — SUPER_ADMIN only. */
function requireSuper(role: string) {
  if (role !== "SUPER_ADMIN") throw new ApiError(403, "Super admin only");
}

export const GET = route(async (ctx, req) => {
  requireSuper(ctx.role);
  const { take, skip, page, q } = listParams(req);
  const where = q ? { name: { contains: q, mode: "insensitive" as const } } : {};
  const [items, total] = await Promise.all([
    db.organization.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }),
    db.organization.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize: take });
});

export const POST = route(async (ctx, req) => {
  requireSuper(ctx.role);
  const data = await parseBody(req, createSchema);
  const org = await db.organization.create({ data });
  return NextResponse.json(org, { status: 201 });
});
