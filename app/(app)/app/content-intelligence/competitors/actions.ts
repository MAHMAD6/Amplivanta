"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { writeAudit } from "@/lib/audit";
import { MAX_TRACKED, refreshCompetitor, runDiscovery } from "@/lib/server/competitor-intel";

/**
 * Competitor Watch actions.
 *
 * Competitors are workspace-scoped. Discovery only proposes candidates; nothing
 * is added until a user confirms it, matching the design's promise that "no
 * competitors are added without your confirmation".
 */

export type CwResult = { ok: true; message: string } | { ok: false; error: string };
export type Suggestion = {
  id: string;
  domain: string;
  score: number;
  sharedKeywords: number;
  avgPosition: number | null;
  reasons: string[];
};

const PATH = "/app/content-intelligence/competitors";
const TYPES = ["direct", "indirect", "aspirational"] as const;

/** Canonical host, so the same site is never tracked twice under two spellings. */
function normalizeWebsite(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    if (!u.hostname.includes(".")) return null;
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

/** V1 tracks at most MAX_TRACKED active competitors per workspace. */
async function atTrackingLimit(workspaceId: string, extra = 1) {
  const active = await db.competitor.count({ where: { workspaceId, trackingEnabled: true } });
  return active + extra > MAX_TRACKED();
}

async function ctx() {
  try {
    return await getSessionContext();
  } catch {
    return null;
  }
}

export async function addCompetitor(fd: FormData): Promise<CwResult> {
  const c = await ctx();
  if (!c) return { ok: false, error: "Sign in to track competitors." };
  const name = String(fd.get("name") ?? "").trim().slice(0, 120);
  const websiteRaw = String(fd.get("website") ?? "");
  const type = String(fd.get("type") ?? "direct");
  if (name.length < 2) return { ok: false, error: "Enter the competitor's name." };
  const website = normalizeWebsite(websiteRaw);
  if (websiteRaw.trim() && !website) return { ok: false, error: "Enter a valid website, e.g. example.com." };
  if (!(TYPES as readonly string[]).includes(type)) return { ok: false, error: "Choose a competitor type." };

  try {
    if (website) {
      const dup = await db.competitor.findFirst({ where: { workspaceId: c.workspaceId, website }, select: { id: true } });
      if (dup) return { ok: false, error: "That website is already being tracked." };
    }
    if (await atTrackingLimit(c.workspaceId)) {
      return { ok: false, error: `You can actively track up to ${MAX_TRACKED()} competitors. Pause one to add another.` };
    }
    const row = await db.competitor.create({
      data: { workspaceId: c.workspaceId, name, website, type, source: "manual" },
    });
    await writeAudit(c, "competitor.added", { resourceType: "Competitor", resourceId: row.id, metadata: { source: "manual" } }).catch(() => {});
    revalidatePath(PATH);
    return { ok: true, message: `${name} is now tracked.` };
  } catch {
    return { ok: false, error: "Could not add the competitor — the database was unreachable." };
  }
}

export async function setCompetitorTracking(id: string, trackingEnabled: boolean): Promise<CwResult> {
  const c = await ctx();
  if (!c) return { ok: false, error: "Sign in to manage competitors." };
  try {
    if (trackingEnabled && (await atTrackingLimit(c.workspaceId))) {
      return { ok: false, error: `You can actively track up to ${MAX_TRACKED()} competitors. Pause one first.` };
    }
    const r = await db.competitor.updateMany({ where: { id, workspaceId: c.workspaceId }, data: { trackingEnabled } });
    if (r.count === 0) return { ok: false, error: "That competitor is not in your workspace." };
    revalidatePath(PATH);
    return { ok: true, message: trackingEnabled ? "Tracking resumed." : "Tracking paused." };
  } catch {
    return { ok: false, error: "Could not update tracking." };
  }
}

export async function removeCompetitor(id: string): Promise<CwResult> {
  const c = await ctx();
  if (!c) return { ok: false, error: "Sign in to manage competitors." };
  try {
    const r = await db.competitor.deleteMany({ where: { id, workspaceId: c.workspaceId } });
    if (r.count === 0) return { ok: false, error: "That competitor is not in your workspace." };
    await writeAudit(c, "competitor.removed", { resourceType: "Competitor", resourceId: id }).catch(() => {});
    revalidatePath(PATH);
    return { ok: true, message: "Competitor removed." };
  } catch {
    return { ok: false, error: "Could not remove the competitor." };
  }
}

/**
 * Runs provider-backed discovery (domain competitors plus SERP competitors
 * for the given keywords) and returns scored candidates with their evidence.
 * Candidates are stored as suggestions; nothing is tracked until confirmed.
 */
export async function discoverCompetitors(fd: FormData): Promise<{ ok: true; suggestions: Suggestion[] } | { ok: false; error: string }> {
  const c = await ctx();
  if (!c) return { ok: false, error: "Sign in to discover competitors." };
  const website = String(fd.get("website") ?? "").trim().slice(0, 200);
  const location = String(fd.get("location") ?? "").trim().slice(0, 80) || process.env.COMPETITOR_WATCH_DEFAULT_LOCATION || "United States";
  const language = String(fd.get("language") ?? "").trim().slice(0, 40) || "English";
  const keywords = String(fd.get("keywords") ?? "")
    .split(/[,\n]/)
    .map((k) => k.trim().slice(0, 80))
    .filter(Boolean)
    .slice(0, 50);
  if (website && !normalizeWebsite(website)) return { ok: false, error: "Enter a valid website, e.g. yourcompany.com." };

  try {
    // One discovery per workspace per 10 minutes keeps provider cost bounded.
    const recent = await db.competitorDiscoveryRun.findFirst({
      where: { workspaceId: c.workspaceId, createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) }, status: { not: "failed" } },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    let runId = recent?.id ?? null;
    if (!runId) {
      const res = await runDiscovery({ workspaceId: c.workspaceId, userId: c.userId ?? null, domain: website || null, keywords, market: { location, language } });
      if (!res.ok) return { ok: false, error: res.error };
      runId = res.runId;
      await writeAudit(c, "competitor.discovery_run", { resourceType: "CompetitorDiscoveryRun", resourceId: runId, metadata: { candidates: res.count } }).catch(() => {});
    }
    const rows = await db.competitorCandidate.findMany({
      where: { runId, workspaceId: c.workspaceId, status: "suggested" },
      orderBy: { score: "desc" },
      take: 20,
    });
    if (rows.length === 0) return { ok: false, error: "No competitors with enough shared search visibility were found. Try adding keywords." };
    return { ok: true, suggestions: rows.map(toSuggestion) };
  } catch {
    return { ok: false, error: "Competitor data is unavailable right now. Please try again later." };
  }
}

function toSuggestion(r: { id: string; domain: string; score: number; evidence: unknown }): Suggestion {
  const e = (r.evidence ?? {}) as { sharedKeywords?: number; avgPosition?: number | null; reasons?: string[] };
  return {
    id: r.id,
    domain: r.domain,
    score: r.score,
    sharedKeywords: Number(e.sharedKeywords ?? 0),
    avgPosition: e.avgPosition ?? null,
    reasons: Array.isArray(e.reasons) ? e.reasons.map(String) : [],
  };
}

/** Tracks only the candidates the user ticked, within the tracking limit. */
export async function confirmDiscovered(candidateIds: string[]): Promise<CwResult> {
  const c = await ctx();
  if (!c) return { ok: false, error: "Sign in to track competitors." };
  const ids = (Array.isArray(candidateIds) ? candidateIds : []).filter((x) => typeof x === "string").slice(0, 20);
  if (ids.length === 0) return { ok: false, error: "Select at least one competitor to track." };
  try {
    const picks = await db.competitorCandidate.findMany({ where: { id: { in: ids }, workspaceId: c.workspaceId, status: "suggested" } });
    const active = await db.competitor.count({ where: { workspaceId: c.workspaceId, trackingEnabled: true } });
    const room = MAX_TRACKED() - active;
    if (room <= 0) return { ok: false, error: `You already track ${MAX_TRACKED()} competitors. Pause one to add another.` };
    let added = 0;
    for (const p of picks.slice(0, room)) {
      const dup = await db.competitor.findFirst({ where: { workspaceId: c.workspaceId, website: p.domain }, select: { id: true } });
      if (!dup) {
        const e = (p.evidence ?? {}) as { reasons?: string[] };
        const row = await db.competitor.create({
          data: {
            workspaceId: c.workspaceId,
            name: p.domain,
            website: p.domain,
            type: "direct",
            source: "discovered",
            reason: (Array.isArray(e.reasons) ? e.reasons.join(" · ") : "").slice(0, 300) || null,
          },
        });
        await writeAudit(c, "competitor.added", { resourceType: "Competitor", resourceId: row.id, metadata: { source: "discovered", candidateId: p.id } }).catch(() => {});
        added++;
      }
      await db.competitorCandidate.update({ where: { id: p.id }, data: { status: "added" } });
    }
    revalidatePath(PATH);
    const skipped = picks.length - Math.min(picks.length, room);
    const base = added ? `${added} competitor${added === 1 ? "" : "s"} now tracked.` : "Those competitors were already tracked.";
    return { ok: true, message: skipped ? `${base} ${skipped} not added — tracking limit is ${MAX_TRACKED()}.` : base };
  } catch {
    return { ok: false, error: "Could not add competitors — the database was unreachable." };
  }
}

export async function dismissCandidates(candidateIds: string[]): Promise<CwResult> {
  const c = await ctx();
  if (!c) return { ok: false, error: "Sign in to manage competitors." };
  const ids = (Array.isArray(candidateIds) ? candidateIds : []).filter((x) => typeof x === "string").slice(0, 20);
  try {
    await db.competitorCandidate.updateMany({ where: { id: { in: ids }, workspaceId: c.workspaceId, status: "suggested" }, data: { status: "dismissed" } });
    return { ok: true, message: "Suggestions dismissed." };
  } catch {
    return { ok: false, error: "Could not update suggestions." };
  }
}

/** On-demand refresh (at most once per 24h per competitor). */
export async function refreshCompetitorNow(id: string): Promise<CwResult> {
  const c = await ctx();
  if (!c) return { ok: false, error: "Sign in to manage competitors." };
  try {
    const r = await refreshCompetitor(c.workspaceId, id);
    if (!r.ok) return { ok: false, error: r.error };
    revalidatePath(PATH);
    const parts = [`Data refreshed.`];
    if (r.signals) parts.push(`${r.signals} new signal${r.signals === 1 ? "" : "s"}.`);
    if (r.gapsSkipped) parts.push("Run discovery with your website to see keyword gaps.");
    return { ok: true, message: parts.join(" ") };
  } catch {
    return { ok: false, error: "Competitor data is unavailable right now." };
  }
}
