import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, BarChart3, CalendarDays, ClipboardList, Clock, Plug, Send, SquarePen, UserPlus, Users } from "lucide-react";
import { EmptyState, KeyList, Panel, QuickActions, ScreenHeader, StatGrid, figure, fmtDateTime, kitOutline, kitPrimary } from "@/components/amplivanta/screen-kit";
import { StatusBadge } from "@/components/amplivanta/social-ui";
import { ACTIVITY_LABELS, excerpt, loadPosts, socialAudit, socialConnections, socialContext, socialCounts } from "@/lib/server/social-screens";
import { platformLabel } from "@/lib/social/platforms";

export const metadata: Metadata = { title: "Social Publishing" };
export const dynamic = "force-dynamic";

const TOOLS: [string, string][] = [
  ["Publishing Queue", "/app/social/queue"],
  ["Approvals", "/app/social/approvals"],
  ["Hashtags & Mentions", "/app/social/hashtags"],
  ["Content Templates", "/app/social/templates"],
  ["Social Accounts", "/app/social/accounts"],
  ["Integrations", "/app/social/integrations"],
  ["Team & Roles", "/app/social/team"],
  ["Activity Log", "/app/social/activity"],
  ["Platform Settings", "/app/social/platform-settings"],
  ["Settings", "/app/social/settings"],
];

export default async function SocialDashboardPage() {
  const c = await socialContext();
  let data = null as null | {
    counts: Awaited<ReturnType<typeof socialCounts>>;
    connections: number;
    upcoming: Awaited<ReturnType<typeof loadPosts>>;
    activity: Awaited<ReturnType<typeof socialAudit>>;
  };
  if (c) {
    try {
      const [counts, connections, upcoming, activity] = await Promise.all([
        socialCounts(c.workspaceId),
        socialConnections(c.workspaceId),
        loadPosts(c.workspaceId, { status: "scheduled", scheduledAt: { gte: new Date() } }, 5),
        socialAudit(c.workspaceId, { take: 6 }),
      ]);
      data = { counts, connections: connections.length, upcoming, activity };
    } catch {
      data = null;
    }
  }
  const counts = data?.counts;

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader title="Social Publishing Dashboard" subtitle="Operational overview of social publishing performance and workload." />
      <StatGrid
        stats={[
          { label: "Connected Accounts", icon: Users, value: figure(data?.connections) },
          { label: "Scheduled Posts", icon: CalendarDays, value: figure(counts?.scheduled) },
          { label: "Approval Items", icon: ClipboardList, value: figure(counts?.pending) },
          { label: "Publishing Queue", icon: Send, value: figure(counts ? counts.scheduled + counts.approved : 0) },
        ]}
      />

      {!data?.connections && (
        <section className="mb-5 flex flex-wrap items-center gap-6 rounded-xl border border-line bg-white p-6">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><AlertTriangle className="h-9 w-9" /></span>
          <div className="flex-1">
            <h2 className="text-[18px] font-semibold text-deep-navy">No social accounts connected yet</h2>
            <p className="mt-1 text-[14px] text-ink-soft">Connect your social accounts to start publishing, schedule content, and track performance.</p>
            <Link href="/app/social/accounts" className={`${kitPrimary} mt-3`}>Connect Account</Link>
          </div>
        </section>
      )}

      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
        <Panel title="Quick Actions">
          <QuickActions
            actions={[
              { label: "Compose Post", icon: SquarePen, href: "/app/social/compose" },
              { label: "Open Calendar", icon: CalendarDays, href: "/app/social/calendar" },
              { label: "Review Approvals", icon: ClipboardList, href: "/app/social/approvals" },
              { label: "Connect Account", icon: UserPlus, href: "/app/social/accounts" },
            ]}
          />
        </Panel>
        <Panel title="Upcoming Posts">
          {data?.upcoming.length ? (
            <ul className="divide-y divide-line">
              {data.upcoming.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-semibold text-deep-navy">{excerpt(p.content, 90)}</div>
                    <div className="text-[12px] text-ink-muted">{p.platforms.map(platformLabel).join(", ") || "No platform"} · {fmtDateTime(p.scheduledAt)}</div>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={CalendarDays} compact title="No upcoming posts" body="Schedule content from the calendar or compose a new post to get started." action={<Link href="/app/social/calendar" className={kitOutline}>Open Calendar</Link>} />
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Platform Performance">
          <EmptyState icon={BarChart3} compact title="No performance data yet" body="Connect your social accounts and start publishing to see performance insights here." />
        </Panel>
        <Panel title="Recent Activity">
          {data?.activity.length ? (
            <ul className="divide-y divide-line">
              {data.activity.map((a) => (
                <li key={a.id} className="py-2.5 text-[13px]">
                  <div className="font-semibold text-deep-navy">{ACTIVITY_LABELS[a.action] ?? a.action}</div>
                  <div className="text-[12px] text-ink-muted">{a.actor} · {fmtDateTime(a.createdAt)}</div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Clock} compact title="No recent activity" body="Publishing activity, approvals, and account updates will appear here." />
          )}
        </Panel>
        <Panel title="Approval Overview">
          {counts && counts.pending + counts.changes + counts.rejected > 0 ? (
            <>
              <KeyList rows={[["Pending", counts.pending], ["Changes requested", counts.changes], ["Rejected", counts.rejected]]} />
              <Link href="/app/social/approvals" className={`${kitOutline} mt-3`}>Review Approvals</Link>
            </>
          ) : (
            <EmptyState icon={ClipboardList} compact title="No items to review" body="Content awaiting approval will appear here." action={<Link href="/app/social/approvals" className={kitOutline}>Review Approvals</Link>} />
          )}
        </Panel>
      </div>

      <nav aria-label="Publishing tools" className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white px-5 py-3 text-[13px]">
        <span className="mr-2 flex items-center gap-1.5 font-semibold text-deep-navy"><Plug className="h-4 w-4" /> Publishing tools</span>
        {TOOLS.map(([label, href]) => (
          <Link key={href} href={href} className="rounded-full border border-line px-3 py-1 text-ink-soft hover:border-[#0B5CFF]/40 hover:text-[#0B5CFF]">{label}</Link>
        ))}
      </nav>
    </div>
  );
}
