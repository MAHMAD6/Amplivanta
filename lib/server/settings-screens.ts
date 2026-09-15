import "server-only";
import { getSessionContext } from "@/lib/tenant";

export async function settingsContext() {
  try {
    const ctx = await getSessionContext();
    return { workspaceId: ctx.workspaceId, userId: ctx.userId, role: ctx.workspaceRole, isAdmin: ["ADMIN", "OWNER", "SUPER_ADMIN"].includes(ctx.workspaceRole) };
  } catch {
    return null;
  }
}
