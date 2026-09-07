import type { Metadata } from "next";
import { Sparkles, Bookmark, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { IntelSubnav } from "@/components/amplivanta/intel-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { IDEAS, IDEA_TOP_THEMES, IDEA_UPCOMING } from "@/lib/intel-data";

export const metadata: Metadata = { title: "Content Ideas" };

const CHANNEL_TONE = { Blog: "violet", Social: "pink", Email: "blue", Video: "orange", Ad: "green" } as const;
const GOAL_TONE = { Awareness: "blue", "Lead Gen": "green", Retention: "amber", "Thought Leadership": "violet" } as const;

export default function IdeasPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Content Ideas"
        subtitle="Channel-aware content ideas from campaign goals, trends, audience context."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <Sparkles className="h-3.5 w-3.5" /> Generate Ideas
          </button>
        }
      />
      <IntelSubnav />

      {/* Prompt */}
      <div className="mb-6 rounded-2xl border border-violet/25 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-5 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet" />
          <div className="text-[14px] font-bold text-ink">Prompt-to-Ideas</div>
        </div>
        <textarea rows={2} defaultValue="10 content ideas for SaaS founders about attribution in a cookieless world — bias toward LinkedIn + blog" className="w-full resize-none rounded-xl border border-line bg-white p-3 text-[13px]" />
        <div className="mt-3 flex flex-wrap gap-2">
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]"><option>Channel: Any</option><option>Blog</option><option>Social</option><option>Email</option><option>Video</option><option>Ad</option></select>
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]"><option>Goal: Any</option><option>Awareness</option><option>Lead Gen</option><option>Retention</option><option>Thought Leadership</option></select>
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]"><option>Type: Any</option><option>Story</option><option>How-to</option><option>Data</option><option>Opinion</option></select>
          <button className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-grad-cta px-4 py-2 text-[12.5px] font-bold text-white shadow-violet">
            <Sparkles className="h-3.5 w-3.5" /> Generate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {IDEAS.map((i) => (
            <div key={i.id} className="rounded-2xl border border-line bg-white p-4 shadow-card hover:border-violet/30">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-1.5">
                  <StatusPill tone={CHANNEL_TONE[i.channel]}>{i.channel}</StatusPill>
                  <StatusPill tone={GOAL_TONE[i.goal]}>{i.goal}</StatusPill>
                </div>
                <button className={i.saved ? "text-violet" : "text-ink-muted hover:text-violet"}>
                  <Bookmark className={"h-4 w-4 " + (i.saved ? "fill-violet" : "")} />
                </button>
              </div>
              <div className="text-[13.5px] font-bold text-ink">{i.title}</div>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{i.hook}</p>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <div className="text-[10.5px] text-ink-muted">Theme: <span className="font-semibold text-ink">{i.theme}</span></div>
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] text-ink-muted">Score</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600">{i.score}</span>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <button className="flex-1 rounded-xl border border-line py-1.5 text-[11.5px] font-semibold text-ink">Preview</button>
                <button className="flex-1 rounded-xl bg-grad-cta py-1.5 text-[11.5px] font-bold text-white shadow-violet">Use Idea →</button>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-ink"><TrendingUp className="h-4 w-4 text-violet" /> Top Themes</div>
            <div className="space-y-2">
              {IDEA_TOP_THEMES.map((t) => (
                <div key={t.theme} className="flex items-center justify-between border-b border-line pb-2 last:border-0">
                  <div>
                    <div className="text-[12.5px] font-semibold text-ink">{t.theme}</div>
                    <div className="text-[10.5px] text-ink-muted">{t.views.toLocaleString()} views</div>
                  </div>
                  <span className="text-[11.5px] font-bold text-emerald-600">↑ {t.delta}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-ink"><Calendar className="h-4 w-4 text-violet" /> Upcoming</div>
            <div className="space-y-2">
              {IDEA_UPCOMING.map((u) => (
                <div key={u.label} className="flex items-center gap-3 rounded-lg border border-line p-2">
                  <div className="text-[11.5px] font-bold text-violet">{u.date}</div>
                  <div className="text-[12px] text-ink">{u.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-5">
            <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink"><Sparkles className="h-3.5 w-3.5 text-violet" /> Saved Ideas</div>
            <div className="text-[11.5px] text-ink-soft">3 saved this week. Review your library before your next planning session.</div>
            <button className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold text-violet">Open library <ArrowRight className="h-3 w-3" /></button>
          </div>
        </aside>
      </div>
    </div>
  );
}
