import type { Metadata } from "next";
import Link from "next/link";
import { HardDrive, Image as ImageIcon, Loader2, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { crmContext } from "@/lib/server/crm-screens";
import { formatBytes, loadMediaLibrary } from "@/lib/server/media-library";
import { AssetMenu, GenerateButton, ImageTools, UploadButton } from "@/components/amplivanta/media-studio";

export const metadata: Metadata = { title: "Images — Creative Studio" };
export const dynamic = "force-dynamic";

const BASE = "/app/creative-studio/images";
const VIEWS = [
  ["mine", "My Images"],
  ["ai", "AI Generated"],
  ["stock", "Stock Images"],
  ["favorites", "Favorites"],
  ["trash", "Trash"],
] as const;

const EMPTY: Record<string, [string, string]> = {
  mine: ["No images yet", "Generate an image, upload your own, or connect an approved stock source."],
  ai: ["No generated images yet", "Images you generate are saved here as drafts for review."],
  stock: ["No stock source connected", "Stock images appear once a licensed stock source is connected."],
  favorites: ["No favorites yet", "Mark images as favorites from the library to find them quickly."],
  trash: ["Trash is empty", "Deleted images are removed permanently, so nothing is kept here."],
};

export default async function ImagesPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view: rawView } = await searchParams;
  const view = VIEWS.some(([k]) => k === rawView) ? rawView! : "mine";
  const ctx = await crmContext();
  const lib = await loadMediaLibrary(ctx?.workspaceId ?? null, "image", view);
  const { counts } = lib;

  const stats: [string, typeof ImageIcon, string | null, string][] = [
    ["My Images", ImageIcon, counts.total ? counts.total.toLocaleString("en-US") : null, "No images yet"],
    ["AI Generated", Sparkles, counts.ai ? counts.ai.toLocaleString("en-US") : null, "No generated images"],
    ["Favorites", Star, counts.favorites ? counts.favorites.toLocaleString("en-US") : null, "No favorites yet"],
    ["Storage", HardDrive, counts.bytes ? formatBytes(counts.bytes) : null, "No usage data yet"],
  ];

  return (
    <div className="mx-auto max-w-[1600px]">
      <h1 className="font-display text-[32px] font-bold leading-tight text-deep-navy">Images</h1>
      <p className="mt-1 text-[14.5px] text-ink-soft">Create, upload, organize, and manage image assets in one workspace.</p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, Icon, value, hint]) => (
          <div key={label} className="flex gap-4 rounded-xl border border-line bg-white px-5 py-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Icon className="h-4 w-4" /></span>
            <div>
              <div className="text-[14px] font-semibold text-deep-navy">{label}</div>
              <div className="mt-2 text-[20px] font-bold leading-none text-deep-navy">{value ?? "—"}</div>
              <div className="mt-2.5 text-[12px] text-ink-muted">{value == null ? (lib.reachable ? hint : "Not available") : ""}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-white px-6 py-3.5">
        {VIEWS.map(([key, label]) => (
          <Link
            key={key}
            href={key === "mine" ? BASE : `${BASE}?view=${key}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[12.5px]",
              key === view ? "border-[#0B5CFF] bg-royal-tint font-semibold text-[#0B5CFF]" : "border-line bg-bg-soft/60 text-ink-soft hover:text-deep-navy",
            )}
          >
            {label}
          </Link>
        ))}
        <div className="ml-auto"><UploadButton accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" storageReady={lib.storageReady} label="Upload Image" /></div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_580px]">
        <section className="min-h-[586px] rounded-xl border border-line bg-white p-6">
          {lib.jobs.length > 0 && (
            <div className="mb-5 space-y-2">
              {lib.jobs.map((j) => (
                <div key={j.id} className="flex items-center gap-2.5 rounded-lg bg-royal-tint/60 px-3.5 py-2.5 text-[13px] text-deep-navy">
                  <Loader2 className="h-4 w-4 animate-spin text-[#0B5CFF]" /> Generating an image… it appears here as a draft when ready. Refresh to check.
                </div>
              ))}
            </div>
          )}
          {lib.assets.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <span className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><ImageIcon className="h-6 w-6" /></span>
              <h2 className="mt-7 text-[17px] font-semibold text-deep-navy">{lib.reachable ? EMPTY[view][0] : "Images unavailable"}</h2>
              <p className="mt-2 max-w-[520px] text-[14px] text-ink-soft">{lib.reachable ? EMPTY[view][1] : "The library could not be loaded right now."}</p>
              {lib.reachable && (view === "mine" || view === "ai") && (
                <GenerateButton kind="image" tasks={lib.tasks} images={lib.images} brandKits={lib.brandKits} label="Generate Image" className="mt-5 inline-flex h-10 items-center rounded-md bg-[#0B5CFF] px-6 text-[13.5px] font-semibold text-white hover:bg-[#0A4FE0]" />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-4">
              {lib.assets.map((a) => (
                <figure key={a.id} className="overflow-hidden rounded-lg border border-line">
                  <div className="relative aspect-square bg-bg-soft">
                    {a.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.url} alt={a.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="absolute inset-0 m-auto h-6 w-6 text-ink-muted" />
                    )}
                    {a.draft && <span className="absolute left-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10.5px] font-bold text-amber-800">Draft</span>}
                    {a.favorite && <Star className="absolute right-2 top-2 h-4 w-4 fill-amber-400 text-amber-400" />}
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

        <aside className="rounded-xl border border-line bg-white p-6">
          <h2 className="mb-6 text-[17px] font-semibold text-deep-navy">Image Tools</h2>
          <ImageTools tasks={lib.tasks} images={lib.images} brandKits={lib.brandKits} />
        </aside>
      </div>
    </div>
  );
}
