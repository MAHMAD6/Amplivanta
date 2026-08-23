import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { route, parseBody, listParams, requireRole } from "@/lib/tenant";
import { writeAudit } from "@/lib/audit";

const createSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string().min(1)).min(1),
  status: z.string().max(40).optional(),
});

export const GET = route(async (ctx, req) => {
  const { take, skip, page } = listParams(req);
  const where = { workspaceId: ctx.workspaceId };
  const [items, total] = await Promise.all([
    db.webhook.findMany({
      where,
      include: { _count: { select: { deliveries: true } } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    db.webhook.count({ where }),
  ]);
  // Never expose full signing secrets in a list — mask them.
  const masked = items.map((w) => ({ ...w, signingSecret: `whsec_****${w.signingSecret.slice(-4)}` }));
  return NextResponse.json({ items: masked, total, page, pageSize: take });
});

// POST /api/webhooks — generates a signing secret, returned in full once.
export const POST = route(async (ctx, req) => {
  requireRole(ctx, "ADMIN");
  const data = await parseBody(req, createSchema);
  const signingSecret = `whsec_${randomBytes(24).toString("hex")}`;
  const webhook = await db.webhook.create({
    data: { ...data, signingSecret, workspaceId: ctx.workspaceId },
  });
  await writeAudit(ctx, "webhook.create", { resourceType: "Webhook", resourceId: webhook.id, metadata: { url: webhook.url } });
  return NextResponse.json(webhook, { status: 201 });
});
