import type { Metadata } from "next";
import { Check, X, MessageSquare, Sparkles, Clock } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { SocialSubnav } from "@/components/amplivanta/social-subnav";
import { PlatformIcon } from "@/components/amplivanta/platform-badge";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { APPROVALS, PLATFORM_META } from "@/lib/social-data";

export const metadata: Metadata = { title: "Approvals — Amplivanta" };

const STATE_TONE = { Pending: "amber", Approved: "green", "Changes Requested": "blue", Rejected: "red" } as const;

export default function ApprovalsPage() {
  const byStatus: Record<string, typeof APPROVALS> = { Pending: [], Approved: [], "Changes Requested": [], Rejected: [] };
  for (const a of APPROVALS) byStatus[a.status].push(a);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Approvals"
        subtitle="Governance for content requiring review before publication."
      />
      <SocialSubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Clock} label="Pending Review" value={String(byStatus.Pending.length)} delta="1 overdue" deltaTone="down" tone="amber" />
        <KpiCard icon={Check} label="Approved (7d)" value={String(byStatus.Approved.length)} delta="94% SLA" tone="green" />
        <KpiCard icon={MessageSquare} label="Changes Requested" value={String(byStatus["Changes Requested"].length)} tone="blue" />
        <KpiCard icon={X} label="Rejected" value={String(byStatus.Rejected.length)} tone="red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {(Object.keys(byStatus) as (keyof typeof byStatus)[]).map((s) => (
          <div key={s} className="rounded-2xl border border-line bg-bg-soft/40 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <StatusPill tone={STATE_TONE[s as keyof typeof STATE_TONE]}>{s}</StatusPill>
              <span className="text-[11px] font-bold text-ink">{byStatus[s].length}</span>
            </div>
            <div className="space-y-2">
              {byStatus[s].map((a) => (
                <div key={a.id} className="rounded-xl border border-line bg-white p-3 shadow-card">
                  <div className="mb-2 flex items-center gap-2">
                    <PlatformIcon platform={a.platform} size={20} />
                    <span className="text-[11.5px] text-ink-muted">{PLATFORM_META[a.platform].label}</span>
                    <StatusPill tone={a.priority === "High" ? "red" : a.priority === "Medium" ? "amber" : "gray"} className="ml-auto">
                      {a.priority}
                    </StatusPill>
                  </div>
                  <div className="text-[12.5px] font-semibold text-ink">{a.content}</div>
                  <div className="mt-2 flex items-center gap-2 border-t border-line pt-2 text-[11px] text-ink-muted">
                    <Avatar name={a.submitter} size={18} />
                    <span>{a.submitter}</span>
                    <span className="ml-auto">Due {a.dueBy}</span>
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
