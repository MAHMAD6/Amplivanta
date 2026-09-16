import "server-only";
import { getSessionContext } from "@/lib/tenant";

export async function creativeContext() {
  try {
    const ctx = await getSessionContext();
    return { workspaceId: ctx.workspaceId, userId: ctx.userId, canEdit: ctx.workspaceRole !== "VIEWER" };
  } catch {
    return null;
  }
}
