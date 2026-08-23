import type { Metadata } from "next";
import { Plus, Filter, Search, LayoutGrid, List, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { SocialSubnav } from "@/components/amplivanta/social-subnav";
import { PlatformIcon } from "@/components/amplivanta/platform-badge";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { POSTS, PLATFORM_META, STATUS_TONE } from "@/lib/social-data";
import { CreateButton } from "@/components/amplivanta/crud/create-button";
import { SOCIAL_POST_FIELDS } from "@/components/amplivanta/crud/module-fields";

export const metadata: Metadata = { title: "Posts — Amplivanta" };

export default function PostsLibraryPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Posts Library"
        subtitle="Search drafts, scheduled and published social content."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><Filter className="h-3.5 w-3.5" /> Filters</button>
            <CreateButton label="Post" fields={SOCIAL_POST_FIELDS} endpoint="/api/social-posts" />
          </>
        }
      />
      <SocialSubnav />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="h-3.5 w-3.5 text-ink-muted" />
          <input placeholder="Search posts…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
        </div>
        {["All Platforms", "All Status", "All Campaigns", "All Owners"].map((l) => (
          <button key={l} className="inline-flex h-10 items-center rounded-xl border border-line bg-white px-3 text-[12.5px] font-semibold text-ink-soft">{l}</button>
        ))}
        <div className="flex overflow-hidden rounded-xl border border-line">
          <button className="flex h-10 w-10 items-center justify-center bg-violet/10 text-violet"><List className="h-4 w-4" /></button>
          <button className="flex h-10 w-10 items-center justify-center border-l border-line text-ink-muted"><LayoutGrid className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="w-8 px-4 py-3"><input type="checkbox" className="h-4 w-4 rounded border-line accent-violet" /></th>
              <th className="px-4 py-3">Post</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Engagement</th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {POSTS.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-bg-soft/40">
                <td className="px-4 py-3"><input type="checkbox" className="h-4 w-4 rounded border-line accent-violet" /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet/25 to-orange-brand/20" />
                    <div className="min-w-0 max-w-[380px]">
                      <div className="truncate text-[13px] font-semibold text-ink">{p.content}</div>
                      {p.campaign && <div className="text-[11px] text-ink-muted">Campaign · {p.campaign}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <PlatformIcon platform={p.platform} size={20} />
                    <span className="text-[12px] text-ink-soft">{PLATFORM_META[p.platform].label}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><StatusPill tone={STATUS_TONE[p.status]}>{p.status}</StatusPill></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.author} size={22} />
                    <span className="text-[12px] text-ink-soft">{p.author}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-ink-muted">{p.publishedAt || p.scheduledFor || "—"}</td>
                <td className="px-4 py-3 text-[12px] text-ink">
                  {p.engagement ? (
                    <div className="flex gap-2 text-[11.5px]">
                      <span>❤ {p.engagement.likes}</span>
                      <span>💬 {p.engagement.comments}</span>
                      <span>↪ {p.engagement.shares}</span>
                    </div>
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </td>
                <td className="px-2 py-3 text-right"><button className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft"><MoreHorizontal className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
