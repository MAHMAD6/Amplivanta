import Anthropic from "@anthropic-ai/sdk";

/**
 * AI gateway. Every model call in the product goes through here, so provider
 * credentials never reach the browser and usage is recorded for the caller.
 *
 * Provider is chosen by AI_PROVIDER ("anthropic" | "openai"), else by whichever
 * key is present. With no key at all, a deterministic local stub keeps AI
 * features usable in development.
 */

const MODEL = process.env.AI_MODEL || "claude-sonnet-5";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5";

export type AiProvider = "anthropic" | "openai" | "stub";

export function aiProvider(): AiProvider {
  const pick = (process.env.AI_PROVIDER ?? "").toLowerCase();
  if (pick === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (pick === "anthropic" && process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "stub";
}

export function isAiConfigured(): boolean {
  return aiProvider() !== "stub";
}

/** OpenAI Responses API, per the approved provider inventory. */
async function completeOpenAi(opts: { system?: string; prompt: string; maxTokens?: number }): Promise<AiResult> {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      ...(opts.system ? { instructions: opts.system } : {}),
      input: opts.prompt,
      max_output_tokens: opts.maxTokens ?? 1024,
    }),
    signal: AbortSignal.timeout(Number(process.env.AI_TIMEOUT_MS ?? 60000)),
  });
  if (!res.ok) throw new Error(`OpenAI request failed (${res.status})`);
  const data = (await res.json()) as {
    output_text?: string;
    output?: { content?: { type?: string; text?: string }[] }[];
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  const text =
    data.output_text ??
    (data.output ?? [])
      .flatMap((o) => o.content ?? [])
      .filter((c) => c.type === "output_text" && typeof c.text === "string")
      .map((c) => c.text as string)
      .join("\n");
  return {
    text: text ?? "",
    model: OPENAI_MODEL,
    tokensIn: data.usage?.input_tokens ?? 0,
    tokensOut: data.usage?.output_tokens ?? 0,
    stubbed: false,
  };
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export interface AiResult {
  text: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  stubbed: boolean;
}

export async function complete(opts: {
  system?: string;
  prompt: string;
  maxTokens?: number;
}): Promise<AiResult> {
  const provider = aiProvider();
  if (provider === "stub") return stub(opts.prompt);
  if (provider === "openai") return completeOpenAi(opts);
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 1024,
    system: opts.system,
    messages: [{ role: "user", content: opts.prompt }],
  });
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return {
    text,
    model: MODEL,
    tokensIn: res.usage.input_tokens,
    tokensOut: res.usage.output_tokens,
    stubbed: false,
  };
}

/** Structured growth recommendations (used by the AI Advisor). */
export async function generateRecommendations(context: string): Promise<
  { title: string; body: string; category: string; impact: string; confidence: number }[]
> {
  const system =
    "You are Amplivanta's growth advisor. Return 3-5 prioritized, specific growth recommendations as strict JSON: " +
    '[{"title":string,"body":string,"category":string,"impact":"High|Medium|Low","confidence":0-1}]. No prose.';
  const { text, stubbed } = await complete({ system, prompt: context, maxTokens: 900 });
  if (stubbed) return stubRecommendations();
  try {
    const json = JSON.parse(text.slice(text.indexOf("["), text.lastIndexOf("]") + 1));
    if (Array.isArray(json)) return json;
  } catch {
    /* fall through */
  }
  return stubRecommendations();
}

/* ------------------------------------------------------------------ stubs */

function stub(prompt: string): AiResult {
  const text =
    `Here's a data-informed take on "${prompt.slice(0, 80)}":\n\n` +
    "• Prioritize the highest-intent segment first — response speed compounds conversion.\n" +
    "• Reallocate spend from low-ROAS channels to your top two performers.\n" +
    "• Ship one experiment this week and measure against a clear baseline.\n\n" +
    "(Set ANTHROPIC_API_KEY to enable live AI responses.)";
  return { text, model: "stub", tokensIn: 0, tokensOut: 0, stubbed: true };
}

function stubRecommendations() {
  return [
    { title: "Improve Conversion Rate", body: "A/B test landing-page headlines and CTAs to lift conversion up to 14%.", category: "Analytics", impact: "High", confidence: 0.92 },
    { title: "Speed Up Lead Follow-up", body: "Contact high-intent leads within 5 minutes to convert 3.6x more.", category: "CRM", impact: "High", confidence: 0.88 },
    { title: "Optimize Email Send Time", body: "Send campaigns Tuesday 10am for ~18% higher open rates.", category: "Email Marketing", impact: "Medium", confidence: 0.8 },
  ];
}
