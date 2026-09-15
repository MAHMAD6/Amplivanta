import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, requireRole, route } from "@/lib/tenant";
import { sendTestDelivery } from "@/lib/webhook-delivery";

// POST /api/webhooks/:id/test — sends a signed webhook.test event and returns the result.
export const POST = route<{ id: string }>(
  async (ctx, _req, { id }) => {
    requireRole(ctx, "ADMIN");
    const wh = await db.webhook.findFirst({ where: { id, workspaceId: ctx.workspaceId } });
    if (!wh) throw new ApiError(404, "Webhook not found");
    const d = await sendTestDelivery(wh);
    return NextResponse.json({ responseCode: d?.responseCode ?? null, latencyMs: d?.latencyMs ?? null, attempts: d?.attempts ?? 0 });
  },
  { limit: 10, windowSec: 600 },
);
