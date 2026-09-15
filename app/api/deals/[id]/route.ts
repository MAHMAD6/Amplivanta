import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, parseBody, requireRole, ApiError } from "@/lib/tenant";
import { emitWebhookEvent } from "@/lib/webhook-delivery";

const updateSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  value: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  pipelineId: z.string().nullable().optional(),
  stageId: z.string().nullable().optional(),
  closeDate: z.coerce.date().nullable().optional(),
  ownerId: z.string().nullable().optional(),
  status: z.enum(["open", "won", "lost"]).optional(),
});

type Params = { id: string };

async function loadOwned(workspaceId: string, id: string) {
  const deal = await db.deal.findFirst({ where: { id, workspaceId } });
  if (!deal) throw new ApiError(404, "Deal not found");
  return deal;
}

export const GET = route<Params>(async (ctx, _req, { id }) => {
  await loadOwned(ctx.workspaceId, id);
  const deal = await db.deal.findUnique({
    where: { id },
    include: { stage: true, pipeline: true, members: true, activities: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  return NextResponse.json(deal);
});

export const PATCH = route<Params>(async (ctx, req, { id }) => {
  requireRole(ctx, "EDITOR");
  const before = await loadOwned(ctx.workspaceId, id);
  const data = await parseBody(req, updateSchema);
  const updated = await db.deal.update({ where: { id }, data });
  if (data.status && data.status !== before.status && data.status !== "open") {
    emitWebhookEvent(ctx.workspaceId, data.status === "won" ? "deal.won" : "deal.lost", { id: updated.id, name: updated.name, value: updated.value, currency: updated.currency });
  }
  return NextResponse.json(updated);
});

export const DELETE = route<Params>(async (ctx, _req, { id }) => {
  requireRole(ctx, "ADMIN");
  await loadOwned(ctx.workspaceId, id);
  await db.deal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
