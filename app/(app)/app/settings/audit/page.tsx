import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { SettingsHeader } from "@/components/amplivanta/settings-header";
import { DataTable, EmptyState, fmtDateTime, kitField } from "@/components/amplivanta/screen-kit";
import { settingsContext } from "@/lib/server/settings-screens";
import { AUDIT_CATEGORIES, auditWhere, type AuditFilters } from "@/lib/audit-filters";

export const metadata: Metadata = { title: "Audit Log" };
export const dynamic = "force-dynamic";

const describe = (m: unknown) => {
  if (!m || typeof m !== "object") return "—";
  const entries = Object.entries(m as Record<string, unknown>).filter(([, v]) => v != null && typeof v !== "object").slice(0, 3);
  return entries.length ? entries.map(([k, v]) => `${k}: ${String(v).slice(0, 40)}`).join(" · ") : "—";
};

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<AuditFilters> }) {
  const sp = await searchParams;
  const c = await settingsContext();
  let reachable = Boolean(c?.isAdmin);
  let rows: { id: string; createdAt: Date; actor: string; action: string; target: string; ip: string; details: string }[] = [];
  let users: { id: string; name: string }[] = [];
  let workspaceName = "—";
  if (c?.isAdmin) {
    try {
      const [logs, members, ws] = await Promise.all([
        db.auditLog.findMany({ where: auditWhere(c.workspaceId, sp), orderBy: { createdAt: "desc" }, take: 200, include: { user: { select: { name: true, email: true } } } }),
        db.membership.findMany({ where: { workspaceId: c.workspaceId }, include: { user: { select: { id: true, name: true, email: true } } } }),
        db.workspace.findUnique({ where: { id: c.workspaceId }, select: { name: true } }),
      ]);
      rows = logs.map((l) => ({
        id: l.id,
        createdAt: l.createdAt,
        actor: l.user?.name || l.user?.email || "System",
        action: l.action,
        target: [l.resourceType, l.resourceId?.slice(-8)].filter(Boolean).join(" · ") || "—",
        ip: l.ipAddress ?? "—",
        details: describe(l.metadata),
      }));
      users = members.map((m) => ({ id: m.user.id, name: m.user.name || m.user.email }));
      workspaceName = ws?.name ?? "—";
    } catch {
      reachable = false;
    }
  }
  const qs = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <>
      <SettingsHeader title="Audit Log" subtitle="Review administrative and security-sensitive workspace activity." />
      <form method="get" className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white px-5 py-2.5">
        <label className="relative w-full max-w-[520px] flex-1">
          <span className="sr-only">Search audit events</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search audit events..." className={cn(kitField, "pl-9")} />
        </label>
        <select name="category" defaultValue={sp.category ?? ""} aria-label="Category" className={cn(kitField, "w-[180px]")}>
          <option value="">All Categories</option>
          {Object.entries(AUDIT_CATEGORIES).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
        </select>
        <select name="user" defaultValue={sp.user ?? ""} aria-label="User" className={cn(kitField, "w-[180px]")}>
          <option value="">All Users</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select name="range" defaultValue={sp.range ?? ""} aria-label="Date range" className={cn(kitField, "w-[180px]")}>
          <option value="">Date Range</option>
          <option value="1">Last 24 hours</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
        <button type="submit" className="h-10 rounded-md border border-line px-4 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft">Apply</button>
        {rows.length > 0 ? (
          <a href={`/api/audit-logs/export${qs ? `?${qs}` : ""}`} className="ml-auto inline-flex h-11 items-center rounded-md border border-line px-14 text-[14px] font-semibold text-deep-navy hover:bg-bg-soft">Export</a>
        ) : (
          <span className="ml-auto inline-flex h-11 items-center rounded-md border border-line bg-bg-soft px-14 text-[14px] font-semibold text-ink-muted">Export</span>
        )}
      </form>

      <section className="rounded-xl border border-line bg-white p-5">
        <DataTable
          minWidth={1100}
          columns={["Time", "Actor", "Action", "Target", "Workspace", "IP / Device", "Details"]}
          rows={rows.map((r) => [fmtDateTime(r.createdAt), r.actor, <code key="a" className="text-[12px] text-deep-navy">{r.action}</code>, r.target, workspaceName, r.ip, r.details])}
          empty={
            <EmptyState
              icon={ClipboardList}
              title={!c?.isAdmin ? "Admins only" : reachable ? "No audit events yet" : "Audit log unavailable"}
              body={!c?.isAdmin ? "Only workspace admins can review the audit log." : "Administrative and security-sensitive events will appear here after they occur."}
              action={Object.keys(sp).length ? <Link href="/app/settings/audit" className="text-[13px] font-semibold text-[#0B5CFF]">Clear filters</Link> : undefined}
            />
          }
        />
        <div className="mt-8 rounded-lg border border-line bg-bg-soft/40 px-5 py-5 text-[13px] text-ink-soft">
          Audit history is an append-only administrative record. Administrators cannot edit audit events, and exports preserve the active filters and timestamps.
        </div>
      </section>
    </>
  );
}
