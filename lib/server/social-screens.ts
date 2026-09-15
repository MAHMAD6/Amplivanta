import "server-only";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { integrationView } from "@/lib/server/integration-view";

/** Shared reads for the Social Publishing screens. Everything is workspace-scoped. */

export async function socialContext() {
  try {
    const ctx = await getSessionContext();
    return { workspaceId: ctx.workspaceId, userId: ctx.userId, role: ctx.workspaceRole };
  } catch {
    return null;
  }
}

export const isAdminRole = (role: string | undefined) => ["ADMIN", "OWNER", "SUPER_ADMIN"].includes(role ?? "");

export type PostRow = {
  id: string;
  content: string;
  status: string;
  platforms: string[];
  mediaUrl: string | null;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const POST_SELECT = { id: true, content: true, status: true, platforms: true, mediaUrl: true, scheduledAt: true, publishedAt: true, createdAt: true, updatedAt: true } as const;

export async function loadPosts(workspaceId: string, where: Record<string, unknown> = {}, take = 200): Promise<PostRow[]> {
  return db.socialPost.findMany({ where: { workspaceId, ...where }, orderBy: [{ scheduledAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }], take, select: POST_SELECT });
}

export async function socialCounts(workspaceId: string) {
  const grouped = await db.socialPost.groupBy({ by: ["status"], where: { workspaceId }, _count: true });
  const by = (s: string) => grouped.find((g) => g.status === s)?._count ?? 0;
  return {
    total: grouped.reduce((n, g) => n + g._count, 0),
    draft: by("draft"),
    pending: by("pending_approval"),
    changes: by("changes_requested"),
    approved: by("approved"),
    rejected: by("rejected"),
    scheduled: by("scheduled"),
    published: by("published"),
    failed: by("failed"),
  };
}

/** Real social channel connections: OAuth integrations holding credentials. */
export async function socialConnections(workspaceId: string) {
  const rows = await db.integration.findMany({ where: { workspaceId, provider: { in: ["meta", "linkedin", "youtube", "tiktok"] } } });
  return rows.map(integrationView).filter((r) => r.hasCredentials);
}

export async function socialAudit(workspaceId: string, opts: { actions?: string[]; take?: number; since?: Date | null; actorUserId?: string; q?: string } = {}) {
  const rows = await db.auditLog.findMany({
    where: {
      workspaceId,
      resourceType: { in: ["SocialPost", "WorkspacePreference"] },
      ...(opts.actions ? { action: { in: opts.actions } } : { OR: [{ action: { startsWith: "social." } }, { action: "settings.updated" }] }),
      ...(opts.since ? { createdAt: { gte: opts.since } } : {}),
      ...(opts.actorUserId ? { actorUserId: opts.actorUserId } : {}),
      ...(opts.q ? { action: { contains: opts.q, mode: "insensitive" as const } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: opts.take ?? 50,
    include: { user: { select: { name: true, email: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    resourceId: r.resourceId,
    createdAt: r.createdAt,
    actor: r.user?.name || r.user?.email || "System",
    metadata: (r.metadata ?? {}) as Record<string, unknown>,
  }));
}

export const ACTIVITY_LABELS: Record<string, string> = {
  "social.post.created": "Draft created",
  "social.post.scheduled": "Post scheduled",
  "social.post.submitted": "Submitted for approval",
  "social.post.approved": "Approved",
  "social.post.changes_requested": "Changes requested",
  "social.post.rejected": "Rejected",
  "social.post.reused": "Reused as new draft",
  "social.post.unscheduled": "Removed from queue",
  "social.post.deleted": "Post deleted",
  "social.post.archived": "Post archived",
  "settings.updated": "Settings changed",
};

export const excerpt = (s: string, n = 80) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
