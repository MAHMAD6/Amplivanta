import type { Metadata } from "next";
import { Sparkles, Video, Play, Wand2, RotateCw, Upload, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { CreativeSubnav } from "@/components/amplivanta/creative-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { VIDEOS } from "@/lib/creative-data";

export const metadata: Metadata = { title: "Video — Creative Studio" };

const MODES = [
  { icon: Wand2, label: "Text-to-Video", desc: "Prompt → 30–60s clip" },
  { icon: Video, label: "Script-to-Video", desc: "Multi-scene from script" },
  { icon: Play, label: "Image-to-Video", desc: "Animate a still" },
  { icon: RotateCw, label: "URL-to-Video", desc: "Repurpose a blog / page" },
  { icon: Upload, label: "Upload & Edit", desc: "Bring your own footage" },
];

const VIDEO_STATUS_TONE = { Ready: "blue", Rendering: "violet", Published: "green", Failed: "red" } as const;

export default function VideoPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Video"
        subtitle="AI-assisted video production and management."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <Sparkles className="h-3.5 w-3.5" /> New Video
          </button>
        }
      />
      <CreativeSubnav />

      {/* Modes */}
      <div className="mb-6 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        {MODES.map((m) => (
          <button key={m.label} className="flex flex-col items-start gap-2 rounded-xl border border-line bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-violet/30 hover:shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet/10 text-violet">
              <m.icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[12.5px] font-bold text-ink">{m.label}</div>
              <div className="text-[10.5px] text-ink-muted">{m.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* AI generator */}
      <div className="mb-6 rounded-2xl border border-violet/25 bg-gradient-to-br from-violet/[0.05] via-white to-orange-brand/[0.05] p-5 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet" />
          <div className="text-[14px] font-bold text-ink">AI Video Studio</div>
        </div>
        <textarea rows={3} defaultValue="60-second product tour of Amplivanta CRM: contact list → drawer → activity timeline. Warm voiceover, brand music." className="w-full resize-none rounded-xl border border-line bg-white p-3 text-[13px]" />
        <div className="mt-3 flex flex-wrap gap-2">
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]"><option>Platform: LinkedIn</option><option>YouTube</option><option>TikTok</option><option>Instagram Reels</option></select>
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]"><option>Format: 16:9</option><option>9:16</option><option>1:1</option></select>
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]"><option>Duration: 60s</option><option>30s</option><option>2 min</option></select>
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]"><option>Tone: Warm</option><option>Bold</option><option>Educational</option></select>
          <button className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-grad-cta px-4 py-2 text-[12.5px] font-bold text-white shadow-violet">
            <Wand2 className="h-3.5 w-3.5" /> Generate
          </button>
        </div>
      </div>

      {/* Library */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[14px] font-bold text-ink">Video Library</div>
          <span className="text-[11px] text-ink-muted">{VIDEOS.length} videos</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {VIDEOS.map((v) => (
            <div key={v.id} className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
              <div className={`relative aspect-video bg-gradient-to-br ${v.thumb}`}>
                <StatusPill tone={VIDEO_STATUS_TONE[v.status]} className="absolute left-2 top-2">{v.status}</StatusPill>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 backdrop-blur">
                    <Play className="h-5 w-5 fill-ink text-ink" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 rounded bg-ink/70 px-1.5 py-0.5 text-[10px] font-bold text-white">{v.duration}</span>
              </div>
              <div className="p-3">
                <div className="mb-1 flex items-start justify-between">
                  <div className="text-[12.5px] font-semibold text-ink">{v.name}</div>
                  <button className="text-ink-muted"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                </div>
                <div className="text-[10.5px] text-ink-muted">{v.platform} · {v.createdAt}</div>
                {v.views && (
                  <div className="mt-2 flex gap-3 border-t border-line pt-2 text-[10.5px]">
                    <span className="text-ink-muted">Views <span className="font-bold text-ink">{v.views.toLocaleString()}</span></span>
                    <span className="text-ink-muted">Eng. <span className="font-bold text-emerald-600">{v.engagement}%</span></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
