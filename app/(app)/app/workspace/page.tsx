import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, CheckSquare, ClipboardList, FileText, Folder, MessageSquare, PieChart, Settings, Star, Users } from "lucide-react";
import { db } from "@/lib/db";
import { BarList, EmptyState, KeyList, Panel, StatGrid, fmtDate, fmtDateTime, figure, kitPrimary } from "@/components/amplivanta/screen-kit";
import { actionLabel, memberNames, moduleOf, workspaceContext } from "@/lib/server/workspace-screens";
import { CAMPAIGN_STATUSES, label } from "@/lib/workspace/options";

export const metadata: Metadata = { title: "AI Workspace" };
export const dynamic = "force-dynamic";

export default async function AiWorkspaceHomePage() {
  const c = await workspaceContext();
  let d = null as null | {
    campaigns: number;
    openTasks: number;
    content: number;
    approvals: number;
    activity: { id: string; action: string; at: Date; actor: string }[];
    projects: { id: string; name: string; type: string; updatedAt: Date }[];
    workload: [string, number][];
    campaignMix: [string, number][];
    recs: { id: string; title: string; impact: string }[];
  };
  if (c) {
    try {
      const w = c.workspaceId;
      const [campaigns, openTasks, docs, posts, approvals, activity, projects, byAssignee, mix, recs, members] = await Promise.all([
        db.campaign.count({ where: { workspaceId: w, status: { not: "archived" } } }),
        db.task.count({ where: { workspaceId: w, status: { not: "done" } } }),
        db.document.count({ where: { workspaceId: w, status: "draft" } }),
        db.socialPost.count({ where: { workspaceId: w, status: { not: "archived" } } }),
        db.socialPost.count({ where: { workspaceId: w, status: "pending_approval" } }),
        db.auditLog.findMany({ where: { workspaceId: w }, orderBy: { createdAt: "desc" }, take: 6, include: { user: { select: { name: true, email: true } } } }),
        db.project.findMany({ where: { workspaceId: w, status: { not: "archived" } }, orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, name: true, type: true, updatedAt: true } }),
        db.task.groupBy({ by: ["assigneeId"], where: { workspaceId: w, status: { not: "done" }, assigneeId: { not: null } }, _count: true }),
        db.campaign.groupBy({ by: ["status"], where: { workspaceId: w }, _count: true }),
        db.recommendation.findMany({ where: { workspaceId: w, status: "new" }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, title: true, impact: true } }),
        memberNames(w),
      ]);
      d = {
        campaigns,
        openTasks,
        content: docs + posts,
        approvals,
        activity: activity.map((a) => ({ id: a.id, action: a.action, at: a.createdAt, actor: a.user?.name || a.user?.email || "System" })),
        projects,
        workload: byAssignee.map((b) => [members.find((m) => m.id === b.assigneeId)?.name ?? "Former member", b._count] as [string, number]).sort((a, b) => b[1] - a[1]),
        campaignMix: mix.map((m) => [label(CAMPAIGN_STATUSES, m.status), m._count] as [string, number]),
        recs,
      };
    } catch {
      d = null;
    }
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] font-bold text-deep-navy">AI Workspace</h1>
          <p className="mt-1 max-w-[560px] text-[14.5px] text-ink-soft">Your centralized workspace to plan, create, automate, and track marketing that drives growth.</p>
        </div>
        <Link href="/app/settings" className="inline-flex h-11 items-center gap-2 rounded-md border border-[#0B5CFF]/50 bg-white px-5 text-[14px] font-semibold text-[#0B5CFF]"><Settings className="h-4 w-4" /> Workspace Settings</Link>
      </div>
      <StatGrid
        stats={[
          { label: "Campaigns", icon: BarChart3, value: figure(d?.campaigns), tone: "blue" },
          { label: "Tasks", icon: CheckSquare, value: figure(d?.openTasks), hint: d?.openTasks ? "Open tasks" : undefined, tone: "green" },
          { label: "Content", icon: MessageSquare, value: figure(d?.content), hint: d?.content ? "Documents and posts" : undefined, tone: "violet" },
          { label: "Approvals", icon: ClipboardList, value: figure(d?.approvals), hint: d?.approvals ? "Awaiting review" : undefined, tone: "orange" },
        ]}
      />
      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_1fr_0.8fr]">
        <Panel title="Recent Activity">
          {d?.activity.length ? (
            <>
              <ul className="divide-y divide-line">
                {d.activity.map((a) => <li key={a.id} className="py-2.5 text-[13px]"><div className="font-semibold capitalize text-deep-navy">{moduleOf(a.action)} · {actionLabel(a.action)}</div><div className="text-[12px] text-ink-muted">{a.actor} · {fmtDateTime(a.at)}</div></li>)}
              </ul>
              <Link href="/app/workspace/activity" className="mt-2 inline-block text-[13px] font-semibold text-[#0B5CFF]">Go to Activity</Link>
            </>
          ) : (
            <EmptyState icon={ClipboardList} title="No recent activity" body="Activity across your workspace will appear here." action={<Link href="/app/workspace/activity" className={kitPrimary}>Go to Activity</Link>} />
          )}
        </Panel>
        <Panel title="Recent Projects">
          {d?.projects.length ? (
            <ul className="divide-y divide-line">
              {d.projects.map((p) => <li key={p.id} className="py-2.5"><div className="text-[13.5px] font-semibold text-deep-navy">{p.name}</div><div className="text-[12px] capitalize text-ink-muted">{p.type} · {fmtDate(p.updatedAt)}</div></li>)}
            </ul>
          ) : (
            <EmptyState icon={Folder} title="No projects yet" body="Create your first project to get started." action={<Link href="/app/creative-studio/projects" className={kitPrimary}>Create Project</Link>} />
          )}
        </Panel>
        <Panel title="Team Workload" subtitle={d?.workload.length ? "Open tasks by assignee" : undefined}>
          {d?.workload.length ? <BarList rows={d.workload} /> : <EmptyState icon={Users} title="No team data yet" body="Assign tasks to teammates to view workload." action={<Link href="/app/workspace/tasks" className={kitPrimary}>Open Tasks</Link>} />}
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.9fr_1fr]">
        <Panel title="AI Workspace Snapshot" subtitle={d?.campaignMix.length ? "Campaigns by status" : undefined}>
          {d?.campaignMix.length ? <KeyList rows={d.campaignMix.map(([k, v]) => [k, v.toLocaleString("en-US")])} /> : <EmptyState icon={PieChart} title="No snapshot data yet" body="Snapshot of your workspace performance will appear here." />}
        </Panel>
        <Panel title="Recommendations">
          {d?.recs.length ? (
            <ul className="divide-y divide-line">
              {d.recs.map((r) => <li key={r.id} className="py-2.5"><div className="text-[13.5px] font-semibold text-deep-navy">{r.title}</div><div className="text-[12px] capitalize text-ink-muted">{r.impact} impact</div></li>)}
              <li className="pt-2"><Link href="/app/ai-advisor" className="text-[13px] font-semibold text-[#0B5CFF]">Open AI Advisor</Link></li>
            </ul>
          ) : (
            <EmptyState icon={Star} title="No recommendations yet" body="Personalized AI recommendations will appear here." />
          )}
        </Panel>
      </div>
      <nav aria-label="AI Workspace sections" className="mt-5 flex flex-wrap gap-2 rounded-xl border border-line bg-white px-5 py-3 text-[13px]">
        {[["Campaign Plan", "/app/workspace/plan"], ["Content Hub", "/app/workspace/content"], ["Asset Library", "/app/workspace/assets"], ["Automations", "/app/workspace/automations"], ["Analytics", "/app/workspace/analytics"], ["Tasks", "/app/workspace/tasks"], ["Notes", "/app/workspace/notes"], ["Approvals", "/app/workspace/approvals"], ["Activity / History", "/app/workspace/activity"]].map(([l, h]) => (
          <Link key={h} href={h} className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-ink-soft hover:border-[#0B5CFF]/40 hover:text-[#0B5CFF]"><FileText className="hidden" />{l}</Link>
        ))}
      </nav>
    </div>
  );
}
