import { describe, expect, it } from "vitest";
import { classifyGap, detectSignals, normalizeDomain, scoreCandidates, type RawCandidate } from "@/lib/competitors/intel-policy";

describe("normalizeDomain", () => {
  it("reduces URLs to a bare host", () => {
    expect(normalizeDomain("https://www.Example.com/pricing?x=1")).toBe("example.com");
    expect(normalizeDomain("shop.example.co.uk")).toBe("shop.example.co.uk");
  });
  it("rejects non-domains", () => {
    expect(normalizeDomain("localhost")).toBeNull();
    expect(normalizeDomain("")).toBeNull();
    expect(normalizeDomain(null)).toBeNull();
  });
});

describe("scoreCandidates", () => {
  const row = (domain: string, over: Partial<RawCandidate> = {}): RawCandidate => ({
    domain, source: "competitors_domain", sharedKeywords: 100, avgPosition: 8, etv: null, ...over,
  });

  it("excludes the customer's own domain, subdomains, generic platforms and tracked ones", () => {
    const out = scoreCandidates(
      [row("mysite.com"), row("blog.mysite.com"), row("wikipedia.org"), row("rival.com"), row("tracked.com")],
      { customerDomain: "https://www.mysite.com", alreadyTracked: ["tracked.com"] },
    );
    expect(out.map((c) => c.domain)).toEqual(["rival.com"]);
  });

  it("merges sources and ranks overlap plus position, with evidence", () => {
    const out = scoreCandidates(
      [
        row("small.com", { sharedKeywords: 5, avgPosition: 18 }),
        row("big.com", { sharedKeywords: 900, avgPosition: 4 }),
        row("big.com", { source: "serp_competitors", sharedKeywords: 40, avgPosition: 6 }),
      ],
      { customerDomain: "me.com", alreadyTracked: [] },
    );
    expect(out[0].domain).toBe("big.com");
    expect(out[0].reasons).toContain("Found by both domain and keyword analysis");
    expect(out[0].avgPosition).toBe(4);
    expect(out[0].sharedKeywords).toBe(900);
  });

  it("caps the suggestion list", () => {
    const rows = Array.from({ length: 40 }, (_, i) => row(`c${i}.com`, { sharedKeywords: i }));
    expect(scoreCandidates(rows, { customerDomain: null, alreadyTracked: [], limit: 20 })).toHaveLength(20);
  });
});

describe("classifyGap", () => {
  it("labels keyword relationships within the monitored depth", () => {
    expect(classifyGap(null, 5)).toBe("missing");
    expect(classifyGap(4, null)).toBe("advantage");
    expect(classifyGap(2, 12)).toBe("advantage");
    expect(classifyGap(15, 3)).toBe("disadvantage");
    expect(classifyGap(6, 7)).toBe("shared");
    expect(classifyGap(null, 45)).toBeNull();
    expect(classifyGap(30, 40)).toBeNull();
  });
});

describe("detectSignals", () => {
  it("reports only meaningful movement", () => {
    const s = detectSignals(
      "rival.com",
      [
        { keyword: "a", from: 12, to: 2 },
        { keyword: "b", from: 6, to: 8 },
        { keyword: "c", from: null, to: 3 },
        { keyword: "d", from: 9, to: null },
      ],
      ["https://rival.com/new"],
    );
    expect(s.map((x) => x.kind)).toEqual(["ranking_gain", "new_ranking", "lost_ranking", "new_page"]);
    expect(s[0].severity).toBe("high");
  });
});
