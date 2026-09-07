"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { complete } from "@/lib/ai";
import { SITE_URL } from "@/lib/constants";

/**
 * Social Publishing writes.
 *
 * Posts are workspace-scoped. Nothing here talks to a social network: no
 * channel is connected yet, so a post can be drafted and scheduled but the
 * platform never claims to have published it. `status` stays "draft" or
 * "scheduled" until a real channel integration exists to move it further.
 */

export type SocialResult = { ok: true; message: string; postId?: string } | { ok: false; error: string };

async function viewer() {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id) return null;
  try {
    const membership = await prisma.membership.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: { workspaceId: true, role: true },
    });
    if (!membership) return null;
    return { userId: user.id, workspaceId: membership.workspaceId, role: membership.role };
  } catch {
    return null;
  }
}

const PLATFORMS = ["facebook", "instagram", "linkedin", "x", "tiktok", "youtube", "pinterest"];

export async function createSocialPost(formData: FormData): Promise<SocialResult> {
  const v = await viewer();
  if (!v) return { ok: false, error: "You need a workspace before you can create posts." };

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { ok: false, error: "Write something to post." };
  if (content.length > 5000) return { ok: false, error: "That post is too long." };

  const platforms = PLATFORMS.filter((p) => formData.get(`platform_${p}`) === "on");
  const scheduledRaw = String(formData.get("scheduledAt") ?? "").trim();
  const scheduledAt = scheduledRaw ? new Date(scheduledRaw) : null;
  if (scheduledAt && Number.isNaN(scheduledAt.getTime())) {
    return { ok: false, error: "That schedule date is not valid." };
  }
  if (scheduledAt && scheduledAt.getTime() < Date.now()) {
    return { ok: false, error: "Choose a schedule time in the future." };
  }

  try {
    const post = await prisma.socialPost.create({
      data: {
        workspaceId: v.workspaceId,
        content,
        mediaUrl: String(formData.get("mediaUrl") ?? "").trim() || null,
        platforms,
        // Never "published": no channel is connected to publish through.
        status: scheduledAt ? "scheduled" : "draft",
        scheduledAt,
        scheduledFor: scheduledAt,
      },
    });
    revalidatePath("/app/social/posts");
    revalidatePath("/app/social/queue");
    return {
      ok: true,
      postId: post.id,
      message: scheduledAt ? "Post scheduled." : "Draft saved.",
    };
  } catch {
    return { ok: false, error: "Could not save the post — the platform database was unreachable." };
  }
}

export async function deleteSocialPost(postId: string): Promise<SocialResult> {
  const v = await viewer();
  if (!v) return { ok: false, error: "You are not authorized to delete posts." };
  try {
    // Scoped delete: a post id from another workspace matches nothing.
    const res = await prisma.socialPost.deleteMany({ where: { id: postId, workspaceId: v.workspaceId } });
    if (res.count === 0) return { ok: false, error: "That post no longer exists." };
    revalidatePath("/app/social/posts");
    return { ok: true, message: "Post deleted." };
  } catch {
    return { ok: false, error: "Could not delete the post." };
  }
}

export type SocialPostRow = {
  id: string;
  content: string;
  status: string;
  platforms: string[];
  mediaUrl: string | null;
  scheduledFor: string | null;
  created: string;
};

export async function loadSocialPosts(status?: string): Promise<{ connected: boolean; rows: SocialPostRow[] }> {
  const v = await viewer();
  if (!v) return { connected: true, rows: [] };
  try {
    const rows = await prisma.socialPost.findMany({
      where: { workspaceId: v.workspaceId, ...(status ? { status } : {}) },
      orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
      take: 200,
    });
    const fmt = (d: Date | null) =>
      d ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(d) : null;
    return {
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        content: r.content,
        status: r.status,
        platforms: r.platforms,
        mediaUrl: r.mediaUrl,
        scheduledFor: fmt(r.scheduledFor ?? r.scheduledAt),
        created: fmt(r.createdAt) ?? "",
      })),
    };
  } catch {
    return { connected: false, rows: [] };
  }
}

/* --------------------------------------------------- promote a product --- */

export type PromoteDraft = {
  productTitle: string;
  content: string;
  mediaUrl: string | null;
  link: string;
};

/**
 * Build a social post draft for a Marketplace product.
 *
 * The link is always the PUBLIC product URL — a post pointing at an `/app`
 * route would send every reader to a login redirect. Copy is generated from
 * the product's own text; when no AI key is configured the caller still gets a
 * usable draft assembled from the listing.
 */
export async function draftProductPromotion(productId: string): Promise<
  { ok: true; draft: PromoteDraft; stubbed: boolean } | { ok: false; error: string }
> {
  const v = await viewer();
  if (!v) return { ok: false, error: "You need a workspace before you can promote a product." };

  try {
    const product = await prisma.marketplaceProduct.findFirst({
      where: { id: productId, status: "PUBLISHED" },
      select: {
        title: true, slug: true, summary: true, description: true, coverImage: true, tags: true,
        category: { select: { name: true } },
      },
    });
    if (!product) return { ok: false, error: "That product is not published." };

    const link = `${SITE_URL}/marketplace/products/${product.slug}`;
    const fallback = [
      product.title,
      product.summary ?? "",
      "",
      link,
      product.tags.slice(0, 4).map((t) => `#${t.replace(/\s+/g, "")}`).join(" "),
    ]
      .filter(Boolean)
      .join("\n");

    let content = fallback;
    let stubbed = true;
    try {
      const res = await complete({
        system:
          "You write short social posts promoting a digital product. Return the post text only — no quotes, no preamble, " +
          "under 280 characters, ending with the provided link. Describe only what the product information supports; " +
          "never invent features, results, statistics or testimonials.",
        prompt: [
          `Product: ${product.title}`,
          product.summary ? `Summary: ${product.summary}` : null,
          product.category ? `Category: ${product.category.name}` : null,
          product.tags.length ? `Tags: ${product.tags.join(", ")}` : null,
          product.description ? `Details: ${product.description.slice(0, 1200)}` : null,
          `Link to include: ${link}`,
        ]
          .filter(Boolean)
          .join("\n"),
        maxTokens: 300,
      });
      stubbed = res.stubbed;
      if (!res.stubbed && res.text.trim()) {
        content = res.text.trim();
        if (!content.includes(link)) content = `${content}\n\n${link}`;
      }
    } catch {
      /* keep the assembled fallback */
    }

    return {
      ok: true,
      stubbed,
      draft: { productTitle: product.title, content, mediaUrl: product.coverImage, link },
    };
  } catch {
    return { ok: false, error: "Could not prepare the post — the platform database was unreachable." };
  }
}
