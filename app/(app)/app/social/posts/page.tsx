import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen, Info, Search, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState, fmtDateTime, kitField, kitPrimary } from "@/components/amplivanta/screen-kit";
import { PostsLibrary } from "@/components/amplivanta/social-ui";
import { excerpt, loadPosts, socialContext } from "@/lib/server/social-screens";
import { POST_STATUSES, SOCIAL_PLATFORMS } from "@/lib/social/platforms";

export const metadata: Metadata = { title: "Posts" };
export const dynamic = "force-dynamic";

type SP = { q?: string; status?: string; platform?: string };

export default async function PostsLibraryPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await socialContext();
  let reachable = Boolean(c);
  let posts: Awaited<ReturnType<typeof loadPosts>> = [];
  if (c) {
    try {
      posts = await loadPosts(c.workspaceId, {
        ...(sp.status ? { status: sp.status } : { status: { not: "archived" } }),
        ...(sp.platform ? { platforms: { has: sp.platform } } : {}),
        ...(sp.q ? { content: { contains: sp.q, mode: "insensitive" } } : {}),
      });
    } catch {
      reachable = false;
    }
  }
  const filtered = Boolean(sp.q || sp.status || sp.platform);

  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[30px] font-bold text-deep-navy">Posts / Content Library</h1>
      <p className="mb-5 mt-1 text-[14.5px] text-ink-soft">Searchable repository of drafts, scheduled posts, and published social content.</p>

      <form method="get" className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white px-5 py-4">
        <label className="relative w-full max-w-[440px] flex-1">
          <span className="sr-only">Search posts</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search posts by title or keyword..." className={cn(kitField, "h-11 pl-9")} />
        </label>
        <select name="status" defaultValue={sp.status ?? ""} aria-label="Status" className={cn(kitField, "h-11 w-[160px]")}>
          <option value="">Status</option>
          {POST_STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select name="platform" defaultValue={sp.platform ?? ""} aria-label="Platform" className={cn(kitField, "h-11 w-[160px]")}>
          <option value="">Platform</option>
          {SOCIAL_PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <button type="submit" className="h-11 rounded-md border border-line px-4 text-[13.5px] font-semibold text-deep-navy hover:bg-bg-soft">Apply</button>
        {filtered && <Link href="/app/social/posts" className="h-11 rounded-md bg-royal-tint px-4 py-3 text-[13.5px] font-semibold text-[#0B5CFF]">Clear Filters</Link>}
        <Link href="/app/social/compose" className={cn(kitPrimary, "ml-auto h-11")}><SquarePen className="h-4 w-4" /> Compose Post</Link>
      </form>

      <PostsLibrary
        posts={posts.map((p) => ({ id: p.id, title: excerpt(p.content, 70), platforms: p.platforms, status: p.status, scheduled: p.scheduledAt ? fmtDateTime(p.scheduledAt) : null, mediaUrl: p.mediaUrl }))}
        emptyAction={
          <EmptyState
            icon={FolderOpen}
            title={!reachable ? "Posts unavailable" : filtered ? "No posts match these filters" : "No social content yet"}
            body={!reachable ? "Posts could not be loaded right now." : filtered ? "Try different filters." : "Drafted, scheduled, and published posts will appear here. Start by composing your first post."}
            action={reachable && !filtered ? <Link href="/app/social/compose" className={kitPrimary}><SquarePen className="h-4 w-4" /> Compose Post</Link> : undefined}
          />
        }
      />

      <div className="mt-5 flex items-center gap-5 rounded-xl border border-line bg-white p-5 xl:mr-[420px]">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Info className="h-5 w-5" /></span>
        <div>
          <div className="text-[14.5px] font-semibold text-deep-navy">Reuse creates a new draft, not a mutation.</div>
          <div className="text-[13px] text-ink-soft">Reusing content creates a new draft for you to customize and publish. Your published content remains unchanged.</div>
        </div>
      </div>
    </div>
  );
}
