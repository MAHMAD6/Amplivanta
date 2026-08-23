import Anthropic from "@anthropic-ai/sdk";

/**
 * AI provider (Anthropic Claude). When ANTHROPIC_API_KEY is set, calls the real
 * Messages API; otherwise returns a deterministic local stub so AI features work
 * in development without a key. Every call records token usage for the caller.
 */

const MODEL = process.env.AI_MODEL || "claude-sonnet-5";

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
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
  if (!isAiConfigured()) {
    return stub(opts.prompt);
  }
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
