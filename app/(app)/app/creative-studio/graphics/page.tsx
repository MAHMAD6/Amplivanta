import type { Metadata } from "next";
import { Sparkles, Plus, Layers, Wand2, Palette, Scissors, Ruler, Type } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { CreativeSubnav } from "@/components/amplivanta/creative-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { GRAPHICS, PROJECT_STATUS_TONE } from "@/lib/creative-data";

export const metadata: Metadata = { title: "Graphics — Creative Studio" };

const TYPES = ["Social Post", "Story", "Ad", "Banner", "Presentation", "Custom Size"];
const TOOLS = [
  { icon: Scissors, label: "Background Remove" },
  { icon: Ruler, label: "Magic Resize" },
  { icon: Type, label: "Text-to-Design" },
  { icon: Palette, label: "Palette Gen" },
];

export default function GraphicsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Graphics"
        subtitle="Design workspace for social, ads, banners, presentations, campaign visuals."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <Plus className="h-3.5 w-3.5" /> Blank Canvas
          </button>
        }
      />
      <CreativeSubnav />

      {/* AI prompt */}
      <div className="mb-6 rounded-2xl border border-violet/25 bg-gradient-to-br from-violet/[0.05] via-white to-orange-brand/[0.05] p-5 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet" />
          <div className="text-[14px] font-bold text-ink">AI Graphic Generator</div>
        </div>
        <textarea rows={2} defaultValue="LinkedIn ad for AI Advisor — bold headline, product screenshot, purple gradient" className="w-full resize-none rounded-xl border border-line bg-white p-3 text-[13px]" />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]">
            <option>Type: LinkedIn Ad</option><option>Instagram Post</option><option>Story</option><option>Banner</option>
          </select>
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]">
            <option>Size: 1200×628</option><option>1080×1080</option><option>1080×1920</option>
          </select>
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]">
            <option>Style: Bold</option><option>Minimal</option><option>Playful</option>
          </select>
          <button className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-grad-cta px-4 py-2 text-[12.5px] font-bold text-white shadow-violet">
            <Wand2 className="h-3.5 w-3.5" /> Generate
          </button>
        </div>
      </div>

      {/* Types */}
      <div className="mb-6 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {TYPES.map((t) => (
          <button key={t} className="rounded-xl border border-line bg-white p-4 text-center transition hover:-translate-y-0.5 hover:border-violet/30 hover:shadow-card">
            <Layers className="mx-auto h-5 w-5 text-violet" />
            <div className="mt-2 text-[12px] font-semibold text-ink">{t}</div>
          </button>
        ))}
      </div>

      {/* Tools */}
      <div className="mb-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 text-[13px] font-bold text-ink">Design Tools</div>
        <div className="grid gap-3 md:grid-cols-4">
          {TOOLS.map((t) => (
            <button key={t.label} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-violet/30">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet/10 text-violet">
                <t.icon className="h-4 w-4" />
              </div>
              <span className="text-[12.5px] font-semibold text-ink">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular templates rail */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[14px] font-bold text-ink">Recent Graphics</div>
          <a href="/app/creative-studio/templates" className="text-[12px] font-semibold text-violet">Browse templates →</a>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GRAPHICS.map((g) => (
            <div key={g.id} className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
              <div className={`aspect-[16/10] bg-gradient-to-br ${g.thumb}`} />
              <div className="p-3">
                <div className="mb-1 flex items-center justify-between">
                  <StatusPill tone={PROJECT_STATUS_TONE[g.status]}>{g.status}</StatusPill>
                  <span className="text-[10px] text-ink-muted">{g.size}</span>
                </div>
                <div className="text-[12.5px] font-semibold text-ink">{g.name}</div>
                <div className="text-[10.5px] text-ink-muted">{g.type} · {g.updatedAt}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
