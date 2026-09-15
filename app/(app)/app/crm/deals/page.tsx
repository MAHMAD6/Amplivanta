import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { CrmScreen, crmDate, crmMoney, crmPrimaryBtn, daysAgo } from "@/components/amplivanta/crm-screen";
import { ResourceDialog } from "@/components/amplivanta/crud/resource-dialog";
import { dealFields } from "@/components/amplivanta/crm/crm-fields";
import { loadStageOptions } from "@/lib/server/loaders";
import { CREATED_WINDOWS, crmContext, ownerOptions, since } from "@/lib/server/crm-screens";

export const metadata: Metadata = { title: "Deals" };
export const dynamic = "force-dynamic";

type SP = { q?: string; created?: string; owner?: string; status?: string };

export default async function DealsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const ctx = await crmContext();
  const stages = await loadStageOptions();
  let reachable = Boolean(ctx);
  let rows: React.ReactNode[][] = [];
  let total = 0;
  let stats: (string | null)[] = [null, null, null, null];
  let owners: [string, string][] = [];
  let pipelines: string | null = null;

  if (ctx) {
    try {
      const w = ctx.workspaceId;
      const created = since(sp.created);
      const [deals, count, openAgg, stageCount, usedStages, acts, pipelineCount] = await Promise.all([
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
          select: {
            id: true, name: true, closeDate: true,
            company: { select: { name: true } },
            pipeline: { select: { name: true } },
            stage: { select: { name: true } },
          },
        }),
        db.deal.count({ where: { workspaceId: w } }),
        db.deal.aggregate({ where: { workspaceId: w, status: "open" }, _sum: { value: true }, _count: true }),
        db.stage.count({ where: { workspaceId: w } }),
        db.deal.groupBy({ by: ["stageId"], where: { workspaceId: w, status: "open", stageId: { not: null } } }),
        db.activity.count({ where: { workspaceId: w, dealId: { not: null }, createdAt: { gte: daysAgo(30) } } }),
        db.pipeline.count({ where: { workspaceId: w } }),
      ]);
      total = count;
      owners = await ownerOptions(w);
      rows = deals.map((d) => [
        d.name,
        d.company?.name ?? null,
        d.pipeline?.name ?? null,
        d.stage?.name ?? null,
        crmDate(d.closeDate),
        <Link key={d.id} href={`/app/crm/deal-detail?id=${d.id}`} className="font-semibold text-[#0B5CFF] hover:underline">View</Link>,
      ]);
      stats = [
        count > 0 ? openAgg._count.toLocaleString("en-US") : null,
        stageCount > 0 ? `${usedStages.length} of ${stageCount}` : null,
        openAgg._count > 0 ? crmMoney(openAgg._sum.value ?? 0) : null,
        count > 0 ? acts.toLocaleString("en-US") : null,
      ];
      pipelines = pipelineCount.toLocaleString("en-US");
    } catch {
      reachable = false;
    }
  }

  const add = (label: string) => (
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
      crumb="Deals"
      title="Deals"
      subtitle="Track opportunities and manage deal progression across your workspace."
      primaryAction={add("+ Add Deal")}
      stats={[
        { label: "Open Deals", value: stats[0], hint: "Currently open" },
        { label: "Stage Coverage", value: stats[1], hint: "Stages with open deals" },
        { label: "Pipeline Value", value: stats[2], hint: "Open deal value" },
        { label: "Deal Activity", value: stats[3], hint: "Activities, last 30 days" },
      ]}
      table={{
        title: "Deals",
        action: "/app/crm/deals",
        q: sp.q ?? "",
        selects: [
          { name: "created", label: "Filters", value: sp.created ?? "", options: CREATED_WINDOWS },
          { name: "owner", label: "Owner", value: sp.owner ?? "", options: owners },
          { name: "status", label: "Status", value: sp.status ?? "", options: [["open", "Open"], ["won", "Won"], ["lost", "Lost"]] },
        ],
        columns: ["Deal", "Company", "Pipeline", "Stage", "Close Date", "Actions"],
        rows,
        reachable,
        empty: { title: "No deals yet", body: "Create your first deal and move it through the configured pipeline.", action: add("Add Deal") },
      }}
      rail={[
        { title: "Pipeline Views", rows: [["Current", pipelines], ["Available", pipelines]] },
        { title: "Deal Summary", rows: [["Records", total ? total.toLocaleString("en-US") : null], ["Status", total ? "Live" : null]] },
      ]}
      insights={{ title: "Deal Insights" }}
    />
  );
}
