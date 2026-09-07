import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, Plus } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { SocialSubnav } from "@/components/amplivanta/social-subnav";
import { PlatformIcon } from "@/components/amplivanta/platform-badge";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { PLATFORM_META } from "@/lib/social-data";
import { DeletePostButton } from "@/components/amplivanta/social-post-actions";
import { loadSocialPosts } from "@/app/(app)/app/social/actions";

export const metadata: Metadata = { title: "Posts" };

const STATUS_TONE: Record<string, "violet" | "green" | "amber" | "gray"> = {
  draft: "gray",
  scheduled: "amber",
  published: "green",
};

export default async function PostsLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { connected, rows } = await loadSocialPosts(status);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Posts Library"
        subtitle="Drafts and scheduled social content in this workspace."
        actions={
          <Link
            href="/app/social/compose"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"
          >
            <Plus className="h-3.5 w-3.5" /> New post
          </Link>
        }
      />
      <SocialSubnav />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[
          ["All", undefined],
          ["Drafts", "draft"],
          ["Scheduled", "scheduled"],
        ].map(([label, value]) => {
          const active = status === value || (!status && !value);
          return (
            <Link
              key={label as string}
              href={value ? `/app/social/posts?status=${value}` : "/app/social/posts"}
              className={
                active
                  ? "inline-flex h-10 items-center rounded-xl bg-violet px-3.5 text-[12.5px] font-bold text-white"
                  : "inline-flex h-10 items-center rounded-xl border border-line bg-white px-3.5 text-[12.5px] font-semibold text-ink-soft hover:border-violet/40"
              }
            >
              {label as string}
            </Link>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white px-6 py-16 text-center shadow-card">
          <Inbox aria-hidden className="mx-auto h-7 w-7 text-ink-muted" />
          <h2 className="mt-3 text-[15px] font-bold text-ink">
            {connected ? "No posts yet" : "Posts unavailable"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-ink-soft">
            {connected
              ? "Compose a post, or promote a Marketplace product to create one prefilled with its image and link."
              : "The platform database could not be reached, so your posts cannot be listed right now."}
          </p>
          {connected && (
            <Link
              href="/app/social/compose"
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-violet px-5 text-[13.5px] font-bold text-white transition hover:opacity-90"
            >
              Create your first post
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="px-4 py-3">Post</th>
                <th className="px-4 py-3">Channels</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Scheduled</th>
                <th className="px-4 py-3">Created</th>
                <th className="w-10 px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-bg-soft/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.mediaUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.mediaUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-violet/25 to-orange-brand/20" />
                      )}
                      <div className="min-w-0 max-w-[420px]">
                        <div className="truncate text-[13px] font-semibold text-ink">{p.content}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.platforms.length === 0 ? (
                      <span className="text-[12px] text-ink-muted">None selected</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {p.platforms.map((pl) => (
                          <span key={pl} className="flex items-center gap-1 text-[12px] text-ink-soft">
                            {PLATFORM_META[pl as keyof typeof PLATFORM_META] ? (
                              <PlatformIcon platform={pl as never} size={18} />
                            ) : null}
                            {PLATFORM_META[pl as keyof typeof PLATFORM_META]?.label ?? pl}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill tone={STATUS_TONE[p.status] ?? "gray"}>{p.status}</StatusPill>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-ink-muted">{p.scheduledFor ?? "—"}</td>
                  <td className="px-4 py-3 text-[12px] text-ink-muted">{p.created}</td>
                  <td className="px-2 py-3 text-right">
                    <DeletePostButton postId={p.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-5 rounded-xl border border-line bg-bg-soft px-4 py-3.5 text-[12.5px] leading-relaxed text-ink-soft">
        No social channel is connected yet, so posts are drafted and scheduled here but never sent.
        Engagement figures appear once a channel integration exists to report them.
      </p>
    </div>
  );
}
