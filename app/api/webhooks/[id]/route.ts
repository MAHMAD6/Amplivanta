import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { route, parseBody, requireRole, ApiError } from "@/lib/tenant";

type Params = { id: string };

async function loadOwned(workspaceId: string, id: string) {
  const wh = await db.webhook.findFirst({ where: { id, workspaceId } });
  if (!wh) throw new ApiError(404, "Webhook not found");
  return wh;
}

const patchSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string().min(1)).optional(),
  status: z.string().max(40).optional(),
  rotateSecret: z.boolean().optional(),
});

export const GET = route<Params>(async (ctx, _req, { id }) => {
  await loadOwned(ctx.workspaceId, id);
  const wh = await db.webhook.findUnique({
    where: { id },
    include: { deliveries: { orderBy: { createdAt: "desc" }, take: 50 } },
  });
  return NextResponse.json({ ...wh, signingSecret: `whsec_****${wh!.signingSecret.slice(-4)}` });
});

export const PATCH = route<Params>(async (ctx, req, { id }) => {
  requireRole(ctx, "ADMIN");
  await loadOwned(ctx.workspaceId, id);
  const { rotateSecret, ...data } = await parseBody(req, patchSchema);
  const updated = await db.webhook.update({
    where: { id },
    data: { ...data, ...(rotateSecret ? { signingSecret: `whsec_${randomBytes(24).toString("hex")}` } : {}) },
  });
  // Return the fresh secret in full only when it was just rotated.
  return NextResponse.json(rotateSecret ? updated : { ...updated, signingSecret: `whsec_****${updated.signingSecret.slice(-4)}` });
});

export const DELETE = route<Params>(async (ctx, _req, { id }) => {
  requireRole(ctx, "ADMIN");
  await loadOwned(ctx.workspaceId, id);
  await db.webhook.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
