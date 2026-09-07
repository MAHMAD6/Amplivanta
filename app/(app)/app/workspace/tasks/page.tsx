import type { Metadata } from "next";
import { Plus, Filter, Sparkles, Calendar, ListChecks, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { WorkspaceSubnav } from "@/components/amplivanta/workspace-subnav";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { WS_TASKS } from "@/lib/workspace-data";

export const metadata: Metadata = { title: "Workspace Tasks" };

const STATUS_TONE = { Todo: "gray", "In Progress": "amber", Done: "green" } as const;
const COLS = ["Todo", "In Progress", "Done"] as const;

export default function WSTasksPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Tasks"
        subtitle="Execution task management for each workspace / campaign."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Filter className="h-3.5 w-3.5" /> Filters</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-violet/30 bg-violet/5 px-4 text-[13px] font-bold text-violet"><Sparkles className="h-3.5 w-3.5" /> AI Suggest Tasks</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Plus className="h-3.5 w-3.5" /> New Task</button>
          </>
        }
      />
      <WorkspaceSubnav />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={ListChecks} label="Total Tasks" value={String(WS_TASKS.length)} tone="violet" />
        <KpiCard icon={Clock} label="Due This Week" value={null} tone="blue" />
        <KpiCard icon={AlertTriangle} label="Overdue" value={null} deltaTone="down" tone="pink" />
        <KpiCard icon={CheckCircle2} label="Completed" value={null} tone="green" />
      </div>

      <div className="mb-3 flex gap-1">
        {["Board", "List", "Calendar"].map((v, i) => (
          <button key={v} className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-semibold ${i === 0 ? "bg-violet/10 text-violet" : "text-ink-soft hover:bg-bg-soft"}`}>
            {v === "Calendar" && <Calendar className="h-3.5 w-3.5" />} {v}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLS.map((col) => {
          const tasks = WS_TASKS.filter((t) => t.status === col);
          return (
            <div key={col} className="rounded-2xl border border-line bg-bg-soft/40 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2"><StatusPill tone={STATUS_TONE[col]}>{col}</StatusPill><span className="text-[11px] font-bold text-ink">{tasks.length}</span></div>
                <button className="rounded-lg p-1 text-ink-muted hover:bg-white"><Plus className="h-3.5 w-3.5" /></button>
              </div>
              <div className="space-y-2">
                {tasks.map((t) => (
                  <div key={t.id} className="rounded-xl border border-line bg-white p-3 shadow-card">
                    <div className="flex items-start gap-2">
                      <input type="checkbox" defaultChecked={t.status === "Done"} className="mt-0.5 h-4 w-4 rounded border-line accent-violet" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-ink">{t.title}</div>
                        <div className="mt-1 text-[10.5px] text-ink-muted">{t.category} · Due {t.dueDate}</div>
                        {t.progress > 0 && t.progress < 100 && (
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-soft">
                            <div className="h-full rounded-full bg-grad-brand" style={{ width: `${t.progress}%` }} />
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1.5"><Avatar name={t.assignee} size={18} /><span className="text-[11px] text-ink-soft">{t.assignee.split(" ")[0]}</span></div>
                          <StatusPill tone={t.priority === "High" ? "red" : t.priority === "Medium" ? "amber" : "gray"}>{t.priority}</StatusPill>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
