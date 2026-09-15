"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MoreHorizontal, Star, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

/**
 * Creative Studio generation and library controls. Generation goes through
 * /api/ai/media (task-based; the server picks the model and price), outputs
 * arrive as draft assets, and uploads go straight to storage via presigned PUT.
 */

export type MediaTask = {
  code: string;
  label: string;
  description: string;
  needsPrompt: boolean;
  needsImage: boolean;
  credits: number | null;
  available: boolean;
};
export type LibraryImage = { id: string; name: string };
export type BrandKitOption = { id: string; name: string };

export const studioPrimary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0B5CFF] px-5 text-[13.5px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-60";
export const studioOutline =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-5 text-[13.5px] font-semibold text-deep-navy hover:bg-bg-soft disabled:opacity-60";
const field = "h-10 w-full rounded-lg border border-line bg-white px-3 text-[13px] text-deep-navy focus:border-[#0B5CFF] focus:outline-none";

const ASPECTS = [["1:1", "Square 1:1"], ["16:9", "Landscape 16:9"], ["9:16", "Portrait 9:16"], ["4:5", "Social 4:5"]] as const;
export const PLATFORMS = ["Instagram", "TikTok", "YouTube", "LinkedIn", "Facebook", "Website"];
export const TONES = ["Professional", "Friendly", "Bold", "Playful", "Inspirational"];
export const FORMATS = [["16:9", "Landscape 16:9"], ["9:16", "Vertical 9:16"], ["1:1", "Square 1:1"]] as const;
export const DURATIONS = [5, 10];

export type VideoControls = { platform: string; format: string; duration: string; brandKitId: string; tone: string };

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-navy/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[90vh] w-full max-w-[540px] overflow-y-auto rounded-2xl bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-deep-navy">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Polls a generation job until it settles, then refreshes the library. */
function useJobWatcher() {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "processing" | "completed" | "failed">("idle");
  useEffect(() => {
    if (!jobId) return;
    let stop = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/ai/media/${jobId}`, { cache: "no-store" });
        const data = (await res.json()) as { status?: string; error?: string | null };
        if (stop) return;
        if (data.status === "completed") {
          setState("completed");
          toast.success("Your draft is ready", "Review it in the library before using it anywhere.");
          router.refresh();
          return;
        }
        if (data.status === "failed") {
          setState("failed");
          toast.error("Generation failed", data.error ?? undefined);
          return;
        }
      } catch {
        /* keep polling */
      }
      if (!stop) timer = setTimeout(tick, 5000);
    };
    let timer = setTimeout(tick, 4000);
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [jobId, router]);
  return { state, start: (id: string) => { setJobId(id); setState("processing"); } };
}

export function GenerateDialog({
  kind,
  tasks,
  initialTask,
  images,
  brandKits,
  controls,
  onClose,
}: {
  kind: "image" | "video";
  tasks: MediaTask[];
  initialTask?: string;
  images: LibraryImage[];
  brandKits: BrandKitOption[];
  controls?: VideoControls;
  onClose: () => void;
}) {
  const usable = tasks.filter((t) => t.available);
  const [code, setCode] = useState(initialTask && usable.some((t) => t.code === initialTask) ? initialTask : usable[0]?.code ?? "");
  const task = usable.find((t) => t.code === code);
  const [pending, start] = useTransition();
  const job = useJobWatcher();

  if (!task) {
    return (
      <Dialog title={kind === "video" ? "Create video" : "Generate image"} onClose={onClose}>
        <p className="text-[13.5px] text-ink-soft">
          {kind === "video" ? "Video generation" : "Image generation"} is not available yet. It becomes available once the media provider, credit pricing and asset storage are configured for this workspace.
        </p>
        <div className="mt-5 flex justify-end"><button type="button" onClick={onClose} className={studioOutline}>Close</button></div>
      </Dialog>
    );
  }

  if (job.state !== "idle") {
    return (
      <Dialog title={task.label} onClose={onClose}>
        <div className="flex flex-col items-center py-6 text-center">
          {job.state === "processing" && <Loader2 className="h-8 w-8 animate-spin text-[#0B5CFF]" />}
          {job.state === "completed" && <CheckCircle2 className="h-8 w-8 text-emerald-600" />}
          {job.state === "failed" && <X className="h-8 w-8 text-red-600" />}
          <div className="mt-3 text-[15px] font-bold text-deep-navy">
            {job.state === "processing" ? "Generating…" : job.state === "completed" ? "Draft added to your library" : "Generation failed"}
          </div>
          <p className="mt-1 max-w-[380px] text-[13px] text-ink-soft">
            {job.state === "processing"
              ? "You can close this window. The draft appears in your library when it is ready."
              : job.state === "completed"
                ? "Generated media is saved as a draft. Review it before publishing."
                : "Any credits charged for this job were refunded."}
          </p>
          <button type="button" onClick={onClose} className={cn(studioOutline, "mt-5")}>Close</button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog title={kind === "video" ? "Create video" : "Generate image"} onClose={onClose}>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const body: Record<string, unknown> = { task: code };
          for (const k of ["prompt", "imageAssetId", "aspectRatio", "platform", "tone", "brandKitId"]) {
            const v = String(fd.get(k) ?? "");
            if (v) body[k] = v;
          }
          if (fd.get("duration")) body.duration = Number(fd.get("duration"));
          start(async () => {
            try {
              const res = await fetch("/api/ai/media", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
              const data = (await res.json()) as { jobId?: string; error?: string };
              if (!res.ok || !data.jobId) toast.error("Could not start generation", data.error ?? undefined);
              else job.start(data.jobId);
            } catch {
              toast.error("Could not start generation", "Check your connection and try again.");
            }
          });
        }}
      >
        {usable.length > 1 && (
          <label className="block">
            <span className="mb-1 block text-[12.5px] font-semibold text-deep-navy">Method</span>
            <select value={code} onChange={(e) => setCode(e.target.value)} className={field}>
              {usable.map((t) => <option key={t.code} value={t.code}>{t.label}</option>)}
            </select>
          </label>
        )}
        {task.needsImage && (
          <label className="block">
            <span className="mb-1 block text-[12.5px] font-semibold text-deep-navy">Source image</span>
            {images.length ? (
              <select name="imageAssetId" required className={field} defaultValue="">
                <option value="" disabled>Choose from your library</option>
                {images.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            ) : (
              <p className="rounded-lg bg-bg-soft px-3 py-2.5 text-[12.5px] text-ink-soft">Upload an image to your library first.</p>
            )}
          </label>
        )}
        {task.needsPrompt && (
          <label className="block">
            <span className="mb-1 block text-[12.5px] font-semibold text-deep-navy">{task.needsImage ? "What should change?" : "Prompt"}</span>
            <textarea name="prompt" required minLength={3} maxLength={1500} rows={4} className={cn(field, "h-auto py-2.5")} placeholder={kind === "video" ? "Describe the scene, subject and motion" : "Describe the image you want"} />
          </label>
        )}
        {kind === "image" && task.code === "image.generate" && (
          <label className="block">
            <span className="mb-1 block text-[12.5px] font-semibold text-deep-navy">Size</span>
            <select name="aspectRatio" defaultValue="1:1" className={field}>
              {ASPECTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        )}
        {kind === "video" && (
          <>
            <input type="hidden" name="aspectRatio" value={controls?.format || "16:9"} />
            <input type="hidden" name="duration" value={controls?.duration || "5"} />
            <input type="hidden" name="platform" value={controls?.platform ?? ""} />
            <input type="hidden" name="tone" value={controls?.tone ?? ""} />
            <input type="hidden" name="brandKitId" value={controls?.brandKitId ?? ""} />
            <p className="text-[12px] text-ink-muted">
              {[controls?.platform || "Any platform", FORMATS.find((f) => f[0] === (controls?.format || "16:9"))?.[1], `${controls?.duration || 5}s`, controls?.tone].filter(Boolean).join(" · ")} — change these in Video Controls.
            </p>
          </>
        )}
        {kind === "image" && brandKits.length > 0 && (
          <label className="block">
            <span className="mb-1 block text-[12.5px] font-semibold text-deep-navy">Brand kit (optional)</span>
            <select name="brandKitId" defaultValue="" className={field}>
              <option value="">None</option>
              {brandKits.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
        )}
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[12px] text-ink-muted">{task.credits} credits · saved as a draft</span>
          <button type="submit" disabled={pending || (task.needsImage && images.length === 0)} className={studioPrimary}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} {kind === "video" ? "Create Video" : "Generate"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export function GenerateButton({
  kind,
  tasks,
  images,
  brandKits,
  label,
  className,
  initialTask,
  controls,
}: {
  kind: "image" | "video";
  tasks: MediaTask[];
  images: LibraryImage[];
  brandKits: BrandKitOption[];
  label: string;
  className?: string;
  initialTask?: string;
  controls?: VideoControls;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className ?? studioPrimary}>{label}</button>
      {open && <GenerateDialog kind={kind} tasks={tasks} images={images} brandKits={brandKits} initialTask={initialTask} controls={controls} onClose={() => setOpen(false)} />}
    </>
  );
}

/** Tool list for the Images right rail; unavailable tools say so instead of pretending. */
export function ImageTools({ tasks, images, brandKits }: { tasks: MediaTask[]; images: LibraryImage[]; brandKits: BrandKitOption[] }) {
  const [openTask, setOpenTask] = useState<string | null>(null);
  const extra = [
    { code: "resize", label: "Resize", description: "Create alternate dimensions." },
    { code: "stock", label: "Stock Source", description: "Connect a licensed source." },
  ];
  const order = ["image.generate", "image.edit", "image.remove_background", "resize", "image.enhance", "stock"];
  const rows = order.map((c) => tasks.find((t) => t.code === c) ?? { ...extra.find((e) => e.code === c)!, available: false, credits: null });
  return (
    <>
      <ul className="space-y-3">
        {rows.map((t) => (
          <li key={t.code}>
            <button
              type="button"
              disabled={!t.available}
              onClick={() => setOpenTask(t.code)}
              className="w-full rounded-lg border border-line bg-white px-4 py-3.5 text-left transition enabled:hover:border-[#0B5CFF]/40 enabled:hover:bg-royal-tint/40 disabled:cursor-default"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-semibold text-deep-navy">{t.label}</span>
                <span className="text-[11.5px] text-ink-muted">{t.available ? `${t.credits} credits` : "Not available yet"}</span>
              </span>
              <span className="mt-1 block text-[12.5px] text-ink-soft">{t.description}</span>
            </button>
          </li>
        ))}
      </ul>
      {openTask && <GenerateDialog kind="image" tasks={tasks} images={images} brandKits={brandKits} initialTask={openTask} onClose={() => setOpenTask(null)} />}
    </>
  );
}

/** Direct-to-storage upload: create the asset record, PUT the bytes, record the size. */
export function UploadButton({ accept, storageReady, label }: { accept: string; storageReady: boolean; label: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => (storageReady ? input.current?.click() : toast.warning("Uploads are not available yet", { description: "Asset storage has not been configured." }))}
        className={studioOutline}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {label}
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          start(async () => {
            let assetId: string | null = null;
            try {
              const res = await fetch("/api/assets", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream", size: file.size }),
              });
              const data = (await res.json()) as { asset?: { id: string }; uploadUrl?: string; error?: string };
              if (!res.ok || !data.uploadUrl || !data.asset) throw new Error(data.error ?? "Upload could not start.");
              assetId = data.asset.id;
              const put = await fetch(data.uploadUrl, { method: "PUT", headers: { "content-type": file.type || "application/octet-stream" }, body: file });
              if (!put.ok) throw new Error("The file could not be stored.");
              toast.success("Uploaded", file.name);
              router.refresh();
            } catch (err) {
              if (assetId) await fetch(`/api/assets/${assetId}`, { method: "DELETE" }).catch(() => {});
              toast.error("Upload failed", (err as Error).message);
            }
          });
        }}
      />
    </>
  );
}

/** Per-asset menu: favorite, approve a draft, delete. */
export function AssetMenu({ id, favorite, draft }: { id: string; favorite: boolean; draft: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const act = (init: RequestInit, done: string) =>
    start(async () => {
      setOpen(false);
      const res = await fetch(`/api/assets/${id}`, init).catch(() => null);
      if (res?.ok) {
        toast.success(done);
        router.refresh();
      } else toast.error("That change could not be saved.");
    });
  const patch = (body: object, done: string) => act({ method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }, done);
  return (
    <div className="relative">
      <button type="button" aria-label="Asset actions" disabled={pending} onClick={() => setOpen((o) => !o)} className="rounded p-1 text-ink-muted hover:bg-bg-soft">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
      </button>
      {open && (
        <div className="absolute bottom-8 right-0 z-10 w-44 overflow-hidden rounded-lg border border-line bg-white py-1 text-[13px] shadow-card">
          <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-bg-soft" onClick={() => patch({ favorite: !favorite }, favorite ? "Removed from favorites" : "Added to favorites")}>
            <Star className="h-3.5 w-3.5" /> {favorite ? "Remove favorite" : "Add to favorites"}
          </button>
          {draft && (
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-bg-soft" onClick={() => patch({ approve: true }, "Draft approved")}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve draft
            </button>
          )}
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50"
            onClick={() => {
              if (window.confirm("Delete this file permanently?")) act({ method: "DELETE" }, "Deleted");
              else setOpen(false);
            }}
          >
            <X className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

/** Video page body: library slot, Create From list and Video Controls share one state. */
export function VideoWorkspace({
  library,
  tasks,
  images,
  brandKits,
}: {
  library: React.ReactNode;
  tasks: MediaTask[];
  images: LibraryImage[];
  brandKits: BrandKitOption[];
}) {
  const [controls, setControls] = useState<VideoControls>({ platform: "", format: "", duration: "", brandKitId: "", tone: "" });
  const [openTask, setOpenTask] = useState<string | null>(null);
  const byCode = (c: string) => tasks.find((t) => t.code === c);
  const methods: { code: string; label: string; task?: MediaTask }[] = [
    { code: "video.text_to_video", label: "Text to Video", task: byCode("video.text_to_video") },
    { code: "script", label: "Script to Video" },
    { code: "video.image_to_video", label: "Image to Video", task: byCode("video.image_to_video") },
    { code: "url", label: "URL to Video" },
    { code: "repurpose", label: "Repurpose Content" },
  ];
  const set = (k: keyof VideoControls) => (e: React.ChangeEvent<HTMLSelectElement>) => setControls((c) => ({ ...c, [k]: e.target.value }));
  const control = "mt-1 w-full appearance-none bg-transparent text-[12.5px] text-ink-muted focus:outline-none";

  return (
    <>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_575px]">
        {library}
        <section className="rounded-xl border border-line bg-white p-6">
          <h2 className="text-[17px] font-semibold text-deep-navy">Create From</h2>
          <ul className="mt-6 space-y-3.5">
            {methods.map((m) => {
              const available = Boolean(m.task?.available);
              return (
                <li key={m.code}>
                  <button
                    type="button"
                    disabled={!available}
                    onClick={() => setOpenTask(m.code)}
                    className="flex h-[58px] w-full items-center justify-between rounded-lg border border-line px-6 text-left transition enabled:hover:border-[#0B5CFF]/40 enabled:hover:bg-royal-tint/40 disabled:cursor-default"
                  >
                    <span className="text-[14px] font-semibold text-deep-navy">{m.label}</span>
                    <span className="text-[11.5px] text-ink-muted">{available ? `${m.task!.credits} credits` : "Not available yet"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-line bg-white p-6">
        <h2 className="text-[17px] font-semibold text-deep-navy">Video Controls</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <label className="block rounded-lg border border-line px-4 py-3.5">
            <span className="text-[14px] font-semibold text-deep-navy">Platform</span>
            <select value={controls.platform} onChange={set("platform")} className={control}>
              <option value="">Not set</option>
              {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label className="block rounded-lg border border-line px-4 py-3.5">
            <span className="text-[14px] font-semibold text-deep-navy">Format</span>
            <select value={controls.format} onChange={set("format")} className={control}>
              <option value="">Not set</option>
              {FORMATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="block rounded-lg border border-line px-4 py-3.5">
            <span className="text-[14px] font-semibold text-deep-navy">Duration</span>
            <select value={controls.duration} onChange={set("duration")} className={control}>
              <option value="">Not set</option>
              {DURATIONS.map((d) => <option key={d} value={d}>{d} seconds</option>)}
            </select>
          </label>
          <label className="block rounded-lg border border-line px-4 py-3.5">
            <span className="text-[14px] font-semibold text-deep-navy">Brand Kit</span>
            <select value={controls.brandKitId} onChange={set("brandKitId")} className={control}>
              <option value="">Optional</option>
              {brandKits.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
          <label className="block rounded-lg border border-line px-4 py-3.5">
            <span className="text-[14px] font-semibold text-deep-navy">Tone</span>
            <select value={controls.tone} onChange={set("tone")} className={control}>
              <option value="">Optional</option>
              {TONES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>
      </section>

      {openTask && <GenerateDialog kind="video" tasks={tasks} images={images} brandKits={brandKits} initialTask={openTask} controls={controls} onClose={() => setOpenTask(null)} />}
    </>
  );
}
