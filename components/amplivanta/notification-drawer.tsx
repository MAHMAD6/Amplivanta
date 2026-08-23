"use client";

import { X, Sparkles, CheckCircle2, AlertTriangle, CreditCard, Share2, ShieldCheck, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Campaigns", "Approvals", "Billing", "Security", "Integrations", "System"] as const;

const NOTIFS = [
  { id: "1", icon: Sparkles, tone: "violet", title: "AI Advisor found a new opportunity", body: "Reallocate $2,400 from Facebook to LinkedIn — projected +18% CPL improvement.", time: "2 min ago", unread: true, category: "Campaigns" },
  { id: "2", icon: CheckCircle2, tone: "green", title: "Spring Promotion campaign approved", body: "Sarah Johnson approved 4 posts. Scheduled for 10:00 AM tomorrow.", time: "18 min ago", unread: true, category: "Approvals" },
  { id: "3", icon: AlertTriangle, tone: "amber", title: "Facebook connection needs re-auth", body: "Token expires in 48 hours. Reconnect to avoid publish failures.", time: "1 h ago", unread: true, category: "Integrations" },
  { id: "4", icon: CreditCard, tone: "blue", title: "Invoice #INV-2098 paid", body: "$249.00 · Growth plan · Aug 12, 2026", time: "3 h ago", unread: false, category: "Billing" },
  { id: "5", icon: Share2, tone: "pink", title: "3 new posts scheduled", body: "Instagram, LinkedIn, X — May 15 batch.", time: "5 h ago", unread: false, category: "Campaigns" },
  { id: "6", icon: ShieldCheck, tone: "emerald", title: "MFA enabled for 4 team members", body: "Security policy updated by Alex Johnson.", time: "Yesterday", unread: false, category: "Security" },
  { id: "7", icon: Workflow, tone: "indigo", title: "Winback workflow completed", body: "Re-engaged 42 dormant contacts. 8 converted.", time: "Yesterday", unread: false, category: "Campaigns" },
];

const toneClass: Record<string, string> = {
  violet: "bg-violet/10 text-violet",
  green: "bg-emerald-500/10 text-emerald-600",
  amber: "bg-amber-500/10 text-amber-600",
  blue: "bg-blue-500/10 text-blue-600",
  pink: "bg-pink-brand/10 text-pink-brand",
  emerald: "bg-emerald-500/10 text-emerald-600",
  indigo: "bg-indigo-500/10 text-indigo-600",
};

export function NotificationDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-white shadow-card-lg">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <div className="text-[15px] font-bold text-ink">Notifications</div>
            <div className="text-[11px] text-ink-muted">3 unread · Updated just now</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-muted hover:bg-bg-soft" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2 no-scrollbar">
          {CATEGORIES.map((c, i) => (
            <button
              key={c}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-[11.5px] font-semibold transition",
                i === 0 ? "bg-violet/10 text-violet" : "text-ink-soft hover:bg-bg-soft"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {NOTIFS.map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex gap-3 border-b border-line px-5 py-3.5 transition hover:bg-bg-soft",
                n.unread && "bg-violet/[0.02]"
              )}
            >
              <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", toneClass[n.tone])}>
                <n.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[13px] font-semibold leading-snug text-ink">{n.title}</div>
                  {n.unread && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-brand" />}
                </div>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">{n.body}</p>
                <div className="mt-1 text-[10.5px] text-ink-muted">{n.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <button className="text-[12px] font-semibold text-violet hover:underline">Mark all as read</button>
          <button className="text-[12px] font-semibold text-ink-soft hover:text-ink">View all</button>
        </div>
      </aside>
    </div>
  );
}
