import type { Metadata } from "next";
import { Plus, Filter, Target, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { StrategySubnav } from "@/components/amplivanta/strategy-subnav";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { GOALS, GOAL_STATUS_TONE } from "@/lib/strategy-data";
import { CreateButton } from "@/components/amplivanta/crud/create-button";
import { GOAL_FIELDS } from "@/components/amplivanta/crud/module-fields";

export const metadata: Metadata = { title: "Marketing Goals — Amplivanta" };

export default function GoalsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Marketing Goals"
        subtitle="Measurable objectives connected to campaigns, channels, budgets."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Filter className="h-3.5 w-3.5" /> Filters</button>
            <CreateButton label="Goal" fields={GOAL_FIELDS} endpoint="/api/goals" />
          </>
        }
      />
      <StrategySubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Target} label="Total Goals" value={String(GOALS.length)} tone="violet" />
        <KpiCard icon={TrendingUp} label="On Track" value={String(GOALS.filter((g) => g.status === "On Track").length)} tone="green" />
        <KpiCard icon={AlertTriangle} label="At Risk" value={String(GOALS.filter((g) => g.status === "At Risk").length)} deltaTone="down" tone="amber" />
        <KpiCard icon={CheckCircle2} label="Achieved" value={String(GOALS.filter((g) => g.status === "Achieved").length)} tone="blue" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {GOALS.map((g) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          return (
            <div key={g.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="text-[14px] font-bold text-ink">{g.name}</div>
                  <div className="text-[11.5px] text-ink-muted">Metric: {g.metric} · Due {g.dueDate}</div>
                </div>
                <StatusPill tone={GOAL_STATUS_TONE[g.status]}>{g.status}</StatusPill>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="text-2xl font-extrabold text-ink">{g.unit === "$" ? "$" : ""}{g.current.toLocaleString()}{g.unit && g.unit !== "$" ? g.unit : ""}</div>
                <div className="text-[11.5px] text-ink-muted">/ target {g.unit === "$" ? "$" : ""}{g.target.toLocaleString()}{g.unit && g.unit !== "$" ? g.unit : ""}</div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-soft">
                  <div className="h-full rounded-full bg-grad-brand" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[12px] font-bold text-ink">{pct}%</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[11.5px]">
                <div className="flex items-center gap-2">
                  <Avatar name={g.owner} size={22} />
                  <span className="font-semibold text-ink">{g.owner}</span>
                </div>
                <div>Baseline <span className="font-bold text-ink">{g.unit === "$" ? "$" : ""}{g.baseline.toLocaleString()}{g.unit && g.unit !== "$" ? g.unit : ""}</span> · <span className="font-bold text-violet">{g.campaigns} campaigns</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
