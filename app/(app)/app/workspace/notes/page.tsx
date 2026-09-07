import type { Metadata } from "next";
import { Plus, Search, Sparkles, Pin, Tag, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { WorkspaceSubnav } from "@/components/amplivanta/workspace-subnav";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { WS_NOTES } from "@/lib/workspace-data";

export const metadata: Metadata = { title: "Workspace Notes" };

const TYPE_TONE = { Meeting: "blue", Research: "violet", Idea: "amber", Strategy: "green", "AI Summary": "pink" } as const;
const NOTEBOOKS = ["All Notes", "Meetings", "Research", "Ideas", "Strategy", "AI Summaries"];

export default function WSNotesPage() {
  const pinned = WS_NOTES.filter((n) => n.pinned);
  const recent = WS_NOTES.filter((n) => !n.pinned);
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Notes"
        subtitle="Capture research, meetings, ideas, strategy, AI summaries — in context."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Sparkles className="h-3.5 w-3.5" /> Meeting Note</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-violet/30 bg-violet/5 px-4 text-[13px] font-bold text-violet"><Sparkles className="h-3.5 w-3.5" /> AI Summary</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Plus className="h-3.5 w-3.5" /> New Note</button>
          </>
        }
      />
      <WorkspaceSubnav />

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-line bg-white p-3 shadow-card">
          <div className="mb-2 flex h-9 items-center gap-2 rounded-lg border border-line px-3">
            <Search className="h-3.5 w-3.5 text-ink-muted" />
            <input placeholder="Search notes…" className="min-w-0 flex-1 bg-transparent text-[12px] focus:outline-none" />
          </div>
          <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-ink-muted">Notebooks</div>
          <div className="space-y-0.5">
            {NOTEBOOKS.map((n, i) => (
              <button key={n} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-semibold ${i === 0 ? "bg-violet/10 text-violet" : "text-ink-soft hover:bg-bg-soft"}`}>
                <BookOpen className="h-3.5 w-3.5" /> {n}
              </button>
            ))}
          </div>
          <div className="mb-2 mt-4 px-2 text-[10px] font-bold uppercase tracking-wider text-ink-muted">Tags</div>
          <div className="flex flex-wrap gap-1 px-2">
            {["BrightTech", "Enterprise", "research", "Q4", "CAC", "PLG", "competitive"].map((t) => (
              <span key={t} className="rounded-full bg-bg-soft px-2 py-0.5 text-[10.5px] text-ink-soft"># {t}</span>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          {pinned.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2 text-[12.5px] font-bold text-ink"><Pin className="h-3.5 w-3.5 text-violet" /> Pinned</div>
              <div className="grid gap-3 md:grid-cols-2">
                {pinned.map((n) => (
                  <div key={n.id} className="rounded-2xl border border-violet/25 bg-white p-4 shadow-card">
                    <div className="mb-2 flex items-center justify-between">
                      <StatusPill tone={TYPE_TONE[n.type]}>{n.type}</StatusPill>
                      <span className="text-[10.5px] text-ink-muted">{n.updatedAt}</span>
                    </div>
                    <div className="text-[13px] font-bold text-ink">{n.title}</div>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">{n.snippet}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                      <div className="flex items-center gap-2"><Avatar name={n.author} size={20} /><span className="text-[11px] text-ink-soft">{n.author}</span></div>
                      <div className="flex flex-wrap gap-1">
                        {n.tags.map((t) => <span key={t} className="rounded-md bg-bg-soft px-1.5 py-0.5 text-[10px] text-ink-muted"># {t}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="mb-3 text-[12.5px] font-bold text-ink">Recent</div>
            <div className="space-y-3">
              {recent.map((n) => (
                <div key={n.id} className="rounded-2xl border border-line bg-white p-4 shadow-card hover:border-violet/30">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusPill tone={TYPE_TONE[n.type]}>{n.type}</StatusPill>
                      <div className="text-[13px] font-bold text-ink">{n.title}</div>
                    </div>
                    <span className="text-[10.5px] text-ink-muted">{n.updatedAt}</span>
                  </div>
                  <p className="text-[12px] text-ink-soft">{n.snippet}</p>
                  <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-[11px]">
                    <div className="flex items-center gap-2 text-ink-muted"><Avatar name={n.author} size={16} /><span>{n.author}</span></div>
                    <div className="flex flex-wrap gap-1">{n.tags.map((t) => <span key={t} className="rounded-md bg-bg-soft px-1.5 py-0.5 text-[10px] text-ink-muted"># {t}</span>)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
