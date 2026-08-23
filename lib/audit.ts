import { db } from "@/lib/db";
import type { SessionContext } from "@/lib/tenant";

/**
 * Appends an audit event. Append-only by convention — the Audit Log UI is
 * read-only and normal admins cannot mutate these rows.
 */
export async function writeAudit(
  ctx: SessionContext,
  action: string,
  opts: { resourceType?: string; resourceId?: string; metadata?: Record<string, unknown>; ipAddress?: string } = {},
): Promise<void> {
  await db.auditLog.create({
    data: {
      workspaceId: ctx.workspaceId,
      actorUserId: ctx.userId,
      action,
      resourceType: opts.resourceType,
      resourceId: opts.resourceId,
      metadata: opts.metadata as never,
      ipAddress: opts.ipAddress,
    },
  });
}
