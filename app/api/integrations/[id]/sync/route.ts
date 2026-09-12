import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, requireRole, route } from "@/lib/tenant";
import { SYNCS } from "@/lib/providers/growth-data";

/**
 * POST /api/integrations/:id/sync — run this workspace's connectors for one
 * connected provider.
 *
 * Ownership is enforced by workspace scope, so a workspace can never sync
 * another's connection. Each connector reports its own outcome, including why
 * it could not run, so failures stay visible instead of silently producing no
 * data.
 */
export const POST = route<{ id: string }>(
  async (ctx, _req, params) => {
    requireRole(ctx, "ADMIN");
    const integration = await db.integration.findFirst({
      where: { id: params.id, workspaceId: ctx.workspaceId },
      select: { id: true, provider: true },
    });
    if (!integration) throw new ApiError(404, "Integration not found");

    const runners = SYNCS[integration.provider];
    if (!runners?.length) {
      throw new ApiError(400, `No sync is implemented for ${integration.provider} yet.`);
    }

    const results = [];
    for (const run of runners) results.push(await run(ctx.workspaceId));
    const rows = results.reduce((n, r) => n + (r.ok ? r.rows : 0), 0);
    return NextResponse.json({ provider: integration.provider, rows, results });
  },
  // Provider APIs are rate-limited themselves; keep manual syncs infrequent.
  { limit: 10, windowSec: 600 },
);
