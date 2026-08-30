import { NextResponse } from "next/server";
import { route } from "@/lib/tenant";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Growth Command Center aggregation endpoint. Purpose-built so the home
 * dashboard makes one call instead of many. Follows the docs' TRUTH-FIRST rule:
 * the score/opportunity/impact remain null (insufficient_data) until a real
 * growth-score + opportunity engine exists — never fabricated. Counts that CAN
 * be derived from real workspace records (campaigns, contacts, deals, activity,
 * integrations) are returned as-is so empty states are accurate.
 */
export const GET = route(async (ctx) => {
  const where = { workspaceId: ctx.workspaceId };
  const [contacts, companies, deals, campaigns, activeCampaigns, integrations, connectedIntegrations, members, recentActivity] = await Promise.all([
    db.contact.count({ where }).catch(() => 0),
    db.company.count({ where }).catch(() => 0),
    db.deal.count({ where }).catch(() => 0),
    db.campaign.count({ where }).catch(() => 0),
    db.campaign.count({ where: { workspaceId: ctx.workspaceId, status: { in: ["active", "live"] } } }).catch(() => 0),
    db.integration.count({ where }).catch(() => 0),
    db.integration.count({ where: { workspaceId: ctx.workspaceId, status: "connected" } }).catch(() => 0),
    db.membership.count({ where: { workspaceId: ctx.workspaceId } }).catch(() => 1),
    db.activity.findMany({ where, orderBy: { createdAt: "desc" }, take: 6, select: { id: true, type: true, subject: true, createdAt: true } }).catch(() => []),
  ]);

  const hasData = connectedIntegrations > 0 || contacts > 0 || deals > 0;

  // Get Started checklist — reflects real workspace state.
  const getStarted = [
    { key: "connect_data", label: "Connect your first data source", done: connectedIntegrations > 0 },
    { key: "first_campaign", label: "Create your first campaign", done: campaigns > 0 },
    { key: "invite_team", label: "Invite your team", done: members > 1 },
    { key: "growth_goals", label: "Tell us your growth goals", done: false },
  ];
  const completion = Math.round((getStarted.filter((g) => g.done).length / getStarted.length) * 100);

  // Needs Your Attention — generated from real setup gaps only.
  const attention: { key: string; title: string; detail: string; href: string }[] = [];
  if (connectedIntegrations === 0) attention.push({ key: "connect", title: "Connect your data sources", detail: "Get the most accurate insights and recommendations.", href: "/app/integrations" });
  if (campaigns === 0) attention.push({ key: "campaign", title: "Campaigns need setup", detail: "Create your first campaign to start driving results.", href: "/app/marketing/campaigns" });
  if (members <= 1) attention.push({ key: "team", title: "Invite your team", detail: "Collaborate with your team to grow faster.", href: "/app/settings/users" });

  return NextResponse.json({
    workspace: { id: ctx.workspaceId },
    // TRUTH-FIRST: no growth-score engine yet → insufficient_data, not a number.
    growth_score: { status: "insufficient_data", score: null },
    top_opportunity: { status: hasData ? "pending" : "insufficient_data", opportunity: null },
    potential_impact: { status: "insufficient_data", value: null },
    active_campaigns: { count: activeCampaigns, total: campaigns },
    recommended_action: { status: hasData ? "pending" : "insufficient_data", action: null },
    attention_items: attention,
    performance: { status: hasData ? "pending" : "no_data", series: [] },
    recent_activity: recentActivity.map((a) => ({ id: a.id, type: a.type, title: a.subject ?? a.type, when: a.createdAt })),
    get_started: { items: getStarted, completion },
    counts: { contacts, companies, deals, campaigns, integrations, connectedIntegrations, members },
  });
});
