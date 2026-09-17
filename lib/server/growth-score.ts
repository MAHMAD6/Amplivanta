import "server-only";
import { db } from "@/lib/db";
import { computeGrowthScore, type GrowthFacts, type GrowthScore } from "@/lib/growth/score";
import { detectOpportunities, type Opportunity } from "@/lib/growth/opportunities";

/**
 * Gathers the measured facts behind the Growth Score, runs the engine and the
 * opportunity rules, and keeps both traceable: snapshots go to
 * GrowthScoreSnapshot and opportunities to Recommendation with their evidence.
 */

export const SCORE_WINDOW_DAYS = 30;

/**
 * Unsubscribes are stored platform-wide by email address, so they are counted
 * only when the address is a contact in this workspace.
 */
async function workspaceUnsubscribes(workspaceId: string, from: Date): Promise<number> {
  try {
    const entries = await db.suppressionEntry.findMany({ where: { reason: "unsubscribe", createdAt: { gte: from } }, select: { email: true }, take: 5000 });
    if (!entries.length) return 0;
    return db.contact.count({ where: { workspaceId, email: { in: entries.map((e) => e.email), mode: "insensitive" } } });
  } catch {
    return 0;
  }
}

export async function collectGrowthFacts(workspaceId: string, windowDays = SCORE_WINDOW_DAYS): Promise<GrowthFacts> {
  const w = workspaceId;
  const from = new Date(Date.now() - windowDays * 86400000);
  const [
    visits, conversions, formSubmissions, newContacts, totalContacts,
    openDeals, wonDeals, lostDeals,
    emailsSent, emailsOpened, emailsClicked, unsubscribes,
    activeCampaigns, metrics, publishedPages, activeForms, activeWorkflows,
    workflowRuns, workflowFailures, socialPosts, connectedIntegrations,
  ] = await Promise.all([
    db.landingPageVisit.count({ where: { workspaceId: w, createdAt: { gte: from } } }),
    db.landingPageVisit.count({ where: { workspaceId: w, createdAt: { gte: from }, converted: true } }),
    db.formSubmission.count({ where: { form: { workspaceId: w }, createdAt: { gte: from } } }),
    db.contact.count({ where: { workspaceId: w, createdAt: { gte: from } } }),
    db.contact.count({ where: { workspaceId: w } }),
    db.deal.count({ where: { workspaceId: w, status: "open" } }),
    db.deal.count({ where: { workspaceId: w, status: "won", updatedAt: { gte: from } } }),
    db.deal.count({ where: { workspaceId: w, status: "lost", updatedAt: { gte: from } } }),
    db.emailSend.count({ where: { emailCampaign: { workspaceId: w }, status: "sent", createdAt: { gte: from } } }),
    db.emailSend.count({ where: { emailCampaign: { workspaceId: w }, openedAt: { gte: from } } }),
    db.emailSend.count({ where: { emailCampaign: { workspaceId: w }, clickedAt: { gte: from } } }),
    workspaceUnsubscribes(w, from),
    db.campaign.count({ where: { workspaceId: w, status: { in: ["active", "live"] } } }),
    db.campaignMetric.aggregate({ where: { campaign: { workspaceId: w }, date: { gte: from } }, _sum: { clicks: true, impressions: true, spend: true, revenue: true } }),
    db.landingPage.count({ where: { workspaceId: w, isPublished: true } }),
    db.form.count({ where: { workspaceId: w, status: "active" } }),
    db.workflow.count({ where: { workspaceId: w, status: "active" } }),
    db.workflowExecution.count({ where: { workflow: { workspaceId: w }, environment: "live", startedAt: { gte: from } } }),
    db.workflowExecution.count({ where: { workflow: { workspaceId: w }, environment: "live", status: "failed", startedAt: { gte: from } } }),
    db.socialPost.count({ where: { workspaceId: w, status: "published", updatedAt: { gte: from } } }),
    db.integration.count({ where: { workspaceId: w, status: "connected" } }),
  ]);

  return {
    visits, conversions, formSubmissions, newContacts, totalContacts,
    openDeals, wonDeals, lostDeals,
    emailsSent, emailsOpened, emailsClicked, unsubscribes,
    activeCampaigns,
    campaignClicks: metrics._sum.clicks ?? 0,
    campaignImpressions: metrics._sum.impressions ?? 0,
    campaignSpend: metrics._sum.spend ?? 0,
    campaignRevenue: metrics._sum.revenue ?? 0,
    publishedPages, activeForms, activeWorkflows,
    workflowRuns, workflowFailures,
    socialPostsPublished: socialPosts,
    connectedIntegrations,
    windowDays,
  };
}

export type GrowthScoreView = {
  score: GrowthScore;
  facts: GrowthFacts;
  opportunities: Opportunity[];
  /** Previous snapshot's score, for the change since last time. */
  previous: { score: number | null; createdAt: Date } | null;
  lastRun: Date | null;
};

/** Reads the current score without writing anything. */
export async function loadGrowthScore(workspaceId: string, windowDays = SCORE_WINDOW_DAYS): Promise<GrowthScoreView> {
  const facts = await collectGrowthFacts(workspaceId, windowDays);
  const score = computeGrowthScore(facts);
  const snapshots = await db.growthScoreSnapshot
    .findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take: 2, select: { score: true, createdAt: true } })
    .catch(() => [] as { score: number | null; createdAt: Date }[]);
  return { score, facts, opportunities: detectOpportunities(facts, score), previous: snapshots[0] ?? null, lastRun: snapshots[0]?.createdAt ?? null };
}

/** Score history, oldest first, for the trend. */
export async function growthScoreHistory(workspaceId: string, take = 12) {
  const rows = await db.growthScoreSnapshot.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take, select: { score: true, status: true, coverage: true, createdAt: true } }).catch(() => []);
  return rows.reverse();
}

/**
 * Recalculates, stores a snapshot, and syncs rule-based opportunities into
 * Recommendation: new findings are added, resolved ones are closed, and
 * anything a person saved or dismissed is left alone.
 */
export async function recalculateGrowthScore(workspaceId: string, userId: string | null, windowDays = SCORE_WINDOW_DAYS): Promise<GrowthScoreView> {
  const view = await loadGrowthScore(workspaceId, windowDays);
  await db.growthScoreSnapshot.create({
    data: {
      workspaceId,
      score: view.score.score,
      status: view.score.status,
      coverage: view.score.coverage,
      dimensions: view.score.dimensions as never,
      windowDays,
      createdById: userId,
    },
  });

  const open = await db.recommendation.findMany({ where: { workspaceId, source: "rules", status: { in: ["pending", "ready"] } }, select: { id: true, ruleKey: true } });
  const detected = new Set(view.opportunities.map((o) => o.key));
  const existing = new Map(open.filter((r) => r.ruleKey).map((r) => [r.ruleKey!, r.id]));

  for (const o of view.opportunities) {
    const data = {
      title: o.title,
      body: `${o.evidence} ${o.action}`,
      description: o.action,
      category: o.category,
      metric: o.metric,
      evidence: o.evidence,
      actionHref: o.href,
      impact: o.impact,
      effort: o.effort,
      confidence: o.confidence,
      source: "rules",
      ruleKey: o.key,
    };
    const id = existing.get(o.key);
    if (id) await db.recommendation.update({ where: { id }, data });
    else await db.recommendation.create({ data: { workspaceId, ...data } });
  }

  // Findings that no longer hold are closed as resolved rather than deleted.
  const resolved = open.filter((r) => r.ruleKey && !detected.has(r.ruleKey)).map((r) => r.id);
  if (resolved.length) await db.recommendation.updateMany({ where: { id: { in: resolved } }, data: { status: "resolved" } });

  await db.auditLog.create({ data: { workspaceId, actorUserId: userId, action: "growth.score_recalculated", resourceType: "GrowthScoreSnapshot", metadata: { score: view.score.score, status: view.score.status, opportunities: view.opportunities.length, resolved: resolved.length } } }).catch(() => null);
  return view;
}

/** Recalculates at most once a day per workspace; used by the scheduler. */
export async function refreshGrowthScoresDaily(limit = 25) {
  const since = new Date(Date.now() - 20 * 3600 * 1000);
  const workspaces = await db.workspace.findMany({
    where: { growthScores: { none: { createdAt: { gte: since } } } },
    select: { id: true },
    take: limit,
  });
  for (const w of workspaces) await recalculateGrowthScore(w.id, null).catch(() => null);
  return workspaces.length;
}
