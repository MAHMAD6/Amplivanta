import type { Metadata } from "next";
import Link from "next/link";
import { Check, Diamond } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { DataTable, EmptyState, ScreenHeader, fmtDate, fmtInt, kitField } from "@/components/amplivanta/screen-kit";
import { ReviewButtons, StatusBadge } from "@/components/amplivanta/social-ui";
import { workspaceContext } from "@/lib/server/workspace-screens";
import { excerpt } from "@/lib/server/social-screens";

export const metadata: Metadata = { title: "Approvals" };
export const dynamic = "force-dynamic";

const BASE = "/app/workspace/approvals";
const TABS: [string, string, string][] = [["pending", "Pending", "pending_approval"], ["approved", "Approved", "approved"], ["changes", "Changes Requested", "changes_requested"], ["rejected", "Rejected", "rejected"]];

/**
 * Cross-module approval queue. Social Publishing is currently the only module
 * with an approval workflow, so its items are listed here with the module named.
 */
export default async function WorkspaceApprovalsPage({ searchParams }: { searchParams: Promise<{ tab?: string; module?: string }> }) {
  const sp = await searchParams;
  const tab = TABS.find(([k]) => k === sp.tab) ?? TABS[0];
  const c = await workspaceContext();
  let reachable = Boolean(c);
  let rows: { id: string; content: string; status: string; updatedAt: Date; submittedBy: string | null; submittedAt: Date | null }[] = [];
  const counts: Record<string, number> = {};
  if (c) {
    try {
      const w = c.workspaceId;
      const [posts, grouped] = await Promise.all([
        sp.module && sp.module !== "social" ? Promise.resolve([]) : db.socialPost.findMany({ where: { workspaceId: w, status: tab[2] }, orderBy: { updatedAt: "desc" }, take: 200, select: { id: true, content: true, status: true, updatedAt: true } }),
        db.socialPost.groupBy({ by: ["status"], where: { workspaceId: w, status: { in: TABS.map((t) => t[2]) } }, _count: true }),
      ]);
      const subs = posts.length
        ? await db.auditLog.findMany({ where: { workspaceId: w, action: "social.post.submitted", resourceId: { in: posts.map((p) => p.id) } }, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, email: true } } } })
        : [];
      rows = posts.map((p) => {
        const s = subs.find((x) => x.resourceId === p.id);
        return { ...p, submittedBy: s ? s.user?.name || s.user?.email || "System" : null, submittedAt: s?.createdAt ?? null };
      });
      for (const g of grouped) counts[g.status] = g._count;
    } catch {
      reachable = false;
    }
  }
  const any = Object.values(counts).some(Boolean);

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader crumbs={[["AI Workspace", "/app/workspace"], ["Approvals"]]} title="Approvals" subtitle="Review cross-module items that require approval before they go live." />
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <nav className="flex gap-12 text-[15px]" aria-label="Approval status">
          {TABS.map(([k, l]) => (
            <Link key={k} href={k === "pending" ? BASE : `${BASE}?tab=${k}`} className={cn("pb-2 font-semibold", tab[0] === k ? "border-b-[3px] border-[#0B5CFF] text-[#0B5CFF]" : "text-deep-navy")}>{l}</Link>
          ))}
        </nav>
        <form method="get" className="flex gap-3">
          {tab[0] !== "pending" && <input type="hidden" name="tab" value={tab[0]} />}
          <select name="module" defaultValue={sp.module ?? ""} aria-label="Module" className={cn(kitField, "w-[190px]")}><option value="">All Modules</option><option value="social">Social Publishing</option></select>
          <button type="submit" className="h-10 rounded-md border border-line px-5 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft">Apply</button>
        </form>
      </div>
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TABS.map(([k, l, s], i) => (
          <div key={k} className="flex gap-4 rounded-xl border border-line bg-white px-5 py-5">
            <span className={cn("flex h-11 w-11 items-center justify-center rounded-full", ["bg-royal-tint text-[#3B3FD8]", "bg-emerald-50 text-emerald-600", "bg-orange-50 text-orange-500", "bg-red-50 text-red-500"][i])}><Diamond className="h-5 w-5" /></span>
            <div><div className="text-[14px] font-semibold text-deep-navy">{l}</div><div className="mt-2 text-[20px] font-bold text-deep-navy">{any ? fmtInt(counts[s] ?? 0) : "—"}</div><div className="text-[12px] text-ink-muted">{any ? "" : "No items"}</div></div>
          </div>
        ))}
      </div>
      <section className="min-h-[560px] rounded-xl border border-line bg-white p-5">
        <DataTable
          minWidth={920}
          columns={["Item", "Module", "Submitted By", "Submitted On", "Status", ...(tab[0] === "pending" ? ["Actions"] : [])]}
          rows={rows.map((r) => [
            excerpt(r.content, 70),
            "Social Publishing",
            r.submittedBy ?? "—",
            r.submittedAt ? fmtDate(r.submittedAt) : fmtDate(r.updatedAt),
            <StatusBadge key="s" status={r.status} />,
            ...(tab[0] === "pending" ? [c?.isAdmin ? <ReviewButtons key="a" postId={r.id} /> : <span key="a" className="text-[12px] text-ink-muted">Admins review</span>] : []),
          ])}
          empty={<EmptyState icon={Check} title={!reachable ? "Approvals unavailable" : tab[0] === "pending" ? "No items awaiting review" : `No ${tab[1].toLowerCase()} items`} body="Submitted items will appear here when an approval workflow requires review." />}
        />
      </section>
    </div>
  );
}
