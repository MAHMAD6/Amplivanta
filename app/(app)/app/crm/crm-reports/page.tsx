import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CrmScreen, crmDate, crmPrimaryBtn } from "@/components/amplivanta/crm-screen";
import { ResourceDialog } from "@/components/amplivanta/crud/resource-dialog";
import { REPORT_FIELDS } from "@/components/amplivanta/crm/crm-fields";
import { CREATED_WINDOWS, crmContext, since } from "@/lib/server/crm-screens";

export const metadata: Metadata = { title: "CRM Reports" };
export const dynamic = "force-dynamic";

type SP = { q?: string; created?: string; type?: string };

const TYPES: [string, string][] = [["pipeline", "Pipeline"], ["contacts", "Contacts"], ["deals", "Deals"], ["activities", "Activities"], ["tasks", "Tasks"]];
const CRM_TYPES = TYPES.map(([v]) => v);

export default async function CrmReportsPage({ searchParams }: { searchParams: Promise<SP> }) {
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
      const [reports, count, sources] = await Promise.all([
        db.report.findMany({
          where: {
            workspaceId: w,
            type: sp.type ? sp.type : { in: CRM_TYPES },
            ...(sp.q ? { name: { contains: sp.q, mode: "insensitive" } } : {}),
            ...(created ? { createdAt: { gte: created } } : {}),
          },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: { id: true, name: true, type: true, createdAt: true },
        }),
        db.report.count({ where: { workspaceId: w, type: { in: CRM_TYPES } } }),
        db.integration.count({ where: { workspaceId: w, status: "connected" } }),
      ]);
      total = count;
      rows = reports.map((r) => [r.name, TYPES.find(([v]) => v === r.type)?.[1] ?? r.type, null, crmDate(r.createdAt), "Not scheduled", "—"]);
      // Scheduling and sharing are not implemented, so those stay neutral.
      stats = [count > 0 ? count.toLocaleString("en-US") : null, null, null, sources > 0 ? sources.toLocaleString("en-US") : null];
    } catch {
      reachable = false;
    }
  }

  const create = (label: string) => (
    <ResourceDialog
      title="New Report"
      description="Save a CRM report definition."
      fields={REPORT_FIELDS}
      endpoint="/api/reports"
      submitLabel="Create report"
      successMessage="Report created"
      trigger={<button className={crmPrimaryBtn}>{label}</button>}
    />
  );

  return (
    <CrmScreen
      crumb="CRM Reports"
      title="CRM Reports"
      subtitle="Build and review CRM summaries, pipeline analysis, and contact performance reports."
      primaryAction={create("+ Create Report")}
      stats={[
        { label: "Saved Reports", value: stats[0], hint: "CRM report definitions" },
        { label: "Scheduled Reports", value: stats[1] },
        { label: "Shared Reports", value: stats[2] },
        { label: "Connected Sources", value: stats[3], hint: "Connected integrations" },
      ]}
      table={{
        title: "Report Library",
        action: "/app/crm/crm-reports",
        q: sp.q ?? "",
        selects: [
          { name: "created", label: "Filters", value: sp.created ?? "", options: CREATED_WINDOWS },
          { name: "type", label: "Status", value: sp.type ?? "", options: TYPES },
        ],
        columns: ["Report", "Type", "Owner", "Updated", "Schedule", "Actions"],
        rows,
        reachable,
        empty: {
          title: "No reports yet",
          body: "Create a report when CRM data sources and report definitions are available.",
          action: create("Create Report"),
        },
      }}
      rail={[
        { title: "Scheduled Reports", rows: [["Current", null], ["Available", null]] },
        { title: "Report Filters", rows: [["Records", total ? total.toLocaleString("en-US") : null], ["Status", total ? "Live" : null]] },
      ]}
      insights={{ title: "Report Insights" }}
    />
  );
}
