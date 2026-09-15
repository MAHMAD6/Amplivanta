import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CrmScreen, crmDate, crmPrimaryBtn, daysAgo } from "@/components/amplivanta/crm-screen";
import { ResourceDialog } from "@/components/amplivanta/crud/resource-dialog";
import { ACTIVITY_FIELDS } from "@/components/amplivanta/crm/crm-fields";
import { CREATED_WINDOWS, crmContext, ownerOptions, since } from "@/lib/server/crm-screens";

export const metadata: Metadata = { title: "Activities" };
export const dynamic = "force-dynamic";

type SP = { q?: string; created?: string; owner?: string; type?: string };

const TYPES: [string, string][] = [["call", "Call"], ["email", "Email"], ["meeting", "Meeting"], ["note", "Note"], ["other", "Other"]];

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const ctx = await crmContext();
  let reachable = Boolean(ctx);
  let rows: React.ReactNode[][] = [];
  let total = 0;
  let stats: (string | null)[] = [null, null, null, null];
  let owners: [string, string][] = [];

  if (ctx) {
    try {
      const w = ctx.workspaceId;
      const created = since(sp.created);
      const [items, count, recent, linked, types] = await Promise.all([
        db.activity.findMany({
          where: {
            workspaceId: w,
            ...(sp.q ? { subject: { contains: sp.q, mode: "insensitive" } } : {}),
            ...(sp.owner ? { userId: sp.owner } : {}),
            ...(sp.type ? { type: sp.type } : {}),
            ...(created ? { createdAt: { gte: created } } : {}),
          },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true, subject: true, type: true, createdAt: true,
            user: { select: { name: true, email: true } },
            contact: { select: { name: true, firstName: true, lastName: true } },
            deal: { select: { name: true } },
          },
        }),
        db.activity.count({ where: { workspaceId: w } }),
        db.activity.count({ where: { workspaceId: w, createdAt: { gte: daysAgo(7) } } }),
        db.activity.count({ where: { workspaceId: w, OR: [{ contactId: { not: null } }, { dealId: { not: null } }] } }),
        db.activity.groupBy({ by: ["type"], where: { workspaceId: w } }),
      ]);
      total = count;
      owners = await ownerOptions(w);
      rows = items.map((a) => [
        a.subject ?? a.type,
        a.deal?.name ?? (a.contact ? a.contact.name ?? [a.contact.firstName, a.contact.lastName].filter(Boolean).join(" ") : null),
        TYPES.find(([v]) => v === a.type)?.[1] ?? a.type,
        a.user?.name ?? a.user?.email ?? null,
        crmDate(a.createdAt),
        "—",
      ]);
      const n = (v: number) => (count > 0 ? v.toLocaleString("en-US") : null);
      stats = [n(count), n(recent), n(linked), n(types.length)];
    } catch {
      reachable = false;
    }
  }

  const log = (label: string) => (
    <ResourceDialog
      title="Log Activity"
      description="Record a call, email, meeting or note."
      fields={ACTIVITY_FIELDS}
      endpoint="/api/activities"
      submitLabel="Log activity"
      successMessage="Activity logged"
      trigger={<button className={crmPrimaryBtn}>{label}</button>}
    />
  );

  return (
    <CrmScreen
      crumb="Activities"
      title="Activities"
      subtitle="Log and review CRM interactions, follow-ups, and engagement history."
      primaryAction={log("+ Log Activity")}
      stats={[
        { label: "Total Activities", value: stats[0], hint: "All time" },
        { label: "Recent Activity", value: stats[1], hint: "Last 7 days" },
        { label: "Linked Records", value: stats[2], hint: "Linked to a contact or deal" },
        { label: "Activity Types", value: stats[3], hint: "Distinct types logged" },
      ]}
      table={{
        title: "Activity Timeline",
        action: "/app/crm/activities",
        q: sp.q ?? "",
        selects: [
          { name: "created", label: "Filters", value: sp.created ?? "", options: CREATED_WINDOWS },
          { name: "owner", label: "Owner", value: sp.owner ?? "", options: owners },
          { name: "type", label: "Status", value: sp.type ?? "", options: TYPES },
        ],
        columns: ["Activity", "Related To", "Type", "Owner", "Date", "Actions"],
        rows,
        reachable,
        empty: { title: "No activities yet", body: "Log calls, emails, meetings, notes, or other CRM interactions.", action: log("Log Activity") },
      }}
      rail={[
        { title: "Activity Templates", rows: [["Current", null], ["Available", null]] },
        { title: "Activity Filters", rows: [["Records", total ? total.toLocaleString("en-US") : null], ["Status", total ? "Live" : null]] },
      ]}
      insights={{ title: "Activity Insights" }}
    />
  );
}
