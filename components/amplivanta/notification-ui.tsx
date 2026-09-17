"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertOctagon, AlertTriangle, Bell, CheckCircle2, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toastResult } from "@/lib/action-toast";
import { clearNotification, clearReadNotifications, markAllNotificationsRead, markNotificationRead } from "@/app/(app)/app/notifications/actions";

export type NotificationRow = {
  id: string;
  category: string;
  categoryLabel: string;
  severity: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  when: string;
};

const SEVERITY = {
  critical: { icon: AlertOctagon, cls: "bg-red-50 text-red-600", label: "Critical" },
  warning: { icon: AlertTriangle, cls: "bg-amber-50 text-amber-600", label: "Warning" },
  success: { icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600", label: "Success" },
  info: { icon: Info, cls: "bg-royal-tint text-[#3B3FD8]", label: "Info" },
} as const;

const toolbarBtn = "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-6 text-[13.5px] font-semibold text-deep-navy hover:bg-bg-soft disabled:cursor-not-allowed disabled:bg-bg-soft disabled:text-ink-muted";

export function NotificationToolbar({ category, severity, unread, read, severities, base }: { category?: string; severity?: string; unread: number; read: number; severities: [string, string][]; base: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const fd = () => {
    const f = new FormData();
    if (category) f.set("category", category);
    if (severity) f.set("severity", severity);
    return f;
  };
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4">
      <button type="button" className={toolbarBtn} disabled={pending || unread === 0} onClick={() => start(async () => { if (toastResult(await markAllNotificationsRead(fd()))) router.refresh(); })}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Mark all read
      </button>
      <button type="button" className={toolbarBtn} disabled={pending || read === 0} title="Clears read notifications in this view. Unread alerts are kept." onClick={() => start(async () => { if (toastResult(await clearReadNotifications(fd()))) router.refresh(); })}>
        Bulk clear
      </button>
      <label className="ml-auto">
        <span className="sr-only">Severity</span>
        <select
          value={severity ?? ""}
          onChange={(e) => {
            const q = new URLSearchParams();
            if (category) q.set("category", category);
            if (e.target.value) q.set("severity", e.target.value);
            router.push(q.size ? `${base}?${q}` : base);
          }}
          className="h-10 min-w-[240px] rounded-md border border-line bg-white px-3 text-center text-[13px] font-semibold text-deep-navy focus:border-[#0B5CFF] focus:outline-none"
        >
          <option value="">All Severities</option>
          {severities.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
    </div>
  );
}

export function NotificationList({ rows }: { rows: NotificationRow[] }) {
  return (
    <ul className="divide-y divide-line">
      {rows.map((n) => <NotificationItem key={n.id} n={n} />)}
    </ul>
  );
}

function NotificationItem({ n }: { n: NotificationRow }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const s = SEVERITY[n.severity as keyof typeof SEVERITY] ?? SEVERITY.info;
  const run = (fn: () => Promise<{ ok: true; message: string } | { ok: false; error: string }>, quiet = false) =>
    start(async () => {
      const r = await fn();
      if (!quiet || !r.ok) toastResult(r);
      if (r.ok) router.refresh();
    });
  return (
    <li className={cn("flex gap-4 py-4", pending && "opacity-60")}>
      <span className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full", s.cls)}>
        <s.icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-ink-muted">
          <span className="font-semibold uppercase tracking-wide">{n.categoryLabel}</span>
          <span>·</span>
          <span>{s.label}</span>
          <span>·</span>
          <time>{n.when}</time>
          {!n.read && <span className="h-2 w-2 rounded-full bg-[#0B5CFF]" aria-label="Unread" />}
        </div>
        <div className={cn("mt-1 text-[14px] text-deep-navy", n.read ? "font-medium" : "font-semibold")}>{n.title}</div>
        {n.body && <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{n.body}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-4 text-[12.5px] font-semibold">
          {n.link && (
            <Link href={n.link} onClick={() => { if (!n.read) void markNotificationRead(n.id, true); }} className="text-[#0B5CFF] hover:underline">
              Open
            </Link>
          )}
          <button type="button" disabled={pending} onClick={() => run(() => markNotificationRead(n.id, !n.read), true)} className="text-deep-navy hover:text-[#0B5CFF]">
            {n.read ? "Mark unread" : "Mark read"}
          </button>
          <button type="button" disabled={pending} onClick={() => run(() => clearNotification(n.id))} className="text-ink-soft hover:text-red-600">
            Clear
          </button>
        </div>
      </div>
    </li>
  );
}

/** Topbar bell: the badge is the real unread count, hidden at zero. */
export function NotificationBell({ unread }: { unread: number | null }) {
  return (
    <Link
      href="/app/notifications"
      aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition hover:bg-bg-soft hover:text-ink"
    >
      <Bell className="h-4 w-4" />
      {unread ? (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0B5CFF] px-1 text-[9px] font-bold text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
