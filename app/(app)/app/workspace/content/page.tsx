import type { Metadata } from "next";
import { Plus, Search, LayoutGrid, List, Calendar, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { WorkspaceSubnav } from "@/components/amplivanta/workspace-subnav";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { WS_CONTENT } from "@/lib/workspace-data";
import { FileText, Mail, Share2, Video, Image as ImageIcon } from "lucide-react";

export const metadata: Metadata = { title: "Content Hub — AI Workspace" };

const QUICK = [
  { icon: FileText, label: "Blog", tone: "violet" },
  { icon: Share2, label: "Social", tone: "pink" },
  { icon: Mail, label: "Email", tone: "blue" },
  { icon: FileText, label: "Ad Copy", tone: "orange" },
  { icon: Video, label: "Video Script", tone: "green" },
  { icon: ImageIcon, label: "Image", tone: "amber" },
];
const TONE_CLS: Record<string, string> = { violet: "bg-violet/10 text-violet", pink: "bg-pink-brand/10 text-pink-brand", blue: "bg-blue-500/10 text-blue-600", orange: "bg-orange-brand/10 text-orange-brand", green: "bg-emerald-500/10 text-emerald-600", amber: "bg-amber-500/10 text-amber-600" };
const STATUS_TONE = { Draft: "gray", "In Review": "amber", Approved: "green", Published: "blue" } as const;

export default function ContentHubPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Content Hub"
        subtitle="Every piece of campaign content + AI generation, one place."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
            <Plus className="h-3.5 w-3.5" /> New Content
          </button>
        }
      />
      <WorkspaceSubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={FileText} label="Total Content" value={null} tone="violet" />
        <KpiCard icon={Sparkles} label="AI Generated" value={null} tone="pink" />
        <KpiCard icon={Calendar} label="Scheduled" value={null} tone="blue" />
        <KpiCard icon={FileText} label="Published (30d)" value={null} tone="green" />
      </div>

      {/* Quick create */}
      <div className="mb-6 rounded-2xl border border-violet/25 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-5">
        <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-ink"><Sparkles className="h-4 w-4 text-violet" /> Quick Create with AI</div>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {QUICK.map((q) => (
            <button key={q.label} className="flex items-center gap-2 rounded-xl border border-line bg-white p-3 hover:border-violet/30">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${TONE_CLS[q.tone]}`}><q.icon className="h-3.5 w-3.5" /></div>
              <span className="text-[12px] font-semibold text-ink">{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="h-3.5 w-3.5 text-ink-muted" />
          <input placeholder="Search content…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
        </div>
        {["All Types", "All Channels", "All Status", "All Owners"].map((l) => (
          <button key={l} className="inline-flex h-10 items-center rounded-xl border border-line bg-white px-3 text-[12px] font-semibold text-ink-soft">{l}</button>
        ))}
        <div className="flex overflow-hidden rounded-xl border border-line">
          <button className="flex h-10 w-10 items-center justify-center bg-violet/10 text-violet"><List className="h-4 w-4" /></button>
          <button className="flex h-10 w-10 items-center justify-center border-l border-line text-ink-muted"><LayoutGrid className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="px-4 py-3">Content</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Performance</th>
              </tr>
            </thead>
            <tbody>
              {WS_CONTENT.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-bg-soft/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${c.thumb}`} />
                      <div className="text-[13px] font-semibold text-ink">{c.title}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusPill tone="violet">{c.type}</StatusPill></td>
                  <td className="px-4 py-3 text-[12px] text-ink-soft">{c.channel}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2"><Avatar name={c.owner} size={22} /><span className="text-[12px] text-ink-soft">{c.owner.split(" ")[0]}</span></div>
                  </td>
                  <td className="px-4 py-3"><StatusPill tone={STATUS_TONE[c.status]}>{c.status}</StatusPill></td>
                  <td className="px-4 py-3 text-right text-[12px] font-bold text-emerald-600">{c.performance || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
