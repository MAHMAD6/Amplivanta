import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, ApiError } from "@/lib/tenant";

const updateSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  plan: z.string().max(40).optional(),
  status: z.string().max(40).optional(),
  userCount: z.number().int().min(0).optional(),
});

type Params = { id: string };

function requireSuper(role: string) {
  if (role !== "SUPER_ADMIN") throw new ApiError(403, "Super admin only");
}

async function load(id: string) {
  const org = await db.organization.findUnique({ where: { id } });
  if (!org) throw new ApiError(404, "Organization not found");
  return org;
}

export const PATCH = route<Params>(async (ctx, req, { id }) => {
  requireSuper(ctx.role);
  await load(id);
  const data = await parseBody(req, updateSchema);
  const updated = await db.organization.update({ where: { id }, data });
  return NextResponse.json(updated);
});

export const DELETE = route<Params>(async (ctx, _req, { id }) => {
  requireSuper(ctx.role);
  await load(id);
  await db.organization.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
