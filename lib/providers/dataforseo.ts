import "server-only";
import { db } from "@/lib/db";

/**
 * DataForSEO provider (Implementation Guidelines, V1).
 *
 * Backend-only: credentials come from DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD
 * and never reach the browser, logs or customer settings. Every call records
 * its endpoint, task id and cost per workspace in ProviderUsage. Callers get
 * normalized results or a neutral error; raw vendor payloads stay here.
 */

const BASE = "https://api.dataforseo.com/v3";

export function isDataForSeoConfigured(): boolean {
  return Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);
}

export type DfsResult<T> = { ok: true; items: T[]; cost: number } | { ok: false; error: string };

type DfsTask = { id?: string; status_code?: number; status_message?: string; cost?: number; result?: { items?: unknown[] | null }[] | null };
type DfsResponse = { status_code?: number; status_message?: string; cost?: number; tasks?: DfsTask[] };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Posts one live task. Retries only transient failures (network, 5xx, 429,
 * provider 50000-range) with bounded backoff; validation and billing errors
 * return immediately.
 */
async function live<T>(endpoint: string, body: Record<string, unknown>, workspaceId: string | null): Promise<DfsResult<T>> {
  if (!isDataForSeoConfigured()) return { ok: false, error: "Competitor data is not configured yet." };
  const auth = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString("base64");
  // Tag with internal identifiers only — no personal data.
  const payload = [{ ...body, tag: workspaceId ? `ws:${workspaceId}` : "platform" }];

  let lastError = "Competitor data provider did not respond.";
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await sleep(400 * 2 ** attempt);
    let res: Response;
    try {
      res = await fetch(`${BASE}/${endpoint}`, {
        method: "POST",
        headers: { authorization: `Basic ${auth}`, "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(Number(process.env.DATAFORSEO_TIMEOUT_MS ?? 45000)),
      });
    } catch {
      continue; // network error: retry
    }
    if (res.status === 429 || res.status >= 500) {
      lastError = `Provider temporarily unavailable (${res.status}).`;
      continue;
    }
    let data: DfsResponse;
    try {
      data = (await res.json()) as DfsResponse;
    } catch {
      return { ok: false, error: "Provider returned an unreadable response." };
    }
    const task = data.tasks?.[0];
    const cost = Number(task?.cost ?? data.cost ?? 0) || 0;
    await recordUsage(workspaceId, endpoint, task?.id ?? null, cost, task?.status_code === 20000 ? "ok" : "error");

    if (!res.ok || data.status_code !== 20000) {
      return { ok: false, error: `Provider error: ${data.status_message ?? res.status}` };
    }
    if (!task || task.status_code !== 20000) {
      const code = task?.status_code ?? 0;
      if (code >= 50000) {
        lastError = task?.status_message ?? "Provider task failed.";
        continue;
      }
      return { ok: false, error: task?.status_message ?? "Provider task failed." };
    }
    const items = (task.result?.[0]?.items ?? []) as T[];
    return { ok: true, items, cost };
  }
  return { ok: false, error: lastError };
}

async function recordUsage(workspaceId: string | null, endpoint: string, taskId: string | null, cost: number, status: string) {
  try {
    await db.providerUsage.create({ data: { workspaceId, provider: "dataforseo", endpoint, taskId, cost, status } });
  } catch {
    /* usage logging must not break the request */
  }
}

export type Market = { location: string; language: string };

const market = (m: Market) => ({ location_name: m.location, language_name: m.language });

/* ------------------------------------------------------------- endpoints */

export type CompetitorsDomainItem = { domain?: string; avg_position?: number; intersections?: number; full_domain_metrics?: { organic?: { etv?: number } } };
export const competitorsDomain = (workspaceId: string, target: string, m: Market, limit = 30) =>
  live<CompetitorsDomainItem>("dataforseo_labs/google/competitors_domain/live", { target, ...market(m), limit, exclude_top_domains: true }, workspaceId);

export type SerpCompetitorItem = { domain?: string; avg_position?: number; keywords_count?: number; etv?: number };
export const serpCompetitors = (workspaceId: string, keywords: string[], m: Market, limit = 30) =>
  live<SerpCompetitorItem>("dataforseo_labs/google/serp_competitors/live", { keywords: keywords.slice(0, 200), ...market(m), limit }, workspaceId);

export type RankedKeywordItem = {
  keyword_data?: { keyword?: string; keyword_info?: { search_volume?: number } };
  ranked_serp_element?: { serp_item?: { rank_absolute?: number; url?: string } };
};
export const rankedKeywords = (workspaceId: string, target: string, m: Market, limit = 50) =>
  live<RankedKeywordItem>(
    "dataforseo_labs/google/ranked_keywords/live",
    { target, ...market(m), limit, filters: ["ranked_serp_element.serp_item.rank_absolute", "<=", 20], order_by: ["keyword_data.keyword_info.search_volume,desc"] },
    workspaceId,
  );

export type DomainIntersectionItem = {
  keyword_data?: { keyword?: string; keyword_info?: { search_volume?: number } };
  first_domain_serp_element?: { rank_absolute?: number };
  second_domain_serp_element?: { rank_absolute?: number };
};
export const domainIntersection = (workspaceId: string, ours: string, theirs: string, m: Market, intersections: boolean, limit = 50) =>
  live<DomainIntersectionItem>(
    "dataforseo_labs/google/domain_intersection/live",
    { target1: ours, target2: theirs, intersections, ...market(m), limit, order_by: ["keyword_data.keyword_info.search_volume,desc"] },
    workspaceId,
  );

export type RelevantPageItem = { page_address?: string; metrics?: { organic?: { count?: number; etv?: number } } };
export const relevantPages = (workspaceId: string, target: string, m: Market, limit = 20) =>
  live<RelevantPageItem>("dataforseo_labs/google/relevant_pages/live", { target, ...market(m), limit, order_by: ["metrics.organic.etv,desc"] }, workspaceId);
