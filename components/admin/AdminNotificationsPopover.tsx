"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Bell, MessageSquare, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

interface NotificationItem {
  unreadMessages: { id: string; name: string; email: string; createdAt: string; service: string | null }[];
  pendingReviews: { id: string; name: string; rating: number; content: string; createdAt: string }[];
  totalNotifications: number;
}

export function AdminNotificationsPopover() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationItem>({
    unreadMessages: [],
    pendingReviews: [],
    totalNotifications: 0,
  });
  const ref = useRef<HTMLDivElement>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const json = await res.json();
        setData(json.notifications || { unreadMessages: [], pendingReviews: [], totalNotifications: 0 });
      }
    } catch {
      // quiet catch
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8f7fb] text-[#4a4756] transition hover:bg-[#e9e7f0] hover:text-[#14121f]"
      >
        <Bell className="h-4 w-4" />
        {data.totalNotifications > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 font-mono text-[10px] font-bold text-white shadow-sm animate-pulse">
            {data.totalNotifications}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden rounded-2xl border border-[#e9e7f0] bg-white text-[#14121f] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e9e7f0] bg-[#14121f] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#6D3BF5]" />
              <span className="font-display text-sm font-bold">Notifications</span>
            </div>
            {data.totalNotifications > 0 ? (
              <span className="rounded-full bg-[#6D3BF5] px-2 py-0.5 font-mono text-xs font-bold text-white">
                {data.totalNotifications} New
              </span>
            ) : (
              <span className="text-xs text-white/50">All caught up!</span>
            )}
          </div>

          {/* Body List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#e9e7f0]">
            {data.totalNotifications === 0 ? (
              <div className="p-8 text-center text-sm text-[#767287]">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                No unread messages or pending reviews.
              </div>
            ) : (
              <>
                {/* Pending Messages */}
                {data.unreadMessages.map((m) => (
                  <Link
                    key={m.id}
                    href={`/admin/messages/${m.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 p-3.5 transition hover:bg-[#f8f7fb]"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[#14121f]">
                        New Message: {m.name}
                      </p>
                      <p className="truncate text-[11px] text-[#4a4756]">{m.email}</p>
                      <p className="mt-1 font-mono text-[10px] text-[#767287]">
                        {formatDateShort(m.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}

                {/* Pending Reviews */}
                {data.pendingReviews.map((r) => (
                  <Link
                    key={r.id}
                    href="/admin/reviews"
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 p-3.5 transition hover:bg-[#f8f7fb]"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Star className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[#14121f]">
                        Pending Review ({r.rating}★) from {r.name}
                      </p>
                      <p className="line-clamp-1 text-[11px] italic text-[#4a4756]">
                        &ldquo;{r.content}&rdquo;
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-[#767287]">
                        {formatDateShort(r.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[#e9e7f0] bg-[#f8f7fb] p-3 text-xs">
            <Link
              href="/admin/messages"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1 font-medium text-[#14121f] hover:text-lime-ink"
            >
              View Inbox <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href="/admin/reviews"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1 font-medium text-[#14121f] hover:text-lime-ink"
            >
              Manage Reviews <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
