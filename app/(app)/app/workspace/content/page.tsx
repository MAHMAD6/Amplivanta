import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { DataTable, EmptyState, Pill, ScreenHeader, TabBar, fmtDate, kitField, kitPrimary } from "@/components/amplivanta/screen-kit";
import { workspaceContext } from "@/lib/server/workspace-screens";
import { platformLabel, statusLabel } from "@/lib/social/platforms";

export const metadata: Metadata = { title: "Content Hub" };
export const dynamic = "force-dynamic";

const BASE = "/app/workspace/content";
const STAGES: [string, string][] = [["draft", "Drafts"], ["review", "In Review"], ["scheduled", "Scheduled"], ["published", "Published"], ["archived", "Archived"]];

type Item = { id: string; title: string; type: string; channel: string; stage: string; statusText: string; updatedAt: Date; href: string };

/** Maps each module's own status onto the hub's stages. */
const socialStage = (s: string) => (s === "pending_approval" || s === "changes_requested" ? "review" : s === "scheduled" || s === "approved" ? "scheduled" : s === "published" ? "published" : s === "archived" || s === "rejected" ? "archived" : "draft");
const emailStage = (s: string) => (s === "scheduled" ? "scheduled" : s === "sent" ? "published" : s === "archived" ? "archived" : "draft");

export default async function ContentHubPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; type?: string }> }) {
  const sp = await searchParams;
  const stage = STAGES.some(([v]) => v === sp.tab) ? sp.tab! : null;
  const c = await workspaceContext();
  let reachable = Boolean(c);
  let items: Item[] = [];
  if (c) {
    try {
      const w = c.workspaceId;
      const [docs, posts, emails] = await Promise.all([
        db.document.findMany({ where: { workspaceId: w }, orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, title: true, status: true, updatedAt: true } }),
        db.socialPost.findMany({ where: { workspaceId: w }, orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, content: true, status: true, platforms: true, updatedAt: true } }),
        db.emailCampaign.findMany({ where: { workspaceId: w }, orderBy: { updatedAt: "desc" }, take: 100 }).catch(() => [] as { id: string; name: string; status: string; updatedAt: Date }[]),
      ]);
      items = [
        ...docs.map((d) => ({ id: d.id, title: d.title, type: "Document", channel: "—", stage: d.status === "archived" ? "archived" : "draft", statusText: d.status === "archived" ? "Archived" : "Draft", updatedAt: d.updatedAt, href: `/app/creative-studio/documents/${d.id}` })),
        ...posts.map((p) => ({ id: p.id, title: p.content.slice(0, 80), type: "Social post", channel: p.platforms.map(platformLabel).join(", ") || "—", stage: socialStage(p.status), statusText: statusLabel(p.status), updatedAt: p.updatedAt, href: "/app/social/posts" })),
        ...emails.map((e) => ({ id: e.id, title: e.name, type: "Email", channel: "Email", stage: emailStage(e.status), statusText: e.status, updatedAt: e.updatedAt, href: "/app/marketing/emails" })),
      ]
        .filter((i) => (!stage || i.stage === stage) && (!sp.type || i.type === sp.type) && (!sp.q || i.title.toLowerCase().includes(sp.q.toLowerCase())))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch {
      reachable = false;
    }
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["AI Workspace", "/app/workspace"], ["Content Hub"]]}
        title="Content Hub"
        subtitle="Create, manage, and collaborate on content across all your campaigns."
        actions={
          <details className="relative">
            <summary className={cn(kitPrimary, "h-11 cursor-pointer list-none")}><FileText className="h-4 w-4" /> Create Content</summary>
            <div className="absolute right-0 z-10 mt-1 w-52 rounded-lg border border-line bg-white py-1 text-[13.5px] shadow-card">
              <Link href="/app/creative-studio/documents" className="block px-3 py-2 hover:bg-bg-soft">Document</Link>
              <Link href="/app/social/compose" className="block px-3 py-2 hover:bg-bg-soft">Social post</Link>
              <Link href="/app/marketing/emails" className="block px-3 py-2 hover:bg-bg-soft">Email campaign</Link>
            </div>
          </details>
        }
      />
      <TabBar active={stage ? `${BASE}?tab=${stage}` : BASE} tabs={[["All Content", BASE], ...STAGES.map(([v, l]) => [l, `${BASE}?tab=${v}`] as [string, string])]} />
      <section className="rounded-xl border border-line bg-white p-6">
        <form method="get" className="mb-5 flex flex-wrap gap-4">
          {stage && <input type="hidden" name="tab" value={stage} />}
          <label className="relative w-full max-w-[420px] flex-1">
            <span className="sr-only">Search content</span>
            <input name="q" defaultValue={sp.q ?? ""} placeholder="Search content..." className={cn(kitField, "h-11 pr-9")} />
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          </label>
          <select name="type" defaultValue={sp.type ?? ""} aria-label="Type" className={cn(kitField, "h-11 w-full sm:w-[280px]")}>
            <option value="">All Types</option>
            {["Document", "Social post", "Email"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <button type="submit" className="h-11 rounded-md border border-line px-5 text-[13.5px] font-semibold text-deep-navy hover:bg-bg-soft">Filters</button>
        </form>
        <div className="mb-6 rounded-xl border border-line">
          <DataTable
            minWidth={760}
            columns={["Content", "Type", "Channel", "Status", "Updated"]}
            rows={items.slice(0, 150).map((i) => [<Link key="t" href={i.href} className="hover:text-[#0B5CFF]">{i.title}</Link>, i.type, i.channel, <Pill key="s" tone={i.stage === "published" ? "green" : i.stage === "review" ? "amber" : i.stage === "scheduled" ? "blue" : "gray"}>{i.statusText}</Pill>, fmtDate(i.updatedAt)])}
            empty={<EmptyState icon={FileText} title={reachable ? "No content yet" : "Content unavailable"} body="Start creating content to engage your audience and drive results." action={reachable ? <Link href="/app/creative-studio/documents" className={kitPrimary}><FileText className="h-4 w-4" /> Create Content</Link> : undefined} />}
          />
        </div>
        <div className="rounded-xl border border-line bg-bg-soft/50 px-8 py-10">
          <h2 className="text-[22px] font-semibold text-deep-navy">Create. Collaborate. Publish.</h2>
          <p className="mt-2 max-w-[460px] text-[15px] text-ink-soft">Build content for any channel and stage. Collaborate with your team and move content to publishing.</p>
        </div>
      </section>
    </div>
  );
}
