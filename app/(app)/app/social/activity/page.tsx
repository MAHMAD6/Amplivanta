import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock, CloudUpload, Info, ListChecks, Search, Send, Settings, ShieldCheck, Upload, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable, EmptyState, fmtDateTime, kitField } from "@/components/amplivanta/screen-kit";
import { db } from "@/lib/db";
import { ACTIVITY_LABELS, socialAudit, socialContext } from "@/lib/server/social-screens";

export const metadata: Metadata = { title: "Activity Log" };
export const dynamic = "force-dynamic";

type SP = { q?: string; type?: string; range?: string; actor?: string };
const TYPES: Record<string, string[]> = {
  publish: ["social.post.created", "social.post.scheduled", "social.post.unscheduled", "social.post.reused", "social.post.deleted", "social.post.archived"],
  approval: ["social.post.submitted", "social.post.approved", "social.post.changes_requested", "social.post.rejected"],
  settings: ["settings.updated"],
};

export default async function ActivityLogPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await socialContext();
  let reachable = Boolean(c);
  let events: Awaited<ReturnType<typeof socialAudit>> = [];
  let actors: { id: string; name: string }[] = [];
  const days = sp.range === "7" ? 7 : sp.range === "30" ? 30 : sp.range === "90" ? 90 : null;
  if (c) {
    try {
      const [ev, members] = await Promise.all([
        socialAudit(c.workspaceId, {
          actions: sp.type && TYPES[sp.type] ? TYPES[sp.type] : undefined,
          since: days ? new Date(Date.now() - days * 86400000) : null,
          actorUserId: sp.actor || undefined,
          take: 200,
        }),
        db.membership.findMany({ where: { workspaceId: c.workspaceId }, include: { user: { select: { id: true, name: true, email: true } } }, take: 100 }),
      ]);
      const q = sp.q?.toLowerCase();
      events = q ? ev.filter((e) => `${ACTIVITY_LABELS[e.action] ?? e.action} ${e.actor}`.toLowerCase().includes(q)) : ev;
      actors = members.map((m) => ({ id: m.user.id, name: m.user.name || m.user.email }));
    } catch {
      reachable = false;
    }
  }
  const filtered = Boolean(sp.q || sp.type || sp.range || sp.actor);

  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[30px] font-bold text-deep-navy">Activity Log</h1>
      <p className="mb-5 mt-1 text-[14.5px] text-ink-soft">Review an auditable history of publishing, approvals, edits, and settings activity.</p>

      <form method="get" className="mb-5 grid grid-cols-1 items-end gap-4 rounded-xl border border-line bg-white px-6 py-5 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_0.9fr_0.9fr_auto]">
        <label>
          <span className="mb-1.5 block text-[13.5px] font-semibold text-deep-navy">Search</span>
          <span className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" /><input name="q" defaultValue={sp.q ?? ""} placeholder="Search events..." className={cn(kitField, "h-11 pl-9")} /></span>
        </label>
        <label>
          <span className="mb-1.5 block text-[13.5px] font-semibold text-deep-navy">Event Type</span>
          <select name="type" defaultValue={sp.type ?? ""} className={cn(kitField, "h-11")}><option value="">All Event Types</option><option value="publish">Publish events</option><option value="approval">Approval actions</option><option value="settings">Settings changes</option></select>
        </label>
        <label>
          <span className="mb-1.5 flex items-center gap-1.5 text-[13.5px] font-semibold text-deep-navy"><CalendarDays className="h-4 w-4" /> Date Range</span>
          <select name="range" defaultValue={sp.range ?? ""} className={cn(kitField, "h-11")}><option value="">All Time</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select>
        </label>
        <label>
          <span className="mb-1.5 flex items-center gap-1.5 text-[13.5px] font-semibold text-deep-navy"><User className="h-4 w-4" /> Actor</span>
          <select name="actor" defaultValue={sp.actor ?? ""} className={cn(kitField, "h-11")}><option value="">All Actors</option>{actors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="h-11 rounded-md bg-[#0B5CFF] px-4 text-[13px] font-semibold text-white">Apply</button>
          <Link href="/app/social/activity" className="flex h-11 items-center rounded-md border border-line px-4 text-[13px] text-ink-soft">Reset Filters</Link>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_520px]">
        <section className="min-h-[560px] min-w-0 rounded-xl border border-line bg-white p-6">
          <h2 className="mb-4 text-[17px] font-semibold text-deep-navy">Recent Activity</h2>
          <DataTable
            columns={["Event", "Actor", "Details", "When"]}
            rows={events.map((e) => [
              ACTIVITY_LABELS[e.action] ?? e.action,
              e.actor,
              typeof e.metadata.note === "string" && e.metadata.note ? `“${e.metadata.note}”` : typeof e.metadata.scope === "string" ? e.metadata.scope : Array.isArray(e.metadata.platforms) ? (e.metadata.platforms as string[]).join(", ") : "—",
              fmtDateTime(e.createdAt),
            ])}
            empty={<EmptyState icon={ListChecks} title={!reachable ? "Activity unavailable" : filtered ? "No activity matches these filters" : "No activity recorded yet"} body={reachable ? "Activity related to publishing, approvals, edits, and settings changes will appear here." : "The activity log could not be loaded right now."} />}
          />
        </section>

        <aside className="space-y-5">
          <section className="rounded-xl border border-line bg-white p-5">
            <h2 className="mb-2 flex items-center gap-3 text-[16px] font-semibold text-deep-navy"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Info className="h-5 w-5" /></span> About Activity Log</h2>
            <p className="mb-3 pl-14 text-[13px] text-ink-soft">The activity log helps you track and review key actions across Social Publishing.</p>
            <ul className="divide-y divide-line">
              {([
                [Send, "Publish Events", "Track when posts are created, scheduled, reused, unscheduled, or deleted."],
                [ShieldCheck, "Approval Actions", "Review approval requests, approvals, rejections, and requested changes."],
                [Settings, "Settings Changes", "See changes made to publishing settings and preferences."],
                [Clock, "Retention", "Activity is retained according to your workspace retention policy."],
              ] as const).map(([Icon, title, body]) => (
                <li key={title} className="flex gap-4 py-3">
                  <Icon className="h-5 w-5 shrink-0 text-[#3B3FD8]" />
                  <div><div className="text-[14px] font-semibold text-deep-navy">{title}</div><div className="text-[12.5px] text-ink-soft">{body}</div></div>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-line bg-white p-5">
            <h2 className="mb-3 flex items-center gap-3 text-[16px] font-semibold text-deep-navy"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><CloudUpload className="h-5 w-5" /></span> Export &amp; Retention</h2>
            <ul className="divide-y divide-line pl-14 text-[13px] text-ink-soft">
              <li className="flex gap-2 py-2"><Upload className="h-4 w-4 shrink-0" /> Export options are available from the workspace audit log.</li>
              <li className="flex gap-2 py-2"><Settings className="h-4 w-4 shrink-0" /> Retention settings can be managed in workspace settings.</li>
            </ul>
            <div className="mt-3 flex gap-3 pl-14">
              <Link href="/app/settings/audit" className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft"><Upload className="h-4 w-4" /> Export</Link>
              <Link href="/app/settings/data" className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft"><Settings className="h-4 w-4" /> View Retention</Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
