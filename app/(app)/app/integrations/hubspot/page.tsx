import type { Metadata } from "next";
import { CheckCircle2, Circle, Play, RotateCw, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { IntegrationsSubnav } from "@/components/amplivanta/integrations-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { HUBSPOT_SETUP_STEPS, HUBSPOT_FIELD_MAP } from "@/lib/integrations-data";

export const metadata: Metadata = { title: "HubSpot Setup" };

export default function HubspotSetupPage() {
  const doneCount = HUBSPOT_SETUP_STEPS.filter((s) => s.done).length;
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="HubSpot Integration Setup"
        subtitle="Connect and configure HubSpot as your CRM source of truth."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Play className="h-3.5 w-3.5" /> Test Sync</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">Activate</button>
          </>
        }
      />
      <IntegrationsSubnav />

      <div className="mb-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[14px] font-bold text-ink">Setup Progress</div>
          <span className="text-[11.5px] text-ink-muted">{doneCount} / {HUBSPOT_SETUP_STEPS.length} steps complete</span>
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-bg-soft"><div className="h-full rounded-full bg-grad-brand" style={{ width: `${(doneCount / HUBSPOT_SETUP_STEPS.length) * 100}%` }} /></div>
        <div className="space-y-3">
          {HUBSPOT_SETUP_STEPS.map((s, i) => (
            <div key={s.title} className="flex items-start gap-3 rounded-xl border border-line p-3">
              {s.done ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" />}
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-ink">Step {i + 1}: {s.title}</div>
                <div className="text-[11.5px] text-ink-soft">{s.body}</div>
              </div>
              {!s.done && <button className="rounded-lg bg-grad-cta px-3 py-1.5 text-[11.5px] font-bold text-white shadow-violet">Continue</button>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Field Mapping</div>
            <button className="text-[11.5px] font-semibold text-violet">+ Add mapping</button>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="pb-2">Amplivanta</th>
                <th className="pb-2"></th>
                <th className="pb-2">HubSpot</th>
                <th className="pb-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {HUBSPOT_FIELD_MAP.map((m) => (
                <tr key={m.source} className="border-b border-line last:border-0">
                  <td className="py-2.5 font-mono text-[11.5px] text-ink">{m.source}</td>
                  <td className="py-2.5 text-center text-[14px] text-violet">{m.direction}</td>
                  <td className="py-2.5 font-mono text-[11.5px] text-ink">{m.target}</td>
                  <td className="py-2.5"><StatusPill tone="gray">{m.type}</StatusPill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[13px] font-bold text-ink">Sync Configuration</div>
            <div className="space-y-2 text-[12px]">
              <Row label="Direction" value="Bidirectional" />
              <Row label="Master of record" value="HubSpot" />
              <Row label="Real-time on writes" value="On" />
              <Row label="Reconciliation" value="Hourly" />
              <Row label="Conflict strategy" value="Newer wins" />
              <Row label="Backfill on activate" value="Enabled" />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-2 text-[13px] font-bold text-ink">Recent Errors</div>
            <div className="text-[11.5px] text-ink-soft">No recent sync errors. Last successful sync 2 min ago.</div>
            <button className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-violet"><RotateCw className="h-3 w-3" /> Force sync now</button>
          </div>

          <div className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-5">
            <div className="mb-1 flex items-center gap-1.5 text-[12.5px] font-bold text-ink"><Sparkles className="h-3.5 w-3.5 text-violet" /> AI Setup Tips</div>
            <ul className="space-y-1 text-[11.5px] text-ink-soft">
              <li>· Enable idempotency keys on webhooks to avoid double-writes.</li>
              <li>· Map lifecycle stages explicitly — HubSpot enums vary.</li>
              <li>· Run dry-run against 10 records before activating.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line pb-1.5 last:border-0">
      <span className="text-ink-muted">{label}</span>
      <span className="font-bold text-ink">{value}</span>
    </div>
  );
}
