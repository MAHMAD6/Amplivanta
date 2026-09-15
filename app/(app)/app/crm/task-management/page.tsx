import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CrmScreen, crmDate, crmPrimaryBtn, daysAgo } from "@/components/amplivanta/crm-screen";
import { ResourceDialog } from "@/components/amplivanta/crud/resource-dialog";
import { TASK_FIELDS } from "@/components/amplivanta/crm/crm-fields";
import { CREATED_WINDOWS, crmContext, ownerOptions, since } from "@/lib/server/crm-screens";

export const metadata: Metadata = { title: "Task Management" };
export const dynamic = "force-dynamic";

type SP = { q?: string; created?: string; owner?: string; status?: string };

const STATUSES: [string, string][] = [["open", "Todo"], ["in_progress", "In Progress"], ["done", "Done"]];

export default async function TaskManagementPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const ctx = await crmContext();
  let reachable = Boolean(ctx);
  let rows: React.ReactNode[][] = [];
  let total = 0;
  let stats: (string | null)[] = [null, null, null, null];
  let owners: [string, string][] = [];

  if (ctx) {
    try {
      const w = ctx.workspaceId;
      const now = new Date();
      const created = since(sp.created);
      const [tasks, count, open, dueSoon, overdue, done] = await Promise.all([
        db.task.findMany({
          where: {
            workspaceId: w,
            ...(sp.q ? { title: { contains: sp.q, mode: "insensitive" } } : {}),
            ...(sp.owner ? { assigneeId: sp.owner } : {}),
            ...(sp.status ? { status: sp.status } : {}),
            ...(created ? { createdAt: { gte: created } } : {}),
          },
          orderBy: [{ isCompleted: "asc" }, { dueDate: "asc" }],
          take: 50,
          select: {
            id: true, title: true, dueDate: true, status: true, isCompleted: true,
            assignee: { select: { name: true, email: true } },
            contact: { select: { name: true, firstName: true, lastName: true } },
          },
        }),
        db.task.count({ where: { workspaceId: w } }),
        db.task.count({ where: { workspaceId: w, isCompleted: false } }),
        db.task.count({ where: { workspaceId: w, isCompleted: false, dueDate: { gte: now, lte: daysAgo(-7) } } }),
        db.task.count({ where: { workspaceId: w, isCompleted: false, dueDate: { lt: now } } }),
        db.task.count({ where: { workspaceId: w, isCompleted: true } }),
      ]);
      total = count;
      owners = await ownerOptions(w);
      rows = tasks.map((t) => [
        t.title,
        t.contact ? t.contact.name ?? [t.contact.firstName, t.contact.lastName].filter(Boolean).join(" ") : null,
        t.assignee?.name ?? t.assignee?.email ?? null,
        crmDate(t.dueDate),
        t.isCompleted ? "Done" : STATUSES.find(([v]) => v === t.status)?.[1] ?? t.status,
        "—",
      ]);
      const n = (v: number) => (count > 0 ? v.toLocaleString("en-US") : null);
      stats = [n(open), n(dueSoon), n(overdue), n(done)];
    } catch {
      reachable = false;
    }
  }

  const create = (label: string) => (
    <ResourceDialog
      title="New Task"
      description="Add a follow-up task to this workspace."
      fields={TASK_FIELDS}
      endpoint="/api/tasks"
      submitLabel="Create task"
      successMessage="Task created"
      trigger={<button className={crmPrimaryBtn}>{label}</button>}
    />
  );

  return (
    <CrmScreen
      crumb="Task Management"
      title="Task Management"
      subtitle="Organize CRM tasks, due dates, and follow-up work across your workspace."
      primaryAction={create("+ Create Task")}
      stats={[
        { label: "Open Tasks", value: stats[0], hint: "Not yet completed" },
        { label: "Due Soon", value: stats[1], hint: "Due in the next 7 days" },
        { label: "Overdue", value: stats[2], hint: "Past their due date" },
        { label: "Completed", value: stats[3], hint: "All time" },
      ]}
      table={{
        title: "Tasks",
        action: "/app/crm/task-management",
        q: sp.q ?? "",
        selects: [
          { name: "created", label: "Filters", value: sp.created ?? "", options: CREATED_WINDOWS },
          { name: "owner", label: "Owner", value: sp.owner ?? "", options: owners },
          { name: "status", label: "Status", value: sp.status ?? "", options: STATUSES },
        ],
        columns: ["Task", "Related Record", "Owner", "Due Date", "Status", "Actions"],
        rows,
        reachable,
        empty: { title: "No tasks yet", body: "Create a task to organize follow-up work and CRM responsibilities.", action: create("Create Task") },
      }}
      rail={[
        { title: "Task Queues", rows: [["Current", stats[0]], ["Available", total ? total.toLocaleString("en-US") : null]] },
        { title: "Saved Views", rows: [["Records", total ? total.toLocaleString("en-US") : null], ["Status", total ? "Live" : null]] },
      ]}
      insights={{ title: "Task Insights" }}
    />
  );
}
