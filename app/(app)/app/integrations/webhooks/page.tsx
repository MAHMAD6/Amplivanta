import type { Metadata } from "next";
import { Plus, MoreHorizontal, Copy, Play, Pause, RotateCw } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { IntegrationsSubnav } from "@/components/amplivanta/integrations-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { WEBHOOKS, WEBHOOK_TONE, WEBHOOK_EVENTS } from "@/lib/integrations-data";
import { Webhook as WHIcon, Activity, AlertTriangle, Clock } from "lucide-react";
import { CreateButton } from "@/components/amplivanta/crud/create-button";
import { WEBHOOK_FIELDS } from "@/components/amplivanta/crud/module-fields";

export const metadata: Metadata = { title: "Webhooks" };

export default function WebhooksPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Webhooks"
        subtitle="Outbound webhook endpoints — create, monitor, troubleshoot."
        actions={
          <CreateButton
            label="Webhook"
            buttonText="New Endpoint"
            title="New Webhook Endpoint"
            fields={WEBHOOK_FIELDS}
            endpoint="/api/webhooks"
            arrayFields={["events"]}
          />
        }
      />
      <IntegrationsSubnav />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={WHIcon} label="Active Endpoints" value={String(WEBHOOKS.filter((w) => w.status === "Active").length)} tone="violet" />
        <KpiCard icon={Activity} label="Deliveries (24h)" value={null} tone="green" />
        <KpiCard icon={AlertTriangle} label="Failing" value={String(WEBHOOKS.filter((w) => w.status === "Failing").length)} deltaTone="down" tone="red" />
        <KpiCard icon={Clock} label="Avg. Latency" value={null} tone="blue" />
      </div>

      <div className="space-y-3">
        {WEBHOOKS.map((w) => (
          <div key={w.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet/10 text-violet"><WHIcon className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-bold text-ink">{w.url}</span>
                  <button className="text-ink-muted"><Copy className="h-3.5 w-3.5" /></button>
                </div>
                <div className="text-[11px] text-ink-muted">Created by {w.createdBy}</div>
              </div>
              <StatusPill tone={WEBHOOK_TONE[w.status]}>{w.status}</StatusPill>
            </div>
            <div className="mb-3 flex flex-wrap gap-1">
              {w.events.map((e) => <span key={e} className="rounded-md bg-violet/10 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-violet">{e}</span>)}
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-line pt-3 text-[11px]">
              <div><span className="text-ink-muted">Last delivery: </span><span className="font-bold text-ink">{w.lastDelivery}</span></div>
              <div><span className="text-ink-muted">Success rate: </span><span className={`font-bold ${w.successRate >= 99 ? "text-emerald-600" : w.successRate >= 90 ? "text-amber-600" : "text-red-600"}`}>{w.successRate}%</span></div>
              <div className="flex justify-end gap-1">
                {w.status === "Failing" && <button className="rounded-lg bg-amber-500 px-2 py-1 text-[10.5px] font-bold text-white"><RotateCw className="mr-1 inline h-3 w-3" />Retry</button>}
                <button className="rounded-lg border border-line px-2 py-1 text-[10.5px] font-semibold text-ink">{w.status === "Paused" ? <Play className="mr-1 inline h-3 w-3" /> : <Pause className="mr-1 inline h-3 w-3" />}{w.status === "Paused" ? "Resume" : "Pause"}</button>
                <button className="rounded-lg p-1 text-ink-muted"><MoreHorizontal className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 text-[14px] font-bold text-ink">Available Events</div>
        <div className="flex flex-wrap gap-1.5">
          {WEBHOOK_EVENTS.map((e) => <span key={e} className="rounded-md bg-bg-soft px-2 py-1 font-mono text-[10.5px] text-ink-soft">{e}</span>)}
        </div>
      </div>
    </div>
  );
}
