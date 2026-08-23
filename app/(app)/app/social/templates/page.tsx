import type { Metadata } from "next";
import { Plus, Search, MoreHorizontal, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { SocialSubnav } from "@/components/amplivanta/social-subnav";
import { PlatformIcon } from "@/components/amplivanta/platform-badge";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { TEMPLATES } from "@/lib/social-data";

export const metadata: Metadata = { title: "Content Templates — Amplivanta" };

const CATEGORIES = ["All", "Product", "Case Study", "Tips", "Culture", "UGC", "Engagement"];

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Content Templates"
        subtitle="Reusable social-post structures by campaign, platform and format."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <Plus className="h-3.5 w-3.5" /> New Template
          </button>
        }
      />
      <SocialSubnav />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="h-3.5 w-3.5 text-ink-muted" />
          <input placeholder="Search templates…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
        </div>
        {CATEGORIES.map((c, i) => (
          <button key={c} className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${i === 0 ? "bg-violet/10 text-violet" : "text-ink-soft hover:bg-bg-soft"}`}>{c}</button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <div key={t.id} className="flex flex-col rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-1 hover:border-violet/30">
            <div className="aspect-[16/10] rounded-t-2xl bg-gradient-to-br from-violet/25 via-fuchsia-200/60 to-orange-brand/25" />
            <div className="flex-1 p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="text-[14px] font-bold text-ink">{t.name}</div>
                  <StatusPill tone="violet" className="mt-1.5">{t.category}</StatusPill>
                </div>
                <button className="text-ink-muted"><MoreHorizontal className="h-4 w-4" /></button>
              </div>
              <pre className="mt-2 max-h-16 overflow-hidden whitespace-pre-wrap rounded-lg bg-bg-soft/60 p-2 text-[11px] text-ink-soft">{t.preview}</pre>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <div className="flex gap-1">{t.platforms.map((p) => <PlatformIcon key={p} platform={p} size={18} />)}</div>
                <span className="text-[11px] text-ink-muted">{t.uses} uses</span>
              </div>
              <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-grad-cta py-2 text-[12px] font-bold text-white shadow-violet">
                <Sparkles className="h-3.5 w-3.5" /> Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
