import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, listParams, requireRole } from "@/lib/tenant";
import { dispatchWebhooks } from "@/lib/webhook-delivery";

const createSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().max(120).optional(),
  lastName: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  jobTitle: z.string().max(120).optional(),
  status: z.string().max(40).optional(),
  companyId: z.string().optional(),
  leadScore: z.number().int().min(0).max(100).optional(),
});

// GET /api/contacts — workspace-scoped, searchable, paginated.
export const GET = route(async (ctx, req) => {
  const { take, skip, page, q } = listParams(req);
  const where = {
    workspaceId: ctx.workspaceId,
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    db.contact.findMany({
      where,
      include: { company: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    db.contact.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize: take });
});

// POST /api/contacts
export const POST = route(async (ctx, req) => {
  requireRole(ctx, "EDITOR");
  const data = await parseBody(req, createSchema);
  const contact = await db.contact.create({
    data: { ...data, workspaceId: ctx.workspaceId },
  });
  // Notify any subscribed outbound webhooks.
  await dispatchWebhooks(ctx.workspaceId, "contact.created", { id: contact.id, email: contact.email });
  return NextResponse.json(contact, { status: 201 });
});
