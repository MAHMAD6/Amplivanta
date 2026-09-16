import { z } from "zod";

/**
 * AI task registry (OpenAI API Integration Guidelines §5, §10, §13).
 *
 * Callers request a business task. The task fixes the model tier, the
 * versioned prompt, whether user text is moderated, the output contract and
 * the credit price. Nothing here performs I/O, so it is unit-testable.
 */

export type ModelTier = "luna" | "terra" | "sol" | "astra";

/** Guideline starting models per tier; each overridable with AI_MODEL_<TIER>. */
export const OPENAI_TIER_DEFAULTS: Record<ModelTier, string> = {
  luna: "gpt-5.6-luna",
  terra: "gpt-5.6-terra",
  sol: "gpt-5.6-sol",
  astra: "gpt-6-astra",
};

export function modelForTier(tier: ModelTier, provider: "openai" | "anthropic", env: Record<string, string | undefined>): string {
  const override = env[`AI_MODEL_${tier.toUpperCase()}`];
  if (override) return override;
  if (provider === "openai") return env.OPENAI_MODEL || OPENAI_TIER_DEFAULTS[tier];
  return env.AI_MODEL || "claude-sonnet-5";
}

const NO_INVENTION =
  "Use only the information provided. Never invent metrics, percentages, benchmarks, customers, testimonials, rankings or results. " +
  "If the information is insufficient, say what is missing instead of guessing.";

const recommendationsSchema = z.object({
  recommendations: z
    .array(
      z.object({
        title: z.string().min(3).max(120),
        body: z.string().min(10).max(600),
        category: z.enum(["CRM", "Campaigns", "Email Marketing", "Social", "Content", "SEO", "Analytics", "Sales"]),
        impact: z.enum(["High", "Medium", "Low"]),
        confidence: z.number().min(0).max(1),
      }),
    )
    .min(1)
    .max(5),
});

const listingSeoSchema = z.object({
  seoTitle: z.string().min(3).max(60),
  metaDescription: z.string().min(10).max(160),
  keywords: z.array(z.string().min(2).max(40)).min(3).max(8),
});

export type AiTaskDef<S extends z.ZodTypeAny | null = z.ZodTypeAny | null> = {
  code: string;
  feature: string;
  tier: ModelTier;
  promptId: string;
  promptVersion: number;
  system: string;
  maxOutputTokens: number;
  /** Moderate user-authored input before the provider call. */
  moderateInput: boolean;
  /** Structured output contract; null means prose shown directly to the user. */
  schema: S;
  jsonSchema: Record<string, unknown> | null;
  creditsEnv: string;
};

export const AI_TASKS = {
  advisor_chat: {
    code: "advisor_chat",
    feature: "ai_advisor",
    tier: "terra",
    promptId: "ai-advisor/chat",
    promptVersion: 1,
    system: `You are Amplivanta's AI growth advisor. Be specific, concise and action-oriented. ${NO_INVENTION}`,
    maxOutputTokens: 1200,
    moderateInput: true,
    schema: null,
    jsonSchema: null,
    creditsEnv: "AI_CREDITS_ADVISOR_CHAT",
  },
  growth_recommendations: {
    code: "growth_recommendations",
    feature: "ai_advisor",
    tier: "terra",
    promptId: "ai-advisor/growth-recommendations",
    promptVersion: 1,
    system:
      "You are Amplivanta's growth advisor. From the workspace facts provided, return 1-5 prioritized, specific growth recommendations. " +
      `Confidence reflects how strongly the provided facts support the recommendation. ${NO_INVENTION}`,
    maxOutputTokens: 1200,
    moderateInput: false,
    schema: recommendationsSchema,
    jsonSchema: {
      type: "object",
      additionalProperties: false,
      required: ["recommendations"],
      properties: {
        recommendations: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "body", "category", "impact", "confidence"],
            properties: {
              title: { type: "string" },
              body: { type: "string" },
              category: { type: "string", enum: ["CRM", "Campaigns", "Email Marketing", "Social", "Content", "SEO", "Analytics", "Sales"] },
              impact: { type: "string", enum: ["High", "Medium", "Low"] },
              confidence: { type: "number" },
            },
          },
        },
      },
    },
    creditsEnv: "AI_CREDITS_GROWTH_RECOMMENDATIONS",
  },
  listing_seo: {
    code: "listing_seo",
    feature: "marketplace",
    tier: "luna",
    promptId: "marketplace/listing-seo",
    promptVersion: 1,
    system: `You write marketplace listing SEO copy: a title of at most 60 characters, a meta description of at most 160 characters and 5-8 lowercase search keywords. ${NO_INVENTION}`,
    maxOutputTokens: 500,
    moderateInput: true,
    schema: listingSeoSchema,
    jsonSchema: {
      type: "object",
      additionalProperties: false,
      required: ["seoTitle", "metaDescription", "keywords"],
      properties: {
        seoTitle: { type: "string" },
        metaDescription: { type: "string" },
        keywords: { type: "array", items: { type: "string" } },
      },
    },
    creditsEnv: "AI_CREDITS_LISTING_SEO",
  },
  social_post_copy: {
    code: "social_post_copy",
    feature: "social_publishing",
    tier: "luna",
    promptId: "social/post-copy",
    promptVersion: 1,
    system:
      "You write short social posts promoting a digital product. Return the post text only — no quotes, no preamble, under 280 characters, " +
      `ending with the provided link. ${NO_INVENTION}`,
    maxOutputTokens: 300,
    moderateInput: true,
    schema: null,
    jsonSchema: null,
    creditsEnv: "AI_CREDITS_SOCIAL_POST_COPY",
  },
  document_draft: {
    code: "document_draft",
    feature: "creative_studio",
    tier: "terra",
    promptId: "creative/document-draft",
    promptVersion: 1,
    system:
      "You draft business documents for a marketing team. Write clear, well-structured Markdown with headings where useful. " +
      `Follow the requested document type, tone and length. Leave [placeholders] for facts you were not given. ${NO_INVENTION}`,
    maxOutputTokens: 2500,
    moderateInput: true,
    schema: null,
    jsonSchema: null,
    creditsEnv: "AI_CREDITS_DOCUMENT_DRAFT",
  },
  document_transform: {
    code: "document_transform",
    feature: "creative_studio",
    tier: "luna",
    promptId: "creative/document-transform",
    promptVersion: 1,
    system:
      "You edit text as instructed (summarize, translate, improve writing, change tone, or fix grammar). Return only the edited text in the same format, " +
      `with no preamble. Preserve facts, names and numbers exactly. ${NO_INVENTION}`,
    maxOutputTokens: 2500,
    moderateInput: true,
    schema: null,
    jsonSchema: null,
    creditsEnv: "AI_CREDITS_DOCUMENT_TRANSFORM",
  },
} satisfies Record<string, AiTaskDef>;

export type AiTaskCode = keyof typeof AI_TASKS;
export type AiTaskOutput<T extends AiTaskCode> = (typeof AI_TASKS)[T]["schema"] extends z.ZodTypeAny
  ? z.infer<(typeof AI_TASKS)[T]["schema"]>
  : string;

/** Credits charged per successful request; 0 when no price is configured. */
export function taskCredits(code: AiTaskCode, env: Record<string, string | undefined>): number {
  const n = Number(env[AI_TASKS[code].creditsEnv]);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

/** Parses and validates model output against the task contract. */
export function validateOutput<T extends AiTaskCode>(code: T, text: string): { ok: true; value: AiTaskOutput<T> } | { ok: false } {
  const def = AI_TASKS[code] as AiTaskDef;
  if (!def.schema) {
    const prose = text.trim();
    return prose ? { ok: true, value: prose as AiTaskOutput<T> } : { ok: false };
  }
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) return { ok: false };
    const parsed = def.schema.safeParse(JSON.parse(text.slice(start, end + 1)));
    return parsed.success ? { ok: true, value: parsed.data as AiTaskOutput<T> } : { ok: false };
  } catch {
    return { ok: false };
  }
}

export type AiErrorClass = "auth" | "rate_limit" | "bad_request" | "provider_unavailable" | "timeout" | "invalid_output" | "moderation_block" | "insufficient_credits" | "not_configured";

/** Normalizes a provider HTTP status into a guideline error class. */
export function classifyStatus(status: number): AiErrorClass {
  if (status === 401 || status === 403) return "auth";
  if (status === 429) return "rate_limit";
  if (status >= 500) return "provider_unavailable";
  return "bad_request";
}

export const RETRYABLE: AiErrorClass[] = ["rate_limit", "provider_unavailable", "timeout"];

/** Neutral customer-facing message per error class. */
export const AI_ERROR_MESSAGES: Record<AiErrorClass, string> = {
  auth: "AI assistance is temporarily unavailable.",
  rate_limit: "AI assistance is busy right now. Please try again shortly.",
  bad_request: "That request could not be processed. Try rephrasing it.",
  provider_unavailable: "AI assistance is temporarily unavailable. Please try again shortly.",
  timeout: "AI assistance took too long to respond. Please try again.",
  invalid_output: "The AI response could not be validated, so nothing was saved. Please try again.",
  moderation_block: "That request can't be processed because it may violate content policies.",
  insufficient_credits: "You don't have enough credits for this AI request. Buy credits or upgrade your plan.",
  not_configured: "AI assistance is not available yet.",
};
