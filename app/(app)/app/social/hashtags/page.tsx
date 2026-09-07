import type { Metadata } from "next";
import { Plus, Search, MoreHorizontal, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { SocialSubnav } from "@/components/amplivanta/social-subnav";
import { PlatformIcon } from "@/components/amplivanta/platform-badge";
import { HASHTAG_SETS } from "@/lib/social-data";

export const metadata: Metadata = { title: "Hashtags & Mentions" };

export default function HashtagsPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Hashtags & Mentions Library"
        subtitle="Reusable hashtag sets and mention references for fast composing."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <Plus className="h-3.5 w-3.5" /> New Set
          </button>
        }
      />
      <SocialSubnav />

      <div className="mb-4 flex h-10 max-w-md items-center gap-2 rounded-xl border border-line bg-white px-3">
        <Search className="h-3.5 w-3.5 text-ink-muted" />
        <input placeholder="Search hashtags…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {HASHTAG_SETS.map((set) => (
          <div key={set.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="text-[14px] font-bold text-ink">{set.name}</div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-muted">
                  <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {set.usageCount} uses</span>
                  <span>· Updated {set.updatedAt}</span>
                </div>
              </div>
              <button className="text-ink-muted"><MoreHorizontal className="h-4 w-4" /></button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {set.hashtags.map((h) => (
                <span key={h} className="rounded-md bg-violet/10 px-2 py-0.5 text-[11.5px] font-semibold text-violet">{h}</span>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <div className="flex gap-1">
                {set.platforms.map((p) => <PlatformIcon key={p} platform={p} size={20} />)}
              </div>
              <div className="flex gap-1.5">
                <button className="rounded-lg border border-line px-2 py-1 text-[11px] font-semibold text-ink-soft">Copy</button>
                <button className="rounded-lg bg-violet/10 px-2 py-1 text-[11px] font-bold text-violet">Insert in composer</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
