import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, Workflow, CheckCircle2, ClipboardList, DollarSign, Sparkles, Plus, ChevronRight, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { WorkspaceSubnav } from "@/components/amplivanta/workspace-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { WS_CAMPAIGNS, WS_ACTIVITY } from "@/lib/workspace-data";

export const metadata: Metadata = { title: "AI Workspace" };

const STATUS_TONE = { Planning: "gray", "In Progress": "amber", Live: "green", Complete: "blue" } as const;

const workload = [
  { name: "Emily Davis", role: "Content", tasks: 14, load: 91 },
  { name: "Marcus Lee", role: "Design", tasks: 8, load: 62 },
  { name: "Sarah Chen", role: "Reviewer", tasks: 6, load: 48 },
  { name: "Priya Ramesh", role: "Growth", tasks: 11, load: 84 },
];

const snapshot = [
  { label: "Leads", value: "842", delta: "18%" },
  { label: "Revenue Influenced", value: "$342K", delta: "24%" },
  { label: "Conversion Rate", value: "4.2%", delta: "0.6 pts" },
  { label: "AI Credits Used", value: "2,450 / 5,000", delta: "49%" },
];

export default function WorkspaceHomePage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="AI Workspace"
        subtitle="Unified execution overview across projects, automations, approvals, tasks, revenue impact."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink">📅 Last 30 Days</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
              <Plus className="h-3.5 w-3.5" /> New Campaign
            </button>
          </>
        }
      />
      <WorkspaceSubnav />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard icon={FolderKanban} label="Active Projects" value={String(WS_CAMPAIGNS.length)} tone="violet" />
        <KpiCard icon={Workflow} label="Active Automations" value={null} tone="pink" />
        <KpiCard icon={CheckCircle2} label="Pending Approvals" value={null} deltaTone="down" tone="amber" />
        <KpiCard icon={ClipboardList} label="Tasks Due" value={null} tone="blue" />
        <KpiCard icon={DollarSign} label="Revenue Influenced" value={null} tone="green" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent projects */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Recent Projects</div>
            <Link href="/app/workspace/plan" className="text-[12px] font-semibold text-violet">Open plan →</Link>
          </div>
          <div className="space-y-3">
            {WS_CAMPAIGNS.map((c) => (
              <Link key={c.id} href={`/app/workspace/plan#${c.id}`} className="block rounded-xl border border-line p-3 hover:border-violet/30">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-ink">{c.name}</div>
                    <div className="text-[11px] text-ink-muted">{c.timeline} · {c.audience}</div>
                  </div>
                  <StatusPill tone={STATUS_TONE[c.status]}>{c.status}</StatusPill>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                  <div><span className="text-ink-muted">Budget </span><span className="font-bold text-ink">${(c.budget / 1000).toFixed(0)}K</span></div>
                  <div><span className="text-ink-muted">Projected ROI </span><span className="font-bold text-emerald-600">{c.projectedROI}</span></div>
                  <div><span className="text-ink-muted">Progress </span><span className="font-bold text-ink">{c.progress}%</span></div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-soft">
                  <div className="h-full rounded-full bg-grad-brand" style={{ width: `${c.progress}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Snapshot Metrics</div>
            <Link href="/app/workspace/analytics" className="text-[12px] font-semibold text-violet">Details →</Link>
          </div>
          <div className="space-y-3">
            {snapshot.map((s) => (
              <div key={s.label} className="flex items-center justify-between border-b border-line pb-2 last:border-0 last:pb-0">
                <span className="text-[12px] text-ink-soft">{s.label}</span>
                <span className="text-[13px] font-bold text-ink">
                  {s.value}
                  <span className="ml-2 text-[10.5px] font-semibold text-emerald-600">↑ {s.delta}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Cross-Module Activity</div>
            <Link href="/app/workspace/activity" className="text-[12px] font-semibold text-violet">View all →</Link>
          </div>
          <div className="space-y-3">
            {WS_ACTIVITY.slice(0, 6).map((a) => (
              <div key={a.id} className="flex gap-2">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet/10 text-[11px]">
                  {a.category === "AI" ? "✨" : a.category === "Approve" ? "✅" : a.category === "Publish" ? "🚀" : a.category === "Create" ? "📝" : a.category === "Budget" ? "💰" : a.category === "Integration" ? "🔌" : "✏️"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] leading-snug text-ink">
                    <span className="font-semibold">{a.actor}</span> {a.verb} <span className="font-semibold">{a.object}</span>
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-ink-muted">{a.module} · {a.when}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Team Workload</div>
            <Link href="/app/workspace/tasks" className="text-[12px] font-semibold text-violet">Balance →</Link>
          </div>
          <div className="space-y-3">
            {workload.map((w) => (
              <div key={w.name}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <Avatar name={w.name} size={22} />
                    <div>
                      <div className="font-semibold text-ink">{w.name}</div>
                      <div className="text-[10.5px] text-ink-muted">{w.role} · {w.tasks} tasks</div>
                    </div>
                  </div>
                  <span className={`font-bold ${w.load > 85 ? "text-amber-600" : "text-ink"}`}>{w.load}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft">
                  <div className={`h-full rounded-full ${w.load > 85 ? "bg-amber-500" : "bg-grad-brand"}`} style={{ width: `${w.load}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-5">
          <div className="mb-3 flex items-center gap-1.5 text-[14px] font-bold text-ink">
            <Sparkles className="h-4 w-4 text-violet" /> AI Recommendations
          </div>
          <div className="space-y-2">
            {[
              { title: "Reallocate ad spend", body: "Shift $2,400 from Facebook to LinkedIn — projected 18% CPL drop." },
              { title: "Fix Winback dropoff", body: "Step 3 losing 62%. Shorten delay to 24h." },
              { title: "Prioritize 12 PQLs", body: "Score jumped past 80. Route to Sarah Chen." },
            ].map((r, i) => (
              <div key={i} className="rounded-xl border border-line bg-white p-3">
                <div className="text-[12.5px] font-semibold text-ink">{r.title}</div>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{r.body}</p>
                <button className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-violet">Take action <ArrowRight className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
