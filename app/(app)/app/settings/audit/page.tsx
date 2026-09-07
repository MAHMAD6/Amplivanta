import type { Metadata } from "next";
import { Search, Filter, Download } from "lucide-react";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { SEVERITY_TONE } from "@/lib/settings-data";
import { LiveBadge } from "@/components/amplivanta/live-badge";
import { loadAuditEvents } from "@/lib/server/loaders";

export const metadata: Metadata = { title: "Audit Log" };
export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const { items: auditEvents, live } = await loadAuditEvents();
  return (
    <div className="space-y-5">
      {live && <LiveBadge label={`Live · ${auditEvents.length} audit events from database`} />}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="h-3.5 w-3.5 text-ink-muted" />
          <input placeholder="Search actor, action, target…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
        </div>
        {["All Severity", "All Users", "Last 30 days"].map((l) => (
          <button key={l} className="inline-flex h-10 items-center rounded-xl border border-line bg-white px-3 text-[12px] font-semibold text-ink-soft">{l}</button>
        ))}
        <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-[12px] font-semibold text-ink"><Filter className="h-3.5 w-3.5" />More</button>
        <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Download className="h-3.5 w-3.5" />Export</button>
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-card">
        <div className="border-b border-line p-4"><div className="text-[14px] font-bold text-ink">Recent Events</div></div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/40 text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {auditEvents.map((e, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2"><Avatar name={e.actor} size={22} /><span className="text-[12.5px] font-semibold text-ink">{e.actor}</span></div>
                </td>
                <td className="px-4 py-3 text-[12.5px] text-ink"><span className="text-ink-soft">{e.action}</span> <span className="font-semibold">{e.target}</span></td>
                <td className="px-4 py-3"><StatusPill tone={SEVERITY_TONE[e.severity as keyof typeof SEVERITY_TONE]}>{e.severity}</StatusPill></td>
                <td className="px-4 py-3 font-mono text-[11px] text-ink-muted">{e.ip}</td>
                <td className="px-4 py-3 text-[11.5px] text-ink-muted">{e.when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-violet/25 bg-gradient-to-br from-violet/[0.04] to-orange-brand/[0.04] p-4 text-[12px] text-ink-soft">
        <span className="font-bold text-ink">Audit records are immutable.</span> Retention: 1 year (Growth), 7 years (Enterprise). Export includes JSON + CSV formats with full payload.
      </div>
    </div>
  );
}
