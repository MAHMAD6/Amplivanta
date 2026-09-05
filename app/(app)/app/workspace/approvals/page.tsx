import type { Metadata } from "next";
import { Check, X, MessageSquare, Clock } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { WorkspaceSubnav } from "@/components/amplivanta/workspace-subnav";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { WS_APPROVALS } from "@/lib/workspace-data";

export const metadata: Metadata = { title: "Workspace Approvals — Amplivanta" };

const STATE_TONE = { Pending: "amber", Approved: "green", "Changes Requested": "blue", Rejected: "red" } as const;

export default function WSApprovalsPage() {
  const groups = { Pending: [] as typeof WS_APPROVALS, Approved: [] as typeof WS_APPROVALS, "Changes Requested": [] as typeof WS_APPROVALS, Rejected: [] as typeof WS_APPROVALS };
  for (const a of WS_APPROVALS) (groups as any)[a.status].push(a);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Approvals"
        subtitle="Cross-module review and approval before assets go live."
      />
      <WorkspaceSubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Clock} label="Pending" value={String(groups.Pending.length)} deltaTone="down" tone="amber" />
        <KpiCard icon={Check} label="Approved (7d)" value={String(groups.Approved.length)} tone="green" />
        <KpiCard icon={MessageSquare} label="Changes Requested" value={String(groups["Changes Requested"].length)} tone="blue" />
        <KpiCard icon={X} label="Rejected" value={String(groups.Rejected.length)} tone="red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {(Object.keys(groups) as (keyof typeof groups)[]).map((s) => (
          <div key={s} className="rounded-2xl border border-line bg-bg-soft/40 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <StatusPill tone={STATE_TONE[s]}>{s}</StatusPill>
              <span className="text-[11px] font-bold text-ink">{groups[s].length}</span>
            </div>
            <div className="space-y-2">
              {groups[s].map((a) => (
                <div key={a.id} className="rounded-xl border border-line bg-white p-3 shadow-card">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10.5px] font-semibold text-ink-muted">{a.itemType}</span>
                    <StatusPill tone={a.priority === "High" ? "red" : a.priority === "Medium" ? "amber" : "gray"}>{a.priority}</StatusPill>
                  </div>
                  <div className="text-[12.5px] font-semibold text-ink">{a.item}</div>
                  <div className="mt-2 flex items-center gap-2 border-t border-line pt-2 text-[11px] text-ink-muted">
                    <Avatar name={a.requester} size={18} />
                    <span>{a.requester.split(" ")[0]}</span>
                    <span className="ml-auto">{a.submittedAt}</span>
                  </div>
                  {s === "Pending" && (
                    <div className="mt-2 flex gap-1.5">
                      <button className="flex-1 rounded-lg bg-emerald-500 py-1.5 text-[11px] font-bold text-white"><Check className="mx-auto h-3.5 w-3.5" /></button>
                      <button className="flex-1 rounded-lg border border-line py-1.5 text-[11px] font-bold text-ink"><MessageSquare className="mx-auto h-3.5 w-3.5" /></button>
                      <button className="flex-1 rounded-lg border border-red-200 bg-red-50 py-1.5 text-[11px] font-bold text-red-600"><X className="mx-auto h-3.5 w-3.5" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
