import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, requireRole, ApiError } from "@/lib/tenant";

const updateSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  domain: z.string().max(160).nullable().optional(),
  industry: z.string().max(120).nullable().optional(),
  size: z.string().max(60).nullable().optional(),
  location: z.string().max(160).nullable().optional(),
  website: z.string().max(200).nullable().optional(),
});

type Params = { id: string };

async function loadOwned(workspaceId: string, id: string) {
  const company = await db.company.findFirst({ where: { id, workspaceId } });
  if (!company) throw new ApiError(404, "Company not found");
  return company;
}

// GET /api/companies/:id
export const GET = route<Params>(async (ctx, _req, { id }) => {
  await loadOwned(ctx.workspaceId, id);
  const company = await db.company.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { createdAt: "desc" }, take: 50 },
      deals: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  return NextResponse.json(company);
});

// PATCH /api/companies/:id
export const PATCH = route<Params>(async (ctx, req, { id }) => {
  requireRole(ctx, "EDITOR");
  await loadOwned(ctx.workspaceId, id);
  const data = await parseBody(req, updateSchema);
  const updated = await db.company.update({ where: { id }, data });
  return NextResponse.json(updated);
});

// DELETE /api/companies/:id
export const DELETE = route<Params>(async (ctx, _req, { id }) => {
  requireRole(ctx, "ADMIN");
  await loadOwned(ctx.workspaceId, id);
  await db.company.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
