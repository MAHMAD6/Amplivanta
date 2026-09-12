import "server-only";

/**
 * fal.ai generative-media gateway (External API Master Revision: required
 * before AI video generation is enabled).
 *
 * Off unless FAL_KEY is set. Only models on the server-side allowlist
 * (FAL_MODELS) may be requested, so the browser cannot pick an arbitrary or
 * unbudgeted model. Jobs are queued and polled; nothing blocks a request.
 */

export function isFalConfigured(): boolean {
  return Boolean(process.env.FAL_KEY) && falModels().length > 0;
}

/** Approved models, e.g. FAL_MODELS=fal-ai/ltx-video,fal-ai/kling-video */
export function falModels(): string[] {
  return (process.env.FAL_MODELS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._/-]*$/i.test(s));
}

/** Credits charged per video job; unset means no metering is configured. */
export function falCreditCost(): number | null {
  const n = Number(process.env.FAL_VIDEO_CREDIT_COST);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const QUEUE = "https://queue.fal.run";

export type FalJob = { ok: true; jobId: string; statusUrl: string } | { ok: false; error: string };

export async function submitVideoJob(opts: {
  model: string;
  prompt: string;
  imageUrl?: string;
}): Promise<FalJob> {
  if (!isFalConfigured()) return { ok: false, error: "Video generation is not configured." };
  if (!falModels().includes(opts.model)) return { ok: false, error: "That model is not on the approved list." };
  try {
    const res = await fetch(`${QUEUE}/${opts.model}`, {
      method: "POST",
      headers: { authorization: `Key ${process.env.FAL_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ prompt: opts.prompt, ...(opts.imageUrl ? { image_url: opts.imageUrl } : {}) }),
      signal: AbortSignal.timeout(Number(process.env.FAL_TIMEOUT_MS ?? 20000)),
    });
    const body = await res.text();
    if (!res.ok) return { ok: false, error: `Provider refused the job (${res.status}).` };
    const data = JSON.parse(body) as { request_id?: string; status_url?: string };
    if (!data.request_id) return { ok: false, error: "The provider did not return a job id." };
    return {
      ok: true,
      jobId: data.request_id,
      statusUrl: data.status_url ?? `${QUEUE}/${opts.model}/requests/${data.request_id}/status`,
    };
  } catch {
    return { ok: false, error: "The video provider did not respond. Please try again." };
  }
}

export type FalStatus =
  | { ok: true; status: string; done: boolean; videoUrl: string | null }
  | { ok: false; error: string };

export async function getVideoJob(model: string, jobId: string): Promise<FalStatus> {
  if (!isFalConfigured()) return { ok: false, error: "Video generation is not configured." };
  if (!falModels().includes(model)) return { ok: false, error: "That model is not on the approved list." };
  if (!/^[A-Za-z0-9_-]{6,80}$/.test(jobId)) return { ok: false, error: "Invalid job id." };
  try {
    const headers = { authorization: `Key ${process.env.FAL_KEY}` };
    const s = await fetch(`${QUEUE}/${model}/requests/${jobId}/status`, { headers, signal: AbortSignal.timeout(15000) });
    if (!s.ok) return { ok: false, error: `Could not read job status (${s.status}).` };
    const status = (await s.json()) as { status?: string };
    const done = status.status === "COMPLETED";
    let videoUrl: string | null = null;
    if (done) {
      const r = await fetch(`${QUEUE}/${model}/requests/${jobId}`, { headers, signal: AbortSignal.timeout(15000) });
      if (r.ok) {
        const out = (await r.json()) as { video?: { url?: string }; videos?: { url?: string }[] };
        videoUrl = out.video?.url ?? out.videos?.[0]?.url ?? null;
      }
    }
    return { ok: true, status: status.status ?? "UNKNOWN", done, videoUrl };
  } catch {
    return { ok: false, error: "The video provider did not respond." };
  }
}
