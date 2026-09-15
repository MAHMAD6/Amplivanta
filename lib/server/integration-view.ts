import "server-only";
import type { Integration } from "@prisma/client";

/** Browser-safe view of an Integration: never includes tokens or credentials. */
export function integrationView(i: Integration) {
  const c = (i.config ?? {}) as Record<string, unknown>;
  const resources = Array.isArray(c.resources) ? (c.resources as { id: string; label: string }[]) : [];
  return {
    id: i.id,
    provider: i.provider,
    status: i.status,
    /** Only connections created through a real OAuth exchange hold tokens. */
    hasCredentials: typeof c.tokens === "string" && c.tokens.length > 0,
    scopes: i.scopes,
    lastSyncAt: i.lastSyncAt,
    createdAt: i.createdAt,
    connectedAt: typeof c.connectedAt === "string" ? c.connectedAt : null,
    connectedByUserId: typeof c.connectedByUserId === "string" ? c.connectedByUserId : null,
    resources,
    selectedResource: typeof c.selectedResource === "string" ? c.selectedResource : null,
    lastErrorCode: typeof c.lastErrorCode === "string" ? c.lastErrorCode : null,
    lastErrorMessage: typeof c.lastErrorMessage === "string" ? c.lastErrorMessage : null,
  };
}
