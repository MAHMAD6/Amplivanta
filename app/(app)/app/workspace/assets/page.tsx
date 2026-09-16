import type { Metadata } from "next";
import { File, Folder, Image as ImageIcon, Music, Search, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { EmptyState, ScreenHeader, TabBar, fmtDate, kitField } from "@/components/amplivanta/screen-kit";
import { AssetMenu, UploadButton } from "@/components/amplivanta/media-studio";
import { workspaceContext } from "@/lib/server/workspace-screens";
import { formatBytes } from "@/lib/server/media-library";
import { isStorageConfigured, objectUrl } from "@/lib/storage";

export const metadata: Metadata = { title: "Asset Library" };
export const dynamic = "force-dynamic";

const BASE = "/app/workspace/assets";
const KINDS: [string, string, string | null][] = [["images", "Images", "image/"], ["videos", "Videos", "video/"], ["documents", "Documents", "application/"], ["audio", "Audio", "audio/"], ["other", "Other", null]];

export default async function AssetLibraryPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; project?: string }> }) {
  const sp = await searchParams;
  const kind = KINDS.find(([k]) => k === sp.tab) ?? null;
  const c = await workspaceContext();
  let reachable = Boolean(c);
  const storage = isStorageConfigured();
  let assets: { id: string; name: string; mimeType: string | null; fileSize: number; tags: string[]; createdAt: Date; url: string | null }[] = [];
  if (c) {
    try {
      const rows = await db.asset.findMany({
        where: {
          workspaceId: c.workspaceId,
          ...(kind?.[2] ? { mimeType: { startsWith: kind[2] } } : {}),
          ...(kind && !kind[2] ? { NOT: [{ mimeType: { startsWith: "image/" } }, { mimeType: { startsWith: "video/" } }, { mimeType: { startsWith: "audio/" } }, { mimeType: { startsWith: "application/" } }] } : {}),
          ...(sp.q ? { name: { contains: sp.q, mode: "insensitive" } } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 60,
      });
      assets = await Promise.all(rows.map(async (a) => ({ id: a.id, name: a.name, mimeType: a.mimeType, fileSize: a.fileSize, tags: a.tags, createdAt: a.createdAt, url: storage && a.mimeType?.startsWith("image/") ? await objectUrl(a.fileUrl).catch(() => null) : null })));
    } catch {
      reachable = false;
    }
  }
  const icon = (m: string | null) => (m?.startsWith("video/") ? Video : m?.startsWith("audio/") ? Music : m?.startsWith("image/") ? ImageIcon : File);

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={[["AI Workspace", "/app/workspace"], ["Asset Library"]]}
        title="Asset Library"
        subtitle="Store, organize, and manage your marketing assets in one place."
        actions={<UploadButton accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv" storageReady={storage} label="Upload assets" />}
      />
      <TabBar active={kind ? `${BASE}?tab=${kind[0]}` : BASE} tabs={[["All Assets", BASE], ...KINDS.map(([k, l]) => [l, `${BASE}?tab=${k}`] as [string, string])]} />
      <section className="rounded-xl border border-line bg-white p-5">
        <form method="get" className="mb-5 flex flex-wrap gap-4">
          {kind && <input type="hidden" name="tab" value={kind[0]} />}
          <label className="relative w-full max-w-[520px] flex-1">
            <span className="sr-only">Search assets</span>
            <input name="q" defaultValue={sp.q ?? ""} placeholder="Search assets..." className={cn(kitField, "h-11 pr-9")} />
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          </label>
          <button type="submit" className="h-11 rounded-md border border-line px-5 text-[13.5px] font-semibold text-deep-navy hover:bg-bg-soft">Filters</button>
        </form>
        {assets.length ? (
          <ul className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-6">
            {assets.map((a) => {
              const Icon = icon(a.mimeType);
              return (
                <li key={a.id} className="overflow-hidden rounded-lg border border-line">
                  <div className="flex aspect-square items-center justify-center bg-bg-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {a.url ? <img src={a.url} alt={a.name} loading="lazy" className="h-full w-full object-cover" /> : <Icon className="h-8 w-8 text-ink-muted" />}
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <div className="min-w-0"><div className="truncate text-[12.5px] font-semibold text-deep-navy">{a.name}</div><div className="text-[11px] text-ink-muted">{formatBytes(a.fileSize)} · {fmtDate(a.createdAt)}</div></div>
                    {c?.canEdit && <AssetMenu id={a.id} favorite={a.tags.includes("favorite")} draft={a.tags.includes("draft")} />}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon={Folder} title={!reachable ? "Assets unavailable" : sp.q || kind ? "No assets match" : "No assets yet"} body={storage ? "Upload your first asset to get started." : "Asset storage is not configured yet, so uploads are unavailable."} action={reachable && storage ? <UploadButton accept="image/*,video/*,audio/*,application/pdf" storageReady={storage} label="Upload assets" /> : undefined} />
        )}
        <div className="mt-4 rounded-xl border border-line bg-bg-soft/50 px-8 py-10">
          <h2 className="text-[22px] font-semibold text-deep-navy">Organized. Accessible. Ready.</h2>
          <p className="mt-2 text-[15px] text-ink-soft">Manage your media and files in one place. Keeps everything organized and easy to find.</p>
        </div>
      </section>
    </div>
  );
}
