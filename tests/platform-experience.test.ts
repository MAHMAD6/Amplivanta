import { describe, expect, it } from "vitest";
import { annualSavings, dimensionValue, parseLimit, periodPrice } from "@/lib/plan-config";
import { csvCell, median, monthlyEquivalent, positionPlans } from "@/lib/pricing-benchmark";

describe("plan configuration", () => {
  it("reads entitlements as configured values", () => {
    const e = [
      { featureKey: "users", limitValue: 5, enabled: true },
      { featureKey: "contacts", limitValue: null, enabled: true },
      { featureKey: "ai_credits", limitValue: 100, enabled: false },
    ];
    expect(dimensionValue("users", e)).toBe("5 users");
    expect(dimensionValue("contacts", e)).toBe("Unlimited");
    expect(dimensionValue("ai_credits", e)).toBe("Not included");
    expect(dimensionValue("storage_gb", e)).toBeNull();
  });

  it("parses admin limit input", () => {
    expect(parseLimit("")).toEqual({ action: "remove" });
    expect(parseLimit("Unlimited")).toEqual({ action: "set", enabled: true, limitValue: null });
    expect(parseLimit("none")).toEqual({ action: "set", enabled: false, limitValue: null });
    expect(parseLimit("10,000")).toEqual({ action: "set", enabled: true, limitValue: 10000 });
    expect(parseLimit("2.5")).toEqual({ action: "invalid" });
    expect(parseLimit("-1")).toEqual({ action: "invalid" });
  });

  it("never invents an annual price", () => {
    expect(periodPrice({ price: 49, annualPrice: null }, "annual")).toBeNull();
    expect(periodPrice({ price: 49, annualPrice: 490 }, "annual")).toBe(490);
    expect(periodPrice({ price: 0, annualPrice: null }, "annual")).toBe(0);
    expect(annualSavings({ price: 49, annualPrice: 490 })).toBe(17);
    expect(annualSavings({ price: 49, annualPrice: 600 })).toBeNull();
    expect(annualSavings({ price: 0, annualPrice: 0 })).toBeNull();
  });
});

describe("pricing benchmark", () => {
  it("normalises intervals and medians", () => {
    expect(monthlyEquivalent(120, "year")).toBe(10);
    expect(monthlyEquivalent(99, "one_time")).toBeNull();
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
    expect(median([])).toBeNull();
  });

  it("positions paid plans against same-currency benchmarks", () => {
    const rows = [
      { competitor: "A", planName: "Pro", price: 100, currency: "USD", interval: "month" },
      { competitor: "B", planName: "Pro", price: 1200, currency: "USD", interval: "year" },
      { competitor: "C", planName: "Pro", price: 200, currency: "USD", interval: "month" },
      { competitor: "D", planName: "Pro", price: 10, currency: "EUR", interval: "month" },
    ];
    const [free, cheap, mid, dear] = [{ name: "Free", price: 0 }, { name: "Starter", price: 49 }, { name: "Growth", price: 100 }, { name: "Scale", price: 300 }];
    const out = positionPlans([free, cheap, mid, dear], rows, "USD");
    expect(out.map((p) => p.plan)).toEqual(["Starter", "Growth", "Scale"]);
    expect(out[0]).toMatchObject({ compared: 3, median: 100, cheaperThan: 3, label: "Below market" });
    expect(out[1]).toMatchObject({ label: "At market", cheaperThan: 1 });
    expect(out[2]).toMatchObject({ label: "Above market", cheaperThan: 0, percentile: 0 });
    expect(positionPlans([cheap], [], "USD")[0].label).toBe("No comparison");
  });

  it("escapes CSV cells and neutralises formulas", () => {
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell(null)).toBe("");
  });
});

import { checkMapping, parseCsv, suggestMapping, validateRow, toCsv } from "@/lib/data-transfer";

describe("data import", () => {
  it("parses quoted CSV with BOM, CRLF and embedded newlines", () => {
    const rows = parseCsv('﻿Email,Name,Notes\r\na@x.com,"Doe, Jane","line1\nline2"\r\n\r\nb@x.com,Bob,"say ""hi"""\r\n');
    expect(rows).toEqual([["Email", "Name", "Notes"], ["a@x.com", "Doe, Jane", "line1\nline2"], ["b@x.com", "Bob", 'say "hi"']]);
  });

  it("suggests mappings from common header names, once per field", () => {
    expect(suggestMapping("contacts", ["E-mail", "First Name", "Company Name", "Email", "Random"])).toEqual(["email", "firstName", "companyName", null, null]);
    expect(suggestMapping("deals", ["Opportunity", "Amount", "Deal Stage", "Close Date"])).toEqual(["name", "value", "stage", "closeDate"]);
  });

  it("validates and normalises rows", () => {
    const map = ["email", "firstName", "lastName", "tags", "status"];
    expect(validateRow("contacts", ["A@X.com", "Ann", "Lee", "vip; beta,vip", "Qualified"], map)).toEqual({ ok: true, data: { email: "a@x.com", firstName: "Ann", lastName: "Lee", tags: ["vip", "beta"], status: "qualified", name: "Ann Lee" } });
    expect(validateRow("contacts", ["not-an-email", "", "", "", ""], map)).toMatchObject({ ok: false });
    expect(validateRow("contacts", ["", "", "", "", ""], map)).toMatchObject({ ok: false, message: "A contact needs an email or a name" });
    expect(validateRow("contacts", ["", "Ann", "", "", "boss"], map)).toMatchObject({ ok: false });
    expect(validateRow("deals", ["Big deal", "$12,500.50", "eur", "WON"], ["name", "value", "currency", "status"])).toEqual({ ok: true, data: { name: "Big deal", value: 12500.5, currency: "EUR", status: "won" } });
    expect(validateRow("companies", ["Acme", "HTTPS://www.Acme.com/about"], ["name", "domain"])).toEqual({ ok: true, data: { name: "Acme", domain: "acme.com" } });
  });

  it("rejects incomplete or duplicate mappings", () => {
    expect(checkMapping("companies", ["a", "b"], ["domain", null])).toBe("Map a column to Name.");
    expect(checkMapping("contacts", ["a", "b"], ["email", "email"])).toBe("Each field can be mapped from one column only.");
    expect(checkMapping("contacts", ["a"], ["phone"])).toBe("Map a column to Email or a name field.");
    expect(checkMapping("contacts", ["a"], ["email", null])).toBe("The column mapping does not match the file.");
    expect(checkMapping("deals", ["a"], ["name"])).toBeNull();
  });

  it("writes spreadsheet-safe CSV", () => {
    expect(toCsv(["A", "B"], [["=cmd()", -5], [["x", "y"], null]])).toBe("A,B\r\n'=cmd(),-5\r\nx; y,\r\n");
  });
});

import { base32Decode, base32Encode, generateRecoveryCodes, generateTotpSecret, otpauthUri, totpCode, verifyTotp } from "@/lib/totp";

describe("two-factor codes", () => {
  it("round-trips base32", () => {
    const buf = Buffer.from("amplivanta-2fa!");
    expect(base32Decode(base32Encode(buf)).equals(buf)).toBe(true);
    expect(() => base32Decode("not base32 !!")).toThrow();
  });

  it("matches RFC 6238 SHA-1 test vectors", () => {
    // RFC 6238 uses the ASCII secret "12345678901234567890".
    const secret = base32Encode(Buffer.from("12345678901234567890"));
    expect(totpCode(secret, Math.floor(59 / 30))).toBe("287082");
    expect(totpCode(secret, Math.floor(1111111109 / 30))).toBe("081804");
    expect(totpCode(secret, Math.floor(1234567890 / 30))).toBe("005924");
  });

  it("accepts the current code and one step of drift, rejects others", () => {
    const secret = generateTotpSecret();
    const now = 1_700_000_000_000;
    expect(verifyTotp(secret, totpCode(secret, Math.floor(now / 30000)), now)).toBe(true);
    expect(verifyTotp(secret, totpCode(secret, Math.floor(now / 30000) - 1), now)).toBe(true);
    expect(verifyTotp(secret, totpCode(secret, Math.floor(now / 30000) + 5), now)).toBe(false);
    expect(verifyTotp(secret, "12345", now)).toBe(false);
    expect(verifyTotp(secret, "", now)).toBe(false);
  });

  it("builds an otpauth uri and unique recovery codes", () => {
    const uri = otpauthUri("ABCDEFGH", "user@example.com");
    expect(uri.startsWith("otpauth://totp/Amplivanta%3Auser%40example.com?")).toBe(true);
    expect(uri).toContain("secret=ABCDEFGH");
    const codes = generateRecoveryCodes();
    expect(codes).toHaveLength(10);
    expect(new Set(codes).size).toBe(10);
    expect(codes.every((c) => /^[a-z2-7]{5}-[a-z2-7]{5}$/.test(c))).toBe(true);
  });
});

import { computeGrowthScore, scoreBand, type GrowthFacts } from "@/lib/growth/score";
import { detectOpportunities } from "@/lib/growth/opportunities";

const emptyFacts: GrowthFacts = {
  visits: 0, conversions: 0, formSubmissions: 0, newContacts: 0, totalContacts: 0,
  openDeals: 0, wonDeals: 0, lostDeals: 0,
  emailsSent: 0, emailsOpened: 0, emailsClicked: 0, unsubscribes: 0,
  activeCampaigns: 0, campaignClicks: 0, campaignImpressions: 0, campaignSpend: 0, campaignRevenue: 0,
  publishedPages: 0, activeForms: 0, activeWorkflows: 0, workflowRuns: 0, workflowFailures: 0,
  socialPostsPublished: 0, connectedIntegrations: 0, windowDays: 30,
};

describe("growth score", () => {
  it("withholds a score until two dimensions have data", () => {
    const blank = computeGrowthScore(emptyFacts);
    expect(blank.score).toBeNull();
    expect(blank.status).toBe("insufficient_data");
    expect(blank.coverage).toBe(0);
    expect(blank.missing).toHaveLength(4);
    expect(scoreBand(null)).toBe("Not scored");

    const oneDimension = computeGrowthScore({ ...emptyFacts, visits: 300, conversions: 0, totalContacts: 0 });
    // Visits cover both acquisition and conversion, so a score is defensible.
    expect(oneDimension.status).toBe("scored");
    expect(oneDimension.dimensions.find((d) => d.key === "retention")?.score).toBeNull();
  });

  it("scores each dimension from its signals and targets", () => {
    const strong = computeGrowthScore({
      ...emptyFacts,
      visits: 1200, conversions: 40, formSubmissions: 30, newContacts: 50, totalContacts: 500,
      openDeals: 10, wonDeals: 5, lostDeals: 5,
      emailsSent: 400, emailsOpened: 120, emailsClicked: 16, unsubscribes: 0,
      activeCampaigns: 3, campaignClicks: 300, campaignImpressions: 10000, campaignSpend: 500, campaignRevenue: 2000,
      publishedPages: 3, activeForms: 2, activeWorkflows: 2, workflowRuns: 100, workflowFailures: 2,
      socialPostsPublished: 20, connectedIntegrations: 3,
    });
    expect(strong.status).toBe("scored");
    expect(strong.coverage).toBe(1);
    expect(strong.score).toBeGreaterThan(60);
    expect(scoreBand(strong.score)).toMatch(/Healthy|Strong/);
    for (const d of strong.dimensions) expect(d.signals.every((s) => s.points <= s.max)).toBe(true);
  });

  it("is reproducible", () => {
    const f = { ...emptyFacts, visits: 500, conversions: 10, totalContacts: 100, emailsSent: 100, emailsOpened: 20 };
    expect(computeGrowthScore(f)).toEqual(computeGrowthScore(f));
  });
});

describe("opportunity detection", () => {
  it("only reports findings the numbers support, with evidence", () => {
    const facts = { ...emptyFacts, visits: 1000, conversions: 5, totalContacts: 200, emailsSent: 1000, emailsOpened: 100, unsubscribes: 20, publishedPages: 1, activeForms: 1, connectedIntegrations: 1 };
    const found = detectOpportunities(facts, computeGrowthScore(facts));
    const keys = found.map((o) => o.key);
    expect(keys).toContain("low-page-conversion");
    expect(keys).toContain("low-open-rate");
    expect(keys).toContain("high-unsubscribes");
    expect(keys).not.toContain("no-data-source");
    expect(keys).not.toContain("no-capture-surface");
    const conv = found.find((o) => o.key === "low-page-conversion")!;
    expect(conv.evidence).toContain("1,000 visits");
    expect(conv.confidence).toBeGreaterThan(0.4);
    expect(conv.confidence).toBeLessThanOrEqual(0.9);
  });

  it("stays quiet without enough samples", () => {
    const facts = { ...emptyFacts, visits: 40, conversions: 0, emailsSent: 50, emailsOpened: 1, connectedIntegrations: 2, publishedPages: 1 };
    const keys = detectOpportunities(facts, computeGrowthScore(facts)).map((o) => o.key);
    expect(keys).not.toContain("low-page-conversion");
    expect(keys).not.toContain("low-open-rate");
  });

  it("flags a workspace with nothing connected", () => {
    const keys = detectOpportunities(emptyFacts, computeGrowthScore(emptyFacts)).map((o) => o.key);
    expect(keys).toContain("no-data-source");
    expect(keys).toContain("no-capture-surface");
  });
});

import { ALLOWED_TRANSITIONS, canTransition, contentTypeMeta, slugify, validateContent, type ContentInput } from "@/lib/admin/content";

const base: ContentInput = {
  contentType: "blog_post",
  title: "How growth loops compound",
  slug: "how-growth-loops-compound",
  excerpt: "A short summary.",
  body: "Body copy.",
  status: "DRAFT",
  visibility: "public",
  categories: [],
  tags: [],
  scheduledAt: null,
  data: {},
};

describe("content operations", () => {
  it("slugifies titles safely", () => {
    expect(slugify("Grüße, Wörld! -- 2026 ")).toBe("grusse-world-2026");
    expect(slugify("///")).toBe("");
    expect(slugify("a".repeat(200)).length).toBe(80);
  });

  it("keeps the publishing lifecycle to allowed transitions", () => {
    expect(canTransition("DRAFT", "PUBLISHED")).toBe(true);
    expect(canTransition("PUBLISHED", "SCHEDULED")).toBe(false);
    expect(canTransition("ARCHIVED", "PUBLISHED")).toBe(false);
    expect(canTransition("ARCHIVED", "DRAFT")).toBe(true);
    expect(Object.keys(ALLOWED_TRANSITIONS)).toHaveLength(5);
  });

  it("accepts a draft but holds publishing to the stricter rules", () => {
    expect(validateContent(base)).toBeNull();
    expect(validateContent({ ...base, excerpt: "" })).toBeNull();
    expect(validateContent({ ...base, excerpt: "", status: "PUBLISHED" })).toBe("Add a short excerpt before publishing.");
    expect(validateContent({ ...base, slug: "Not A Slug" })).toMatch(/slug/);
    expect(validateContent({ ...base, status: "SCHEDULED" })).toBe("Choose when this should publish.");
    expect(validateContent({ ...base, status: "SCHEDULED", scheduledAt: new Date(Date.now() - 86400000) })).toBe("Schedule a time in the future.");
  });

  it("applies the event, lead magnet and template rules", () => {
    const event = { ...base, contentType: "webinar", data: { eventType: "webinar", format: "online" } };
    expect(validateContent(event)).toBeNull();
    expect(validateContent({ ...event, status: "PUBLISHED" })).toBe("Enter the event date and start time before publishing.");
    expect(validateContent({ ...event, data: { ...event.data, registrationEnabled: true } })).toBe("Add the registration link, or turn registration off.");

    const magnet = { ...base, contentType: "lead_magnet", data: { accessMode: "FORM_REQUIRED" } };
    expect(validateContent(magnet)).toBeNull();
    expect(validateContent({ ...magnet, status: "PUBLISHED" })).toBe("Select the lead capture form, or switch to direct download.");
    expect(validateContent({ ...magnet, status: "PUBLISHED", data: { accessMode: "DIRECT_DOWNLOAD" } })).toBe("Upload the downloadable file before publishing.");

    const template = { ...base, contentType: "template", excerpt: "", data: { templateType: "social_post" } };
    expect(validateContent(template)).toBeNull();
    expect(validateContent({ ...template, status: "PUBLISHED" })).toBe("Link the Creative Studio template before publishing.");
  });

  it("knows every content type's destination", () => {
    expect(contentTypeMeta("blog_post")?.href).toBe("/admin/content-management/blog-posts");
    expect(contentTypeMeta("nope")).toBeNull();
  });
});
