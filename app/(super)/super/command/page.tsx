import type { Metadata } from "next";
import { Search, Filter, Check, Clock, X, User, MoreHorizontal, AlertTriangle } from "lucide-react";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { CMD_ALERTS, CMD_SEV_TONE } from "@/lib/super-data";

export const metadata: Metadata = { title: "Command Center — Super Admin" };

const CATS = ["All", "Billing", "Trials", "Churn", "Quota", "Deliverability", "Integrations", "Approvals", "Security", "Support"];
const STATUS_TONE = { Open: "red", Acknowledged: "amber", Snoozed: "gray", Resolved: "green" } as const;

export default function CommandCenterPage() {
  const grouped = { critical: [] as typeof CMD_ALERTS, high: [] as typeof CMD_ALERTS, medium: [] as typeof CMD_ALERTS, low: [] as typeof CMD_ALERTS };
  for (const a of CMD_ALERTS) (grouped as any)[a.severity].push(a);

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold text-ink">Command Center</h1>
          <p className="mt-1 text-sm text-ink-soft">Prioritized platform issues requiring Super Admin attention.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Filter className="h-3.5 w-3.5" />Filters</button>
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-red-500 px-4 text-[13px] font-bold text-white shadow">Acknowledge All Critical</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(grouped) as (keyof typeof grouped)[]).map((sev) => {
          const tone = { critical: "bg-red-500/10 text-red-700 border-red-200", high: "bg-pink-brand/10 text-pink-brand border-pink-brand/30", medium: "bg-amber-500/10 text-amber-700 border-amber-200", low: "bg-ink/10 text-ink-soft border-line" }[sev];
          return (
            <div key={sev} className={`rounded-2xl border p-4 ${tone}`}>
              <div className="text-[10.5px] font-bold uppercase tracking-wider">{sev}</div>
              <div className="mt-1 text-2xl font-extrabold">{grouped[sev].length}</div>
              <div className="text-[11px] opacity-80">alerts</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="h-3.5 w-3.5 text-ink-muted" />
          <input placeholder="Search alerts by org, category, title…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
        </div>
        {CATS.map((c, i) => (
          <button key={c} className={`rounded-full border px-3 py-1.5 text-[11.5px] font-semibold ${i === 0 ? "border-red-300 bg-red-50 text-red-700" : "border-line bg-white text-ink-soft"}`}>{c}</button>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-card">
        <div className="border-b border-line p-4"><div className="text-[14px] font-bold text-ink">All Alerts ({CMD_ALERTS.length})</div></div>
        <div className="divide-y divide-line">
          {CMD_ALERTS.map((a) => (
            <div key={a.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_140px_160px_180px]">
              <div>
                <div className="mb-1 flex items-center gap-1.5">
                  <StatusPill tone={CMD_SEV_TONE[a.severity]}>{a.severity}</StatusPill>
                  <span className="text-[10.5px] font-bold text-ink-muted">{a.category}</span>
                  <StatusPill tone={STATUS_TONE[a.status]}>{a.status}</StatusPill>
                </div>
                <div className="text-[13.5px] font-bold text-ink">{a.title}</div>
                <div className="mt-0.5 text-[12px] text-ink-soft">{a.detail}</div>
                <div className="mt-1 text-[11px] text-ink-muted">Org: <span className="font-semibold text-ink">{a.org}</span> · {a.age}</div>
              </div>
              <div className="flex items-center">
                {a.assignee ? (
                  <div className="flex items-center gap-2 text-[11.5px]"><Avatar name={a.assignee} size={22} /><span className="text-ink-soft">{a.assignee.split(" ")[0]}</span></div>
                ) : (
                  <button className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-[11px] font-semibold text-ink-soft"><User className="h-3 w-3" />Assign</button>
                )}
              </div>
              <div className="flex items-center gap-1">
                {a.status === "Open" && <button className="rounded-lg border border-line bg-white px-2 py-1 text-[11px] font-bold text-ink"><Check className="mr-1 inline h-3 w-3" />Ack</button>}
                <button className="rounded-lg border border-line bg-white px-2 py-1 text-[11px] font-semibold text-ink-soft"><Clock className="mr-1 inline h-3 w-3" />Snooze</button>
                <button className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600"><X className="mr-1 inline h-3 w-3" />Escalate</button>
              </div>
              <div className="flex items-center justify-end gap-1">
                <button className="rounded-lg bg-grad-cta px-3 py-1 text-[11px] font-bold text-white shadow-violet">Open record →</button>
                <button className="rounded-lg p-1 text-ink-muted"><MoreHorizontal className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50/30 p-4 text-[12px]">
        <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-600" /><span className="font-bold text-red-700">Governance</span></div>
        <div className="mt-1 text-ink-soft">Alert counts match source queues in real time. Every acknowledge, snooze, escalate, and open-record action is audit-logged with the Super Admin identity, target org, and prior state.</div>
      </div>
    </div>
  );
}
