import type { Metadata } from "next";
import { Plus, Search, Filter, Star, MoreHorizontal, Folder } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { CreativeSubnav } from "@/components/amplivanta/creative-subnav";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { PROJECTS, PROJECT_STATUS_TONE } from "@/lib/creative-data";
import { CreateButton } from "@/components/amplivanta/crud/create-button";
import { PROJECT_FIELDS } from "@/components/amplivanta/crud/module-fields";

export const metadata: Metadata = { title: "My Projects — Creative Studio" };

const TABS = [
  { label: "All Projects", count: PROJECTS.length },
  { label: "Starred", count: PROJECTS.filter((p) => p.starred).length },
  { label: "Shared with Me", count: 3 },
  { label: "My Folders", count: 4 },
];

const FOLDERS = [
  { name: "Spring Launch", count: 12 },
  { name: "Events", count: 8 },
  { name: "Templates", count: 24 },
  { name: "Client Work", count: 42 },
];

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="My Projects"
        subtitle="Project-management layer for all creative work."
        actions={
          <CreateButton label="Project" fields={PROJECT_FIELDS} endpoint="/api/projects" />
        }
      />
      <CreativeSubnav />

      <div className="mb-4 flex gap-4 border-b border-line">
        {TABS.map((t, i) => (
          <button key={t.label} className={`relative pb-2 text-[13px] font-semibold ${i === 0 ? "text-violet" : "text-ink-muted"}`}>
            {t.label} <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${i === 0 ? "bg-violet/10 text-violet" : "bg-bg-soft text-ink-muted"}`}>{t.count}</span>
            {i === 0 && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-violet" />}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="h-3.5 w-3.5 text-ink-muted" />
          <input placeholder="Search projects…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
        </div>
        {["All Types", "All Status", "All Owners", "Any Date"].map((l) => (
          <button key={l} className="inline-flex h-10 items-center rounded-xl border border-line bg-white px-3 text-[12px] font-semibold text-ink-soft">{l}</button>
        ))}
        <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-violet/30 bg-violet/5 px-3 text-[12px] font-bold text-violet"><Filter className="h-3.5 w-3.5" /> More</button>
      </div>

      {/* Folders row */}
      <div className="mb-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[13px] font-bold text-ink">Folders</div>
          <button className="text-[11.5px] font-semibold text-violet">+ New Folder</button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {FOLDERS.map((f) => (
            <button key={f.name} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-violet/30">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600"><Folder className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1 text-left">
                <div className="text-[12.5px] font-semibold text-ink">{f.name}</div>
                <div className="text-[10.5px] text-ink-muted">{f.count} projects</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Projects grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PROJECTS.map((p) => (
          <div key={p.id} id={p.id} className="group overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-1 hover:border-violet/30">
            <div className={`relative aspect-video bg-gradient-to-br ${p.thumb}`}>
              {p.starred && <Star className="absolute right-2 top-2 h-4 w-4 fill-amber-400 text-amber-400" />}
              <StatusPill tone={PROJECT_STATUS_TONE[p.status]} className="absolute left-2 top-2">{p.status}</StatusPill>
            </div>
            <div className="p-4">
              <div className="mb-1 flex items-start justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-ink">{p.name}</div>
                  <div className="text-[10.5px] text-ink-muted">{p.type}{p.folder ? ` · ${p.folder}` : ""}</div>
                </div>
                <button className="text-ink-muted"><MoreHorizontal className="h-4 w-4" /></button>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <div className="flex -space-x-1.5">
                  <Avatar name={p.owner} size={22} />
                  {p.collaborators.slice(0, 2).map((c) => <Avatar key={c} name={c} size={22} />)}
                  {p.collaborators.length > 2 && (
                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-white bg-bg-soft text-[9px] font-bold text-ink-muted">
                      +{p.collaborators.length - 2}
                    </div>
                  )}
                </div>
                <span className="text-[10.5px] text-ink-muted">{p.updatedAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
