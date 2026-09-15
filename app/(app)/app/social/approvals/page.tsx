import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ClipboardList, Clock, Eye, History, MessageSquare, RefreshCw, Search, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable, EmptyState, Panel, fmtDate, fmtDateTime, kitField } from "@/components/amplivanta/screen-kit";
import { ReviewButtons, StatusBadge } from "@/components/amplivanta/social-ui";
import { ACTIVITY_LABELS, excerpt, isAdminRole, loadPosts, socialAudit, socialContext } from "@/lib/server/social-screens";
import { SOCIAL_PLATFORMS, platformLabel } from "@/lib/social/platforms";

export const metadata: Metadata = { title: "Approvals" };
export const dynamic = "force-dynamic";

const TABS = [
  ["pending", "Pending", "pending_approval", Clock, "text-[#0B5CFF]"],
  ["approved", "Approved", "approved", CheckCircle2, "text-emerald-600"],
  ["changes", "Changes Requested", "changes_requested", RefreshCw, "text-orange-500"],
  ["rejected", "Rejected", "rejected", XCircle, "text-red-600"],
] as const;

const GUIDE: [typeof ClipboardList, string, string][] = [
  [ClipboardList, "Review Content", "Check the content details, copy, media, and campaign alignment."],
  [Eye, "Preview by Platform", "Preview how the content will appear on each selected platform."],
  [MessageSquare, "Request Changes (If needed)", "Provide clear feedback to the creator for required updates."],
  [CheckCircle2, "Approve", "Approve the content to move it to the publishing queue."],
  [XCircle, "Reject", "Reject the content if it doesn't meet requirements."],
];

type SP = { tab?: string; q?: string; platform?: string };

export default async function ApprovalsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t[0] === sp.tab) ?? TABS[0];
  const c = await socialContext();
  let reachable = Boolean(c);
  let posts: Awaited<ReturnType<typeof loadPosts>> = [];
  let submissions = new Map<string, { actor: string; at: Date }>();
  let activity: Awaited<ReturnType<typeof socialAudit>> = [];
  if (c) {
    try {
      const [list, submitted, history] = await Promise.all([
        loadPosts(c.workspaceId, {
          status: tab[2],
          ...(sp.platform ? { platforms: { has: sp.platform } } : {}),
          ...(sp.q ? { content: { contains: sp.q, mode: "insensitive" } } : {}),
        }),
        socialAudit(c.workspaceId, { actions: ["social.post.submitted"], take: 500 }),
        socialAudit(c.workspaceId, { actions: ["social.post.approved", "social.post.changes_requested", "social.post.rejected"], take: 8 }),
      ]);
      posts = list;
      // Latest submission per post gives "Submitted By" and the date.
      submissions = new Map(submitted.filter((s) => s.resourceId).reverse().map((s) => [s.resourceId as string, { actor: s.actor, at: s.createdAt }]));
      activity = history;
    } catch {
      reachable = false;
    }
  }
  const canReview = isAdminRole(c?.role);

  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[30px] font-bold text-deep-navy">Approvals</h1>
      <p className="mb-5 mt-1 text-[14.5px] text-ink-soft">Review and manage content that requires approval before publication.</p>

      <nav aria-label="Approval status" className="mb-5 inline-flex flex-wrap overflow-hidden rounded-xl border border-line bg-white">
        {TABS.map(([key, label, , Icon, tone]) => (
          <Link key={key} href={key === "pending" ? "/app/social/approvals" : `/app/social/approvals?tab=${key}`} className={cn("flex items-center gap-2.5 px-8 py-4 text-[14px] font-semibold text-deep-navy", tab[0] === key && "border-b-[3px] border-[#0B5CFF]")}>
            <Icon className={cn("h-5 w-5", tone)} /> {label}
          </Link>
        ))}
      </nav>

      <section className="mb-5 rounded-xl border border-line bg-white p-5">
        <form method="get" className="mb-4 flex flex-wrap items-center gap-3">
          {tab[0] !== "pending" && <input type="hidden" name="tab" value={tab[0]} />}
          <label className="relative w-full max-w-[260px]">
            <span className="sr-only">Search approvals</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input name="q" defaultValue={sp.q ?? ""} placeholder="Search approvals..." className={cn(kitField, "pl-9")} />
          </label>
          <select name="platform" defaultValue={sp.platform ?? ""} aria-label="Platform" className={cn(kitField, "w-[200px]")}>
            <option value="">All Platforms</option>
            {SOCIAL_PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <button type="submit" className="h-10 rounded-md border border-line px-4 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft">Apply</button>
          <Link href="/app/social/settings" className="ml-auto inline-flex h-10 items-center gap-2 rounded-md border border-[#0B5CFF]/40 px-4 text-[13px] font-semibold text-[#0B5CFF] hover:bg-royal-tint">
            <ShieldCheck className="h-4 w-4" /> Approval Rules
          </Link>
        </form>
        <div className="rounded-lg border border-line">
          <DataTable
            minWidth={900}
            columns={["Content", "Platform", "Status", "Submitted By", "Submitted Date", "Scheduled", ...(tab[0] === "pending" ? ["Actions"] : [])]}
            rows={posts.map((p) => {
              const s = submissions.get(p.id);
              return [
                excerpt(p.content, 60),
                p.platforms.map(platformLabel).join(", ") || "—",
                <StatusBadge key="s" status={p.status} />,
                s?.actor ?? "—",
                s ? fmtDate(s.at) : "—",
                p.scheduledAt ? fmtDateTime(p.scheduledAt) : "—",
                ...(tab[0] === "pending" ? [canReview ? <ReviewButtons key="r" postId={p.id} /> : <span key="r" className="text-[12px] text-ink-muted">Admins review</span>] : []),
              ];
            })}
            empty={
              <EmptyState
                icon={ClipboardList}
                title={!reachable ? "Approvals unavailable" : tab[0] === "pending" ? "No items awaiting review" : `No ${tab[1].toLowerCase()} items`}
                body={!reachable ? "Approval items could not be loaded right now." : "Content that requires approval before publication will appear here."}
              />
            }
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title="Review Guidance" subtitle="Follow these steps to review content efficiently.">
          <ol className="space-y-3">
            {GUIDE.map(([Icon, title, body], i) => (
              <li key={title} className="flex items-center gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-royal-tint text-[13px] font-semibold text-[#3B3FD8]">{i + 1}</span>
                <Icon className="h-5 w-5 shrink-0 text-[#3B3FD8]" />
                <div><div className="text-[13.5px] font-semibold text-deep-navy">{title}</div><div className="text-[12.5px] text-ink-soft">{body}</div></div>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Approval Activity" subtitle="History of approval actions will appear here after items are reviewed.">
          {activity.length ? (
            <ul className="divide-y divide-line">
              {activity.map((a) => (
                <li key={a.id} className="py-2.5 text-[13px]">
                  <div className="font-semibold text-deep-navy">{ACTIVITY_LABELS[a.action] ?? a.action}</div>
                  <div className="text-[12px] text-ink-muted">{a.actor} · {fmtDateTime(a.createdAt)}{typeof a.metadata.note === "string" && a.metadata.note ? ` · “${excerpt(a.metadata.note, 80)}”` : ""}</div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={History} title="No activity yet" body="Approval, request changes, or reject content to see activity history here." />
          )}
        </Panel>
      </div>
    </div>
  );
}
