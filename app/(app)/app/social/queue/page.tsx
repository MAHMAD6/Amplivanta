import type { Metadata } from "next";
import { Pause, Play, RotateCw, AlertTriangle, ArrowUpDown, MoreHorizontal, ListChecks, Timer, Zap, XCircle } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { SocialSubnav } from "@/components/amplivanta/social-subnav";
import { PlatformIcon } from "@/components/amplivanta/platform-badge";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { QUEUE, PLATFORM_META } from "@/lib/social-data";

export const metadata: Metadata = { title: "Publishing Queue" };

const STATUS_TONE_LOCAL = { Queued: "blue", Publishing: "violet", Retrying: "amber", Failed: "red", Paused: "gray" } as const;

export default function QueuePage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Publishing Queue"
        subtitle="Operational control of content waiting to publish."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Pause className="h-3.5 w-3.5" /> Pause All</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Play className="h-3.5 w-3.5" /> Publish Next</button>
          </>
        }
      />
      <SocialSubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={ListChecks} label="Queued" value={String(QUEUE.filter((q) => q.status === "Queued").length)} tone="blue" />
        <KpiCard icon={Zap} label="Publishing Now" value={String(QUEUE.filter((q) => q.status === "Publishing").length)} tone="violet" />
        <KpiCard icon={AlertTriangle} label="Failed" value={String(QUEUE.filter((q) => q.status === "Failed").length)} deltaTone="down" delta="Retry available" tone="pink" />
        <KpiCard icon={Timer} label="Avg. Wait" value={null} tone="green" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Post</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Scheduled</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Attempts</th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {QUEUE.map((q, i) => (
              <tr key={q.id} className="border-b border-line last:border-0 hover:bg-bg-soft/40">
                <td className="px-4 py-3 text-[13px] font-bold text-ink">{i + 1}</td>
                <td className="px-4 py-3 text-[13px] text-ink">{q.content}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <PlatformIcon platform={q.platform} size={20} />
                    <span className="text-[12px]">{PLATFORM_META[q.platform].label}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-ink-muted">{q.scheduledFor}</td>
                <td className="px-4 py-3"><StatusPill tone={STATUS_TONE_LOCAL[q.status]}>{q.status}</StatusPill></td>
                <td className="px-4 py-3 text-[12px] text-ink-soft">{q.attempts} / 3</td>
                <td className="px-2 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    {q.status === "Failed" && <button className="rounded-lg bg-amber-500 p-1.5 text-white"><RotateCw className="h-3 w-3" /></button>}
                    <button className="rounded-lg p-1.5 text-ink-muted hover:bg-bg-soft"><ArrowUpDown className="h-3 w-3" /></button>
                    <button className="rounded-lg p-1.5 text-ink-muted hover:bg-bg-soft"><MoreHorizontal className="h-3 w-3" /></button>
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
