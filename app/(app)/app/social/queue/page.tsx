import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, Search, Send, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable, EmptyState, InfoList, Panel, fmtDateTime, kitField, kitOutline, kitPrimary } from "@/components/amplivanta/screen-kit";
import { QueueItemActions, StatusBadge } from "@/components/amplivanta/social-ui";
import { excerpt, loadPosts, socialContext } from "@/lib/server/social-screens";
import { SOCIAL_PLATFORMS, platformLabel } from "@/lib/social/platforms";

export const metadata: Metadata = { title: "Publishing Queue" };
export const dynamic = "force-dynamic";

type SP = { q?: string; status?: string; platform?: string; when?: string };
const QUEUED = ["scheduled", "approved", "failed"];

export default async function QueuePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = await socialContext();
  let reachable = Boolean(c);
  let items: Awaited<ReturnType<typeof loadPosts>> = [];
  const horizon = sp.when === "today" ? 1 : sp.when === "week" ? 7 : sp.when === "month" ? 30 : null;
  if (c) {
    try {
      items = await loadPosts(c.workspaceId, {
        status: sp.status && QUEUED.includes(sp.status) ? sp.status : { in: QUEUED },
        ...(sp.platform ? { platforms: { has: sp.platform } } : {}),
        ...(sp.q ? { content: { contains: sp.q, mode: "insensitive" } } : {}),
        ...(horizon ? { scheduledAt: { lte: new Date(Date.now() + horizon * 86400000) } } : {}),
      });
    } catch {
      reachable = false;
    }
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[30px] font-bold text-deep-navy">Publishing Queue</h1>
      <p className="mb-4 mt-1 text-[14.5px] text-ink-soft">Manage scheduled publishing jobs, retries, and queue behavior across your social workflow.</p>
      <div className="mb-5 flex gap-3">
        <Link href="/app/social/settings" className={cn(kitOutline, "border-[#0B5CFF] text-[#0B5CFF]")}><Settings className="h-4 w-4" /> Queue Settings</Link>
        <Link href="/app/social/queue" className={kitOutline}><RefreshCw className="h-4 w-4" /> Refresh Queue</Link>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_600px]">
        <div className="min-w-0 space-y-5">
          <form method="get" className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white px-5 py-4">
            <label className="relative w-full max-w-[280px]">
              <span className="sr-only">Search queue</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input name="q" defaultValue={sp.q ?? ""} placeholder="Search queue..." className={cn(kitField, "pl-9")} />
            </label>
            <select name="status" defaultValue={sp.status ?? ""} aria-label="Status" className={cn(kitField, "w-[180px]")}>
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="approved">Approved</option>
              <option value="failed">Failed</option>
            </select>
            <select name="platform" defaultValue={sp.platform ?? ""} aria-label="Destination" className={cn(kitField, "w-[180px]")}>
              <option value="">All Destinations</option>
              {SOCIAL_PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <select name="when" defaultValue={sp.when ?? ""} aria-label="Schedule" className={cn(kitField, "w-[170px]")}>
              <option value="">All Schedules</option>
              <option value="today">Next 24 hours</option>
              <option value="week">Next 7 days</option>
              <option value="month">Next 30 days</option>
            </select>
            <button type="submit" className="h-10 rounded-md border border-line px-4 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft">Apply</button>
          </form>

          <Panel title="Scheduled Items">
            <DataTable
              columns={["Content", "Destinations", "Scheduled For", "Status", "Actions"]}
              rows={items.map((p) => [excerpt(p.content, 60), p.platforms.map(platformLabel).join(", ") || "—", fmtDateTime(p.scheduledAt), <StatusBadge key="s" status={p.status} />, <QueueItemActions key="a" postId={p.id} />])}
              empty={
                <EmptyState
                  icon={Send}
                  title={reachable ? "No items in queue" : "Queue unavailable"}
                  body={reachable ? "You're all caught up! There are no scheduled items waiting to be published. Schedule new content from the Calendar to get started." : "Queue items could not be loaded right now."}
                  action={reachable ? <Link href="/app/social/calendar" className={kitPrimary}>Go to Calendar</Link> : undefined}
                />
              }
            />
          </Panel>

          <Panel title="Retry & Failure Handling">
            <InfoList
              rows={[
                { title: "Retry policy", body: "Retry behavior follows the queue settings and connected platform capabilities." },
                { title: "Manual review", body: "Failed items can be unscheduled and reviewed; failure details are kept when a publishing attempt fails." },
                { title: "Rescheduling", body: "Unschedule an item to return it to drafts, then schedule it again from the composer." },
              ]}
            />
          </Panel>
        </div>

        <aside className="space-y-5">
          <Panel title="Queue Overview">
            <InfoList
              rows={[
                { title: "Queue behavior", body: items.length ? `${items.length} item${items.length === 1 ? "" : "s"} in the current view, ordered by schedule time.` : "Scheduled items appear according to your publishing configuration." },
                { title: "Pause & resume", body: "Queue controls are available when supported by the configured workflow." },
                { title: "Queue status", body: "Statuses and diagnostics appear when queue activity becomes available." },
              ]}
            />
          </Panel>
          <Panel title="Operational Notes">
            <InfoList
              rows={[
                { title: "Failure handling", body: "Available actions depend on the item state and connected publishing destination." },
                { title: "Diagnostics", body: "Error details are retained when a publishing attempt fails." },
                { title: "Queue settings", body: "Approval and scheduling defaults are defined in Social Publishing Settings.", href: "/app/social/settings" },
              ]}
            />
          </Panel>
        </aside>
      </div>
    </div>
  );
}
