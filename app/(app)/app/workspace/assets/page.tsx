import type { Metadata } from "next";
import { Upload, Plus, Sparkles, Search, Folder, HardDrive, Image as ImageIcon, Video, FileText, Palette, Music } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { WorkspaceSubnav } from "@/components/amplivanta/workspace-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { WS_ASSETS } from "@/lib/workspace-data";

export const metadata: Metadata = { title: "Asset Library — AI Workspace" };

const CATS = [
  { label: "All", count: 128 },
  { label: "Images", count: 62, icon: ImageIcon },
  { label: "Videos", count: 24, icon: Video },
  { label: "Documents", count: 18, icon: FileText },
  { label: "Designs", count: 16, icon: Palette },
  { label: "Audio", count: 8, icon: Music },
];

const FOLDERS = ["Spring Launch", "Case Studies", "Ads", "Videos", "Brand", "Audio"];

export default function AssetLibraryPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Asset Library"
        subtitle="Workspace repository for images, video, documents, designs, audio, and other files."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Upload className="h-3.5 w-3.5" /> Upload</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-violet/30 bg-violet/5 px-4 text-[13px] font-bold text-violet"><Plus className="h-3.5 w-3.5" /> New Folder</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Sparkles className="h-3.5 w-3.5" /> Generate Asset</button>
          </>
        }
      />
      <WorkspaceSubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={HardDrive} label="Storage Used" value={null} tone="violet" />
        <KpiCard icon={Folder} label="Folders" value={null} tone="amber" />
        <KpiCard icon={ImageIcon} label="Assets" value={null} tone="pink" />
        <KpiCard icon={Sparkles} label="AI Generated" value={null} tone="blue" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-3 shadow-card">
            <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-ink-muted">Categories</div>
            <div className="space-y-0.5">
              {CATS.map((c, i) => (
                <button key={c.label} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12.5px] font-semibold ${i === 0 ? "bg-violet/10 text-violet" : "text-ink-soft hover:bg-bg-soft"}`}>
                  <span className="flex items-center gap-2">{c.icon && <c.icon className="h-3.5 w-3.5" />} {c.label}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${i === 0 ? "bg-white text-violet" : "bg-bg-soft text-ink-muted"}`}>{c.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-3 shadow-card">
            <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-ink-muted">Folders</div>
            <div className="space-y-0.5">
              {FOLDERS.map((f) => (
                <button key={f} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-bg-soft">
                  <Folder className="h-3.5 w-3.5 text-amber-500" /> {f}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
              <Search className="h-3.5 w-3.5 text-ink-muted" />
              <input placeholder="Search assets, tags…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
            </div>
            {["All Formats", "All Owners", "Recent"].map((l) => (
              <button key={l} className="inline-flex h-10 items-center rounded-xl border border-line bg-white px-3 text-[12px] font-semibold text-ink-soft">{l}</button>
            ))}
          </div>

          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {WS_ASSETS.map((a) => (
              <div key={a.id} className="group overflow-hidden rounded-xl border border-line bg-white shadow-card transition hover:-translate-y-1 hover:border-violet/30">
                <div className={`relative aspect-video bg-gradient-to-br ${a.thumb}`}>
                  <StatusPill tone="gray" className="absolute left-2 top-2">{a.kind}</StatusPill>
                </div>
                <div className="p-3">
                  <div className="truncate font-mono text-[11.5px] font-semibold text-ink">{a.name}</div>
                  <div className="text-[10.5px] text-ink-muted">{a.folder} · {a.size}</div>
                  <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                    <div className="flex items-center gap-1"><Avatar name={a.owner} size={16} /><span className="text-[10px] text-ink-muted">{a.owner.split(" ")[0]}</span></div>
                    <span className="text-[10px] text-ink-muted">{a.updatedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
