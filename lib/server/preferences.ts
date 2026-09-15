import "server-only";
import { db } from "@/lib/db";
import type { PreferenceValues } from "@/lib/preferences";

export async function loadPreferences(workspaceId: string | null, scope: string): Promise<{ values: PreferenceValues; updatedAt: Date | null; reachable: boolean }> {
  if (!workspaceId) return { values: {}, updatedAt: null, reachable: false };
  try {
    const row = await db.workspacePreference.findUnique({ where: { workspaceId_scope: { workspaceId, scope } } });
    return { values: (row?.values as PreferenceValues) ?? {}, updatedAt: row?.updatedAt ?? null, reachable: true };
  } catch {
    return { values: {}, updatedAt: null, reachable: false };
  }
}
