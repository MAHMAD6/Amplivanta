import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { DataTable, EmptyState, Pill, ScreenHeader, fmtDate, fmtInt, kitField } from "@/components/amplivanta/screen-kit";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { StatusSelect } from "@/components/amplivanta/workspace-ui";
import { createTask } from "@/app/(app)/app/workspace/actions";
import { TASK_PRIORITIES, TASK_STATUSES, label } from "@/lib/workspace/options";
import { memberNames, workspaceContext } from "@/lib/server/workspace-screens";

export const metadata: Metadata = { title: "Tasks" };
export const dynamic = "force-dynamic";

const BASE = "/app/workspace/tasks";
type SP = { view?: string; status?: string; priority?: string; assignee?: string; month?: string };
type Row = { id: string; title: string; status: string; priority: string; dueDate: Date | null; assigneeId: string | null; contactName: string | null };

export default async function TasksPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const view = sp.view === "board" || sp.view === "calendar" ? sp.view : "list";
  const c = await workspaceContext();
  let reachable = Boolean(c);
  let rows: Row[] = [];
  let members: { id: string; name: string }[] = [];
  const counts = { open: 0, in_progress: 0, waiting: 0, done: 0, overdue: 0 };
  if (c) {
    try {
      const w = c.workspaceId;
      const [t, m, grouped, overdue] = await Promise.all([
        db.task.findMany({
          where: { workspaceId: w, ...(sp.status ? { status: sp.status } : {}), ...(sp.priority ? { priority: sp.priority } : {}), ...(sp.assignee ? { assigneeId: sp.assignee } : {}) },
          orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
          take: 300,
          include: { contact: { select: { name: true, email: true } } },
        }),
        memberNames(w),
        db.task.groupBy({ by: ["status"], where: { workspaceId: w }, _count: true }),
        db.task.count({ where: { workspaceId: w, status: { not: "done" }, dueDate: { lt: new Date() } } }),
      ]);
      rows = t.map((x) => ({ id: x.id, title: x.title, status: x.status, priority: x.priority, dueDate: x.dueDate, assigneeId: x.assigneeId, contactName: x.contact?.name ?? x.contact?.email ?? null }));
      members = m;
      for (const g of grouped) if (g.status in counts) counts[g.status as keyof typeof counts] = g._count;
      counts.overdue = overdue;
    } catch {
      reachable = false;
    }
  }
  const has = Object.values(counts).some(Boolean);
  const who = (id: string | null) => members.find((m) => m.id === id)?.name ?? "Unassigned";
  const qs = (patch: Partial<SP>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...patch })) if (v) u.set(k, v);
    const s = u.toString();
    return s ? `${BASE}?${s}` : BASE;
  };
  const create = (cls: string) => (
    <FormDialog
      title="New Task"
      label="+ New Task"
      className={cls}
      action={createTask}
      disabled={!c?.canEdit}
      submitLabel="Create task"
      fields={[
        { name: "title", label: "Task", kind: "text", required: true },
        { name: "description", label: "Details", kind: "textarea", rows: 3 },
        { name: "assigneeId", label: "Assigned to", kind: "select", options: members.map((m) => [m.id, m.name]), placeholder: "Unassigned" },
        { name: "dueDate", label: "Due date", kind: "date" },
        { name: "priority", label: "Priority", kind: "select", options: TASK_PRIORITIES, defaultValue: "medium" },
      ]}
    />
  );
  const statusControl = (r: Row) => <StatusSelect kind="task" id={r.id} value={r.status} options={TASK_STATUSES} canEdit={Boolean(c?.canEdit)} />;
  const overdue = (r: Row) => r.status !== "done" && r.dueDate && r.dueDate.getTime() < Date.now();

  // Calendar month grid (by due date).
  const now = new Date();
  const m = /^(\d{4})-(\d{2})$/.exec(sp.month ?? "");
  const month = m ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1)) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const gridStart = new Date(month.getTime() - month.getUTCDay() * 86400000);
  const cells = Math.ceil((new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate() + month.getUTCDay()) / 7) * 7;
  const ym = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={[["AI Workspace", "/app/workspace"], ["Tasks"]]} title="Tasks" subtitle="Manage execution tasks for the active workspace or campaign." actions={create("inline-flex h-11 items-center rounded-md bg-[#0B5CFF] px-8 text-[15px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50")} />
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-2">
        <nav className="flex gap-10 px-2 text-[15px]">
          {[["list", "All Tasks"], ["board", "Board"], ["calendar", "Calendar"]].map(([k, l]) => (
            <Link key={k} href={qs({ view: k === "list" ? undefined : k })} className={view === k ? "font-semibold text-[#0B5CFF]" : "font-semibold text-deep-navy"}>{l}</Link>
          ))}
        </nav>
        <form method="get" className="flex flex-wrap gap-3">
          {view !== "list" && <input type="hidden" name="view" value={view} />}
          <select name="status" defaultValue={sp.status ?? ""} aria-label="Status" className={cn(kitField, "w-[160px]")}><option value="">All Statuses</option>{TASK_STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <select name="priority" defaultValue={sp.priority ?? ""} aria-label="Priority" className={cn(kitField, "w-[160px]")}><option value="">All Priorities</option>{TASK_PRIORITIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <select name="assignee" defaultValue={sp.assignee ?? ""} aria-label="Assignee" className={cn(kitField, "w-[160px]")}><option value="">Anyone</option>{members.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
          <button type="submit" className="h-10 rounded-md border border-line px-5 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft">Filter</button>
        </form>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {([["Not Started", counts.open], ["In Progress", counts.in_progress], ["Waiting", counts.waiting], ["Completed", counts.done], ["Overdue", counts.overdue]] as [string, number][]).map(([l, v]) => (
          <div key={l} className="rounded-xl border border-line bg-white px-4 py-5">
            <div className="text-[14px] font-semibold text-deep-navy">{l}</div>
            <div className="mt-2 text-[20px] font-bold text-deep-navy">{has ? fmtInt(v) : "—"}</div>
            <div className="mt-1 text-[11.5px] text-ink-muted">{has ? "" : "No task data"}</div>
          </div>
        ))}
      </div>

      <section className="min-h-[560px] rounded-xl border border-line bg-white p-5">
        {rows.length === 0 ? (
          <EmptyState icon={Check} title={reachable ? (has ? "No tasks match these filters" : "No tasks yet") : "Tasks unavailable"} body="Create a task when work is ready to be assigned." action={reachable && !has ? create("inline-flex h-11 items-center rounded-md bg-[#0B5CFF] px-8 text-[15px] font-semibold text-white") : undefined} />
        ) : view === "board" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {TASK_STATUSES.map(([v, l]) => {
              const col = rows.filter((r) => r.status === v);
              return (
                <div key={v} className="rounded-lg bg-bg-soft/60 p-3">
                  <div className="mb-3 flex items-center justify-between text-[13.5px] font-semibold text-deep-navy">{l}<span className="text-ink-muted">{col.length}</span></div>
                  <ul className="space-y-2">
                    {col.map((r) => (
                      <li key={r.id} className="rounded-md border border-line bg-white p-3">
                        <div className="text-[13px] font-semibold text-deep-navy">{r.title}</div>
                        <div className={cn("mt-1 text-[11.5px]", overdue(r) ? "text-red-600" : "text-ink-muted")}>{who(r.assigneeId)} · {r.dueDate ? fmtDate(r.dueDate) : "No due date"}</div>
                        <div className="mt-2">{statusControl(r)}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : view === "calendar" ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <Link href={qs({ month: ym(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() - 1, 1))) })} className="rounded-md border border-line px-3 py-1.5 text-[13px]">Previous</Link>
              <span className="text-[15px] font-semibold text-deep-navy">{new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(month)}</span>
              <Link href={qs({ month: ym(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1))) })} className="rounded-md border border-line px-3 py-1.5 text-[13px]">Next</Link>
            </div>
            <div className="overflow-x-auto">
              <div className="grid min-w-[640px] grid-cols-7">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="border-b border-line py-2 text-center text-[12.5px] font-semibold text-deep-navy">{d}</div>)}
                {Array.from({ length: cells }, (_, i) => {
                  const day = new Date(gridStart.getTime() + i * 86400000);
                  const key = day.toISOString().slice(0, 10);
                  const due = rows.filter((r) => r.dueDate?.toISOString().slice(0, 10) === key);
                  return (
                    <div key={key} className={cn("min-h-[92px] border-b border-r border-line p-1.5", day.getUTCMonth() !== month.getUTCMonth() && "bg-bg-soft/40")}>
                      <div className="text-right text-[11.5px] text-ink-muted">{day.getUTCDate()}</div>
                      {due.slice(0, 3).map((r) => <div key={r.id} className={cn("truncate rounded px-1 py-0.5 text-[11px]", r.status === "done" ? "bg-emerald-50 text-emerald-700 line-through" : "bg-royal-tint/60 text-deep-navy")} title={r.title}>{r.title}</div>)}
                      {due.length > 3 && <div className="text-[11px] text-ink-muted">+{due.length - 3} more</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <DataTable
            minWidth={900}
            columns={["Task", "Related To", "Assigned To", "Due Date", "Priority", "Status"]}
            rows={rows.map((r) => [
              r.title,
              r.contactName ?? "—",
              who(r.assigneeId),
              <span key="d" className={overdue(r) ? "font-semibold text-red-600" : undefined}>{r.dueDate ? fmtDate(r.dueDate) : "—"}</span>,
              <Pill key="p" tone={r.priority === "high" ? "red" : r.priority === "medium" ? "amber" : "gray"}>{label(TASK_PRIORITIES, r.priority)}</Pill>,
              statusControl(r),
            ])}
          />
        )}
      </section>
    </div>
  );
}
