import type { Metadata } from "next";
import Link from "next/link";
import { Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { crmContext } from "@/lib/server/crm-screens";
import { formatBytes, loadMediaLibrary } from "@/lib/server/media-library";
import { AssetMenu, GenerateButton, VideoWorkspace } from "@/components/amplivanta/media-studio";

export const metadata: Metadata = { title: "Video — Creative Studio" };
export const dynamic = "force-dynamic";

const BASE = "/app/creative-studio/video";
const VIEWS = [
  ["create", "Create New"],
  ["mine", "My Videos"],
  ["templates", "Templates"],
  ["library", "Media Library"],
] as const;

export default async function VideoPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view: rawView } = await searchParams;
  const view = VIEWS.some(([k]) => k === rawView) ? rawView! : "create";
  const ctx = await crmContext();
  const lib = await loadMediaLibrary(ctx?.workspaceId ?? null, "video", view);
  const videoTasks = lib.tasks;
  const createBtn = (className: string) => (
    <GenerateButton kind="video" tasks={videoTasks} images={lib.images} brandKits={lib.brandKits} label="Create Video" className={className} />
  );

  const empty =
    view === "templates"
      ? ["No video templates yet", "Video templates appear here once they are published to your workspace."]
      : view === "library"
        ? ["No media yet", "Upload footage or images in Creative Studio to reuse them in videos."]
        : ["No videos yet", "Choose a creation method to start a video project."];

  const library = (
    <section className="min-h-[502px] rounded-xl border border-line bg-white p-6">
      {lib.jobs.map((j) => (
        <div key={j.id} className="mb-3 flex items-center gap-2.5 rounded-lg bg-royal-tint/60 px-3.5 py-2.5 text-[13px] text-deep-navy">
          <Loader2 className="h-4 w-4 animate-spin text-[#0B5CFF]" /> Generating a video… it appears here as a draft when ready. Refresh to check.
        </div>
      ))}
      {lib.assets.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Play className="h-6 w-6 fill-current" /></span>
          <h2 className="mt-7 text-[17px] font-semibold text-deep-navy">{lib.reachable ? empty[0] : "Videos unavailable"}</h2>
          <p className="mt-2 max-w-[460px] text-[14px] text-ink-soft">{lib.reachable ? empty[1] : "The library could not be loaded right now."}</p>
          {lib.reachable && view !== "templates" && view !== "library" && createBtn("mt-5 inline-flex h-10 items-center rounded-md bg-[#0B5CFF] px-8 text-[13.5px] font-semibold text-white hover:bg-[#0A4FE0]")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {lib.assets.map((a) => (
            <figure key={a.id} className="overflow-hidden rounded-lg border border-line">
              <div className="relative aspect-video bg-deep-navy">
                {a.url && <video src={a.url} controls preload="metadata" className="h-full w-full object-contain" />}
                {a.draft && <span className="absolute left-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10.5px] font-bold text-amber-800">Draft</span>}
              </div>
              <figcaption className="flex items-center justify-between gap-2 px-3 py-2.5">
                <div className="min-w-0">
                  <div className="truncate text-[12.5px] font-semibold text-deep-navy">{a.name}</div>
                  <div className="text-[11px] text-ink-muted">{a.ai ? "AI generated · " : ""}{formatBytes(a.size)}</div>
                </div>
                <AssetMenu id={a.id} favorite={a.favorite} draft={a.draft} />
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[32px] font-bold leading-tight text-deep-navy">Video</h1>
      <p className="mt-1 text-[14.5px] text-ink-soft">Create and manage AI-assisted video projects and reusable video assets.</p>

      <div className="mt-6 mb-6 flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-white px-6 py-3.5">
        {VIEWS.map(([key, label]) => (
          <Link
            key={key}
            href={key === "create" ? BASE : `${BASE}?view=${key}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[12.5px]",
              key === view ? "border-[#0B5CFF] bg-royal-tint font-semibold text-[#0B5CFF]" : "border-line bg-bg-soft/60 text-ink-soft hover:text-deep-navy",
            )}
          >
            {label}
          </Link>
        ))}
        <div className="ml-auto">{createBtn("inline-flex h-[52px] items-center rounded-md bg-[#0B5CFF] px-12 text-[13.5px] font-semibold text-white hover:bg-[#0A4FE0]")}</div>
      </div>

      <VideoWorkspace library={library} tasks={videoTasks} images={lib.images} brandKits={lib.brandKits} />
    </div>
  );
}
