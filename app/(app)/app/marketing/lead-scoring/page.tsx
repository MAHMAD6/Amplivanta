import type { Metadata } from "next";
import { Plus, RefreshCw, Download, TrendingUp, Target, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { SCORING_RULES } from "@/lib/marketing-auto-data";

export const metadata: Metadata = { title: "Lead Scoring" };

const TIERS = [
  { name: "Hot", range: "80+", count: 128, cvr: 42, tone: "bg-red-500" },
  { name: "Warm", range: "50–79", count: 842, cvr: 18, tone: "bg-orange-brand" },
  { name: "Cold", range: "25–49", count: 2480, cvr: 6, tone: "bg-blue-500" },
  { name: "Ice", range: "0–24", count: 12480, cvr: 1, tone: "bg-ink/50" },
];

export default function LeadScoringPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Lead Scoring"
        subtitle="Measure buyer intent, prioritize sales-ready leads, optimize scoring rules."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><RefreshCw className="h-3.5 w-3.5" /> Recalculate</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Download className="h-3.5 w-3.5" /> Export</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Plus className="h-3.5 w-3.5" /> Create Rule</button>
          </>
        }
      />
      <MarketingSubnav />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Target} label="Hot Leads (80+)" value={null} tone="pink" />
        <KpiCard icon={TrendingUp} label="Avg. Score" value={null} tone="violet" />
        <KpiCard icon={RefreshCw} label="Last Recalc" value={null} tone="blue" />
        <KpiCard icon={Sparkles} label="AI Suggestions" value={null} tone="teal" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {TIERS.map((t) => (
          <div key={t.name} className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-bold text-ink">{t.name}</div>
              <span className={`h-2 w-2 rounded-full ${t.tone}`} />
            </div>
            <div className="text-[10.5px] text-ink-muted">Score {t.range}</div>
            <div className="mt-2 text-2xl font-extrabold text-ink">{t.count.toLocaleString()}</div>
            <div className="text-[11px] font-bold text-emerald-600">CVR {t.cvr}%</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-card">
        <div className="border-b border-line p-4">
          <div className="text-[14px] font-bold text-ink">Scoring Rules</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="px-4 py-3">Rule</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Trigger</th>
                <th className="px-4 py-3 text-right">Points</th>
                <th className="px-4 py-3 text-right">Triggered</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {SCORING_RULES.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-[13px] font-semibold text-ink">{r.name}</td>
                  <td className="px-4 py-3"><StatusPill tone={r.type === "Positive" ? "green" : r.type === "Negative" ? "red" : "amber"}>{r.type}</StatusPill></td>
                  <td className="px-4 py-3 font-mono text-[11px] text-ink-muted">{r.trigger}</td>
                  <td className={`px-4 py-3 text-right text-[13px] font-bold ${r.points > 0 ? "text-emerald-600" : "text-red-600"}`}>{r.points > 0 ? "+" : ""}{r.points}</td>
                  <td className="px-4 py-3 text-right text-[12.5px]">{r.triggeredCount.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusPill tone={r.status === "Active" ? "green" : "amber"}>{r.status}</StatusPill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
