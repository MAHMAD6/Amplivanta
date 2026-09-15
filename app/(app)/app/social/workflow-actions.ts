"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { nextStatusForReview, SOCIAL_PLATFORM_IDS } from "@/lib/social/platforms";
import { loadPreferences } from "@/lib/server/preferences";

/**
 * Social Publishing workflow: compose, submit for approval, review decisions,
 * reuse and unschedule. Every transition is workspace-scoped and audited, and
 * the audit trail is what the Approvals and Activity Log screens read.
 * Nothing here publishes to a network — no channel integration exists yet.
 */

type Result = { ok: true; message: string; id?: string } | { ok: false; error: string };

const PATHS = ["/app/social", "/app/social/posts", "/app/social/calendar", "/app/social/approvals", "/app/social/queue", "/app/social/activity"];
const refresh = () => PATHS.forEach((p) => revalidatePath(p));

async function ctx() {
  try {
    return await getSessionContext();
  } catch {
    return null;
  }
}

async function audit(c: { workspaceId: string; userId: string }, action: string, postId: string, metadata: Record<string, unknown> = {}) {
  await db.auditLog
    .create({ data: { workspaceId: c.workspaceId, actorUserId: c.userId, action, resourceType: "SocialPost", resourceId: postId, metadata: metadata as never } })
    .catch(() => null);
}

/** Composer save. intent: draft | schedule | submit (for approval). */
export async function composePost(fd: FormData): Promise<Result> {
  const c = await ctx();
  if (!c) return { ok: false, error: "Sign in to create posts." };
  if (c.workspaceRole === "VIEWER") return { ok: false, error: "Viewers cannot create posts." };

  const content = String(fd.get("content") ?? "").trim();
  const intent = String(fd.get("intent") ?? "draft");
  const platforms = String(fd.get("platforms") ?? "").split(",").filter((p) => SOCIAL_PLATFORM_IDS.includes(p));
  const mediaUrl = String(fd.get("mediaUrl") ?? "").trim();
  const link = String(fd.get("link") ?? "").trim();
  const when = String(fd.get("scheduledAt") ?? "").trim();

  if (!content) return { ok: false, error: "Add content for your post." };
  if (content.length > 5000) return { ok: false, error: "That post is too long." };
  if (intent !== "draft" && platforms.length === 0) return { ok: false, error: "Select at least one platform." };
  if (mediaUrl && !/^https:\/\//.test(mediaUrl)) return { ok: false, error: "Media must be an https link." };
  if (link && !/^https?:\/\/[^\s]+$/.test(link)) return { ok: false, error: "Enter a valid link, including https://." };

  let scheduledAt: Date | null = null;
  if (intent === "schedule" || (intent === "submit" && when)) {
    scheduledAt = when ? new Date(when) : null;
    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) return { ok: false, error: "Choose a date and time to schedule." };
    if (scheduledAt.getTime() < Date.now() + 60_000) return { ok: false, error: "Choose a schedule time in the future." };
  }

  const prefs = await loadPreferences(c.workspaceId, "social.settings");
  const needsApproval = prefs.values.requireApproval === true && !(prefs.values.autoApproveSingle === true && platforms.length === 1);
  const status = intent === "draft" ? "draft" : intent === "submit" || needsApproval ? "pending_approval" : "scheduled";
  const body = link && !content.includes(link) ? `${content}\n\n${link}` : content;

  try {
    const post = await db.socialPost.create({
      data: { workspaceId: c.workspaceId, content: body, mediaUrl: mediaUrl || null, mediaUrls: mediaUrl ? [mediaUrl] : [], platforms, status, scheduledAt, scheduledFor: scheduledAt },
    });
    await audit(c, status === "pending_approval" ? "social.post.submitted" : status === "scheduled" ? "social.post.scheduled" : "social.post.created", post.id, { platforms });
    refresh();
    return {
      ok: true,
      id: post.id,
      message: status === "pending_approval" ? "Submitted for approval." : status === "scheduled" ? "Post scheduled." : "Draft saved.",
    };
  } catch {
    return { ok: false, error: "Could not save the post right now." };
  }
}

export async function submitForApproval(postId: string): Promise<Result> {
  const c = await ctx();
  if (!c) return { ok: false, error: "Sign in to manage posts." };
  const r = await db.socialPost.updateMany({ where: { id: postId, workspaceId: c.workspaceId, status: { in: ["draft", "changes_requested"] } }, data: { status: "pending_approval" } }).catch(() => null);
  if (!r?.count) return { ok: false, error: "Only drafts or posts with requested changes can be submitted." };
  await audit(c, "social.post.submitted", postId);
  refresh();
  return { ok: true, message: "Submitted for approval." };
}

/** Review decision. Approvers must be workspace admins. */
export async function reviewPost(postId: string, decision: "approve" | "changes" | "reject", note = ""): Promise<Result> {
  const c = await ctx();
  if (!c) return { ok: false, error: "Sign in to review posts." };
  if (!["ADMIN", "OWNER", "SUPER_ADMIN"].includes(c.workspaceRole)) return { ok: false, error: "Only workspace admins can review posts." };
  const post = await db.socialPost.findFirst({ where: { id: postId, workspaceId: c.workspaceId }, select: { status: true, scheduledAt: true } }).catch(() => null);
  if (!post) return { ok: false, error: "That post no longer exists." };
  const future = Boolean(post.scheduledAt && post.scheduledAt.getTime() > Date.now());
  const next = nextStatusForReview(post.status, decision, future);
  if (!next) return { ok: false, error: "This post is not awaiting review." };
  const r = await db.socialPost.updateMany({ where: { id: postId, workspaceId: c.workspaceId, status: "pending_approval" }, data: { status: next } });
  if (!r.count) return { ok: false, error: "This post was already reviewed." };
  await audit(c, `social.post.${decision === "approve" ? "approved" : decision === "changes" ? "changes_requested" : "rejected"}`, postId, { note: note.slice(0, 500) });
  refresh();
  return { ok: true, message: decision === "approve" ? "Approved." : decision === "changes" ? "Changes requested." : "Rejected." };
}

/** Reuse creates a new draft; the original is unchanged. */
export async function reusePost(postId: string): Promise<Result> {
  const c = await ctx();
  if (!c) return { ok: false, error: "Sign in to manage posts." };
  const src = await db.socialPost.findFirst({ where: { id: postId, workspaceId: c.workspaceId } }).catch(() => null);
  if (!src) return { ok: false, error: "That post no longer exists." };
  const copy = await db.socialPost.create({
    data: { workspaceId: c.workspaceId, content: src.content, mediaUrl: src.mediaUrl, mediaUrls: src.mediaUrls, platforms: src.platforms, status: "draft" },
  });
  await audit(c, "social.post.reused", copy.id, { sourceId: src.id });
  refresh();
  return { ok: true, id: copy.id, message: "Copied to a new draft." };
}

/** Removes a scheduled post from the queue, returning it to draft. */
export async function unschedulePost(postId: string): Promise<Result> {
  const c = await ctx();
  if (!c) return { ok: false, error: "Sign in to manage posts." };
  const r = await db.socialPost.updateMany({ where: { id: postId, workspaceId: c.workspaceId, status: { in: ["scheduled", "approved", "failed"] } }, data: { status: "draft", scheduledAt: null, scheduledFor: null } }).catch(() => null);
  if (!r?.count) return { ok: false, error: "Only queued posts can be unscheduled." };
  await audit(c, "social.post.unscheduled", postId);
  refresh();
  return { ok: true, message: "Removed from the queue." };
}

export async function deletePosts(ids: string[]): Promise<Result> {
  const c = await ctx();
  if (!c) return { ok: false, error: "Sign in to manage posts." };
  if (c.workspaceRole === "VIEWER") return { ok: false, error: "Viewers cannot delete posts." };
  const list = ids.filter((x) => typeof x === "string").slice(0, 100);
  const r = await db.socialPost.deleteMany({ where: { id: { in: list }, workspaceId: c.workspaceId, status: { not: "published" } } }).catch(() => null);
  if (!r?.count) return { ok: false, error: "Nothing was deleted. Published posts are kept for the record." };
  for (const id of list) await audit(c, "social.post.deleted", id);
  refresh();
  return { ok: true, message: `${r.count} post${r.count === 1 ? "" : "s"} deleted.` };
}

/** Archive keeps a post for reference but removes it from active views. */
export async function archivePosts(ids: string[]): Promise<Result> {
  const c = await ctx();
  if (!c) return { ok: false, error: "Sign in to manage posts." };
  const list = ids.filter((x) => typeof x === "string").slice(0, 100);
  const r = await db.socialPost.updateMany({ where: { id: { in: list }, workspaceId: c.workspaceId, status: { in: ["draft", "rejected", "changes_requested", "approved", "failed", "published"] } }, data: { status: "archived" } }).catch(() => null);
  if (!r?.count) return { ok: false, error: "Scheduled or pending posts must be unscheduled or reviewed before archiving." };
  for (const id of list) await audit(c, "social.post.archived", id);
  refresh();
  return { ok: true, message: `${r.count} post${r.count === 1 ? "" : "s"} archived.` };
}
