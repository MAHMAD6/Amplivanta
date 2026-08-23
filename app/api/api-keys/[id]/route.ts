import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { route, requireRole, ApiError } from "@/lib/tenant";
import { writeAudit } from "@/lib/audit";

type Params = { id: string };

// DELETE — revokes a key (soft revoke via revokedAt, then remove).
export const DELETE = route<Params>(async (ctx, _req, { id }) => {
  requireRole(ctx, "ADMIN");
  const key = await db.apiKey.findFirst({ where: { id, workspaceId: ctx.workspaceId } });
  if (!key) throw new ApiError(404, "API key not found");
  await db.apiKey.delete({ where: { id } });
  await writeAudit(ctx, "apikey.revoke", { resourceType: "ApiKey", resourceId: id });
  return NextResponse.json({ ok: true });
});
