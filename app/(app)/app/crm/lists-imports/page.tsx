import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CrmScreen, crmDate, crmPrimaryBtn } from "@/components/amplivanta/crm-screen";
import { ResourceDialog } from "@/components/amplivanta/crud/resource-dialog";
import { LIST_FIELDS } from "@/components/amplivanta/crm/crm-fields";
import { CREATED_WINDOWS, crmContext, since } from "@/lib/server/crm-screens";

export const metadata: Metadata = { title: "Lists & Imports" };
export const dynamic = "force-dynamic";

type SP = { q?: string; created?: string; kind?: string };

/** A list with filter criteria is smart (re-evaluated); an empty one is static. */
const isSmart = (criteria: unknown) =>
  Boolean(criteria && typeof criteria === "object" && Object.keys(criteria as object).length > 0);

export default async function ListsImportsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const ctx = await crmContext();
  let reachable = Boolean(ctx);
  let rows: React.ReactNode[][] = [];
  let total = 0;
  let stats: (string | null)[] = [null, null, null, null];

  if (ctx) {
    try {
      const w = ctx.workspaceId;
      const created = since(sp.created);
      const [lists, all, importJobs] = await Promise.all([
        db.segment.findMany({
          where: {
            workspaceId: w,
            ...(sp.q ? { name: { contains: sp.q, mode: "insensitive" } } : {}),
            ...(created ? { createdAt: { gte: created } } : {}),
          },
          orderBy: { updatedAt: "desc" },
          take: 100,
          select: { id: true, name: true, filterCriteria: true, memberCount: true, updatedAt: true },
        }),
        db.segment.findMany({ where: { workspaceId: w }, select: { filterCriteria: true } }),
        db.dataTransferJob.count({ where: { workspaceId: w, kind: "import" } }),
      ]);
      total = all.length;
      const smart = all.filter((s) => isSmart(s.filterCriteria)).length;
      const filtered = sp.kind ? lists.filter((l) => (sp.kind === "smart") === isSmart(l.filterCriteria)) : lists;
      rows = filtered.map((l) => [
        l.name,
        isSmart(l.filterCriteria) ? "Smart" : "Static",
        l.memberCount.toLocaleString("en-US"),
        null,
        crmDate(l.updatedAt),
        "—",
      ]);
      stats = [total ? total.toLocaleString("en-US") : null, total ? smart.toLocaleString("en-US") : null, total ? (total - smart).toLocaleString("en-US") : null, importJobs ? importJobs.toLocaleString("en-US") : null];
    } catch {
      reachable = false;
    }
  }

  const create = (label: string) => (
    <ResourceDialog
      title="New List"
      description="Create a list to organize CRM records."
      fields={LIST_FIELDS}
      endpoint="/api/segments"
      submitLabel="Create list"
      successMessage="List created"
      trigger={<button className={crmPrimaryBtn}>{label}</button>}
    />
  );

  return (
    <CrmScreen
      crumb="Lists & Imports"
      title="Lists & Imports"
      subtitle="Organize CRM records into reusable lists and import data into your workspace."
      primaryAction={create("+ Create List")}
      stats={[
        { label: "Saved Lists", value: stats[0], hint: "All lists" },
        { label: "Smart Lists", value: stats[1], hint: "Rule-based lists" },
        { label: "Static Lists", value: stats[2], hint: "Fixed membership" },
        { label: "Import Jobs", value: stats[3] },
      ]}
      table={{
        title: "List Library",
        action: "/app/crm/lists-imports",
        q: sp.q ?? "",
        selects: [
          { name: "created", label: "Filters", value: sp.created ?? "", options: CREATED_WINDOWS },
          { name: "kind", label: "Status", value: sp.kind ?? "", options: [["smart", "Smart"], ["static", "Static"]] },
        ],
        columns: ["List", "Type", "Records", "Owner", "Updated", "Actions"],
        rows,
        reachable,
        empty: { title: "No lists yet", body: "Create a list or import records to organize your CRM workspace.", action: create("Create List") },
      }}
      rail={[
        { title: "Import Center", rows: [["Current", null], ["Available", null]], manage: { href: "/app/integrations/import-export", label: "Open Import Center" } },
        { title: "Import Options", rows: [["Records", total ? total.toLocaleString("en-US") : null], ["Status", total ? "Live" : null]] },
      ]}
      insights={{ title: "Import History" }}
    />
  );
}
