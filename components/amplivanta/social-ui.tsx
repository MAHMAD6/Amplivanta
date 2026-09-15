"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Check, Copy, FolderOpen, Image as ImageIcon, Loader2, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toastResult } from "@/lib/action-toast";
import { archivePosts, deletePosts, reusePost, reviewPost, submitForApproval, unschedulePost } from "@/app/(app)/app/social/workflow-actions";
import { platformLabel, statusLabel, statusTone } from "@/lib/social/platforms";

type Act = () => Promise<{ ok: true; message: string } | { ok: false; error: string }>;

function useAction() {
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: Act) => start(async () => { if (toastResult(await fn())) router.refresh(); });
  return { pending, run };
}

const small = "inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-[12px] font-semibold text-deep-navy hover:bg-bg-soft disabled:opacity-50";
const tones = { gray: "bg-bg-soft text-ink-soft", green: "bg-emerald-50 text-emerald-700", blue: "bg-royal-tint text-[#0B5CFF]", amber: "bg-amber-50 text-amber-700", red: "bg-red-50 text-red-600", violet: "bg-violet/10 text-violet" };

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold", tones[statusTone(status)])}>{statusLabel(status)}</span>;
}

export function ReviewButtons({ postId }: { postId: string }) {
  const { pending, run } = useAction();
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <button type="button" disabled={pending} className={cn(small, "text-emerald-700")} onClick={() => run(() => reviewPost(postId, "approve"))}>
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Approve
      </button>
      <button
        type="button"
        disabled={pending}
        className={cn(small, "text-amber-700")}
        onClick={() => {
          const note = window.prompt("What needs to change?") ?? "";
          if (note.trim()) run(() => reviewPost(postId, "changes", note));
        }}
      >
        <RefreshCw className="h-3 w-3" /> Request changes
      </button>
      <button
        type="button"
        disabled={pending}
        className={cn(small, "text-red-600")}
        onClick={() => {
          if (window.confirm("Reject this post?")) run(() => reviewPost(postId, "reject"));
        }}
      >
        <X className="h-3 w-3" /> Reject
      </button>
    </div>
  );
}

export function QueueItemActions({ postId }: { postId: string }) {
  const { pending, run } = useAction();
  return (
    <button type="button" disabled={pending} className={small} onClick={() => run(() => unschedulePost(postId))}>
      {pending && <Loader2 className="h-3 w-3 animate-spin" />} Unschedule
    </button>
  );
}

export type LibraryPost = { id: string; title: string; platforms: string[]; status: string; scheduled: string | null; mediaUrl: string | null };

/** Posts table with selection-driven bulk and content actions (design 04). */
export function PostsLibrary({ posts, emptyAction }: { posts: LibraryPost[]; emptyAction: React.ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { pending, run } = useAction();
  const ids = [...selected];
  const one = ids.length === 1 ? posts.find((p) => p.id === ids[0]) : undefined;
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const clear = () => setSelected(new Set());

  const railBtn = "flex w-full items-center gap-2.5 rounded-md border border-line bg-bg-soft/40 px-3 py-2 text-left text-[13px] text-deep-navy enabled:hover:bg-bg-soft disabled:text-ink-muted/60";

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
      <section className="min-w-0 rounded-xl border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-line text-[13.5px] font-semibold text-deep-navy">
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    className="h-4 w-4 accent-[#0B5CFF]"
                    checked={posts.length > 0 && selected.size === posts.length}
                    onChange={(e) => setSelected(e.target.checked ? new Set(posts.map((p) => p.id)) : new Set())}
                  />
                </th>
                {["Title", "Platform", "Status", "Scheduled For"].map((h) => <th key={h} className="px-4 py-4">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className={cn("border-b border-line text-[13px] text-ink-soft last:border-0", selected.has(p.id) && "bg-royal-tint/40")}>
                  <td className="px-4 py-3"><input type="checkbox" aria-label={`Select ${p.title}`} className="h-4 w-4 accent-[#0B5CFF]" checked={selected.has(p.id)} onChange={() => toggle(p.id)} /></td>
                  <td className="max-w-[340px] truncate px-4 py-3 font-semibold text-deep-navy">{p.title}</td>
                  <td className="px-4 py-3">{p.platforms.length ? p.platforms.map(platformLabel).join(", ") : "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">{p.scheduled ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {posts.length === 0 && emptyAction}
      </section>

      <aside className="space-y-4">
        <div className="rounded-xl border border-line bg-white p-4">
          <h2 className="text-[14.5px] font-semibold text-deep-navy">Bulk Actions</h2>
          <p className="mb-3 text-[12.5px] text-ink-soft">{ids.length ? `${ids.length} selected` : "Select one or more items to enable bulk actions."}</p>
          <div className="space-y-2">
            <button type="button" className={railBtn} disabled={!ids.length || pending} onClick={() => run(async () => { const r = await archivePosts(ids); if (r.ok) clear(); return r; })}><Archive className="h-4 w-4" /> Archive</button>
            <button type="button" className={railBtn} disabled={!ids.length || pending} onClick={() => { if (window.confirm(`Delete ${ids.length} post(s)?`)) run(async () => { const r = await deletePosts(ids); if (r.ok) clear(); return r; }); }}><Trash2 className="h-4 w-4" /> Delete</button>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <h2 className="text-[14.5px] font-semibold text-deep-navy">Content Actions</h2>
          <p className="mb-3 text-[12.5px] text-ink-soft">{one ? "Actions for the selected post." : "Select an item to enable content actions."}</p>
          <div className="space-y-2">
            <button type="button" className={railBtn} disabled={!one || pending} onClick={() => one && run(() => reusePost(one.id))}><Copy className="h-4 w-4" /> Reuse as new draft</button>
            <button type="button" className={railBtn} disabled={!one || pending || !["draft", "changes_requested"].includes(one?.status ?? "")} onClick={() => one && run(() => submitForApproval(one.id))}><Pencil className="h-4 w-4" /> Submit for approval</button>
            <button type="button" className={railBtn} disabled={!one || pending || !["scheduled", "approved", "failed"].includes(one?.status ?? "")} onClick={() => one && run(() => unschedulePost(one.id))}><RefreshCw className="h-4 w-4" /> Unschedule</button>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <h2 className="mb-3 text-[14.5px] font-semibold text-deep-navy">Media Preview</h2>
          {one?.mediaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={one.mediaUrl} alt="" className="max-h-56 w-full rounded-lg object-cover" />
          ) : (
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><ImageIcon className="h-6 w-6" /></span>
              <div>
                <div className="text-[13.5px] font-semibold text-deep-navy">{one ? "No media on this post" : "No media selected"}</div>
                <div className="text-[12.5px] text-ink-soft">{one ? "Add media when composing." : "Select a post to preview its media."}</div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export function ComposeLink({ label = "Compose Post", className }: { label?: string; className?: string }) {
  return (
    <Link href="/app/social/compose" className={className ?? "inline-flex h-10 items-center gap-2 rounded-md bg-[#0B5CFF] px-5 text-[13.5px] font-semibold text-white hover:bg-[#0A4FE0]"}>
      <FolderOpen className="hidden" /> {label}
    </Link>
  );
}
