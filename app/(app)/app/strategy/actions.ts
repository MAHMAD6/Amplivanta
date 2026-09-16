"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { runAiTask } from "@/lib/ai";
import { integrationView } from "@/lib/server/integration-view";
import { runAuditChecks } from "@/lib/growth/audit-checks";
import {
  APPROVAL_STATUSES,
  EVENT_TYPES,
  GOAL_STATUSES,
  GROWTH_GOALS,
  IDEA_CHANNELS,
  IDEA_TYPES,
  INDUSTRIES,
  PERIODS,
  PERSONA_STATUSES,
  PLAN_CHANNELS,
  REPORT_SECTIONS,
  SCENARIOS,
  STRATEGY_REPORT_TYPES,
  inList,
  label,
  lines,
} from "@/lib/growth/options";

/**
 * Growth Intelligence writes: audits, content ideas, trends, news, events,
 * strategy, goals, personas, channel plans and strategy reports. Every write
 * is workspace-scoped and needs editor access; approvals need an admin.
 */

type Result = { ok: true; message: string; id?: string } | { ok: false; error: string };
const denied = { ok: false as const, error: "You don't have permission to make changes in this workspace." };
const missing = (what: string) => ({ ok: false as const, error: `That ${what} is not in this workspace.` });
const str = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);

async function session() {
  try {
    return await getSessionContext();
  } catch {
    return null;
  }
}
async function editor() {
  const c = await session();
  return c && c.workspaceRole !== "VIEWER" ? c : null;
}
async function admin() {
  const c = await session();
  return c && ["ADMIN", "OWNER", "SUPER_ADMIN"].includes(c.workspaceRole) ? c : null;
}
async function audit(c: { workspaceId: string; userId: string }, action: string, resourceType: string, resourceId: string, metadata: Record<string, unknown> = {}) {
  await db.auditLog.create({ data: { workspaceId: c.workspaceId, actorUserId: c.userId, action, resourceType, resourceId, metadata: metadata as never } }).catch(() => null);
}
function num(v: string, { min = 0, int = false } = {}): number | null | "invalid" {
  if (!v) return null;
  const n = Number(v.replace(/,/g, ""));
  if (!Number.isFinite(n) || n < min || (int && !Number.isInteger(n))) return "invalid";
  return n;
}
function date(v: string): Date | null | "invalid" {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "invalid" : d;
}
function httpUrl(v: string): string | null {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/* ---------------------------------- Audit --------------------------------- */

export async function runGrowthAudit(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const website = str(fd, "website", 200);
  if (website.length < 3) return { ok: false, error: "Enter the website or business to audit." };
  const industry = str(fd, "industry", 40);
  const goal = str(fd, "goal", 40);
  const period = str(fd, "period", 5) || "30";
  if ((industry && !inList(INDUSTRIES, industry)) || (goal && !inList(GROWTH_GOALS, goal)) || !inList(PERIODS, period)) return { ok: false, error: "Choose options from the lists." };
  const competitors = lines(str(fd, "competitors", 4000).replace(/,/g, "\n")).slice(0, 10);

  const w = c.workspaceId;
  const [integrations, contacts, openDeals, activeCampaigns, sentEmails, publishedPages, forms, goals, personas, tracked] = await Promise.all([
    db.integration.findMany({ where: { workspaceId: w } }),
    db.contact.count({ where: { workspaceId: w } }),
    db.deal.count({ where: { workspaceId: w, status: "open" } }),
    db.campaign.count({ where: { workspaceId: w, status: "active" } }),
    db.emailCampaign.count({ where: { workspaceId: w, status: "sent" } }),
    db.landingPage.count({ where: { workspaceId: w, publishedAt: { not: null } } }),
    db.form.count({ where: { workspaceId: w } }),
    db.goal.count({ where: { workspaceId: w } }),
    db.persona.count({ where: { workspaceId: w } }),
    db.competitor.count({ where: { workspaceId: w } }),
  ]);
  const live = new Set(integrations.map(integrationView).filter((i) => i.hasCredentials).map((i) => i.provider));
  const { score, checks } = runAuditChecks({
    analyticsConnected: live.has("google_analytics"),
    searchConsoleConnected: live.has("google_search_console"),
    adsConnected: live.has("google_ads") || live.has("meta_ads"),
    socialAccounts: ["meta", "linkedin", "youtube", "tiktok"].filter((p) => live.has(p)).length,
    contacts,
    openDeals,
    activeCampaigns,
    sentEmails,
    publishedPages,
    forms,
    goals,
    personas,
    competitors: Math.max(tracked, competitors.length),
  });
  const row = await db.growthAudit.create({
    data: { workspaceId: w, website, industry: industry || null, goal: goal || null, periodDays: Number(period), competitors, score, checks: checks as never, createdById: c.userId },
  });
  await audit(c, "growth.audit_run", "GrowthAudit", row.id, { score });
  revalidatePath("/app/growth-audit");
  revalidatePath("/app/ai-advisor");
  return { ok: true, message: `Growth Audit complete: ${score}/100 readiness.`, id: row.id };
}

/* ------------------------------ Content ideas ----------------------------- */

export async function generateIdeas(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const brief = str(fd, "brief", 2000);
  if (brief.length < 10) return { ok: false, error: "Describe the topic, goal, audience or offer in a sentence or two." };
  const channel = str(fd, "channel", 30);
  const type = str(fd, "type", 30);
  const goal = str(fd, "goal", 200);
  if ((channel && !inList(IDEA_CHANNELS, channel)) || (type && !inList(IDEA_TYPES, type))) return { ok: false, error: "Choose options from the lists." };

  const [personas, goals] = await Promise.all([
    db.persona.findMany({ where: { workspaceId: c.workspaceId, status: "active" }, take: 3, select: { name: true, role: true, painPoints: true } }),
    db.goal.findMany({ where: { workspaceId: c.workspaceId }, take: 5, select: { title: true } }),
  ]);
  const prompt = [
    `Brief: ${brief}`,
    channel && `Channel: ${label(IDEA_CHANNELS, channel)}`,
    type && `Content type: ${label(IDEA_TYPES, type)}`,
    goal && `Goal: ${goal}`,
    personas.length ? `Personas: ${personas.map((p) => `${p.name}${p.role ? ` (${p.role})` : ""}${p.painPoints.length ? ` — pains: ${p.painPoints.slice(0, 3).join("; ")}` : ""}`).join(" | ")}` : "",
    goals.length ? `Workspace goals: ${goals.map((g) => g.title).join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const r = await runAiTask({ workspaceId: c.workspaceId, userId: c.userId }, "content_ideas", { prompt, moderationText: brief });
  if (!r.ok) return { ok: false, error: r.error };
  const ideas = r.value.ideas.filter((i) => (!channel || i.channel === channel) && (!type || i.type === type));
  const use = ideas.length ? ideas : r.value.ideas;
  await db.contentIdea.createMany({
    data: use.map((i) => ({ workspaceId: c.workspaceId, title: i.title, description: i.description, channel: i.channel, type: i.type, goal: goal || null, source: "ai", status: "generated" })),
  });
  await audit(c, "growth.ideas_generated", "ContentIdea", "", { count: use.length });
  revalidatePath("/app/content-intelligence");
  return { ok: true, message: `${use.length} ideas generated.` };
}

export async function addIdea(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const title = str(fd, "title", 140);
  if (title.length < 3) return { ok: false, error: "Enter an idea title." };
  const channel = str(fd, "channel", 30);
  const type = str(fd, "type", 30);
  const row = await db.contentIdea.create({
    data: { workspaceId: c.workspaceId, title, description: str(fd, "description", 500) || null, channel: inList(IDEA_CHANNELS, channel) ? channel : null, type: inList(IDEA_TYPES, type) ? type : null, source: "manual", status: "generated", saved: true },
  });
  revalidatePath("/app/content-intelligence");
  return { ok: true, message: "Idea saved.", id: row.id };
}

export async function setIdeaSaved(id: string, saved: boolean): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.contentIdea.updateMany({ where: { id, workspaceId: c.workspaceId }, data: { saved } });
  if (!r.count) return missing("idea");
  revalidatePath("/app/content-intelligence");
  return { ok: true, message: saved ? "Idea saved." : "Removed from saved ideas." };
}

export async function deleteIdea(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.contentIdea.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return missing("idea");
  revalidatePath("/app/content-intelligence");
  return { ok: true, message: "Idea removed." };
}

export async function ideaToDraft(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const idea = await db.contentIdea.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!idea) return missing("idea");
  const type = idea.type && ["blog_post", "email", "social"].includes(idea.type) ? idea.type : "other";
  const doc = await db.document.create({
    data: { workspaceId: c.workspaceId, title: idea.title, type, content: `# ${idea.title}\n\n${idea.description ?? ""}\n`, createdByUserId: c.userId },
  });
  await db.contentIdea.update({ where: { id }, data: { status: "drafted" } });
  await audit(c, "growth.idea_drafted", "Document", doc.id, { ideaId: id });
  revalidatePath("/app/content-intelligence");
  return { ok: true, message: "Draft created in Creative Studio.", id: doc.id };
}

/* --------------------------------- Trends --------------------------------- */

export async function trackTopic(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const topic = str(fd, "topic", 120);
  if (topic.length < 2) return { ok: false, error: "Enter a topic." };
  const mentions = num(str(fd, "mentions", 12), { int: true });
  const growth = num(str(fd, "growth", 12), { min: -100 });
  const relevance = num(str(fd, "relevance", 5));
  if (mentions === "invalid" || growth === "invalid" || relevance === "invalid" || (relevance != null && relevance > 100)) return { ok: false, error: "Enter valid numbers (relevance 0-100)." };
  const hashtags = lines(str(fd, "hashtags", 600).replace(/[,\s]+/g, "\n"))
    .map((h) => (h.startsWith("#") ? h : `#${h}`))
    .slice(0, 10);
  const row = await db.trend.create({
    data: {
      workspaceId: c.workspaceId,
      topic,
      category: str(fd, "category", 60) || null,
      source: str(fd, "source", 60) || "Manual",
      country: str(fd, "country", 60) || null,
      mentions,
      volume: mentions ?? 0,
      growth: growth ?? 0,
      relevance,
      hashtags,
    },
  });
  await audit(c, "growth.trend_tracked", "Trend", row.id);
  revalidatePath("/app/content-intelligence/trending");
  return { ok: true, message: "Topic tracked.", id: row.id };
}

export async function deleteTrend(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.trend.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return missing("topic");
  revalidatePath("/app/content-intelligence/trending");
  return { ok: true, message: "Topic removed." };
}

export async function trendToIdea(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const t = await db.trend.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!t) return missing("topic");
  await db.contentIdea.create({ data: { workspaceId: c.workspaceId, title: `Content on ${t.topic}`, description: `Timely content responding to the "${t.topic}" trend.`, source: "trend", status: "generated", saved: true } });
  revalidatePath("/app/content-intelligence");
  return { ok: true, message: "Saved as a content idea." };
}

/* ---------------------------------- News ---------------------------------- */

export async function addStory(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const title = str(fd, "title", 240);
  const url = httpUrl(str(fd, "url", 1000));
  if (title.length < 5) return { ok: false, error: "Enter the story headline." };
  if (!url) return { ok: false, error: "Enter the story's full web address (https://…)." };
  const relevance = num(str(fd, "relevance", 5));
  if (relevance === "invalid" || (relevance != null && relevance > 100)) return { ok: false, error: "Relevance must be 0-100." };
  const published = date(str(fd, "publishedAt", 20));
  if (published === "invalid") return { ok: false, error: "Enter a valid date." };
  const row = await db.newsItem.create({
    data: { workspaceId: c.workspaceId, title, url, source: str(fd, "source", 80) || new URL(url).hostname.replace(/^www\./, ""), topic: str(fd, "topic", 60) || null, summary: str(fd, "summary", 1500) || null, relevance, publishedAt: published ?? new Date() },
  });
  await audit(c, "growth.story_added", "NewsItem", row.id);
  revalidatePath("/app/content-intelligence/news");
  return { ok: true, message: "Story added.", id: row.id };
}

export async function setStorySaved(id: string, saved: boolean): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.newsItem.updateMany({ where: { id, workspaceId: c.workspaceId }, data: { saved } });
  if (!r.count) return missing("story");
  revalidatePath("/app/content-intelligence/news");
  return { ok: true, message: saved ? "Story saved." : "Removed from saved stories." };
}

export async function deleteStory(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.newsItem.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return missing("story");
  revalidatePath("/app/content-intelligence/news");
  return { ok: true, message: "Story removed." };
}

const STORY_DRAFTS: Record<string, { docType: string; heading: string }> = {
  blog: { docType: "blog_post", heading: "Blog draft" },
  social: { docType: "social", heading: "Social draft" },
  email: { docType: "email", heading: "Email draft" },
  video: { docType: "other", heading: "Video concept" },
  infographic: { docType: "other", heading: "Infographic concept" },
};

/** Starts an original draft that credits the story; never copies its text. */
export async function storyToDraft(id: string, kind: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const d = STORY_DRAFTS[kind];
  if (!d) return { ok: false, error: "Choose a content type." };
  const s = await db.newsItem.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!s) return missing("story");
  const doc = await db.document.create({
    data: {
      workspaceId: c.workspaceId,
      title: `${d.heading}: ${s.title}`.slice(0, 200),
      type: d.docType,
      content: `# ${d.heading}\n\nOur perspective on: ${s.title}\n\n[Write your original take here]\n\nSource: ${s.source} — ${s.url}\n`,
      createdByUserId: c.userId,
    },
  });
  await audit(c, "growth.story_drafted", "Document", doc.id, { storyId: id, kind });
  return { ok: true, message: "Draft created in Creative Studio.", id: doc.id };
}

/* --------------------------------- Events --------------------------------- */

export async function addEvent(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const title = str(fd, "title", 160);
  if (title.length < 2) return { ok: false, error: "Enter the event name." };
  const when = date(str(fd, "date", 20));
  if (!when || when === "invalid") return { ok: false, error: "Enter the event date." };
  const type = str(fd, "type", 20) || "custom";
  if (!inList(EVENT_TYPES, type)) return { ok: false, error: "Choose an event type." };
  const row = await db.eventItem.create({
    data: { workspaceId: c.workspaceId, title, date: when, type, country: str(fd, "country", 60) || null, goal: str(fd, "goal", 200) || null, location: str(fd, "location", 160) || null, description: str(fd, "description", 1500) || null },
  });
  await audit(c, "growth.event_added", "EventItem", row.id);
  revalidatePath("/app/content-intelligence/events");
  revalidatePath("/app/content-intelligence");
  return { ok: true, message: "Event added to the calendar.", id: row.id };
}

export async function deleteEvent(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.eventItem.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return missing("event");
  revalidatePath("/app/content-intelligence/events");
  return { ok: true, message: "Event removed." };
}

export async function eventToIdea(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const e = await db.eventItem.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!e) return missing("event");
  await db.contentIdea.create({
    data: { workspaceId: c.workspaceId, title: `${e.title} content`, description: `Content planned around ${e.title} on ${e.date.toISOString().slice(0, 10)}.${e.description ? ` ${e.description.slice(0, 300)}` : ""}`, goal: e.goal, source: "event", status: "generated", saved: true },
  });
  revalidatePath("/app/content-intelligence");
  revalidatePath("/app/content-intelligence/events");
  return { ok: true, message: "Saved as a content idea." };
}

/* -------------------------------- Strategy -------------------------------- */

export async function createStrategy(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 160);
  if (name.length < 2) return { ok: false, error: "Enter a strategy name." };
  const start = date(str(fd, "startDate", 20));
  const end = date(str(fd, "endDate", 20));
  if (start === "invalid" || end === "invalid") return { ok: false, error: "Enter valid dates." };
  if (start && end && end < start) return { ok: false, error: "The end date must be after the start date." };
  const row = await db.strategy.create({
    data: { workspaceId: c.workspaceId, name, description: str(fd, "description", 2000) || null, startDate: start, endDate: end, pillars: lines(str(fd, "pillars", 4000)) },
  });
  await audit(c, "growth.strategy_created", "Strategy", row.id);
  revalidatePath("/app/strategy");
  return { ok: true, message: "Strategy created.", id: row.id };
}

export async function saveStrategyDetails(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const id = str(fd, "id", 40);
  const data: { pillars?: string[]; swot?: object } = {};
  if (fd.has("pillars")) data.pillars = lines(str(fd, "pillars", 4000));
  if (fd.has("strengths")) data.swot = { strengths: lines(str(fd, "strengths", 2000)), weaknesses: lines(str(fd, "weaknesses", 2000)), opportunities: lines(str(fd, "opportunities", 2000)), threats: lines(str(fd, "threats", 2000)) };
  const r = await db.strategy.updateMany({ where: { id, workspaceId: c.workspaceId }, data: data as never });
  if (!r.count) return missing("strategy");
  await audit(c, "growth.strategy_updated", "Strategy", id);
  revalidatePath("/app/strategy");
  return { ok: true, message: "Strategy updated." };
}

/* ---------------------------------- Goals --------------------------------- */

export async function createGoal(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const title = str(fd, "title", 160);
  const metric = str(fd, "metric", 80);
  if (title.length < 2 || !metric) return { ok: false, error: "Enter a goal name and the metric it measures." };
  const target = num(str(fd, "targetValue", 20));
  const current = num(str(fd, "currentValue", 20));
  if (target == null || target === "invalid" || target <= 0 || current === "invalid") return { ok: false, error: "Enter a positive target (and a valid current value)." };
  const deadline = date(str(fd, "deadline", 20));
  if (deadline === "invalid") return { ok: false, error: "Enter a valid due date." };
  const ownerId = str(fd, "ownerId", 40);
  if (ownerId && !(await db.membership.findFirst({ where: { workspaceId: c.workspaceId, userId: ownerId } }))) return { ok: false, error: "The owner must be a workspace member." };
  const strategyId = str(fd, "strategyId", 40);
  if (strategyId && !(await db.strategy.findFirst({ where: { id: strategyId, workspaceId: c.workspaceId } }))) return missing("strategy");
  const row = await db.goal.create({
    data: { workspaceId: c.workspaceId, title, metric, targetValue: target, currentValue: current ?? 0, deadline, ownerId: ownerId || null, strategyId: strategyId || null, status: "in_progress" },
  });
  await audit(c, "growth.goal_created", "Goal", row.id);
  revalidatePath("/app/strategy/goals");
  revalidatePath("/app/strategy");
  return { ok: true, message: "Goal created.", id: row.id };
}

export async function setGoalStatus(id: string, status: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  if (!inList(GOAL_STATUSES, status)) return { ok: false, error: "Choose a valid status." };
  const r = await db.goal.updateMany({ where: { id, workspaceId: c.workspaceId }, data: { status } });
  if (!r.count) return missing("goal");
  await audit(c, "growth.goal_status_changed", "Goal", id, { status });
  revalidatePath("/app/strategy/goals");
  revalidatePath("/app/strategy");
  return { ok: true, message: `Goal marked ${label(GOAL_STATUSES, status)}.` };
}

export async function updateGoalProgress(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const id = str(fd, "id", 40);
  const current = num(str(fd, "currentValue", 20));
  if (current == null || current === "invalid") return { ok: false, error: "Enter the current value." };
  const campaignId = str(fd, "campaignId", 40);
  const goal = await db.goal.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!goal) return missing("goal");
  if (campaignId && !(await db.campaign.findFirst({ where: { id: campaignId, workspaceId: c.workspaceId } }))) return missing("campaign");
  await db.goal.update({
    where: { id },
    data: { currentValue: current, ...(campaignId && !goal.campaignIds.includes(campaignId) ? { campaignIds: [...goal.campaignIds, campaignId] } : {}) },
  });
  await audit(c, "growth.goal_progress_updated", "Goal", id, { current });
  revalidatePath("/app/strategy/goals");
  revalidatePath("/app/strategy");
  return { ok: true, message: "Goal updated." };
}

export async function unlinkGoalCampaign(id: string, campaignId: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const goal = await db.goal.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!goal) return missing("goal");
  await db.goal.update({ where: { id }, data: { campaignIds: goal.campaignIds.filter((x) => x !== campaignId) } });
  revalidatePath("/app/strategy/goals");
  return { ok: true, message: "Campaign unlinked." };
}

export async function deleteGoal(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.goal.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return missing("goal");
  await audit(c, "growth.goal_deleted", "Goal", id);
  revalidatePath("/app/strategy/goals");
  revalidatePath("/app/strategy");
  return { ok: true, message: "Goal deleted." };
}

/* -------------------------------- Personas -------------------------------- */

export async function savePersona(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const id = str(fd, "id", 40);
  const name = str(fd, "name", 120);
  if (name.length < 2) return { ok: false, error: "Enter a persona name." };
  const status = str(fd, "status", 20) || "active";
  if (!inList(PERSONA_STATUSES, status)) return { ok: false, error: "Choose a valid status." };
  const segmentId = str(fd, "segmentId", 40);
  if (segmentId && !(await db.segment.findFirst({ where: { id: segmentId, workspaceId: c.workspaceId } }))) return missing("segment");
  const data = {
    name,
    role: str(fd, "role", 120) || null,
    status,
    segmentId: segmentId || null,
    needs: lines(str(fd, "needs", 2000)),
    painPoints: lines(str(fd, "painPoints", 2000)),
    objections: lines(str(fd, "objections", 2000)),
    channels: lines(str(fd, "channels", 2000)),
    triggers: lines(str(fd, "triggers", 2000)),
    goals: lines(str(fd, "goals", 2000)),
    notes: str(fd, "notes", 4000) || null,
  };
  if (id) {
    const r = await db.persona.updateMany({ where: { id, workspaceId: c.workspaceId }, data });
    if (!r.count) return missing("persona");
    await audit(c, "growth.persona_updated", "Persona", id);
  } else {
    const row = await db.persona.create({ data: { ...data, workspaceId: c.workspaceId } });
    await audit(c, "growth.persona_created", "Persona", row.id);
    revalidatePath("/app/strategy/personas");
    return { ok: true, message: "Persona created.", id: row.id };
  }
  revalidatePath("/app/strategy/personas");
  return { ok: true, message: "Persona saved.", id };
}

export async function deletePersona(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.persona.deleteMany({ where: { id, workspaceId: c.workspaceId } });
  if (!r.count) return missing("persona");
  await audit(c, "growth.persona_deleted", "Persona", id);
  revalidatePath("/app/strategy/personas");
  return { ok: true, message: "Persona deleted." };
}

export async function createSegment(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 120);
  if (name.length < 2) return { ok: false, error: "Enter a segment name." };
  const row = await db.segment.create({ data: { workspaceId: c.workspaceId, name, description: str(fd, "description", 1000) || null, filterCriteria: {} } });
  await audit(c, "growth.segment_created", "Segment", row.id);
  revalidatePath("/app/strategy/personas");
  return { ok: true, message: "Segment created. Add rules in Marketing Automation → Segments.", id: row.id };
}

/* ------------------------------ Channel plans ----------------------------- */

export async function saveChannelPlan(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const id = str(fd, "id", 40);
  const channel = str(fd, "channel", 30);
  if (!inList(PLAN_CHANNELS, channel)) return { ok: false, error: "Choose a channel." };
  const scenario = str(fd, "scenario", 20) || "draft";
  if (!inList(SCENARIOS, scenario)) return { ok: false, error: "Choose a scenario." };
  const budget = num(str(fd, "budget", 20));
  const plannedSpend = num(str(fd, "plannedSpend", 20));
  const expectedReturn = num(str(fd, "expectedReturn", 20));
  const targetLeads = num(str(fd, "targetLeads", 12), { int: true });
  const targetRevenue = num(str(fd, "targetRevenue", 20));
  if ([budget, plannedSpend, expectedReturn, targetLeads, targetRevenue].includes("invalid")) return { ok: false, error: "Amounts must be positive numbers." };
  if (budget == null) return { ok: false, error: "Enter the channel budget." };
  const data = {
    channel,
    scenario,
    budget: budget as number,
    plannedSpend: plannedSpend as number | null,
    expectedReturn: expectedReturn as number | null,
    targetLeads: targetLeads as number | null,
    targetRevenue: targetRevenue as number | null,
    strategy: str(fd, "strategy", 2000) || null,
    assumptions: str(fd, "assumptions", 2000) || null,
  };
  if (id) {
    const existing = await db.channelPlan.findFirst({ where: { id, workspaceId: c.workspaceId } });
    if (!existing) return missing("channel plan");
    if (existing.approvalStatus === "approved" && c.workspaceRole === "EDITOR") return { ok: false, error: "Approved allocations are locked. Ask an admin to reopen them." };
    await db.channelPlan.update({ where: { id }, data: { ...data, approvalStatus: existing.approvalStatus === "approved" ? "not_submitted" : existing.approvalStatus } });
    await audit(c, "growth.channel_plan_updated", "ChannelPlan", id);
  } else {
    const row = await db.channelPlan.create({ data: { ...data, workspaceId: c.workspaceId } });
    await audit(c, "growth.channel_plan_created", "ChannelPlan", row.id);
  }
  revalidatePath("/app/strategy/channels");
  revalidatePath("/app/strategy");
  return { ok: true, message: "Channel allocation saved." };
}

export async function deleteChannelPlan(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const existing = await db.channelPlan.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!existing) return missing("channel plan");
  if (existing.approvalStatus === "approved" && c.workspaceRole === "EDITOR") return { ok: false, error: "Approved allocations are locked." };
  await db.channelPlan.delete({ where: { id } });
  await audit(c, "growth.channel_plan_deleted", "ChannelPlan", id);
  revalidatePath("/app/strategy/channels");
  revalidatePath("/app/strategy");
  return { ok: true, message: "Allocation removed." };
}

export async function submitChannelPlan(): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.channelPlan.updateMany({ where: { workspaceId: c.workspaceId, approvalStatus: { in: ["not_submitted", "changes_requested"] } }, data: { approvalStatus: "pending" } });
  if (!r.count) return { ok: false, error: "There are no allocations waiting to be submitted." };
  await audit(c, "growth.channel_plan_submitted", "ChannelPlan", "", { count: r.count });
  revalidatePath("/app/strategy/channels");
  return { ok: true, message: "Channel plan submitted for approval." };
}

export async function reviewChannelPlan(decision: string): Promise<Result> {
  const c = await admin();
  if (!c) return { ok: false, error: "Only workspace admins can approve channel plans." };
  if (!inList(APPROVAL_STATUSES, decision) || !["approved", "changes_requested"].includes(decision)) return { ok: false, error: "Choose approve or request changes." };
  const r = await db.channelPlan.updateMany({ where: { workspaceId: c.workspaceId, approvalStatus: "pending" }, data: { approvalStatus: decision, approvedById: decision === "approved" ? c.userId : null } });
  if (!r.count) return { ok: false, error: "Nothing is pending approval." };
  await audit(c, `growth.channel_plan_${decision}`, "ChannelPlan", "", { count: r.count });
  revalidatePath("/app/strategy/channels");
  return { ok: true, message: decision === "approved" ? "Channel plan approved." : "Changes requested." };
}

/* ----------------------------- Strategy reports --------------------------- */

export async function createStrategyReport(fd: FormData): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const name = str(fd, "name", 160);
  if (name.length < 2) return { ok: false, error: "Enter a report name." };
  const type = str(fd, "type", 40);
  const period = str(fd, "period", 5) || "90";
  if (!inList(STRATEGY_REPORT_TYPES, type) || !inList(PERIODS, period)) return { ok: false, error: "Choose a report type and period." };
  const sections = REPORT_SECTIONS.map(([k]) => k).filter((k) => fd.get(`section_${k}`) === "on");
  const row = await db.report.create({
    data: { workspaceId: c.workspaceId, name, type, status: "draft", createdById: c.userId, config: { periodDays: Number(period), sections: sections.length ? sections : REPORT_SECTIONS.map(([k]) => k) } },
  });
  await audit(c, "report.created", "Report", row.id, { type });
  revalidatePath("/app/strategy/reports");
  return { ok: true, message: "Report created.", id: row.id };
}

export async function setReportShared(id: string, shared: boolean): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.report.updateMany({ where: { id, workspaceId: c.workspaceId, type: { startsWith: "strategy_" } }, data: { sharedAt: shared ? new Date() : null } });
  if (!r.count) return missing("report");
  await audit(c, shared ? "report.shared" : "report.unshared", "Report", id);
  revalidatePath("/app/strategy/reports");
  return { ok: true, message: shared ? "Shared with workspace members." : "Sharing stopped." };
}

export async function setReportStatus(id: string, status: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  if (!["draft", "final"].includes(status)) return { ok: false, error: "Choose a valid status." };
  const r = await db.report.updateMany({ where: { id, workspaceId: c.workspaceId, type: { startsWith: "strategy_" } }, data: { status } });
  if (!r.count) return missing("report");
  revalidatePath("/app/strategy/reports");
  return { ok: true, message: status === "final" ? "Report finalized." : "Report moved back to draft." };
}

export async function deleteStrategyReport(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const r = await db.report.deleteMany({ where: { id, workspaceId: c.workspaceId, type: { startsWith: "strategy_" } } });
  if (!r.count) return missing("report");
  await audit(c, "report.deleted", "Report", id);
  revalidatePath("/app/strategy/reports");
  return { ok: true, message: "Report deleted." };
}

/* ---------------------------- AI recommendations -------------------------- */

const REC_STATUSES = ["new", "pending", "saved", "ready", "in_progress", "implemented", "dismissed", "archived"];

export async function setRecommendationStatus(id: string, status: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  if (!REC_STATUSES.includes(status)) return { ok: false, error: "Choose a valid status." };
  const r = await db.recommendation.updateMany({ where: { id, workspaceId: c.workspaceId }, data: { status } });
  if (!r.count) return missing("recommendation");
  await audit(c, "growth.recommendation_status_changed", "Recommendation", id, { status });
  revalidatePath("/app/ai-advisor", "layout");
  return { ok: true, message: `Marked ${status.replace("_", " ")}.` };
}

/** Turns a recommendation into a workspace task and puts it in progress. */
export async function recommendationToTask(id: string): Promise<Result> {
  const c = await editor();
  if (!c) return denied;
  const rec = await db.recommendation.findFirst({ where: { id, workspaceId: c.workspaceId } });
  if (!rec) return missing("recommendation");
  const task = await db.task.create({
    data: { workspaceId: c.workspaceId, title: rec.title.slice(0, 200), description: [rec.body ?? rec.description ?? "", `From AI recommendation (${rec.category}).`].filter(Boolean).join("\n\n"), priority: rec.impact === "high" ? "high" : rec.impact === "low" ? "low" : "medium", status: "open", assigneeId: c.userId },
  });
  if (["new", "pending", "saved", "ready"].includes(rec.status)) await db.recommendation.update({ where: { id }, data: { status: "in_progress" } });
  await audit(c, "task.created", "Task", task.id, { recommendationId: id });
  revalidatePath("/app/ai-advisor", "layout");
  revalidatePath("/app/workspace/tasks");
  return { ok: true, message: "Task created and assigned to you." };
}
