import type { Metadata } from "next";
import { Sparkles, Wand2, Upload, Plus, FileText, MoreHorizontal, Download, Languages, PenLine } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { CreativeSubnav } from "@/components/amplivanta/creative-subnav";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { DOCUMENTS, PROJECT_STATUS_TONE } from "@/lib/creative-data";

export const metadata: Metadata = { title: "Documents — Creative Studio" };

const TABS = ["My Documents", "Templates", "AI Generated", "Shared with Me", "Trash"];
const AI_TOOLS = [
  { icon: PenLine, label: "Improve Writing" },
  { icon: Wand2, label: "Change Tone" },
  { icon: Languages, label: "Translate" },
  { icon: FileText, label: "Summarize" },
];

export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Documents"
        subtitle="AI-assisted document creation + managed document library."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Upload className="h-3.5 w-3.5" /> Upload</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Plus className="h-3.5 w-3.5" /> Blank</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Sparkles className="h-3.5 w-3.5" /> Generate with AI</button>
          </>
        }
      />
      <CreativeSubnav />

      {/* AI writer */}
      <div className="mb-6 rounded-2xl border border-violet/25 bg-gradient-to-br from-violet/[0.05] via-white to-orange-brand/[0.05] p-5 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet" />
          <div className="text-[14px] font-bold text-ink">AI Document Writer</div>
        </div>
        <textarea rows={2} defaultValue="Case study — how BrightTech grew qualified pipeline 3.2× with Amplivanta. 800 words." className="w-full resize-none rounded-xl border border-line bg-white p-3 text-[13px]" />
        <div className="mt-3 flex flex-wrap gap-2">
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]"><option>Type: Case Study</option><option>Blog</option><option>Proposal</option><option>Guide</option></select>
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]"><option>Tone: Professional</option><option>Conversational</option><option>Bold</option></select>
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]"><option>Length: Medium (800)</option><option>Short (300)</option><option>Long (2000+)</option></select>
          <select className="rounded-lg border border-line bg-white px-2 py-1.5 text-[12px]"><option>Brand Kit: Amplivanta Primary</option></select>
          <button className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-grad-cta px-4 py-2 text-[12.5px] font-bold text-white shadow-violet"><Wand2 className="h-3.5 w-3.5" /> Draft</button>
        </div>
      </div>

      {/* AI tools */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        {AI_TOOLS.map((t) => (
          <button key={t.label} className="flex items-center gap-3 rounded-xl border border-line bg-white p-3 hover:border-violet/30">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet/10 text-violet"><t.icon className="h-4 w-4" /></div>
            <span className="text-[12.5px] font-semibold text-ink">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-4 border-b border-line">
        {TABS.map((t, i) => (
          <button key={t} className={`relative pb-2 text-[13px] font-semibold ${i === 0 ? "text-violet" : "text-ink-muted"}`}>
            {t}
            {i === 0 && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-violet" />}
          </button>
        ))}
      </div>

      {/* Docs table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Status</th>
                <th className="w-16 px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {DOCUMENTS.map((d) => (
                <tr key={d.id} className="border-b border-line last:border-0 hover:bg-bg-soft/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet/10 text-violet"><FileText className="h-4 w-4" /></div>
                      <div className="text-[13px] font-semibold text-ink">{d.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-ink-soft">{d.type}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={d.owner} size={22} />
                      <span className="text-[12px] text-ink-soft">{d.owner.split(" ")[0]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-ink-muted">{d.size}</td>
                  <td className="px-4 py-3 text-[12px] text-ink-muted">{d.updatedAt}</td>
                  <td className="px-4 py-3"><StatusPill tone={PROJECT_STATUS_TONE[d.status]}>{d.status}</StatusPill></td>
                  <td className="px-2 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft"><Download className="h-3.5 w-3.5" /></button>
                      <button className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
