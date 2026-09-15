import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CrmScreen, crmDate, crmPrimaryBtn, daysAgo } from "@/components/amplivanta/crm-screen";
import { ResourceDialog } from "@/components/amplivanta/crud/resource-dialog";
import { CONTACT_FIELDS } from "@/components/amplivanta/crm/crm-fields";
import { CREATED_WINDOWS, crmContext, since } from "@/lib/server/crm-screens";

export const metadata: Metadata = { title: "Contacts" };
export const dynamic = "force-dynamic";

type SP = { q?: string; created?: string; status?: string };

const STAGES: [string, string][] = [["new", "New"], ["qualified", "Qualified"], ["engaged", "Engaged"], ["customer", "Customer"]];

export default async function ContactsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const ctx = await crmContext();
  let reachable = Boolean(ctx);
  let rows: React.ReactNode[][] = [];
  let total = 0;
  let stats: (string | null)[] = [null, null, null, null];
  let segments: string | null = null;

  if (ctx) {
    try {
      const w = ctx.workspaceId;
      const created = since(sp.created);
      const [contacts, count, updated, added, acts, segCount] = await Promise.all([
        db.contact.findMany({
          where: {
            workspaceId: w,
            ...(sp.q
              ? { OR: [{ name: { contains: sp.q, mode: "insensitive" } }, { firstName: { contains: sp.q, mode: "insensitive" } }, { lastName: { contains: sp.q, mode: "insensitive" } }, { email: { contains: sp.q, mode: "insensitive" } }] }
              : {}),
            ...(sp.status ? { status: sp.status } : {}),
            ...(created ? { createdAt: { gte: created } } : {}),
          },
          orderBy: { updatedAt: "desc" },
          take: 50,
          select: {
            id: true, name: true, firstName: true, lastName: true, email: true, companyName: true, status: true,
            company: { select: { name: true } },
            activities: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
          },
        }),
        db.contact.count({ where: { workspaceId: w } }),
        db.contact.count({ where: { workspaceId: w, updatedAt: { gte: daysAgo(30) } } }),
        db.contact.count({ where: { workspaceId: w, createdAt: { gte: daysAgo(7) } } }),
        db.activity.count({ where: { workspaceId: w, contactId: { not: null }, createdAt: { gte: daysAgo(30) } } }),
        db.segment.count({ where: { workspaceId: w } }),
      ]);
      total = count;
      rows = contacts.map((c) => [
        c.name ?? ([c.firstName, c.lastName].filter(Boolean).join(" ") || "Unnamed contact"),
        c.email,
        c.company?.name ?? c.companyName,
        STAGES.find(([v]) => v === c.status)?.[1] ?? c.status,
        crmDate(c.activities[0]?.createdAt),
        "—",
      ]);
      const n = (v: number) => (count > 0 ? v.toLocaleString("en-US") : null);
      stats = [n(count), n(updated), n(added), n(acts)];
      segments = segCount.toLocaleString("en-US");
    } catch {
      reachable = false;
    }
  }

  const add = (label: string) => (
    <ResourceDialog
      title="New Contact"
      description="Add a contact to this workspace."
      fields={CONTACT_FIELDS}
      endpoint="/api/contacts"
      submitLabel="Create contact"
      successMessage="Contact created"
      trigger={<button className={crmPrimaryBtn}>{label}</button>}
    />
  );

  return (
    <CrmScreen
      crumb="Contacts"
      title="Contacts"
      subtitle="Manage people, relationships, and engagement across your workspace."
      primaryAction={add("+ Add Contact")}
      stats={[
        { label: "Total Contacts", value: stats[0], hint: "In this workspace" },
        { label: "Updated Records", value: stats[1], hint: "Last 30 days" },
        { label: "Recently Added", value: stats[2], hint: "Last 7 days" },
        { label: "Contact Activity", value: stats[3], hint: "Logged activities, last 30 days" },
      ]}
      table={{
        title: "Contacts",
        action: "/app/crm/contacts",
        q: sp.q ?? "",
        selects: [
          { name: "created", label: "Filters", value: sp.created ?? "", options: CREATED_WINDOWS },
          { name: "status", label: "Status", value: sp.status ?? "", options: STAGES },
        ],
        columns: ["Name", "Email", "Company", "Lifecycle Stage", "Last Activity", "Actions"],
        rows,
        reachable,
        empty: { title: "No contacts yet", body: "Add, import, or sync contacts to start building your CRM.", action: add("Add Contact") },
      }}
      rail={[
        { title: "Smart Segments", rows: [["Current", segments], ["Available", segments]], manage: { href: "/app/crm/lists-imports" } },
        { title: "Contact Views", rows: [["Records", total ? total.toLocaleString("en-US") : null], ["Status", total ? "Live" : null]] },
      ]}
      insights={{ title: "Contact Insights" }}
    />
  );
}
