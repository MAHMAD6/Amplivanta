"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { parsePreferences, PREFERENCE_SCOPES } from "@/lib/preferences";

type Result = { ok: true; message: string } | { ok: false; error: string };

const ADMIN = new Set(["ADMIN", "OWNER", "SUPER_ADMIN"]);

async function adminContext() {
  try {
    const ctx = await getSessionContext();
    return ADMIN.has(ctx.workspaceRole) ? ctx : null;
  } catch {
    return null;
  }
}

/** Saves one settings screen. Only workspace admins may change workspace defaults. */
export async function savePreferences(scope: string, path: string, fd: FormData): Promise<Result> {
  const def = PREFERENCE_SCOPES[scope];
  if (!def) return { ok: false, error: "Unknown settings." };
  const ctx = await adminContext();
  if (!ctx) return { ok: false, error: "Only workspace admins can change these settings." };
  const input: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") input[k] = v;
  const values = parsePreferences(def, input);
  try {
    await db.workspacePreference.upsert({
      where: { workspaceId_scope: { workspaceId: ctx.workspaceId, scope } },
      create: { workspaceId: ctx.workspaceId, scope, values, updatedByUserId: ctx.userId },
      update: { values, updatedByUserId: ctx.userId },
    });
    await db.auditLog
      .create({ data: { workspaceId: ctx.workspaceId, actorUserId: ctx.userId, action: "settings.updated", resourceType: "WorkspacePreference", metadata: { scope } } })
      .catch(() => null);
    if (path.startsWith("/app")) revalidatePath(path);
    return { ok: true, message: "Settings saved." };
  } catch {
    return { ok: false, error: "Settings could not be saved right now." };
  }
}
