import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ApiError, parseBody, requireRole, route } from "@/lib/tenant";

const schema = z.object({ resourceId: z.string().min(1).max(300) });

// POST /api/integrations/:id/resource — choose which property/site/account/channel to sync.
// Only ids Google returned for this connection are accepted.
export const POST = route<{ id: string }>(async (ctx, req, { id }) => {
  requireRole(ctx, "ADMIN");
  const { resourceId } = await parseBody(req, schema);
  const row = await db.integration.findFirst({ where: { id, workspaceId: ctx.workspaceId } });
  if (!row) throw new ApiError(404, "Integration not found");
  const config = (row.config ?? {}) as Record<string, unknown>;
  const resources = Array.isArray(config.resources) ? (config.resources as { id: string }[]) : [];
  if (!resources.some((r) => r.id === resourceId)) throw new ApiError(400, "That resource is not available on this connection.");
  await db.integration.update({
    where: { id: row.id },
    data: { config: { ...config, selectedResource: resourceId } as never, status: row.status === "needs_resource" ? "connected" : row.status, isConnected: true },
  });
  await db.auditLog
    .create({ data: { workspaceId: ctx.workspaceId, actorUserId: ctx.userId, action: "integration.resource_selected", resourceType: "Integration", resourceId: row.id, metadata: { provider: row.provider, resourceId } } })
    .catch(() => null);
  return NextResponse.json({ ok: true });
});
