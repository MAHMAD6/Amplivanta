/**
 * Creative Studio generation tasks (fal.ai Integration Guidelines).
 *
 * The browser names an Amplivanta task, never a provider model. Each task maps
 * to one approved model configured on the server, declares the inputs it
 * accepts, and carries its credit price. Pure so validation is unit-testable.
 */

export type MediaKind = "image" | "video";

export type FalTaskCode =
  | "image.generate"
  | "image.edit"
  | "image.remove_background"
  | "image.enhance"
  | "video.text_to_video"
  | "video.image_to_video";

export type FalTaskDef = {
  code: FalTaskCode;
  kind: MediaKind;
  label: string;
  description: string;
  /** Server env var naming the approved fal model for this task. */
  modelEnv: string;
  /** Server env var with the credit price per job. */
  creditsEnv: string;
  needsPrompt: boolean;
  needsImage: boolean;
};

export const FAL_TASKS: Record<FalTaskCode, FalTaskDef> = {
  "image.generate": {
    code: "image.generate", kind: "image", label: "AI Image Generator", description: "Create from a prompt.",
    modelEnv: "FAL_MODEL_IMAGE_GENERATE", creditsEnv: "FAL_CREDITS_IMAGE_GENERATE", needsPrompt: true, needsImage: false,
  },
  "image.edit": {
    code: "image.edit", kind: "image", label: "Edit with AI", description: "Modify an existing image.",
    modelEnv: "FAL_MODEL_IMAGE_EDIT", creditsEnv: "FAL_CREDITS_IMAGE_EDIT", needsPrompt: true, needsImage: true,
  },
  "image.remove_background": {
    code: "image.remove_background", kind: "image", label: "Background Removal", description: "Remove a background.",
    modelEnv: "FAL_MODEL_IMAGE_REMOVE_BACKGROUND", creditsEnv: "FAL_CREDITS_IMAGE_REMOVE_BACKGROUND", needsPrompt: false, needsImage: true,
  },
  "image.enhance": {
    code: "image.enhance", kind: "image", label: "Enhance", description: "Improve an existing image.",
    modelEnv: "FAL_MODEL_IMAGE_ENHANCE", creditsEnv: "FAL_CREDITS_IMAGE_ENHANCE", needsPrompt: false, needsImage: true,
  },
  "video.text_to_video": {
    code: "video.text_to_video", kind: "video", label: "Text to Video", description: "Generate a clip from a prompt.",
    modelEnv: "FAL_MODEL_VIDEO_TEXT", creditsEnv: "FAL_CREDITS_VIDEO_TEXT", needsPrompt: true, needsImage: false,
  },
  "video.image_to_video": {
    code: "video.image_to_video", kind: "video", label: "Image to Video", description: "Animate an image from your library.",
    modelEnv: "FAL_MODEL_VIDEO_IMAGE", creditsEnv: "FAL_CREDITS_VIDEO_IMAGE", needsPrompt: true, needsImage: true,
  },
};

export const isFalTaskCode = (v: unknown): v is FalTaskCode => typeof v === "string" && v in FAL_TASKS;

const MODEL_ID = /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._/-]*$/i;

/** Resolves a task's approved model and price from the given env. Null = task not enabled. */
export function resolveTask(code: FalTaskCode, env: Record<string, string | undefined>): { model: string; credits: number } | null {
  const def = FAL_TASKS[code];
  const model = (env[def.modelEnv] ?? "").trim();
  const credits = Number(env[def.creditsEnv]);
  // A task without a price is not enabled: generation is never free by accident.
  if (!MODEL_ID.test(model) || !Number.isInteger(credits) || credits <= 0) return null;
  return { model, credits };
}

export const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:5"] as const;
export const VIDEO_DURATIONS = [5, 10] as const;
export const VIDEO_PLATFORMS = ["Instagram", "TikTok", "YouTube", "LinkedIn", "Facebook", "Website"] as const;
export const VIDEO_TONES = ["Professional", "Friendly", "Bold", "Playful", "Inspirational"] as const;

export type MediaInput = {
  prompt?: string;
  imageAssetId?: string;
  aspectRatio?: string;
  duration?: number;
  platform?: string;
  tone?: string;
  brandKitId?: string;
};

export type ValidatedInput = {
  prompt: string | null;
  imageAssetId: string | null;
  aspectRatio: (typeof ASPECT_RATIOS)[number];
  duration: (typeof VIDEO_DURATIONS)[number] | null;
  platform: string | null;
  tone: string | null;
  brandKitId: string | null;
};

/** Server-side validation of everything the browser may send for a task. */
export function validateMediaInput(code: FalTaskCode, input: MediaInput): { ok: true; value: ValidatedInput } | { ok: false; error: string } {
  const def = FAL_TASKS[code];
  const prompt = typeof input.prompt === "string" ? input.prompt.trim().replace(/\s+/g, " ") : "";
  if (def.needsPrompt && prompt.length < 3) return { ok: false, error: "Describe what to create (at least 3 characters)." };
  if (prompt.length > 1500) return { ok: false, error: "Keep the prompt under 1,500 characters." };
  const imageAssetId = typeof input.imageAssetId === "string" && /^[a-z0-9]{10,40}$/i.test(input.imageAssetId) ? input.imageAssetId : null;
  if (def.needsImage && !imageAssetId) return { ok: false, error: "Choose an image from your library." };

  const aspectRatio = (ASPECT_RATIOS as readonly string[]).includes(input.aspectRatio ?? "")
    ? (input.aspectRatio as ValidatedInput["aspectRatio"])
    : def.kind === "video" ? "16:9" : "1:1";
  let duration: ValidatedInput["duration"] = null;
  if (def.kind === "video") {
    const d = Number(input.duration ?? 5);
    if (!(VIDEO_DURATIONS as readonly number[]).includes(d)) return { ok: false, error: "Choose a supported duration." };
    duration = d as ValidatedInput["duration"];
  }
  const pick = (v: unknown, list: readonly string[]) => (typeof v === "string" && list.includes(v) ? v : null);
  return {
    ok: true,
    value: {
      prompt: prompt || null,
      imageAssetId: def.needsImage ? imageAssetId : null,
      aspectRatio,
      duration,
      platform: def.kind === "video" ? pick(input.platform, VIDEO_PLATFORMS) : null,
      tone: def.kind === "video" ? pick(input.tone, VIDEO_TONES) : null,
      brandKitId: typeof input.brandKitId === "string" && /^[a-z0-9]{10,40}$/i.test(input.brandKitId) ? input.brandKitId : null,
    },
  };
}

/** Provider request body for a task. Tone and platform only shape the prompt. */
export function buildFalPayload(code: FalTaskCode, v: ValidatedInput, imageUrl: string | null): Record<string, unknown> {
  const def = FAL_TASKS[code];
  const styled = [v.prompt, v.tone && `${v.tone.toLowerCase()} tone`, v.platform && `for ${v.platform}`].filter(Boolean).join(", ");
  const body: Record<string, unknown> = {};
  if (def.needsPrompt && styled) body.prompt = styled;
  if (imageUrl) body.image_url = imageUrl;
  if (code === "image.generate") {
    body.image_size = { "1:1": "square_hd", "16:9": "landscape_16_9", "9:16": "portrait_16_9", "4:5": "portrait_4_3" }[v.aspectRatio];
    body.num_images = 1;
  }
  if (def.kind === "video") {
    body.aspect_ratio = v.aspectRatio === "4:5" ? "1:1" : v.aspectRatio;
    body.duration = String(v.duration ?? 5);
  }
  return body;
}

/** Output media URLs from a completed fal payload, across common response shapes. */
export function extractOutputs(payload: unknown): { url: string; contentType: string | null; width: number | null; height: number | null }[] {
  const out: { url: string; contentType: string | null; width: number | null; height: number | null }[] = [];
  const push = (f: unknown) => {
    const o = f as { url?: unknown; content_type?: unknown; width?: unknown; height?: unknown } | null;
    if (o && typeof o.url === "string" && /^https:\/\//.test(o.url)) {
      out.push({
        url: o.url,
        contentType: typeof o.content_type === "string" ? o.content_type : null,
        width: typeof o.width === "number" ? o.width : null,
        height: typeof o.height === "number" ? o.height : null,
      });
    }
  };
  const p = (payload ?? {}) as { images?: unknown[]; image?: unknown; video?: unknown; videos?: unknown[] };
  if (Array.isArray(p.images)) p.images.forEach(push);
  push(p.image);
  push(p.video);
  if (Array.isArray(p.videos)) p.videos.forEach(push);
  return out.slice(0, 4);
}
