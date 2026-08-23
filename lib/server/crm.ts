import { formatDistanceToNow } from "date-fns";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { CONTACTS, type Contact, type DealStage } from "@/lib/crm-data";

const STAGE_BY_STATUS: Record<string, DealStage> = {
  new: "New",
  qualified: "Qualified",
  engaged: "Proposal",
  customer: "Won",
};

/**
 * Loads workspace contacts and maps them into the CRM UI's Contact shape.
 * Falls back to the static sample set when unauthenticated or empty, so the
 * page design always renders.
 */
export async function loadContacts(): Promise<{ contacts: Contact[]; live: boolean }> {
  try {
    const ctx = await getSessionContext();
    const rows = await db.contact.findMany({
      where: { workspaceId: ctx.workspaceId },
      include: { company: { select: { name: true, industry: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    if (rows.length === 0) throw new Error("empty");

    const contacts: Contact[] = rows.map((c) => ({
      id: c.id,
      name: [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email || "Unknown",
      role: c.jobTitle ?? "—",
      company: c.company?.name ?? "—",
      email: c.email ?? "—",
      phone: c.phone ?? "—",
      leadScore: c.leadScore ?? 50,
      stage: STAGE_BY_STATUS[c.status] ?? "New",
      owner: "Alex Johnson",
      lastActivity: formatDistanceToNow(c.updatedAt, { addSuffix: true }),
      tags: c.company?.industry ? [c.company.industry] : [],
      location: "—",
      timezone: "—",
      createdAt: c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      source: "—",
    }));
    return { contacts, live: true };
  } catch {
    return { contacts: CONTACTS, live: false };
  }
}
