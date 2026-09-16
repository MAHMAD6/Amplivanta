import type { Metadata } from "next";
import { Diamond, History, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { EmptyState, InfoList, ScreenHeader, fmtDateTime, fmtInt, kitField } from "@/components/amplivanta/screen-kit";
import { MODULES, actionLabel, memberNames, moduleOf, workspaceContext } from "@/lib/server/workspace-screens";

export const metadata: Metadata = { title: "Activity / History" };
export const dynamic = "force-dynamic";

type SP = { q?: string; module?: string; user?: string; range?: string };

export default async function ActivityHistoryPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await workspaceContext();
  let reachable = Boolean(c);
  let events: { id: string; action: string; actor: string; at: Date; resourceType: string | null }[] = [];
  let members: { id: string; name: string }[] = [];
  let totals = { activity: 0, contributors: 0, exports: 0 };
  const days = [1, 7, 30, 90].includes(Number(sp.range)) ? Number(sp.range) : null;
  if (c) {
    try {
      const w = c.workspaceId;
      const where = {
        workspaceId: w,
        ...(sp.user ? { actorUserId: sp.user } : {}),
        ...(days ? { createdAt: { gte: new Date(Date.now() - days * 86400000) } } : {}),
        ...(sp.module ? { action: { startsWith: sp.module } } : {}),
        ...(sp.q ? { OR: [{ action: { contains: sp.q, mode: "insensitive" as const } }, { resourceType: { contains: sp.q, mode: "insensitive" as const } }] } : {}),
      };
      const [rows, count, actors, exportsCount, m] = await Promise.all([
        db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: 150, include: { user: { select: { name: true, email: true } } } }),
        db.auditLog.count({ where }),
        db.auditLog.groupBy({ by: ["actorUserId"], where: { ...where, actorUserId: { not: null } } }),
        db.auditLog.count({ where: { workspaceId: w, action: { in: ["audit.exported", "report.exported"] } } }),
        memberNames(w),
      ]);
      events = rows.map((r) => ({ id: r.id, action: r.action, actor: r.user?.name || r.user?.email || "System", at: r.createdAt, resourceType: r.resourceType }));
      totals = { activity: count, contributors: actors.length, exports: exportsCount };
      members = m;
    } catch {
      reachable = false;
    }
  }
  const qs = new URLSearchParams(Object.entries({ q: sp.q, user: sp.user, range: sp.range }).filter(([, v]) => v) as [string, string][]).toString();
  const filtered = Boolean(sp.q || sp.module || sp.user || sp.range);

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={[["AI Workspace", "/app/workspace"], ["Activity / History"]]} title="Activity / History" subtitle="Review a chronological history of actions across your workspace." />
      <form method="get" className="mb-5 flex flex-wrap items-center gap-3">
        <label className="relative w-full max-w-[510px] flex-1">
          <span className="sr-only">Search activity</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search activity..." className={cn(kitField, "h-11 pl-9")} />
        </label>
        <select name="module" defaultValue={sp.module ?? ""} aria-label="Module" className={cn(kitField, "h-11 w-[210px]")}><option value="">All Modules</option>{MODULES.map(([p, l]) => <option key={p} value={p}>{l}</option>)}</select>
        <select name="user" defaultValue={sp.user ?? ""} aria-label="User" className={cn(kitField, "h-11 w-[210px]")}><option value="">All Users</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
        <select name="range" defaultValue={sp.range ?? ""} aria-label="Date range" className={cn(kitField, "h-11 w-[170px]")}><option value="">Date Range</option><option value="1">Last 24 hours</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select>
        <button type="submit" className="h-11 rounded-md border border-line px-5 text-[13.5px] font-semibold text-deep-navy hover:bg-bg-soft">Apply</button>
        {c?.isAdmin && events.length > 0 ? (
          <a href={`/api/audit-logs/export${qs ? `?${qs}` : ""}`} className="ml-auto inline-flex h-11 items-center rounded-md border border-line bg-white px-8 text-[15px] font-semibold text-deep-navy hover:bg-bg-soft">Export</a>
        ) : (
          <span className="ml-auto inline-flex h-11 items-center rounded-md border border-line bg-bg-soft px-8 text-[15px] text-ink-muted" title={c?.isAdmin ? "Export becomes available when activity exists" : "Only admins can export"}>Export</span>
        )}
      </form>
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3 xl:w-2/3">
        {([["Activity", totals.activity], ["Contributors", totals.contributors], ["Exports", totals.exports]] as [string, number][]).map(([l, v]) => (
          <div key={l} className="flex gap-4 rounded-xl border border-line bg-white px-5 py-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Diamond className="h-5 w-5" /></span>
            <div><div className="text-[14px] font-semibold text-deep-navy">{l}</div><div className="mt-2 text-[20px] font-bold text-deep-navy">{v ? fmtInt(v) : "—"}</div><div className="text-[12px] text-ink-muted">{v ? "" : "Not available yet"}</div></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_1fr]">
        <section className="min-h-[600px] rounded-xl border border-line bg-white p-5">
          <h2 className="mb-4 text-[16px] font-semibold text-deep-navy">Activity Timeline</h2>
          {events.length ? (
            <ol className="relative space-y-4 border-l border-line pl-5">
              {events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white bg-[#0B5CFF]" />
                  <div className="text-[13.5px] font-semibold capitalize text-deep-navy">{moduleOf(e.action)} · {actionLabel(e.action)}</div>
                  <div className="text-[12px] text-ink-muted">{e.actor} · {fmtDateTime(e.at)}{e.resourceType ? ` · ${e.resourceType}` : ""}</div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState icon={History} title={!reachable ? "Activity unavailable" : filtered ? "No activity matches these filters" : "No activity recorded yet"} body="Workspace actions will appear here after activity occurs." />
          )}
        </section>
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[16px] font-semibold text-deep-navy">About Activity History</h2>
          <InfoList
            rows={[
              { title: "Tracked actions", body: "Creation, edits, approvals, publishing, automation, integration, settings and AI events that write to the audit trail." },
              { title: "Filters", body: "Filter by user, module, keyword, and date." },
              { title: "Audit safety", body: "Sensitive credentials and private values are never recorded in plaintext." },
              { title: "Export", body: "Admins can export the filtered history as CSV." },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
