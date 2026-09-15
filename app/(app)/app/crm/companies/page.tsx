import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CrmScreen, crmDate, crmPrimaryBtn, daysAgo } from "@/components/amplivanta/crm-screen";
import { ResourceDialog } from "@/components/amplivanta/crud/resource-dialog";
import { COMPANY_FIELDS } from "@/components/amplivanta/crm/crm-fields";
import { CREATED_WINDOWS, crmContext, since } from "@/lib/server/crm-screens";

export const metadata: Metadata = { title: "Companies" };
export const dynamic = "force-dynamic";

type SP = { q?: string; created?: string; industry?: string };

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const ctx = await crmContext();
  let reachable = Boolean(ctx);
  let rows: React.ReactNode[][] = [];
  let total = 0;
  let stats: (string | null)[] = [null, null, null, null];
  let industries: [string, string][] = [];

  if (ctx) {
    try {
      const w = ctx.workspaceId;
      const created = since(sp.created);
      const [companies, count, byIndustry, added, withDeals] = await Promise.all([
        db.company.findMany({
          where: {
            workspaceId: w,
            ...(sp.q ? { name: { contains: sp.q, mode: "insensitive" } } : {}),
            ...(sp.industry ? { industry: sp.industry } : {}),
            ...(created ? { createdAt: { gte: created } } : {}),
          },
          orderBy: { updatedAt: "desc" },
          take: 50,
          select: { id: true, name: true, industry: true, location: true, updatedAt: true },
        }),
        db.company.count({ where: { workspaceId: w } }),
        db.company.groupBy({ by: ["industry"], where: { workspaceId: w, industry: { not: null } } }),
        db.company.count({ where: { workspaceId: w, createdAt: { gte: daysAgo(7) } } }),
        db.company.count({ where: { workspaceId: w, deals: { some: { updatedAt: { gte: daysAgo(30) } } } } }),
      ]);
      total = count;
      industries = byIndustry.map((i) => [i.industry as string, i.industry as string]);
      rows = companies.map((c) => [c.name, c.industry, null, c.location, crmDate(c.updatedAt), "—"]);
      const n = (v: number) => (count > 0 ? v.toLocaleString("en-US") : null);
      stats = [n(count), n(byIndustry.length), n(added), n(withDeals)];
    } catch {
      reachable = false;
    }
  }

  const add = (label: string) => (
    <ResourceDialog
      title="New Company"
      description="Add a company to this workspace."
      fields={COMPANY_FIELDS}
      endpoint="/api/companies"
      submitLabel="Create company"
      successMessage="Company created"
      trigger={<button className={crmPrimaryBtn}>{label}</button>}
    />
  );

  return (
    <CrmScreen
      crumb="Companies"
      title="Companies"
      subtitle="Manage business accounts and company records across your workspace."
      primaryAction={add("+ Add Company")}
      stats={[
        { label: "Total Companies", value: stats[0], hint: "In this workspace" },
        { label: "Industries", value: stats[1], hint: "Distinct industries" },
        { label: "Recently Added", value: stats[2], hint: "Last 7 days" },
        { label: "Company Activity", value: stats[3], hint: "With deals updated in 30 days" },
      ]}
      table={{
        title: "Companies",
        action: "/app/crm/companies",
        q: sp.q ?? "",
        selects: [
          { name: "created", label: "Filters", value: sp.created ?? "", options: CREATED_WINDOWS },
          { name: "industry", label: "Industry", value: sp.industry ?? "", options: industries },
        ],
        columns: ["Company", "Industry", "Owner", "Location", "Last Activity", "Actions"],
        rows,
        reachable,
        empty: { title: "No companies yet", body: "Add companies to organize and manage business relationships.", action: add("Add Company") },
      }}
      rail={[
        { title: "Saved Views", rows: [["Current", null], ["Available", null]] },
        { title: "Company Filters", rows: [["Records", total ? total.toLocaleString("en-US") : null], ["Status", total ? "Live" : null]] },
      ]}
      insights={{ title: "Company Insights" }}
    />
  );
}
