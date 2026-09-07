import type { Metadata } from "next";
import { Plus, Filter, ClipboardList, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { CrmSubnav } from "@/components/amplivanta/crm-subnav";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { type TaskStatus } from "@/lib/crm-data";
import { LiveBadge } from "@/components/amplivanta/live-badge";
import { ResourceDialog } from "@/components/amplivanta/crud/resource-dialog";
import { DeleteAction } from "@/components/amplivanta/crud/delete-action";
import { TaskToggle } from "@/components/amplivanta/crm/task-toggle";
import { TASK_FIELDS } from "@/components/amplivanta/crm/crm-fields";
import { Trash2 } from "lucide-react";
import { loadCrmTasks } from "@/lib/server/loaders";

const COLUMN_STATUS: Record<string, string> = { Todo: "open", "In Progress": "in_progress", Done: "done" };

export const metadata: Metadata = { title: "CRM Tasks" };
export const dynamic = "force-dynamic";

const COLUMNS: TaskStatus[] = ["Todo", "In Progress", "Done"];
const STATUS_TONE = { Todo: "gray", "In Progress": "amber", Done: "green" } as const;

export default async function CrmTasksPage() {
  const { items: crmTasks, live } = await loadCrmTasks();
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Tasks"
        subtitle="Manage CRM follow-ups and sales tasks with owners, due dates, priorities and related records."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30">
              <Filter className="h-3.5 w-3.5" /> Filters
            </button>
            <ResourceDialog
              title="New Task"
              description="Add a follow-up or sales task."
              fields={TASK_FIELDS}
              endpoint="/api/tasks"
              submitLabel="Create task"
              successMessage="Task created"
              trigger={
                <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
                  <Plus className="h-3.5 w-3.5" /> New Task
                </button>
              }
            />
          </>
        }
      />
      <CrmSubnav />
      {live && <LiveBadge label={`Live · ${crmTasks.length} tasks from database`} />}

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={ClipboardList} label="Total Tasks" value={null} tone="violet" />
        <KpiCard icon={Clock} label="Due This Week" value={null} tone="amber" />
        <KpiCard icon={AlertTriangle} label="Overdue" value={null} deltaTone="down" tone="pink" />
        <KpiCard icon={CheckCircle2} label="Completed" value={null} tone="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const tasks = crmTasks.filter((t) => t.status === col);
          return (
            <div key={col} className="rounded-2xl border border-line bg-bg-soft/40 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <StatusPill tone={STATUS_TONE[col]}>{col}</StatusPill>
                  <span className="text-[11px] font-bold text-ink">{tasks.length}</span>
                </div>
                <ResourceDialog
                  title="New Task"
                  description={`Add a task to ${col}.`}
                  fields={TASK_FIELDS}
                  endpoint="/api/tasks"
                  method="POST"
                  submitLabel="Create task"
                  successMessage="Task created"
                  initial={{ status: COLUMN_STATUS[col] }}
                  trigger={
                    <button className="rounded-lg p-1 text-ink-muted hover:bg-white"><Plus className="h-3.5 w-3.5" /></button>
                  }
                />
              </div>
              <div className="space-y-2">
                {tasks.map((t) => (
                  <div key={t.id} className="group rounded-xl border border-line bg-white p-3 shadow-card">
                    <div className="flex items-start gap-2">
                      <TaskToggle id={t.id} done={t.status === "Done"} live={live} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-[13px] font-semibold text-ink">{t.title}</div>
                          {live && (
                            <DeleteAction
                              endpoint={`/api/tasks/${t.id}`}
                              label="task"
                              name={t.title}
                              successMessage="Task deleted"
                              trigger={
                                <button className="shrink-0 rounded-lg p-1 text-ink-muted opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100" aria-label="Delete task"><Trash2 className="h-3.5 w-3.5" /></button>
                              }
                            />
                          )}
                        </div>
                        <div className="mt-1 text-[11px] text-ink-muted">{t.related}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Avatar name={t.owner} size={18} />
                            <span className="text-[11px] text-ink-soft">{t.owner.split(" ")[0]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusPill tone={t.priority === "High" ? "red" : t.priority === "Medium" ? "amber" : "gray"}>
                              {t.priority}
                            </StatusPill>
                            <span className="text-[10.5px] text-ink-muted">{t.dueDate.split(",")[0]}</span>
                          </div>
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
