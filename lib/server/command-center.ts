import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";

export interface CommandCenterData {
  live: boolean;
  growthScore: number | null;
  topOpportunity: string | null;
  potentialImpact: string | null;
  activeCampaigns: number;
  totalCampaigns: number;
  hasData: boolean;
  attention: { key: string; title: string; detail: string; href: string }[];
  recentActivity: { id: string; title: string; when: Date }[];
  getStarted: { key: string; label: string; done: boolean }[];
  completion: number;
  counts: { contacts: number; companies: number; deals: number; campaigns: number; integrations: number; connectedIntegrations: number; members: number };
}

const EMPTY: CommandCenterData = {
  live: false,
  growthScore: null,
  topOpportunity: null,
  potentialImpact: null,
  activeCampaigns: 0,
  totalCampaigns: 0,
  hasData: false,
  attention: [
    { key: "connect", title: "Connect your data sources", detail: "Get the most accurate insights and recommendations.", href: "/app/integrations" },
    { key: "campaign", title: "Campaigns need setup", detail: "Create your first campaign to start driving results.", href: "/app/marketing/campaigns" },
    { key: "team", title: "Invite your team", detail: "Collaborate with your team to grow faster.", href: "/app/settings/users" },
  ],
  recentActivity: [],
  getStarted: [
    { key: "connect_data", label: "Connect your first data source", done: false },
    { key: "first_campaign", label: "Create your first campaign", done: false },
    { key: "invite_team", label: "Invite your team", done: false },
    { key: "growth_goals", label: "Tell us your growth goals", done: false },
  ],
  completion: 0,
  counts: { contacts: 0, companies: 0, deals: 0, campaigns: 0, integrations: 0, connectedIntegrations: 0, members: 1 },
};

/**
 * Aggregates the Growth Command Center. TRUTH-FIRST: growthScore/topOpportunity/
 * potentialImpact stay null until a real score+opportunity engine exists — never
 * fabricated. Derivable counts come straight from workspace records.
 */
export async function loadCommandCenter(): Promise<CommandCenterData> {
  let ctx;
  try {
    ctx = await getSessionContext();
  } catch {
    return EMPTY;
  }
  const where = { workspaceId: ctx.workspaceId };
  try {
    const [contacts, companies, deals, campaigns, activeCampaigns, integrations, connectedIntegrations, members, recentActivity] = await Promise.all([
      db.contact.count({ where }).catch(() => 0),
      db.company.count({ where }).catch(() => 0),
      db.deal.count({ where }).catch(() => 0),
      db.campaign.count({ where }).catch(() => 0),
      db.campaign.count({ where: { workspaceId: ctx.workspaceId, status: { in: ["active", "live"] } } }).catch(() => 0),
      db.integration.count({ where }).catch(() => 0),
      db.integration.count({ where: { workspaceId: ctx.workspaceId, status: "connected" } }).catch(() => 0),
      db.membership.count({ where: { workspaceId: ctx.workspaceId } }).catch(() => 1),
      db.activity.findMany({ where, orderBy: { createdAt: "desc" }, take: 6, select: { id: true, type: true, subject: true, createdAt: true } }).catch(() => [] as { id: string; type: string; subject: string | null; createdAt: Date }[]),
    ]);
    const hasData = connectedIntegrations > 0 || contacts > 0 || deals > 0;
    const getStarted = [
      { key: "connect_data", label: "Connect your first data source", done: connectedIntegrations > 0 },
      { key: "first_campaign", label: "Create your first campaign", done: campaigns > 0 },
      { key: "invite_team", label: "Invite your team", done: members > 1 },
      { key: "growth_goals", label: "Tell us your growth goals", done: false },
    ];
    const completion = Math.round((getStarted.filter((g) => g.done).length / getStarted.length) * 100);
    const attention: CommandCenterData["attention"] = [];
    if (connectedIntegrations === 0) attention.push({ key: "connect", title: "Connect your data sources", detail: "Get the most accurate insights and recommendations.", href: "/app/integrations" });
    if (campaigns === 0) attention.push({ key: "campaign", title: "Campaigns need setup", detail: "Create your first campaign to start driving results.", href: "/app/marketing/campaigns" });
    if (members <= 1) attention.push({ key: "team", title: "Invite your team", detail: "Collaborate with your team to grow faster.", href: "/app/settings/users" });

    return {
      live: true,
      growthScore: null,
      topOpportunity: null,
      potentialImpact: null,
      activeCampaigns,
      totalCampaigns: campaigns,
      hasData,
      attention,
      recentActivity: recentActivity.map((a) => ({ id: a.id, title: a.subject ?? a.type, when: a.createdAt })),
      getStarted,
      completion,
      counts: { contacts, companies, deals, campaigns, integrations, connectedIntegrations, members },
    };
  } catch {
    return EMPTY;
  }
}
