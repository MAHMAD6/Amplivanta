import { describe, expect, it } from "vitest";
import { classifyStatus, modelForTier, taskCredits, validateOutput } from "@/lib/ai/tasks";

describe("modelForTier", () => {
  it("routes by tier with per-tier overrides", () => {
    expect(modelForTier("luna", "openai", {})).toBe("gpt-5.6-luna");
    expect(modelForTier("terra", "openai", { AI_MODEL_TERRA: "gpt-custom" })).toBe("gpt-custom");
    expect(modelForTier("terra", "anthropic", { AI_MODEL: "claude-x" })).toBe("claude-x");
  });
});

describe("validateOutput", () => {
  it("accepts only schema-conformant structured output", () => {
    const good = JSON.stringify({ recommendations: [{ title: "Follow up faster", body: "Respond to new leads the same day.", category: "CRM", impact: "High", confidence: 0.6 }] });
    expect(validateOutput("growth_recommendations", good).ok).toBe(true);
    const badEnum = good.replace('"High"', '"Critical"');
    expect(validateOutput("growth_recommendations", badEnum).ok).toBe(false);
    const impossible = good.replace("0.6", "7");
    expect(validateOutput("growth_recommendations", impossible).ok).toBe(false);
    expect(validateOutput("growth_recommendations", "not json").ok).toBe(false);
  });

  it("treats prose tasks as text but rejects empty output", () => {
    expect(validateOutput("advisor_chat", "  Hello ")).toEqual({ ok: true, value: "Hello" });
    expect(validateOutput("advisor_chat", "  ").ok).toBe(false);
  });
});

describe("credits and errors", () => {
  it("prices tasks only from positive integer config", () => {
    expect(taskCredits("advisor_chat", {})).toBe(0);
    expect(taskCredits("advisor_chat", { AI_CREDITS_ADVISOR_CHAT: "2" })).toBe(2);
    expect(taskCredits("advisor_chat", { AI_CREDITS_ADVISOR_CHAT: "1.5" })).toBe(0);
  });
  it("classifies provider statuses", () => {
    expect([401, 429, 503, 400].map(classifyStatus)).toEqual(["auth", "rate_limit", "provider_unavailable", "bad_request"]);
  });
});
