import "server-only";
import { db } from "@/lib/db";
import {
  competitorsDomain,
  domainIntersection,
  isDataForSeoConfigured,
  rankedKeywords,
  relevantPages,
  serpCompetitors,
  type Market,
} from "@/lib/providers/dataforseo";
import { classifyGap, detectSignals, normalizeDomain, scoreCandidates, type RawCandidate } from "@/lib/competitors/intel-policy";

/**
 * Competitor Watch service: discovery, approval and refresh.
 *
 * Page loads never call the provider — they read what this service stored.
 * Discovered competitors are only suggestions until a user adds them.
 */

export const MAX_TRACKED = () => {
  const n = Number(process.env.COMPETITOR_WATCH_MAX_TRACKED);
  return Number.isInteger(n) && n > 0 ? n : 5;
};

/** Minimum interval between on-demand refreshes of one competitor. */
const REFRESH_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export type DiscoveryInput = { workspaceId: string; userId: string | null; domain: string | null; keywords: string[]; market: Market };

export async function runDiscovery(input: DiscoveryInput) {
  if (!isDataForSeoConfigured()) return { ok: false as const, error: "Competitor discovery is not configured yet. You can add competitors manually." };
  const domain = normalizeDomain(input.domain);
  const keywords = input.keywords.map((k) => k.trim()).filter(Boolean).slice(0, 50);
  if (!domain && keywords.length === 0) return { ok: false as const, error: "Enter your website or at least one target keyword." };

  const run = await db.competitorDiscoveryRun.create({
    data: {
      workspaceId: input.workspaceId,
      domain,
      location: input.market.location,
      language: input.market.language,
      keywords,
      createdByUserId: input.userId,
    },
  });

  const [byDomain, bySerp] = await Promise.all([
    domain ? competitorsDomain(input.workspaceId, domain, input.market) : Promise.resolve(null),
    keywords.length ? serpCompetitors(input.workspaceId, keywords, input.market) : Promise.resolve(null),
  ]);

  const failures = [byDomain, bySerp].filter((r) => r && !r.ok) as { ok: false; error: string }[];
  const raw: RawCandidate[] = [];
  if (byDomain?.ok) {
    for (const i of byDomain.items) {
      if (!i.domain) continue;
      raw.push({ domain: i.domain, source: "competitors_domain", sharedKeywords: i.intersections ?? 0, avgPosition: i.avg_position ?? null, etv: i.full_domain_metrics?.organic?.etv ?? null });
    }
  }
  if (bySerp?.ok) {
    for (const i of bySerp.items) {
      if (!i.domain) continue;
      raw.push({ domain: i.domain, source: "serp_competitors", sharedKeywords: i.keywords_count ?? 0, avgPosition: i.avg_position ?? null, etv: i.etv ?? null });
    }
  }

  if (raw.length === 0 && failures.length > 0) {
    await db.competitorDiscoveryRun.update({ where: { id: run.id }, data: { status: "failed", error: failures[0].error.slice(0, 300) } });
    return { ok: false as const, error: "Competitor data is unavailable right now. Please try again later." };
  }

  const tracked = await db.competitor.findMany({ where: { workspaceId: input.workspaceId }, select: { website: true } });
  const scored = scoreCandidates(raw, { customerDomain: domain, alreadyTracked: tracked.map((t) => t.website ?? ""), limit: 20 });

  if (scored.length) {
    await db.competitorCandidate.createMany({
      data: scored.map((c) => ({
        runId: run.id,
        workspaceId: input.workspaceId,
        domain: c.domain,
        score: c.score,
        evidence: { sharedKeywords: c.sharedKeywords, avgPosition: c.avgPosition, etv: c.etv, source: c.source, reasons: c.reasons },
      })),
      skipDuplicates: true,
    });
  }
  await db.competitorDiscoveryRun.update({ where: { id: run.id }, data: { status: "completed", candidateCount: scored.length } });
  return { ok: true as const, runId: run.id, count: scored.length };
}

/** The workspace's own domain and market from its latest discovery, for gap analysis. */
async function latestContext(workspaceId: string): Promise<{ domain: string | null; market: Market }> {
  const run = await db.competitorDiscoveryRun.findFirst({
    where: { workspaceId, status: "completed" },
    orderBy: { createdAt: "desc" },
    select: { domain: true, location: true, language: true },
  });
  return {
    domain: run?.domain ?? null,
    market: { location: run?.location ?? process.env.COMPETITOR_WATCH_DEFAULT_LOCATION ?? "United States", language: run?.language ?? "English" },
  };
}

/**
 * Refreshes one tracked competitor: ranked keywords (with signal detection
 * against the previous snapshot), keyword gaps against the workspace domain,
 * and relevant pages. Partial provider failures keep whatever succeeded.
 */
export async function refreshCompetitor(workspaceId: string, competitorId: string, opts: { force?: boolean } = {}) {
  if (!isDataForSeoConfigured()) return { ok: false as const, error: "Competitor data is not configured yet." };
  const competitor = await db.competitor.findFirst({
    where: { id: competitorId, workspaceId, trackingEnabled: true },
    select: { id: true, website: true, lastRefreshedAt: true },
  });
  if (!competitor) return { ok: false as const, error: "That competitor is not tracked in this workspace." };
  const target = normalizeDomain(competitor.website);
  if (!target) return { ok: false as const, error: "Add a website to this competitor to collect data." };
  if (!opts.force && competitor.lastRefreshedAt && Date.now() - competitor.lastRefreshedAt.getTime() < REFRESH_COOLDOWN_MS) {
    return { ok: false as const, error: "This competitor was refreshed in the last 24 hours." };
  }

  const ctx = await latestContext(workspaceId);
  const [ranked, pages, missing, shared] = await Promise.all([
    rankedKeywords(workspaceId, target, ctx.market),
    relevantPages(workspaceId, target, ctx.market),
    ctx.domain ? domainIntersection(workspaceId, ctx.domain, target, ctx.market, false) : Promise.resolve(null),
    ctx.domain ? domainIntersection(workspaceId, ctx.domain, target, ctx.market, true) : Promise.resolve(null),
  ]);

  const now = new Date();
  let signals = 0;

  if (ranked.ok) {
    const previous = await db.competitorKeyword.findMany({ where: { competitorId }, select: { keyword: true, position: true } });
    const prevMap = new Map(previous.map((p) => [p.keyword, p.position]));
    const current = new Map<string, { position: number | null; volume: number | null; url: string | null }>();
    for (const i of ranked.items) {
      const kw = i.keyword_data?.keyword;
      if (!kw) continue;
      current.set(kw, {
        position: i.ranked_serp_element?.serp_item?.rank_absolute ?? null,
        volume: i.keyword_data?.keyword_info?.search_volume ?? null,
        url: i.ranked_serp_element?.serp_item?.url ?? null,
      });
    }
    const changes = previous.length
      ? [
          ...[...current].map(([keyword, v]) => ({ keyword, from: prevMap.get(keyword) ?? null, to: v.position })),
          ...previous.filter((p) => !current.has(p.keyword)).map((p) => ({ keyword: p.keyword, from: p.position, to: null })),
        ]
      : []; // first snapshot establishes a baseline, it is not "movement"

    const existingPages = new Set((await db.competitorPage.findMany({ where: { competitorId }, select: { url: true } })).map((p) => p.url));
    const newPages = pages.ok && existingPages.size > 0
      ? pages.items.map((p) => p.page_address).filter((u): u is string => Boolean(u) && !existingPages.has(u as string)).slice(0, 5)
      : [];

    const drafts = detectSignals(target, changes, newPages);
    await db.$transaction([
      db.competitorKeyword.deleteMany({ where: { competitorId, keyword: { notIn: [...current.keys()] } } }),
      ...[...current].map(([keyword, v]) =>
        db.competitorKeyword.upsert({
          where: { competitorId_keyword: { competitorId, keyword } },
          create: { workspaceId, competitorId, keyword, position: v.position, searchVolume: v.volume, url: v.url, capturedAt: now },
          update: { position: v.position, searchVolume: v.volume, url: v.url, capturedAt: now },
        }),
      ),
      ...(drafts.length
        ? [db.competitorSignal.createMany({ data: drafts.map((d) => ({ workspaceId, competitorId, kind: d.kind, title: d.title.slice(0, 300), severity: d.severity, detail: d.detail as never })) })]
        : []),
    ]);
    signals = drafts.length;
  }

  if (pages.ok) {
    await db.$transaction(
      pages.items
        .filter((p) => p.page_address)
        .map((p) =>
          db.competitorPage.upsert({
            where: { competitorId_url: { competitorId, url: p.page_address as string } },
            create: { workspaceId, competitorId, url: p.page_address as string, organicCount: p.metrics?.organic?.count ?? null, etv: p.metrics?.organic?.etv ?? null, capturedAt: now },
            update: { organicCount: p.metrics?.organic?.count ?? null, etv: p.metrics?.organic?.etv ?? null, capturedAt: now },
          }),
        ),
    );
  }

  const gapRows: { keyword: string; ours: number | null; theirs: number | null; volume: number | null }[] = [];
  for (const res of [missing, shared]) {
    if (!res?.ok) continue;
    for (const i of res.items) {
      const kw = i.keyword_data?.keyword;
      if (!kw) continue;
      gapRows.push({
        keyword: kw,
        ours: i.first_domain_serp_element?.rank_absolute ?? null,
        theirs: i.second_domain_serp_element?.rank_absolute ?? null,
        volume: i.keyword_data?.keyword_info?.search_volume ?? null,
      });
    }
  }
  if (gapRows.length) {
    const writes = gapRows
      .map((g) => ({ ...g, kind: classifyGap(g.ours, g.theirs) }))
      .filter((g): g is typeof g & { kind: NonNullable<typeof g.kind> } => g.kind !== null)
      .map((g) =>
        db.competitorKeywordGap.upsert({
          where: { competitorId_keyword: { competitorId, keyword: g.keyword } },
          create: { workspaceId, competitorId, keyword: g.keyword, ourPosition: g.ours, theirPosition: g.theirs, kind: g.kind, searchVolume: g.volume, capturedAt: now },
          update: { ourPosition: g.ours, theirPosition: g.theirs, kind: g.kind, searchVolume: g.volume, capturedAt: now },
        }),
      );
    await db.$transaction(writes);
  }

  const anyOk = ranked.ok || pages.ok || missing?.ok || shared?.ok;
  if (anyOk) await db.competitor.update({ where: { id: competitorId }, data: { lastRefreshedAt: now } });
  return anyOk
    ? { ok: true as const, signals, gaps: gapRows.length, gapsSkipped: !ctx.domain }
    : { ok: false as const, error: "Competitor data is unavailable right now." };
}

/** Weekly refresh for stale tracked competitors, bounded per run. */
export async function refreshStaleCompetitors(limit = 25) {
  const staleBefore = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const due = await db.competitor.findMany({
    where: { trackingEnabled: true, website: { not: null }, OR: [{ lastRefreshedAt: null }, { lastRefreshedAt: { lt: staleBefore } }] },
    orderBy: { lastRefreshedAt: { sort: "asc", nulls: "first" } },
    take: limit,
    select: { id: true, workspaceId: true },
  });
  let refreshed = 0;
  for (const c of due) {
    const r = await refreshCompetitor(c.workspaceId, c.id, { force: true });
    if (r.ok) refreshed++;
  }
  return { due: due.length, refreshed };
}
