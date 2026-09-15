/**
 * Pure Competitor Watch rules (DataForSEO Implementation Guidelines, V1).
 *
 * Kept free of I/O so normalization, scoring, gap classification and signal
 * detection are unit-testable. Every figure here comes from provider facts;
 * nothing is estimated or invented.
 */

/** Bare, lower-case registrable host: "https://www.Example.com/x" -> "example.com". */
export function normalizeDomain(raw: string | null | undefined): string | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    return host.includes(".") && !/\s/.test(host) ? host : null;
  } catch {
    return null;
  }
}

/** Marketplaces, social networks and encyclopedias rank everywhere but are not competitors. */
const GENERIC_DOMAINS = new Set([
  "google.com", "youtube.com", "facebook.com", "instagram.com", "linkedin.com", "twitter.com", "x.com",
  "wikipedia.org", "reddit.com", "amazon.com", "pinterest.com", "tiktok.com", "quora.com", "yelp.com",
  "apple.com", "microsoft.com", "medium.com",
]);

export type RawCandidate = {
  domain: string;
  source: "competitors_domain" | "serp_competitors";
  /** Keywords the candidate shares with the customer (competitors_domain) or ranks for (serp). */
  sharedKeywords: number;
  avgPosition: number | null;
  /** Estimated traffic value from the provider, when returned. */
  etv: number | null;
};

export type ScoredCandidate = RawCandidate & { score: number; reasons: string[] };

/**
 * Merges both discovery sources, drops the customer's own domain and generic
 * platforms, and scores by shared keywords and ranking strength. The reasons
 * are the evidence shown before "Add to Watch".
 */
export function scoreCandidates(
  rows: RawCandidate[],
  opts: { customerDomain: string | null; alreadyTracked: string[]; limit?: number },
): ScoredCandidate[] {
  const own = normalizeDomain(opts.customerDomain);
  const tracked = new Set(opts.alreadyTracked.map((d) => normalizeDomain(d)).filter(Boolean));
  const merged = new Map<string, RawCandidate & { sources: Set<string> }>();

  for (const r of rows) {
    const domain = normalizeDomain(r.domain);
    if (!domain || domain === own || tracked.has(domain) || GENERIC_DOMAINS.has(domain)) continue;
    if (own && (domain.endsWith(`.${own}`) || own.endsWith(`.${domain}`))) continue;
    const prev = merged.get(domain);
    if (!prev) {
      merged.set(domain, { ...r, domain, sources: new Set([r.source]) });
    } else {
      prev.sources.add(r.source);
      prev.sharedKeywords = Math.max(prev.sharedKeywords, r.sharedKeywords);
      prev.avgPosition =
        prev.avgPosition == null ? r.avgPosition : r.avgPosition == null ? prev.avgPosition : Math.min(prev.avgPosition, r.avgPosition);
      prev.etv = Math.max(prev.etv ?? 0, r.etv ?? 0) || null;
    }
  }

  const scored = [...merged.values()].map((c) => {
    const overlap = Math.log10(1 + Math.max(0, c.sharedKeywords)) * 40;
    const rank = c.avgPosition != null && c.avgPosition > 0 ? Math.max(0, 30 - c.avgPosition) : 0;
    const both = c.sources.size > 1 ? 15 : 0;
    const reasons: string[] = [];
    if (c.sharedKeywords > 0) reasons.push(`Ranks for ${c.sharedKeywords.toLocaleString("en-US")} of the same keywords`);
    if (c.avgPosition != null) reasons.push(`Average position ${c.avgPosition.toFixed(1)}`);
    if (c.sources.size > 1) reasons.push("Found by both domain and keyword analysis");
    return {
      domain: c.domain,
      source: c.source,
      sharedKeywords: c.sharedKeywords,
      avgPosition: c.avgPosition,
      etv: c.etv,
      score: Math.round((overlap + rank + both) * 10) / 10,
      reasons,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, opts.limit ?? 20);
}

export type GapKind = "shared" | "missing" | "advantage" | "disadvantage";

/**
 * Classifies one keyword from a domain intersection. `ours`/`theirs` are
 * absolute ranks (null = not ranking within the monitored depth).
 */
export function classifyGap(ours: number | null, theirs: number | null, depth = 20): GapKind | null {
  const o = ours != null && ours <= depth ? ours : null;
  const t = theirs != null && theirs <= depth ? theirs : null;
  if (o == null && t == null) return null;
  if (o == null) return "missing";
  if (t == null) return "advantage";
  if (o + 3 < t) return "advantage";
  if (t + 3 < o) return "disadvantage";
  return "shared";
}

export type PositionChange = { keyword: string; from: number | null; to: number | null };
export type SignalDraft = { kind: "ranking_gain" | "ranking_loss" | "new_ranking" | "lost_ranking" | "new_page"; title: string; severity: "low" | "medium" | "high"; detail: Record<string, unknown> };

/**
 * Turns position changes for one competitor into signals. Only meaningful
 * movement counts: entering/leaving the monitored depth, or moving at least
 * `threshold` places.
 */
export function detectSignals(domain: string, changes: PositionChange[], newPages: string[], threshold = 5): SignalDraft[] {
  const out: SignalDraft[] = [];
  for (const c of changes) {
    if (c.from == null && c.to != null) {
      out.push({ kind: "new_ranking", title: `${domain} started ranking for "${c.keyword}" (#${c.to})`, severity: c.to <= 3 ? "high" : "medium", detail: { ...c } });
    } else if (c.from != null && c.to == null) {
      out.push({ kind: "lost_ranking", title: `${domain} dropped out of the top results for "${c.keyword}"`, severity: "low", detail: { ...c } });
    } else if (c.from != null && c.to != null) {
      const delta = c.from - c.to;
      if (Math.abs(delta) >= threshold) {
        out.push({
          kind: delta > 0 ? "ranking_gain" : "ranking_loss",
          title: `${domain} moved ${delta > 0 ? "up" : "down"} ${Math.abs(delta)} places for "${c.keyword}" (#${c.from} → #${c.to})`,
          severity: delta > 0 && c.to <= 3 ? "high" : "medium",
          detail: { ...c, delta },
        });
      }
    }
  }
  for (const url of newPages) {
    out.push({ kind: "new_page", title: `${domain} has a newly visible page: ${url}`, severity: "low", detail: { url } });
  }
  return out;
}
