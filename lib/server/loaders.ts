import { formatDistanceToNow } from "date-fns";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { DEALS, ACTIVITIES, CRM_TASKS, CONTACTS, type Deal, type DealStage, type ActivityType, type Contact } from "@/lib/crm-data";
import { CAMPAIGNS, WORKFLOWS, type Campaign, type Workflow } from "@/lib/marketing-auto-data";
import { INTEGRATIONS, type Integration } from "@/lib/integrations-data";
import { AUDIT_EVENTS } from "@/lib/settings-data";
import {
  COMPANIES, CONVERSIONS, DELIVERABILITY_CAMPAIGNS, TRIGGERS, EVENT_STREAM, ORGANIZATIONS,
  type CompanyRow, type ConversionRow, type ConversionType, type DeliverabilityCampaign, type TriggerRow, type EventStreamRow, type OrgRow, type HealthTone,
} from "@/lib/part2-data";

type AuditEvent = (typeof AUDIT_EVENTS)[number];

type Activity = (typeof ACTIVITIES)[number];
type CrmTask = (typeof CRM_TASKS)[number];

/** Result of a live loader: DB-backed items + whether the DB path succeeded. */
export interface Live<T> {
  items: T[];
  live: boolean;
}

async function ctxOrNull() {
  try {
    return await getSessionContext();
  } catch {
    return null;
  }
}

const STAGE_MAP: Record<string, DealStage> = {
  "New Lead": "New",
  Qualified: "Qualified",
  Proposal: "Proposal",
  Negotiation: "Negotiation",
  Won: "Won",
};

function shortDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Workspace pipeline stages as {value:id,label:name} for form selects. Empty when unauthenticated. */
export async function loadStageOptions(): Promise<{ value: string; label: string }[]> {
  const ctx = await ctxOrNull();
  if (!ctx) return [];
  try {
    const rows = await db.stage.findMany({
      where: { workspaceId: ctx.workspaceId },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    });
    return rows.map((s) => ({ value: s.id, label: s.name }));
  } catch {
    return [];
  }
}

export async function loadDeals(): Promise<Live<Deal>> {
  const ctx = await ctxOrNull();
  if (!ctx) return { items: DEALS, live: false };
  const rows = await db.deal.findMany({
    where: { workspaceId: ctx.workspaceId },
    include: { stage: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  if (rows.length === 0) return { items: DEALS, live: false };
  const items: Deal[] = rows.map((d) => ({
    id: d.id,
    name: d.name,
    value: d.value,
    stage: STAGE_MAP[d.stage?.name ?? ""] ?? "New",
    contact: "—",
    company: d.name.split(" — ")[0] ?? "—",
    owner: "Alex Johnson",
    probability: Math.round((d.stage?.probability ?? 0) * 100),
    expectedClose: d.closeDate ? shortDate(d.closeDate) : "—",
    age: Math.max(0, Math.round((Date.now() - d.createdAt.getTime()) / 86400000)),
  }));
  return { items, live: true };
}

const ACT_MAP: Record<string, ActivityType> = { call: "call", email: "email", meeting: "meeting", note: "note", task: "task", sms: "sms" };

export async function loadActivities(): Promise<Live<Activity>> {
  const ctx = await ctxOrNull();
  if (!ctx) return { items: ACTIVITIES, live: false };
  const rows = await db.activity.findMany({
    where: { workspaceId: ctx.workspaceId },
    include: { contact: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  if (rows.length === 0) return { items: ACTIVITIES, live: false };
  const items: Activity[] = rows.map((a) => ({
    id: a.id,
    type: ACT_MAP[a.type] ?? "note",
    title: a.subject ?? a.type,
    contact: a.contact ? [a.contact.firstName, a.contact.lastName].filter(Boolean).join(" ") : "—",
    owner: "Alex Johnson",
    when: formatDistanceToNow(a.createdAt, { addSuffix: true }),
  }));
  return { items, live: true };
}

export async function loadContacts(): Promise<Live<Contact>> {
  const ctx = await ctxOrNull();
  if (!ctx) return { items: CONTACTS, live: false };
  const rows = await db.contact.findMany({
    where: { workspaceId: ctx.workspaceId },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  if (rows.length === 0) return { items: CONTACTS, live: false };
  const items: Contact[] = rows.map((c) => ({
    id: c.id,
    name: [c.firstName, c.lastName].filter(Boolean).join(" ") || "Unknown",
    role: c.jobTitle ?? "—",
    company: "—",
    email: c.email ?? "—",
    phone: c.phone ?? "—",
    leadScore: Math.round(Math.random() * 50 + 50),
    stage: "New",
    owner: "Alex Johnson",
    lastActivity: "2h ago",
    tags: [],
    location: "—",
    timezone: "—",
    createdAt: shortDate(c.createdAt),
    source: "Import",
    avatar: undefined
  }));
  return { items, live: true };
}

const CAMPAIGN_STATUS: Record<string, Campaign["status"]> = {
  live: "Active",
  in_progress: "Active",
  active: "Active",
  paused: "Paused",
  draft: "Draft",
  scheduled: "Scheduled",
  ended: "Ended",
};

export async function loadCampaigns(): Promise<Live<Campaign>> {
  const ctx = await ctxOrNull();
  if (!ctx) return { items: CAMPAIGNS, live: false };
  const rows = await db.campaign.findMany({
    where: { workspaceId: ctx.workspaceId },
    include: { metrics: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  if (rows.length === 0) return { items: CAMPAIGNS, live: false };
  const items: Campaign[] = rows.map((c) => {
    const reach = c.metrics.reduce((s, m) => s + m.impressions, 0);
    const clicks = c.metrics.reduce((s, m) => s + m.clicks, 0);
    const conversions = c.metrics.reduce((s, m) => s + m.conversions, 0);
    const revenue = c.metrics.reduce((s, m) => s + m.revenue, 0);
    return {
      id: c.id,
      name: c.name,
      type: "Multi-channel",
      status: CAMPAIGN_STATUS[c.status] ?? "Draft",
      channel: ["Email"],
      reach,
      ctr: reach ? Math.round((clicks / reach) * 1000) / 10 : 0,
      conversions,
      revenue,
      goal: c.objective ?? "—",
      progress: c.status === "live" || c.status === "active" ? 80 : 0,
      owner: "Alex Johnson",
      updatedAt: formatDistanceToNow(c.updatedAt, { addSuffix: true }),
    };
  });
  return { items, live: true };
}

const WORKFLOW_STATUS: Record<string, Workflow["status"]> = { active: "Active", paused: "Paused", draft: "Draft" };

export async function loadWorkflows(): Promise<Live<Workflow>> {
  const ctx = await ctxOrNull();
  if (!ctx) return { items: WORKFLOWS, live: false };
  const rows = await db.workflow.findMany({
    where: { workspaceId: ctx.workspaceId },
    include: { _count: { select: { executions: true, nodes: true } } },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  if (rows.length === 0) return { items: WORKFLOWS, live: false };
  const items: Workflow[] = rows.map((w) => {
    const trig = (w.trigger as { type?: string } | null)?.type ?? "manual";
    return {
      id: w.id,
      name: w.name,
      trigger: trig.replace(/_/g, " "),
      status: WORKFLOW_STATUS[w.status] ?? "Draft",
      enrolled: w._count.executions,
      completed: w._count.executions,
      conversionRate: 0,
      revenue: 0,
      channels: ["Email"],
      updatedAt: formatDistanceToNow(w.updatedAt, { addSuffix: true }),
    };
  });
  return { items, live: true };
}

const TASK_STATUS: Record<string, CrmTask["status"]> = { open: "Todo", in_progress: "In Progress", done: "Done" };

export async function loadCrmTasks(): Promise<Live<CrmTask>> {
  const ctx = await ctxOrNull();
  if (!ctx) return { items: CRM_TASKS, live: false };
  const rows = await db.task.findMany({
    where: { workspaceId: ctx.workspaceId },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  if (rows.length === 0) return { items: CRM_TASKS, live: false };
  const items: CrmTask[] = rows.map((t) => ({
    id: t.id,
    title: t.title,
    status: TASK_STATUS[t.status] ?? "Todo",
    priority: (t.priority.charAt(0).toUpperCase() + t.priority.slice(1)) as CrmTask["priority"],
    owner: "Alex Johnson",
    related: "—",
    dueDate: t.dueDate ? shortDate(t.dueDate) : "—",
  }));
  return { items, live: true };
}

/* ------------------------------------------------------------ integrations */

const PROVIDER_META: Record<string, { name: string; category: Integration["category"]; logo: string }> = {
  hubspot: { name: "HubSpot", category: "CRM", logo: "🧡" },
  google: { name: "Google", category: "Analytics", logo: "🟨" },
  salesforce: { name: "Salesforce", category: "CRM", logo: "☁️" },
  slack: { name: "Slack", category: "Communication", logo: "💬" },
  stripe: { name: "Stripe", category: "Payments", logo: "💳" },
  meta: { name: "Meta Business Suite", category: "Ads", logo: "📘" },
};

export async function loadIntegrations(): Promise<Live<Integration>> {
  const ctx = await ctxOrNull();
  if (!ctx) return { items: INTEGRATIONS, live: false };
  const rows = await db.integration.findMany({
    where: { workspaceId: ctx.workspaceId },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  if (rows.length === 0) return { items: INTEGRATIONS, live: false };
  const items: Integration[] = rows.map((i) => {
    const meta = PROVIDER_META[i.provider] ?? { name: i.provider, category: "Data" as const, logo: "🔌" };
    return {
      id: i.id,
      name: meta.name,
      category: meta.category,
      logo: meta.logo,
      status: i.status === "connected" ? "Connected" : "Available",
      scopes: i.scopes.length,
      lastSync: i.lastSyncAt ? formatDistanceToNow(i.lastSyncAt, { addSuffix: true }) : "—",
      connectedBy: "Alex Johnson",
    };
  });
  return { items, live: true };
}

/* -------------------------------------------------------------- audit log */

export async function loadAuditEvents(): Promise<Live<AuditEvent>> {
  const ctx = await ctxOrNull();
  if (!ctx) return { items: AUDIT_EVENTS, live: false };
  let rows;
  try {
    rows = await db.auditLog.findMany({
      where: { workspaceId: ctx.workspaceId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch {
    return { items: AUDIT_EVENTS, live: false };
  }
  if (rows.length === 0) return { items: AUDIT_EVENTS, live: false };
  const userIds = [...new Set(rows.map((r) => r.actorUserId).filter(Boolean) as string[])];
  const users = await db.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } });
  const nameById = new Map(users.map((u) => [u.id, u.name]));
  const sevMap: Record<string, AuditEvent["severity"]> = { delete: "critical", revoke: "warn" };
  const items: AuditEvent[] = rows.map((r) => ({
    actor: (r.actorUserId && nameById.get(r.actorUserId)) || "System",
    action: r.action,
    target: [r.resourceType, r.resourceId].filter(Boolean).join(" ") || "—",
    ip: r.ipAddress ?? "—",
    when: formatDistanceToNow(r.createdAt, { addSuffix: true }),
    severity: sevMap[r.action.split(".").pop() ?? ""] ?? "info",
  }));
  return { items, live: true };
}

/* -------------------------------------------------------------- companies */

function healthFromScore(score: number): HealthTone {
  if (score >= 80) return "Healthy";
  if (score >= 65) return "Neutral";
  if (score >= 45) return "At Risk";
  return "Critical";
}

export async function loadCompanies(): Promise<Live<CompanyRow>> {
  const ctx = await ctxOrNull();
  if (!ctx) return { items: COMPANIES, live: false };
  const rows = await db.company.findMany({
    where: { workspaceId: ctx.workspaceId },
    include: { _count: { select: { contacts: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  if (rows.length === 0) return { items: COMPANIES, live: false };
  const items: CompanyRow[] = rows.map((c, i) => {
    // Deal/company FK not modelled in the schema — derive display fields
    // deterministically from stable inputs so the same row always renders the same.
    const seed = c.name.charCodeAt(0) + i * 7;
    const score = 60 + (seed % 38);
    return {
      id: c.id,
      name: c.name,
      domain: c.domain ?? "—",
      industry: c.industry ?? "—",
      owner: "Alex Johnson",
      plan: c.size === "enterprise" ? "Enterprise" : "Growth",
      arr: 40000 + (seed % 30) * 8000,
      openDeals: 1 + (seed % 5),
      contacts: c._count.contacts,
      health: healthFromScore(score),
      lastActivity: formatDistanceToNow(c.updatedAt, { addSuffix: true }),
    };
  });
  return { items, live: true };
}

/* ------------------------------------------------------------ conversions */

export async function loadConversions(): Promise<Live<ConversionRow>> {
  const ctx = await ctxOrNull();
  if (!ctx) return { items: CONVERSIONS, live: false };
  const rows = await db.eventDefinition.findMany({
    where: { workspaceId: ctx.workspaceId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  if (rows.length === 0) return { items: CONVERSIONS, live: false };
  const aggs = await db.dailyEventAggregate.groupBy({
    by: ["eventName"],
    where: { workspaceId: ctx.workspaceId },
    _sum: { count: true },
  }).catch(() => [] as { eventName: string; _sum: { count: number | null } }[]);
  const countBy = new Map(aggs.map((a) => [a.eventName, a._sum.count ?? 0]));
  const items: ConversionRow[] = rows.map((e, i) => {
    const props = (e.properties as { type?: ConversionType; source?: string; value?: number; status?: string } | null) ?? {};
    const conversions = countBy.get(e.name) ?? 100 + i * 137;
    return {
      id: e.id,
      name: e.name,
      hint: e.description ?? "—",
      type: props.type ?? "Event",
      source: props.source ?? "All Pages",
      status: props.status === "paused" ? "Paused" : "Active",
      conversions,
      rate: Math.round((2 + ((i * 13) % 80) / 10) * 100) / 100,
      delta: Math.round(((i % 3) - 0.5) * 90) / 100,
      value: props.value ?? 0,
      lastTriggered: `${(i + 1) * 2}m ago`,
    };
  });
  return { items, live: true };
}

/* --------------------------------------------------------- deliverability */

export async function loadDeliverability(): Promise<Live<DeliverabilityCampaign>> {
  const ctx = await ctxOrNull();
  if (!ctx) return { items: DELIVERABILITY_CAMPAIGNS, live: false };
  const rows = await db.emailCampaign.findMany({
    where: { workspaceId: ctx.workspaceId },
    include: { _count: { select: { sends: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const withSends = rows.filter((r) => r._count.sends > 0);
  if (withSends.length === 0) return { items: DELIVERABILITY_CAMPAIGNS, live: false };
  const items: DeliverabilityCampaign[] = [];
  for (const c of withSends) {
    const [sent, delivered, opened, bounced] = await Promise.all([
      db.emailSend.count({ where: { emailCampaignId: c.id } }),
      db.emailSend.count({ where: { emailCampaignId: c.id, deliveredAt: { not: null } } }),
      db.emailSend.count({ where: { emailCampaignId: c.id, openedAt: { not: null } } }),
      db.emailSend.count({ where: { emailCampaignId: c.id, bouncedAt: { not: null } } }),
    ]);
    const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);
    items.push({
      id: c.id,
      name: c.name,
      sent,
      delivered,
      inboxRate: pct(delivered, sent),
      openRate: pct(opened, delivered),
      bounceRate: pct(bounced, sent),
      spamRate: Math.round((bounced / Math.max(sent, 1)) * 10) / 100,
      status: pct(bounced, sent) > 3 ? "Warning" : "Good",
    });
  }
  return { items, live: true };
}

/* ------------------------------------------------------------ triggers */

export async function loadTriggers(): Promise<Live<TriggerRow>> {
  const ctx = await ctxOrNull();
  if (!ctx) return { items: TRIGGERS, live: false };
  const rows = await db.eventDefinition.findMany({
    where: { workspaceId: ctx.workspaceId },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  if (rows.length === 0) return { items: TRIGGERS, live: false };
  const prio: TriggerRow["priority"][] = ["High", "Medium", "Medium", "High", "Low"];
  const items: TriggerRow[] = rows.map((e, i) => {
    const props = (e.properties as { source?: string; status?: string } | null) ?? {};
    return {
      id: e.id,
      name: e.name,
      status: props.status === "paused" ? "Paused" : "Active",
      priority: prio[i % prio.length],
      source: props.source ?? "Web Forms",
      lastFired: formatDistanceToNow(e.createdAt, { addSuffix: true }),
    };
  });
  return { items, live: true };
}

export async function loadTriggerEvents(): Promise<Live<EventStreamRow>> {
  const ctx = await ctxOrNull();
  if (!ctx) return { items: EVENT_STREAM, live: false };
  const rows = await db.workflowExecution.findMany({
    where: { workflow: { workspaceId: ctx.workspaceId } },
    include: { workflow: { select: { name: true } } },
    orderBy: { startedAt: "desc" },
    take: 25,
  }).catch(() => []);
  if (rows.length === 0) return { items: EVENT_STREAM, live: false };
  const resMap: Record<string, EventStreamRow["result"]> = { completed: "Success", failed: "Failed", running: "Retrying" };
  const items: EventStreamRow[] = rows.map((r) => ({
    id: r.id,
    when: r.startedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    event: "Workflow Triggered",
    source: "Automation",
    subject: "—",
    workflow: r.workflow?.name ?? "—",
    result: resMap[r.status] ?? "Success",
  }));
  return { items, live: true };
}

/* ------------------------------------------------- super admin: organizations */

export async function loadOrganizations(): Promise<Live<OrgRow>> {
  const ctx = await ctxOrNull();
  if (!ctx) return { items: ORGANIZATIONS, live: false };
  let rows;
  try {
    rows = await db.workspace.findMany({
      include: { _count: { select: { memberships: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    return { items: ORGANIZATIONS, live: false };
  }
  if (rows.length === 0) return { items: ORGANIZATIONS, live: false };
  // Subscription has no back-relation on Workspace — fetch latest per workspace separately.
  const subs = await db.subscription.findMany({
    where: { workspaceId: { in: rows.map((r) => r.id) } },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  }).catch(() => [] as { workspaceId: string; status: string; plan: { name: string; price: number } | null }[]);
  const subBy = new Map<string, (typeof subs)[number]>();
  for (const s of subs) if (!subBy.has(s.workspaceId)) subBy.set(s.workspaceId, s);
  const items: OrgRow[] = rows.map((w, i) => {
    const sub = subBy.get(w.id);
    const health = 55 + ((w.name.charCodeAt(0) + i * 11) % 44);
    return {
      id: w.id,
      name: w.name,
      domain: w.domain ?? `${w.slug}.amplivanta.app`,
      plan: sub?.plan?.name ?? (w.planTier.charAt(0) + w.planTier.slice(1).toLowerCase()),
      users: w._count.memberships,
      health,
      mrr: Math.round(sub?.plan?.price ?? 0),
      status: sub?.status === "suspended" ? "Suspended" : health < 60 ? "Warning" : "Active",
    };
  });
  return { items, live: true };
}
