import { describe, expect, it } from "vitest";
import { bandFor, parseFields, parseRules, parseVariants, pickVariant, readiness, rulesToWhere, scoreContact, significance, validateSubmission, type ScoreFacts } from "@/lib/marketing/logic";
import { mergeTags, parseBlocks, renderEmailHtml, safeUrl } from "@/lib/marketing/blocks";
import { evaluateCondition, parseNodes, validateGraph } from "@/lib/marketing/workflow";

describe("forms", () => {
  const fields = parseFields([
    { type: "email", label: "Work email", name: "email", required: true },
    { type: "dropdown", label: "Size", name: "size", options: "1-10\n11-50" },
    { type: "hidden", label: "src", name: "src", value: "lp" },
    { type: "script", label: "bad" },
  ]);
  it("drops unknown field types", () => expect(fields.map((f) => f.type)).toEqual(["email", "dropdown", "hidden"]));
  it("requires and validates email", () => {
    expect(validateSubmission(fields, {})).toEqual({ ok: false, error: "Work email is required." });
    expect(validateSubmission(fields, { email: "nope" }).ok).toBe(false);
  });
  it("rejects options outside the dropdown and forces hidden values", () => {
    expect(validateSubmission(fields, { email: "a@b.co", size: "9000" }).ok).toBe(false);
    expect(validateSubmission(fields, { email: "a@b.co", size: "1-10", src: "spoofed", extra: "x" })).toEqual({ ok: true, values: { email: "a@b.co", size: "1-10", src: "lp" } });
  });
});

describe("segments", () => {
  it("builds an AND where from valid rules only", () => {
    const rules = parseRules([{ field: "leadScore", operator: "gte", value: "50" }, { field: "tags", operator: "equals", value: "VIP" }, { field: "password", operator: "equals", value: "x" }]);
    expect(rulesToWhere("w1", rules)).toEqual({ workspaceId: "w1", AND: [{ leadScore: { gte: 50 } }, { tags: { has: "vip" } }] });
  });
  it("uses a relative created window", () => {
    const now = new Date("2026-09-17T00:00:00Z");
    expect(rulesToWhere("w", [{ field: "createdWithinDays", operator: "gte", value: "7" }], now)).toEqual({ workspaceId: "w", AND: [{ createdAt: { gte: new Date("2026-09-10T00:00:00Z") } }] });
  });
});

describe("lead scoring", () => {
  const facts: ScoreFacts = { email: "a@b.co", jobTitle: "VP Marketing", status: "qualified", tags: ["vip"], submissions: 7, openDeals: 0, opened: true, clicked: false };
  it("sums matching active rules and caps submissions", () => {
    expect(scoreContact(facts, [
      { signal: "has_email", value: null, points: 5, active: true },
      { signal: "job_title_contains", value: "vp", points: 20, active: true },
      { signal: "form_submissions", value: null, points: 10, active: true },
      { signal: "open_deals", value: null, points: 30, active: true },
      { signal: "has_tag", value: "vip", points: 15, active: false },
    ])).toBe(75);
  });
  it("picks the highest reached band", () => {
    const bands = [{ name: "Cold", minScore: 0 }, { name: "Hot", minScore: 80 }, { name: "Warm", minScore: 40 }];
    expect(bandFor(75, bands)?.name).toBe("Warm");
    expect(bandFor(-5, bands)).toBeNull();
  });
});

describe("experiments", () => {
  const vs = parseVariants([{ landingPageId: "p1", weight: 70 }, { landingPageId: "p2", weight: 30 }, { weight: 10 }]);
  it("labels variants and drops invalid ones", () => expect(vs.map((v) => v.key)).toEqual(["A", "B"]));
  it("picks by weight", () => {
    expect(pickVariant(vs, 0.69)?.key).toBe("A");
    expect(pickVariant(vs, 0.7)?.key).toBe("B");
  });
  it("reports lift and confidence", () => {
    const r = significance({ visits: 1000, conversions: 100 }, { visits: 1000, conversions: 150 });
    expect(Math.round(r.lift!)).toBe(50);
    expect(r.confidence!).toBeGreaterThan(99);
    expect(significance({ visits: 0, conversions: 0 }, { visits: 5, conversions: 1 }).confidence).toBeNull();
  });
});

describe("landing page readiness", () => {
  it("blocks publishing without content or a connected form", () => {
    const r = readiness({ title: "T", slug: "offer", blocks: 2, hasFormBlock: true, formId: null, contentReviewed: true, seoReviewed: false });
    expect(r.canPublish).toBe(false);
    expect(readiness({ title: "T", slug: "offer", blocks: 2, hasFormBlock: true, formId: "f", contentReviewed: false, seoReviewed: false }).canPublish).toBe(true);
  });
});

describe("blocks", () => {
  it("escapes text and neutralises unsafe links", () => {
    const html = renderEmailHtml(parseBlocks([{ type: "text", props: { text: "<script>x</script>" } }, { type: "button", props: { label: "Go", url: "javascript:alert(1)" } }], "email"));
    expect(html).not.toContain("<script>");
    expect(html).toContain('href="#"');
    expect(safeUrl("https://x.io/a")).toBe("https://x.io/a");
    expect(safeUrl("//evil.com")).toBe("#");
  });
  it("does not accept the html block on pages", () => expect(parseBlocks([{ type: "html", props: { html: "<b>" } }], "page")).toEqual([]));
  it("escapes merge values", () => expect(mergeTags("Hi {{firstName}}", { firstName: "<b>" })).toBe("Hi &lt;b&gt;"));
});

describe("workflow graph", () => {
  it("requires a trigger first and complete configs", () => {
    expect(validateGraph([])).toEqual(["Add a trigger to begin."]);
    const nodes = parseNodes([{ type: "trigger", config: { event: "form.submitted" } }, { type: "webhook", config: { url: "http://x" } }]);
    expect(validateGraph(nodes)).toEqual(["Webhook: webhooks must use an https URL."]);
  });
  it("evaluates conditions against contact facts", () => {
    expect(evaluateCondition({ field: "tags", operator: "equals", value: "VIP" }, { tags: ["vip"] })).toBe(true);
    expect(evaluateCondition({ field: "leadScore", operator: "gte", value: "50" }, { leadScore: 40 })).toBe(false);
    expect(evaluateCondition({ field: "email", operator: "exists", value: "" }, null)).toBe(false);
  });
});
