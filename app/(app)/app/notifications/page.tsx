import type { Metadata } from "next";
import Link from "next/link";
import { Bell, ServerCrash } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, ScreenHeader, TabBar, kitOutline } from "@/components/amplivanta/screen-kit";
import { NotificationList, NotificationToolbar, type NotificationRow } from "@/components/amplivanta/notification-ui";
import { NOTIFICATION_TABS, SEVERITIES, visibleWhere } from "@/lib/notifications";
import { workspaceContext } from "@/lib/server/workspace-screens";

export const metadata: Metadata = { title: "Notification Center" };
export const dynamic = "force-dynamic";

const BASE = "/app/notifications";
const PAGE = 50;

const BEHAVIOR: [string, string][] = [
  ["Unread badge", "Bell badge reflects the actual unread count when notifications exist."],
  ["Read state", "Mark read or unread only affects your own notification state."],
  ["Deep links", "Actionable alerts open the affected record when you have permission."],
  ["Workspace boundaries", "Notification visibility follows workspace and role permissions."],
  ["Preferences", "Channel and category preferences are configured under Notification Settings."],
];

function ago(d: Date) {
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} d ago`;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d);
}

type SP = { category?: string; severity?: string; page?: string };

export default async function NotificationCenterPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const category = NOTIFICATION_TABS.some(([k]) => k === sp.category) ? sp.category : undefined;
  const severity = SEVERITIES.some(([k]) => k === sp.severity) ? sp.severity : undefined;
  const take = PAGE * Math.min(Math.max(Number(sp.page) || 1, 1), 20);
  const c = await workspaceContext();

  let data: { rows: NotificationRow[]; total: number; unread: number; read: number; tabUnread: Record<string, number> } | null = null;
  if (c) {
    try {
      const base = { AND: [visibleWhere(c.workspaceId, c.userId), category ? { category } : {}, severity ? { severity } : {}] };
      const readFilter = { states: { some: { userId: c.userId, readAt: { not: null } } } };
      const [items, total, read, byTab] = await Promise.all([
        db.notification.findMany({ where: base, orderBy: { createdAt: "desc" }, take, include: { states: { where: { userId: c.userId }, select: { readAt: true } } } }),
        db.notification.count({ where: base }),
        db.notification.count({ where: { AND: [...base.AND, readFilter] } }),
        db.notification.groupBy({ by: ["category"], where: { AND: [visibleWhere(c.workspaceId, c.userId), { NOT: readFilter }] }, _count: true }),
      ]);
      const label = (k: string | null) => NOTIFICATION_TABS.find(([v]) => v === k)?.[1] ?? "System";
      data = {
        rows: items.map((n) => ({ id: n.id, category: n.category ?? "system", categoryLabel: label(n.category), severity: n.severity, title: n.title, body: n.body ?? n.message, link: n.link, read: Boolean(n.states[0]?.readAt), when: ago(n.createdAt) })),
        total,
        read,
        unread: total - read,
        tabUnread: Object.fromEntries(byTab.map((g) => [g.category ?? "system", g._count])),
      };
    } catch {
      data = null;
    }
  }

  const href = (cat?: string) => {
    const q = new URLSearchParams();
    if (cat) q.set("category", cat);
    if (severity) q.set("severity", severity);
    return q.size ? `${BASE}?${q}` : BASE;
  };
  const tabs: [string, string][] = [["All", href()], ...NOTIFICATION_TABS.map(([k, l]): [string, string] => [data?.tabUnread[k] ? `${l} (${data.tabUnread[k]})` : l, href(k)])];
  const filtered = Boolean(category || severity);

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={[["Platform Experience", "/app"], ["Notifications"]]} title="Notification Center" subtitle="Review actionable platform alerts from the global notification bell." />
      <TabBar variant="boxed" tabs={tabs} active={href(category)} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_540px]">
        <section className="min-w-0 rounded-xl border border-line bg-white p-5">
          <NotificationToolbar category={category} severity={severity} unread={data?.unread ?? 0} read={data?.read ?? 0} severities={SEVERITIES} base={BASE} />
          {!c || data === null ? (
            <EmptyState icon={ServerCrash} tone="orange" title="Notifications are unavailable" body={c ? "The notification service could not be reached. Try again shortly." : "Sign in to a workspace to see its notifications."} />
          ) : data.rows.length === 0 ? (
            <div className="py-24">
              <EmptyState
                icon={Bell}
                title={filtered ? "No notifications match this view" : "No notifications yet"}
                body={filtered ? "Try another category or severity." : "Campaign, approval, billing, security, integration, publishing, and system alerts will appear here."}
              />
            </div>
          ) : (
            <>
              <NotificationList rows={data.rows} />
              {data.total > data.rows.length && (
                <div className="border-t border-line pt-4 text-center">
                  <Link href={`${href(category)}${href(category).includes("?") ? "&" : "?"}page=${take / PAGE + 1}`} className={kitOutline} scroll={false}>
                    Show more ({data.total - data.rows.length} older)
                  </Link>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="flex flex-col rounded-xl border border-line bg-white p-5">
          <h2 className="text-[17px] font-semibold text-deep-navy">Notification Behavior</h2>
          <dl className="mt-4 space-y-5">
            {BEHAVIOR.map(([t, b]) => (
              <div key={t}>
                <dt className="text-[14px] font-semibold text-deep-navy">{t}</dt>
                <dd className="mt-1 text-[12.5px] text-ink-soft">{b}</dd>
              </div>
            ))}
          </dl>
          {data && (
            <p className="mt-6 rounded-md bg-bg-soft px-3 py-2 text-[12.5px] text-ink-soft">
              {data.unread === 0 ? "You have no unread notifications in this view." : `${data.unread} unread in this view.`}
            </p>
          )}
          <div className="mt-auto flex justify-center pt-8">
            <Link href="/app/settings/notifications" className={`${kitOutline} min-w-[280px]`}>Notification Settings</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
