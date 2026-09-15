import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { CrmScreen, crmDate, crmMoney, crmPrimaryBtn } from "@/components/amplivanta/crm-screen";
import { ResourceDialog } from "@/components/amplivanta/crud/resource-dialog";
import { dealFields } from "@/components/amplivanta/crm/crm-fields";
import { loadStageOptions } from "@/lib/server/loaders";
import { crmContext, ownerNames } from "@/lib/server/crm-screens";

export const metadata: Metadata = { title: "Deal Detail" };
export const dynamic = "force-dynamic";

type SP = { id?: string; q?: string };

export default async function DealDetailPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const ctx = await crmContext();
  const stages = await loadStageOptions();
  let reachable = Boolean(ctx);
  let rows: React.ReactNode[][] = [];
  let stats: (string | null)[] = [null, null, null, null];
  let activityCount: string | null = null;
  let related: { contacts: number; records: string | null } = { contacts: 0, records: null };
  let notes: string | null = null;

  if (ctx && sp.id) {
    try {
      // Workspace-scoped lookup: a deal id from another workspace resolves to nothing.
      const deal = await db.deal.findFirst({
        where: { id: sp.id, workspaceId: ctx.workspaceId },
        select: {
          id: true, name: true, value: true, currency: true, status: true, closeDate: true, ownerId: true, updatedAt: true,
          stage: { select: { name: true } },
          pipeline: { select: { name: true } },
          company: { select: { name: true } },
          contact: { select: { name: true, firstName: true, lastName: true } },
          activities: { orderBy: { createdAt: "desc" }, take: 5, select: { subject: true, type: true, createdAt: true } },
          _count: { select: { activities: true, members: true } },
        },
      });
      if (deal) {
        const owner = deal.ownerId ? (await ownerNames([deal.ownerId])).get(deal.ownerId) ?? null : null;
        const contactName = deal.contact ? deal.contact.name ?? [deal.contact.firstName, deal.contact.lastName].filter(Boolean).join(" ") : null;
        const updated = crmDate(deal.updatedAt);
        rows = (
          [
            ["Deal", deal.name],
            ["Company", deal.company?.name ?? null],
            ["Primary contact", contactName],
            ["Pipeline", deal.pipeline?.name ?? null],
            ["Stage", deal.stage?.name ?? null],
            ["Value", crmMoney(deal.value, deal.currency)],
          ] as [string, string | null][]
        ).map(([field, value]) => [field, value, deal.status, updated, owner, "—"]);
        stats = [owner, deal.stage?.name ?? null, crmMoney(deal.value, deal.currency), crmDate(deal.closeDate)];
        activityCount = deal._count.activities.toLocaleString("en-US");
        related = { contacts: deal._count.members, records: (deal._count.members + (deal.company ? 1 : 0) + (deal.contact ? 1 : 0)).toLocaleString("en-US") };
        notes = deal.activities.length
          ? deal.activities.map((a) => `${a.subject ?? a.type} (${crmDate(a.createdAt)})`).join(" · ")
          : null;
      }
    } catch {
      reachable = false;
    }
  }

  const create = (label: string) => (
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
      crumb="Deal Detail"
      title="Deal Detail"
      subtitle="Review deal activity, related records, and next steps."
      primaryAction={create("+ Create Deal")}
      stats={[
        { label: "Deal Owner", value: stats[0] },
        { label: "Stage", value: stats[1] },
        { label: "Value", value: stats[2] },
        { label: "Expected Close", value: stats[3] },
      ]}
      table={{
        title: "Deal Overview",
        action: "/app/crm/deals",
        q: sp.q ?? "",
        selects: [],
        columns: ["Field", "Value", "Status", "Updated", "Owner", "Actions"],
        rows,
        reachable,
        empty: {
          title: "No deal selected",
          body: "Select a deal from the list or create one to view its details.",
          action: (
            <div className="flex flex-wrap justify-center gap-2.5">
              <Link href="/app/crm/deals" className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-[14px] font-bold text-deep-navy hover:bg-bg-soft">
                Choose a deal
              </Link>
              {create("Create Deal")}
            </div>
          ),
        },
      }}
      rail={[
        { title: "Next Actions", rows: [["Current", activityCount], ["Available", null]], manage: { href: "/app/crm/task-management" } },
        { title: "Related Records", rows: [["Records", related.records], ["Status", related.records ? "Live" : null]] },
      ]}
      insights={{ title: "Activity & Notes", body: notes }}
    />
  );
}
