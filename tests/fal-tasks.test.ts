import { describe, expect, it } from "vitest";
import { buildFalPayload, extractOutputs, resolveTask, validateMediaInput } from "@/lib/media/fal-tasks";

describe("resolveTask", () => {
  it("enables a task only with an approved model id and a positive price", () => {
    expect(resolveTask("image.generate", {})).toBeNull();
    expect(resolveTask("image.generate", { FAL_MODEL_IMAGE_GENERATE: "fal-ai/flux/dev" })).toBeNull();
    expect(resolveTask("image.generate", { FAL_MODEL_IMAGE_GENERATE: "not a model", FAL_CREDITS_IMAGE_GENERATE: "4" })).toBeNull();
    expect(resolveTask("image.generate", { FAL_MODEL_IMAGE_GENERATE: "fal-ai/flux/dev", FAL_CREDITS_IMAGE_GENERATE: "0" })).toBeNull();
    expect(resolveTask("image.generate", { FAL_MODEL_IMAGE_GENERATE: "fal-ai/flux/dev", FAL_CREDITS_IMAGE_GENERATE: "4" })).toEqual({ model: "fal-ai/flux/dev", credits: 4 });
  });
});

describe("validateMediaInput", () => {
  it("requires a prompt and an image where the task needs them", () => {
    expect(validateMediaInput("image.generate", { prompt: "" }).ok).toBe(false);
    expect(validateMediaInput("image.edit", { prompt: "make it blue" }).ok).toBe(false);
    expect(validateMediaInput("image.remove_background", { imageAssetId: "clx1234567890abc" }).ok).toBe(true);
  });

  it("normalizes options and drops what the task does not use", () => {
    const r = validateMediaInput("image.generate", { prompt: "  a   red  bike ", aspectRatio: "7:3", duration: 99, platform: "TikTok" });
    expect(r.ok && r.value).toMatchObject({ prompt: "a red bike", aspectRatio: "1:1", duration: null, platform: null });
  });

  it("rejects unsupported video durations", () => {
    expect(validateMediaInput("video.text_to_video", { prompt: "a sunrise", duration: 30 }).ok).toBe(false);
    const ok = validateMediaInput("video.text_to_video", { prompt: "a sunrise", duration: 10, tone: "Bold" });
    expect(ok.ok && buildFalPayload("video.text_to_video", ok.value, null)).toEqual({ prompt: "a sunrise, bold tone", aspect_ratio: "16:9", duration: "10" });
  });
});

describe("extractOutputs", () => {
  it("reads image and video shapes and ignores non-https urls", () => {
    expect(extractOutputs({ images: [{ url: "https://x/1.png", content_type: "image/png", width: 1, height: 1 }, { url: "http://x/2.png" }] })).toHaveLength(1);
    expect(extractOutputs({ video: { url: "https://x/v.mp4" } })[0].url).toBe("https://x/v.mp4");
    expect(extractOutputs(null)).toEqual([]);
  });
});
