import type { Metadata } from "next";
import { Plus, Upload, Search, Users, TrendingUp, Zap, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { SEGMENTS } from "@/lib/marketing-auto-data";
import { CreateButton } from "@/components/amplivanta/crud/create-button";
import { SEGMENT_FIELDS } from "@/components/amplivanta/crud/module-fields";

export const metadata: Metadata = { title: "Segments & Audiences — Amplivanta" };

export default function SegmentsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Segments & Audiences"
        subtitle="Organize contacts into reusable dynamic and static segments."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Upload className="h-3.5 w-3.5" /> Import Audience</button>
            <CreateButton label="Segment" buttonText="Create Segment" fields={SEGMENT_FIELDS} endpoint="/api/segments" />
          </>
        }
      />
      <MarketingSubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Users} label="Total Contacts" value={null} tone="violet" />
        <KpiCard icon={TrendingUp} label="Segments" value={String(SEGMENTS.length)} tone="pink" />
        <KpiCard icon={Zap} label="Auto-refreshing" value={String(SEGMENTS.filter((s) => s.type === "Dynamic").length)} tone="blue" />
        <KpiCard icon={Sparkles} label="AI Suggestions" value={null} tone="teal" />
      </div>

      <div className="mb-4 flex h-10 max-w-md items-center gap-2 rounded-xl border border-line bg-white px-3">
        <Search className="h-3.5 w-3.5 text-ink-muted" />
        <input placeholder="Search segments…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Segment</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Size</th>
              <th className="px-4 py-3 text-right">Growth</th>
              <th className="px-4 py-3 text-right">Automations</th>
              <th className="px-4 py-3">Rules</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {SEGMENTS.map((s) => (
              <tr key={s.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-[13px] font-semibold text-ink">{s.name}</td>
                <td className="px-4 py-3"><StatusPill tone={s.type === "Dynamic" ? "violet" : "gray"}>{s.type}</StatusPill></td>
                <td className="px-4 py-3 text-right text-[13px] font-bold text-ink">{s.size.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[12px] font-bold ${s.growth > 0 ? "text-emerald-600" : s.growth < 0 ? "text-red-600" : "text-ink-muted"}`}>
                    {s.growth > 0 ? "↑" : s.growth < 0 ? "↓" : "·"} {Math.abs(s.growth)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-[12.5px]">{s.automations}</td>
                <td className="px-4 py-3 font-mono text-[10.5px] text-ink-muted">{s.rules}</td>
                <td className="px-4 py-3 text-[11.5px] text-ink-muted">{s.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
