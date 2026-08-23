"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  Check,
  Trash2,
  Clock,
  Filter,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: "success" | "warning" | "info" | "ai";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
  category: "Campaign" | "CRM" | "AI Advisor" | "System" | "Integration";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    type: "ai",
    title: "AI Growth Recommendation",
    message: "AI Advisor detected high conversion opportunity on 'AI-Native Stack' landing page. Projected +24% MQL lift.",
    time: "10 mins ago",
    read: false,
    link: "/app/advisor",
    category: "AI Advisor",
  },
  {
    id: "n2",
    type: "success",
    title: "Deal Closed - BrightTech Corp",
    message: "Sophia Vance moved BrightTech Corp to 'Closed Won' ($48,000 ARR).",
    time: "1 hour ago",
    read: false,
    link: "/app/crm/deals",
    category: "CRM",
  },
  {
    id: "n3",
    type: "warning",
    title: "Webhook Delivery Retrying",
    message: "Webhook endpoint for Slack integration returned 503 Service Unavailable. Automatic retry 2 of 3 in progress.",
    time: "2 hours ago",
    read: false,
    link: "/app/integrations/webhooks",
    category: "Integration",
  },
  {
    id: "n4",
    type: "info",
    title: "Email Campaign Scheduled",
    message: "Q3 Product Announcement email campaign scheduled for broadcast on Tuesday, Aug 25 at 9:00 AM EST.",
    time: "5 hours ago",
    read: true,
    link: "/app/marketing/emails",
    category: "Campaign",
  },
  {
    id: "n5",
    type: "success",
    title: "Domain SSL Certificate Renewed",
    message: "Auto-renewal succeeded for go.amplivanta.com. Valid through August 2027.",
    time: "1 day ago",
    read: true,
    link: "/app/marketing/domains",
    category: "System",
  },
  {
    id: "n6",
    type: "ai",
    title: "Weekly Intelligence Brief Ready",
    message: "Competitor content monitoring processed 42 new signals across LinkedIn and X.",
    time: "2 days ago",
    read: true,
    link: "/app/content-intelligence",
    category: "AI Advisor",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread" | "ai" | "crm">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "ai") return n.category === "AI Advisor";
    if (filter === "crm") return n.category === "CRM";
    return true;
  });

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "ai":
        return <Sparkles className="h-4 w-4 text-violet" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getIconBg = (type: NotificationItem["type"]) => {
    switch (type) {
      case "ai":
        return "bg-violet/10 border-violet/20";
      case "success":
        return "bg-emerald-500/10 border-emerald-500/20";
      case "warning":
        return "bg-amber-500/10 border-amber-500/20";
      default:
        return "bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7fb] p-6 lg:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink lg:text-3xl">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-violet/10 px-2.5 py-0.5 text-xs font-semibold text-violet">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              System alerts, AI insights, workflow triggers, and team activity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-xs hover:bg-slate-50"
              >
                <Check className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === "all"
                ? "bg-ink text-white"
                : "bg-white text-ink-muted hover:text-ink border border-border"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === "unread"
                ? "bg-ink text-white"
                : "bg-white text-ink-muted hover:text-ink border border-border"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("ai")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === "ai"
                ? "bg-ink text-white"
                : "bg-white text-ink-muted hover:text-ink border border-border"
            }`}
          >
            AI Insights
          </button>
          <button
            onClick={() => setFilter("crm")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === "crm"
                ? "bg-ink text-white"
                : "bg-white text-ink-muted hover:text-ink border border-border"
            }`}
          >
            CRM & Deals
          </button>
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet/10 text-violet">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-ink">
                No notifications found
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                You are completely up to date with your workspace activity.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`group relative flex items-start gap-4 rounded-2xl border p-4 transition-all duration-200 ${
                  item.read
                    ? "border-border/60 bg-white/70 hover:bg-white hover:border-border"
                    : "border-violet/30 bg-white shadow-sm ring-1 ring-violet/10"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${getIconBg(
                    item.type
                  )}`}
                >
                  {getIcon(item.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
                      {item.category}
                    </span>
                    {!item.read && (
                      <span className="h-2 w-2 rounded-full bg-violet" />
                    )}
                    <span className="ml-auto text-xs text-ink-muted flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.time}
                    </span>
                  </div>

                  <h4 className="mt-1 text-sm font-bold text-ink">
                    {item.title}
                  </h4>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                    {item.message}
                  </p>

                  {item.link && (
                    <div className="mt-2.5 flex items-center gap-3">
                      <Link
                        href={item.link}
                        onClick={() => markAsRead(item.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-violet hover:underline"
                      >
                        View details
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  {!item.read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      title="Mark as read"
                      className="rounded-lg p-1.5 text-ink-muted hover:bg-slate-100 hover:text-ink"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(item.id)}
                    title="Delete notification"
                    className="rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
