"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { writeAudit } from "@/lib/audit";
import { complete, isAiConfigured } from "@/lib/ai";

/**
 * Competitor Watch actions.
 *
 * Competitors are workspace-scoped. Discovery only proposes candidates; nothing
 * is added until a user confirms it, matching the design's promise that "no
 * competitors are added without your confirmation".
 */

export type CwResult = { ok: true; message: string } | { ok: false; error: string };
export type Suggestion = { name: string; website: string | null; reason: string };

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
 * Proposes competitors from what the user tells us about their business.
 * Requires a configured AI provider: without one, it says so rather than
 * returning placeholder companies. Suggestions are never saved here.
 */
export async function discoverCompetitors(fd: FormData): Promise<{ ok: true; suggestions: Suggestion[] } | { ok: false; error: string }> {
  const c = await ctx();
  if (!c) return { ok: false, error: "Sign in to discover competitors." };
  if (!isAiConfigured()) {
    return { ok: false, error: "Competitor discovery needs an AI provider to be configured. You can add competitors manually." };
  }
  const website = String(fd.get("website") ?? "").trim().slice(0, 200);
  const industry = String(fd.get("industry") ?? "").trim().slice(0, 120);
  const location = String(fd.get("location") ?? "").trim().slice(0, 120);
  const keywords = String(fd.get("keywords") ?? "").trim().slice(0, 300);
  if (!website && !industry && !keywords) {
    return { ok: false, error: "Tell us your website, industry or keywords first." };
  }

  const existing = await db.competitor
    .findMany({ where: { workspaceId: c.workspaceId }, select: { name: true, website: true } })
    .catch(() => []);

  const system =
    "You identify real, currently operating companies that compete with the described business. " +
    "Return strict JSON only: [{\"name\":string,\"website\":string|null,\"reason\":string}] with at most 8 entries. " +
    "Only include companies you are confident exist. Give the bare domain for website, or null if unsure. " +
    "The reason is one factual sentence on why they compete. Never invent metrics.";
  const prompt = [
    website && `Website: ${website}`,
    industry && `Industry: ${industry}`,
    location && `Location: ${location}`,
    keywords && `Keywords: ${keywords}`,
    existing.length ? `Already tracked (exclude): ${existing.map((e) => e.website ?? e.name).join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await complete({ system, prompt, maxTokens: 900 });
    if (res.stubbed) {
      return { ok: false, error: "Competitor discovery needs an AI provider to be configured. You can add competitors manually." };
    }
    const json = JSON.parse(res.text.slice(res.text.indexOf("["), res.text.lastIndexOf("]") + 1));
    const tracked = new Set(existing.map((e) => e.website).filter(Boolean));
    const suggestions: Suggestion[] = (Array.isArray(json) ? json : [])
      .map((s: Record<string, unknown>) => ({
        name: String(s.name ?? "").trim().slice(0, 120),
        website: typeof s.website === "string" ? normalizeWebsite(s.website) : null,
        reason: String(s.reason ?? "").trim().slice(0, 300),
      }))
      .filter((s) => s.name.length >= 2 && !(s.website && tracked.has(s.website)))
      .slice(0, 8);
    if (suggestions.length === 0) return { ok: false, error: "No confident matches were found. Try adding keywords." };
    return { ok: true, suggestions };
  } catch {
    return { ok: false, error: "Discovery did not return usable results. Please try again." };
  }
}

/** Adds only the suggestions the user ticked. */
export async function confirmDiscovered(selected: Suggestion[]): Promise<CwResult> {
  const c = await ctx();
  if (!c) return { ok: false, error: "Sign in to track competitors." };
  const clean = (Array.isArray(selected) ? selected : []).slice(0, 8).filter((s) => typeof s?.name === "string" && s.name.trim().length >= 2);
  if (clean.length === 0) return { ok: false, error: "Select at least one competitor to track." };
  try {
    let added = 0;
    for (const s of clean) {
      const website = s.website ? normalizeWebsite(s.website) : null;
      if (website) {
        const dup = await db.competitor.findFirst({ where: { workspaceId: c.workspaceId, website }, select: { id: true } });
        if (dup) continue;
      }
      const row = await db.competitor.create({
        data: {
          workspaceId: c.workspaceId,
          name: s.name.trim().slice(0, 120),
          website,
          type: "direct",
          source: "discovered",
          reason: String(s.reason ?? "").slice(0, 300) || null,
        },
      });
      await writeAudit(c, "competitor.added", { resourceType: "Competitor", resourceId: row.id, metadata: { source: "discovered" } }).catch(() => {});
      added++;
    }
    revalidatePath(PATH);
    return { ok: true, message: added ? `${added} competitor${added === 1 ? "" : "s"} now tracked.` : "Those competitors were already tracked." };
  } catch {
    return { ok: false, error: "Could not add competitors — the database was unreachable." };
  }
}
