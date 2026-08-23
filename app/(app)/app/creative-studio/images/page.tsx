import type { Metadata } from "next";
import { Upload, Sparkles, Wand2, Star, Trash2, Search, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { CreativeSubnav } from "@/components/amplivanta/creative-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { IMAGES } from "@/lib/creative-data";
import { Image as ImageIcon, HardDrive, Zap } from "lucide-react";

export const metadata: Metadata = { title: "Images — Creative Studio" };

const TABS = [
  { label: "My Images", count: 128 },
  { label: "AI Generated", count: 42 },
  { label: "Stock Images", count: 620 },
  { label: "Favorites", count: 24 },
  { label: "Trash", count: 8 },
];

export default function ImagesPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Images"
        subtitle="Unified image library + AI image creation workspace."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Upload className="h-3.5 w-3.5" /> Upload</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Sparkles className="h-3.5 w-3.5" /> Generate with AI</button>
          </>
        }
      />
      <CreativeSubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={ImageIcon} label="Total Images" value="822" delta="18 this week" tone="violet" />
        <KpiCard icon={Sparkles} label="AI Generated" value="42" delta="8 today" tone="pink" />
        <KpiCard icon={Star} label="Favorites" value="24" tone="amber" />
        <KpiCard icon={HardDrive} label="Storage" value="42 / 100 GB" tone="blue" />
      </div>

      {/* AI generator card */}
      <div className="mb-6 rounded-2xl border border-violet/25 bg-gradient-to-br from-violet/[0.05] via-white to-orange-brand/[0.05] p-5 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet" />
          <div className="text-[14px] font-bold text-ink">Generate with AI</div>
        </div>
        <textarea rows={2} defaultValue="Vibrant gradient hero image for SaaS product launch, minimal, violet to orange" className="w-full resize-none rounded-xl border border-line bg-white p-3 text-[13px] focus:border-violet focus:outline-none" />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="text-[11px] font-semibold text-ink-muted">Aspect</label>
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]">
            <option>1:1 · Square</option><option>16:9 · Landscape</option><option>9:16 · Portrait</option><option>4:5 · Instagram</option>
          </select>
          <label className="ml-2 text-[11px] font-semibold text-ink-muted">Style</label>
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]">
            <option>Photorealistic</option><option>Illustration</option><option>3D Render</option><option>Minimalist</option>
          </select>
          <label className="ml-2 text-[11px] font-semibold text-ink-muted">Brand Kit</label>
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]">
            <option>Amplivanta Primary</option><option>Amplivanta Dark</option><option>None</option>
          </select>
          <button className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-grad-cta px-4 py-2 text-[12.5px] font-bold text-white shadow-violet">
            <Wand2 className="h-3.5 w-3.5" /> Generate 4 variants
          </button>
        </div>
      </div>

      {/* Tabs + filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-line">
        {TABS.map((t, i) => (
          <button key={t.label} className={`relative px-3 py-2 text-[13px] font-semibold ${i === 0 ? "text-violet" : "text-ink-soft"}`}>
            {t.label} <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${i === 0 ? "bg-violet/10 text-violet" : "bg-bg-soft text-ink-muted"}`}>{t.count}</span>
            {i === 0 && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-grad-brand" />}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex h-9 items-center gap-2 rounded-xl border border-line bg-white px-3">
            <Search className="h-3.5 w-3.5 text-ink-muted" />
            <input placeholder="Search images…" className="w-40 bg-transparent text-[12.5px] focus:outline-none" />
          </div>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {IMAGES.map((im) => (
          <div key={im.id} className="group overflow-hidden rounded-xl border border-line bg-white shadow-card transition hover:-translate-y-1 hover:border-violet/30">
            <div className={`relative aspect-square bg-gradient-to-br ${im.thumb}`}>
              {im.starred && <Star className="absolute right-2 top-2 h-4 w-4 fill-amber-400 text-amber-400" />}
              <StatusPill tone={im.category === "AI Generated" ? "violet" : im.category === "Stock" ? "blue" : "gray"} className="absolute left-2 top-2">
                {im.category === "AI Generated" ? "AI" : im.category === "Stock" ? "Stock" : "Mine"}
              </StatusPill>
            </div>
            <div className="p-3">
              <div className="truncate text-[12.5px] font-semibold text-ink">{im.title}</div>
              <div className="text-[10.5px] text-ink-muted">{im.dimensions} · {im.size}</div>
              {im.prompt && <div className="mt-1 truncate text-[10px] italic text-ink-muted">&ldquo;{im.prompt}&rdquo;</div>}
              <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                <span className="text-[10px] text-ink-muted">{im.createdAt}</span>
                <button className="text-ink-muted"><MoreHorizontal className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
