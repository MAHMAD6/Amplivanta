import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { CrmScreen, crmDate, crmMoney, crmPrimaryBtn, daysAgo } from "@/components/amplivanta/crm-screen";
import { ResourceDialog } from "@/components/amplivanta/crud/resource-dialog";
import { dealFields } from "@/components/amplivanta/crm/crm-fields";
import { loadStageOptions } from "@/lib/server/loaders";
import { CREATED_WINDOWS, crmContext, ownerNames, ownerOptions, since } from "@/lib/server/crm-screens";

export const metadata: Metadata = { title: "CRM Dashboard / Pipeline" };
export const dynamic = "force-dynamic";

type SP = { q?: string; created?: string; owner?: string; status?: string };

export default async function CrmPipelinePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const ctx = await crmContext();
  const stages = await loadStageOptions();

  let reachable = Boolean(ctx);
  let rows: React.ReactNode[][] = [];
  let stats = { pipelineValue: null as string | null, stageSpread: null as string | null, dealActivity: null as string | null, recent: null as string | null };
  let rail = { dueSoon: null as string | null, openTasks: null as string | null, deals: 0 };
  let owners: [string, string][] = [];

  if (ctx) {
    try {
      const w = ctx.workspaceId;
      const created = since(sp.created);
      const [deals, openAgg, stageCount, usedStages, dealActs, recentActs, dueSoon, openTasks, dealTotal] = await Promise.all([
        db.deal.findMany({
          where: {
            workspaceId: w,
            ...(sp.q ? { name: { contains: sp.q, mode: "insensitive" } } : {}),
            ...(sp.owner ? { ownerId: sp.owner } : {}),
            ...(sp.status ? { status: sp.status } : {}),
            ...(created ? { createdAt: { gte: created } } : {}),
          },
          orderBy: { updatedAt: "desc" },
          take: 50,
          select: { id: true, name: true, value: true, currency: true, ownerId: true, company: { select: { name: true } }, stage: { select: { name: true } } },
        }),
        db.deal.aggregate({ where: { workspaceId: w, status: "open" }, _sum: { value: true }, _count: true }),
        db.stage.count({ where: { workspaceId: w } }),
        db.deal.groupBy({ by: ["stageId"], where: { workspaceId: w, status: "open", stageId: { not: null } } }),
        db.activity.count({ where: { workspaceId: w, dealId: { not: null }, createdAt: { gte: daysAgo(30) } } }),
        db.activity.count({ where: { workspaceId: w, createdAt: { gte: daysAgo(7) } } }),
        db.task.count({ where: { workspaceId: w, isCompleted: false, dueDate: { gte: new Date(), lte: daysAgo(-7) } } }),
        db.task.count({ where: { workspaceId: w, isCompleted: false } }),
        db.deal.count({ where: { workspaceId: w } }),
      ]);
      const names = await ownerNames(deals.map((d) => d.ownerId));
      owners = await ownerOptions(w);
      rows = deals.map((d) => [
        d.name,
        d.company?.name ?? null,
        d.stage?.name ?? null,
        d.ownerId ? names.get(d.ownerId) ?? null : null,
        crmMoney(d.value, d.currency),
        <Link key={d.id} href={`/app/crm/deal-detail?id=${d.id}`} className="font-semibold text-[#0B5CFF] hover:underline">View</Link>,
      ]);
      stats = {
        pipelineValue: openAgg._count > 0 ? crmMoney(openAgg._sum.value ?? 0) : null,
        stageSpread: stageCount > 0 ? `${usedStages.length} of ${stageCount}` : null,
        dealActivity: dealTotal > 0 ? dealActs.toLocaleString("en-US") : null,
        recent: recentActs > 0 ? recentActs.toLocaleString("en-US") : null,
      };
      rail = { dueSoon: dueSoon.toLocaleString("en-US"), openTasks: openTasks.toLocaleString("en-US"), deals: dealTotal };
    } catch {
      reachable = false;
    }
  }

  const addDeal = (label: string) => (
    <ResourceDialog
      title="New Deal"
      description="Add a deal to this workspace's pipeline."
      fields={dealFields(stages)}
      endpoint="/api/deals"
      submitLabel="Create deal"
      successMessage="Deal created"
      trigger={<button className={crmPrimaryBtn}>{label}</button>}
    />
  );

  return (
    <CrmScreen
      crumb="CRM Dashboard / Pipeline"
      title="CRM Dashboard / Pipeline"
      subtitle="Manage your CRM pipeline, activities, and follow-up work across your workspace."
      primaryAction={addDeal("+ Add Deal")}
      stats={[
        { label: "Pipeline Overview", value: stats.pipelineValue, hint: "Open pipeline value" },
        { label: "Stage Distribution", value: stats.stageSpread, hint: "Stages with open deals" },
        { label: "Deal Activity", value: stats.dealActivity, hint: "Deal activities, last 30 days" },
        { label: "Recent CRM Activity", value: stats.recent, hint: "Activities, last 7 days" },
      ]}
      table={{
        title: "Pipeline Board Preview",
        action: "/app/crm",
        q: sp.q ?? "",
        selects: [
          { name: "created", label: "Filters", value: sp.created ?? "", options: CREATED_WINDOWS },
          { name: "owner", label: "Owner", value: sp.owner ?? "", options: owners },
          { name: "status", label: "Status", value: sp.status ?? "", options: [["open", "Open"], ["won", "Won"], ["lost", "Lost"]] },
        ],
        columns: ["Deal", "Company", "Stage", "Owner", "Value", "Actions"],
        rows,
        reachable,
        empty: {
          title: "Your pipeline is empty",
          body: "Deals and pipeline stages will appear here when CRM records are available.",
          action: addDeal("Add Deal"),
        },
      }}
      rail={[
        { title: "Tasks Due", rows: [["Current", rail.dueSoon], ["Available", rail.openTasks]], manage: { href: "/app/crm/task-management" } },
        { title: "Quick Actions", rows: [["Records", rail.deals ? rail.deals.toLocaleString("en-US") : null], ["Status", rail.deals ? "Live" : null]] },
      ]}
      insights={{ title: "CRM Insights" }}
    />
  );
}
