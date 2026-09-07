import type { Metadata } from "next";
import Link from "next/link";
import { Plus, MoreHorizontal, Zap, Mail, Clock, GitBranch } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { LiveBadge } from "@/components/amplivanta/live-badge";
import { WorkflowRunButton } from "@/components/amplivanta/workflow-run-button";
import { CreateButton } from "@/components/amplivanta/crud/create-button";
import { WORKFLOW_FIELDS } from "@/components/amplivanta/crud/module-fields";
import { loadWorkflows } from "@/lib/server/loaders";

export const metadata: Metadata = { title: "Workflows" };
export const dynamic = "force-dynamic";

const WF_TONE = { Active: "green", Draft: "gray", Paused: "amber" } as const;

export default async function WorkflowsPage() {
  const { items: workflows, live } = await loadWorkflows();
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Workflows"
        subtitle="Visual automation engine for triggers, actions, conditions and delays."
        actions={
          <>
            <Link href="/app/marketing/templates" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink">Templates</Link>
            <CreateButton label="Workflow" fields={WORKFLOW_FIELDS} endpoint="/api/workflows" />
          </>
        }
      />
      <MarketingSubnav />
      {live && <LiveBadge label={`Live · ${workflows.length} workflows from database · Run executes the engine`} />}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Zap} label="Active Workflows" value={String(workflows.filter((w) => w.status === "Active").length)} tone="violet" />
        <KpiCard icon={Mail} label="Enrolled (30d)" value={null} tone="blue" />
        <KpiCard icon={Clock} label="Avg. Completion" value={null} tone="green" />
        <KpiCard icon={GitBranch} label="Steps Executed" value={null} tone="pink" />
      </div>

      {/* Builder sandbox preview */}
      <div className="mb-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[14px] font-bold text-ink">Workflow Builder (Preview)</div>
            <div className="text-[11.5px] text-ink-muted">Drag triggers, actions, waits, branches. Test before publish.</div>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-line px-3 py-1.5 text-[11.5px] font-semibold text-ink-soft">Test Run</button>
            <button className="rounded-lg bg-grad-cta px-3 py-1.5 text-[11.5px] font-bold text-white shadow-violet">Save & Publish</button>
          </div>
        </div>
        <div className="relative overflow-x-auto rounded-xl border border-dashed border-line bg-bg-soft/40 p-6">
          <div className="flex items-center gap-6">
            {[
              { emoji: "⚡", title: "Trigger", sub: "New signup", tone: "bg-violet text-white" },
              { emoji: "⏱️", title: "Wait", sub: "1 hour", tone: "bg-amber-500 text-white" },
              { emoji: "✉️", title: "Send Email", sub: "Welcome 1", tone: "bg-blue-500 text-white" },
              { emoji: "🔀", title: "If/Else", sub: "Opened?", tone: "bg-pink-brand text-white" },
              { emoji: "🏷️", title: "Add Tag", sub: "engaged", tone: "bg-emerald-500 text-white" },
            ].map((node, i, arr) => (
              <div key={i} className="flex items-center">
                <div className="w-40 rounded-xl bg-white p-3 shadow-card">
                  <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-[16px] ${node.tone}`}>{node.emoji}</div>
                  <div className="text-[12px] font-bold text-ink">{node.title}</div>
                  <div className="text-[10.5px] text-ink-muted">{node.sub}</div>
                </div>
                {i < arr.length - 1 && <div className="mx-3 h-0.5 w-8 rounded-full bg-line" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Workflow</th>
              <th className="px-4 py-3">Trigger</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Enrolled</th>
              <th className="px-4 py-3 text-right">Completed</th>
              <th className="px-4 py-3 text-right">CVR</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {workflows.map((w) => (
              <tr key={w.id} className="border-b border-line last:border-0 hover:bg-bg-soft/40">
                <td className="px-4 py-3">
                  <div className="text-[13px] font-semibold text-ink">{w.name}</div>
                  <div className="text-[10.5px] text-ink-muted">{w.channels.join(" · ")} · Updated {w.updatedAt}</div>
                </td>
                <td className="px-4 py-3 text-[12px] text-ink-soft">{w.trigger}</td>
                <td className="px-4 py-3"><StatusPill tone={WF_TONE[w.status]}>{w.status}</StatusPill></td>
                <td className="px-4 py-3 text-right text-[12.5px]">{w.enrolled.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-[12.5px]">{w.completed.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-[12.5px] font-bold text-emerald-600">{w.conversionRate}%</td>
                <td className="px-4 py-3 text-right text-[12.5px] font-bold text-ink">${(w.revenue / 1000).toFixed(0)}K</td>
                <td className="px-2 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <WorkflowRunButton workflowId={w.id} live={live} />
                    <button className="rounded-lg p-1.5 text-ink-muted hover:bg-bg-soft"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
