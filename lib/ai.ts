import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import {
  AI_ERROR_MESSAGES,
  AI_TASKS,
  classifyStatus,
  modelForTier,
  RETRYABLE,
  taskCredits,
  validateOutput,
  type AiErrorClass,
  type AiTaskCode,
  type AiTaskDef,
  type AiTaskOutput,
  type ModelTier,
} from "@/lib/ai/tasks";
import { consumeCredits, getWallet } from "@/lib/server/credits";

/**
 * Amplivanta AI Gateway (OpenAI API Integration Guidelines §6, §12).
 *
 * Every model call goes through runAiTask: provider credentials stay on the
 * server, the task chooses the model tier and versioned prompt, user text is
 * moderated where the task requires it, output is validated against the task
 * contract, credits are checked before and charged after a successful call,
 * and each request is recorded in AiRequestLog. With no provider configured
 * the gateway says so — it never returns placeholder content.
 */

export type AiProvider = "anthropic" | "openai" | "stub";

export function aiProvider(): AiProvider {
  const pick = (process.env.AI_PROVIDER ?? "").toLowerCase();
  if (pick === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (pick === "anthropic" && process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "stub";
}

export function isAiConfigured(): boolean {
  return aiProvider() !== "stub";
}

export type AiTaskResult<T extends AiTaskCode> =
  | { ok: true; value: AiTaskOutput<T>; model: string; requestId: string; creditsCharged: number }
  | { ok: false; errorClass: AiErrorClass; error: string };

type CallResult = { text: string; tokensIn: number; tokensOut: number; providerRequestId: string | null };

class ProviderError extends Error {
  constructor(public errorClass: AiErrorClass) {
    super(errorClass);
  }
}

const timeoutMs = () => Number(process.env.AI_TIMEOUT_MS ?? 60000);

async function callOpenAi(def: AiTaskDef, model: string, prompt: string): Promise<CallResult> {
  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        instructions: def.system,
        input: prompt,
        max_output_tokens: def.maxOutputTokens,
        // Provider-side response state is not needed; Amplivanta stores what it keeps.
        store: false,
        ...(def.jsonSchema
          ? { text: { format: { type: "json_schema", name: def.code, schema: def.jsonSchema, strict: true } } }
          : {}),
      }),
      signal: AbortSignal.timeout(timeoutMs()),
    });
  } catch (e) {
    throw new ProviderError((e as Error).name === "TimeoutError" ? "timeout" : "provider_unavailable");
  }
  if (!res.ok) throw new ProviderError(classifyStatus(res.status));
  const data = (await res.json()) as {
    id?: string;
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
  return { text: text ?? "", tokensIn: data.usage?.input_tokens ?? 0, tokensOut: data.usage?.output_tokens ?? 0, providerRequestId: data.id ?? null };
}

let anthropic: Anthropic | null = null;

async function callAnthropic(def: AiTaskDef, model: string, prompt: string): Promise<CallResult> {
  if (!anthropic) anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: timeoutMs(), maxRetries: 0 });
  const system = def.jsonSchema
    ? `${def.system}\nReturn only JSON matching this JSON Schema, with no prose:\n${JSON.stringify(def.jsonSchema)}`
    : def.system;
  try {
    const res = await anthropic.messages.create({ model, max_tokens: def.maxOutputTokens, system, messages: [{ role: "user", content: prompt }] });
    const text = res.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("\n");
    return { text, tokensIn: res.usage.input_tokens, tokensOut: res.usage.output_tokens, providerRequestId: res.id };
  } catch (e) {
    const status = (e as { status?: number }).status;
    throw new ProviderError(typeof status === "number" ? classifyStatus(status) : "provider_unavailable");
  }
}

/** OpenAI moderation of user-authored text. Returns true when flagged. */
async function isFlagged(text: string): Promise<boolean | null> {
  if (aiProvider() !== "openai") return null;
  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_MODERATION_MODEL || "omni-moderation-latest", input: text.slice(0, 20000) }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: { flagged?: boolean }[] };
    return Boolean(data.results?.[0]?.flagged);
  } catch {
    return null;
  }
}

function estimateCost(tier: ModelTier, tokensIn: number, tokensOut: number): number | null {
  const inPrice = Number(process.env[`AI_PRICE_${tier.toUpperCase()}_INPUT_PER_MTOK`]);
  const outPrice = Number(process.env[`AI_PRICE_${tier.toUpperCase()}_OUTPUT_PER_MTOK`]);
  if (!(inPrice >= 0 && outPrice >= 0) || Number.isNaN(inPrice) || Number.isNaN(outPrice)) return null;
  return (tokensIn * inPrice + tokensOut * outPrice) / 1_000_000;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runAiTask<T extends AiTaskCode>(
  ctx: { workspaceId: string | null; userId: string | null },
  code: T,
  input: { prompt: string; moderationText?: string },
): Promise<AiTaskResult<T>> {
  const def = AI_TASKS[code] as AiTaskDef;
  const provider = aiProvider();
  const started = Date.now();
  const log = async (data: Partial<{ model: string; tokensIn: number; tokensOut: number; creditsCharged: number; status: string; errorClass: AiErrorClass; attempts: number; providerRequestId: string | null; estimatedCostUsd: number | null }>) =>
    db.aiRequestLog
      .create({
        data: {
          workspaceId: ctx.workspaceId,
          userId: ctx.userId,
          feature: def.feature,
          task: def.code,
          provider,
          promptVersion: `${def.promptId}@v${def.promptVersion}`,
          latencyMs: Date.now() - started,
          status: "error",
          ...data,
        },
      })
      .catch(() => null);
  const fail = async (errorClass: AiErrorClass, extra: Parameters<typeof log>[0] = {}): Promise<AiTaskResult<T>> => {
    await log({ errorClass, ...extra });
    return { ok: false, errorClass, error: AI_ERROR_MESSAGES[errorClass] };
  };

  if (provider === "stub") return { ok: false, errorClass: "not_configured", error: AI_ERROR_MESSAGES.not_configured };

  // Credits are checked before the provider call and charged only on success.
  const credits = taskCredits(code, process.env);
  if (credits > 0) {
    if (!ctx.workspaceId) return fail("insufficient_credits");
    const wallet = await getWallet(ctx.workspaceId).catch(() => null);
    if ((wallet?.planCredits ?? 0) + (wallet?.purchasedCredits ?? 0) < credits) return fail("insufficient_credits");
  }

  if (def.moderateInput) {
    const flagged = await isFlagged(input.moderationText ?? input.prompt);
    if (flagged) return fail("moderation_block");
  }

  const model = modelForTier(def.tier, provider, process.env);
  let result: CallResult | null = null;
  let attempts = 0;
  let lastError: AiErrorClass = "provider_unavailable";
  while (attempts < 3 && !result) {
    attempts++;
    try {
      result = provider === "openai" ? await callOpenAi(def, model, input.prompt) : await callAnthropic(def, model, input.prompt);
    } catch (e) {
      lastError = e instanceof ProviderError ? e.errorClass : "provider_unavailable";
      if (!RETRYABLE.includes(lastError)) break;
      if (attempts < 3) await sleep(500 * 2 ** attempts);
    }
  }
  if (!result) return fail(lastError, { model, attempts });

  const usage = {
    model,
    attempts,
    tokensIn: result.tokensIn,
    tokensOut: result.tokensOut,
    providerRequestId: result.providerRequestId,
    estimatedCostUsd: estimateCost(def.tier, result.tokensIn, result.tokensOut),
  };
  if (ctx.workspaceId) {
    await db.aiUsage.create({ data: { workspaceId: ctx.workspaceId, model, tokensIn: result.tokensIn, tokensOut: result.tokensOut, tokens: result.tokensIn + result.tokensOut } }).catch(() => null);
  }

  const validated = validateOutput(code, result.text);
  if (!validated.ok) return fail("invalid_output", usage);

  const entry = await log({ ...usage, status: "ok" });
  let charged = 0;
  if (credits > 0 && ctx.workspaceId && entry) {
    const debit = await consumeCredits(ctx.workspaceId, credits, { type: "ai_request", id: entry.id, note: def.code, actorUserId: ctx.userId ?? undefined });
    if (debit.ok) {
      charged = credits;
      await db.aiRequestLog.update({ where: { id: entry.id }, data: { creditsCharged: credits } }).catch(() => null);
    }
  }
  return { ok: true, value: validated.value, model, requestId: entry?.id ?? "", creditsCharged: charged };
}
