import { describe, expect, it } from "vitest";
import { dimensionScores, parseChecks, runAuditChecks, type AuditFacts } from "@/lib/growth/audit-checks";

const empty: AuditFacts = {
  analyticsConnected: false,
  searchConsoleConnected: false,
  adsConnected: false,
  socialAccounts: 0,
  contacts: 0,
  openDeals: 0,
  activeCampaigns: 0,
  sentEmails: 0,
  publishedPages: 0,
  forms: 0,
  goals: 0,
  personas: 0,
  competitors: 0,
};

describe("growth audit checks", () => {
  it("scores an empty workspace at zero", () => {
    const r = runAuditChecks(empty);
    expect(r.score).toBe(0);
    expect(r.checks.every((c) => !c.passed)).toBe(true);
  });

  it("scores the share of passed checks", () => {
    const r = runAuditChecks({ ...empty, contacts: 3, goals: 1 });
    expect(r.score).toBe(Math.round((2 / r.checks.length) * 100));
    expect(r.checks.find((c) => c.key === "contacts")?.detail).toBe("3 contacts in the CRM.");
  });

  it("breaks scores down by dimension", () => {
    const { checks } = runAuditChecks({ ...empty, goals: 1, personas: 1, competitors: 2 });
    expect(dimensionScores(checks)).toContainEqual(["Strategy", 100]);
    expect(dimensionScores(checks)).toContainEqual(["Measurement", 0]);
  });

  it("ignores malformed stored checks", () => {
    expect(parseChecks([{ key: "a" }, null, 3])).toHaveLength(1);
    expect(parseChecks("x")).toEqual([]);
  });
});
