import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, requireRole, route } from "@/lib/tenant";
import { decryptSecret } from "@/lib/crypto";
import { OAUTH_PROVIDERS, revokeGoogleToken } from "@/lib/oauth";
import { integrationView } from "@/lib/server/integration-view";

type Params = { id: string };

async function owned(workspaceId: string, id: string) {
  const row = await db.integration.findFirst({ where: { id, workspaceId } });
  if (!row) throw new ApiError(404, "Integration not found");
  return row;
}

export const GET = route<Params>(async (ctx, _req, { id }) => NextResponse.json(integrationView(await owned(ctx.workspaceId, id))));

// DELETE /api/integrations/:id — disconnect: revoke the Google grant where applicable,
// remove stored tokens and synced connection, and audit.
export const DELETE = route<Params>(async (ctx, _req, { id }) => {
  requireRole(ctx, "ADMIN");
  const row = await owned(ctx.workspaceId, id);
  let revoked: boolean | null = null;
  if (OAUTH_PROVIDERS[row.provider]?.family === "google") {
    try {
      const t = JSON.parse(decryptSecret(String((row.config as { tokens?: string } | null)?.tokens ?? ""))) as { refresh_token?: string; access_token?: string };
      const token = t.refresh_token ?? t.access_token;
      revoked = token ? await revokeGoogleToken(token) : null;
    } catch {
      revoked = null;
    }
  }
  await db.integration.delete({ where: { id: row.id } });
  await db.auditLog
    .create({ data: { workspaceId: ctx.workspaceId, actorUserId: ctx.userId, action: "integration.disconnected", resourceType: "Integration", resourceId: row.id, metadata: { provider: row.provider, revoked } } })
    .catch(() => null);
  return NextResponse.json({ ok: true, revoked });
});
