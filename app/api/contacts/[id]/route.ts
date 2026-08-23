import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, requireRole, ApiError } from "@/lib/tenant";

const updateSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().max(120).optional(),
  lastName: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  jobTitle: z.string().max(120).optional(),
  status: z.string().max(40).optional(),
  companyId: z.string().nullable().optional(),
  leadScore: z.number().int().min(0).max(100).optional(),
});

type Params = { id: string };

async function loadOwned(workspaceId: string, id: string) {
  const contact = await db.contact.findFirst({ where: { id, workspaceId } });
  if (!contact) throw new ApiError(404, "Contact not found");
  return contact;
}

// GET /api/contacts/:id — full record with related activity, notes, tasks, deals.
export const GET = route<Params>(async (ctx, _req, { id }) => {
  await loadOwned(ctx.workspaceId, id);
  const contact = await db.contact.findUnique({
    where: { id },
    include: {
      company: true,
      activities: { orderBy: { createdAt: "desc" }, take: 20 },
      notes: { orderBy: { createdAt: "desc" }, take: 20 },
      tasks: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  return NextResponse.json(contact);
});

// PATCH /api/contacts/:id
export const PATCH = route<Params>(async (ctx, req, { id }) => {
  requireRole(ctx, "EDITOR");
  await loadOwned(ctx.workspaceId, id);
  const data = await parseBody(req, updateSchema);
  const updated = await db.contact.update({ where: { id }, data });
  return NextResponse.json(updated);
});

// DELETE /api/contacts/:id
export const DELETE = route<Params>(async (ctx, _req, { id }) => {
  requireRole(ctx, "ADMIN");
  await loadOwned(ctx.workspaceId, id);
  await db.contact.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
