import type { Metadata } from "next";
import { SuperInfoNote } from "@/components/admin/primitives";
import { MediaLibraryPanel } from "@/components/admin/media-library";
import { isStorageConfigured } from "@/lib/storage";
import { loadMediaAssets } from "../../content/loaders";

export const metadata: Metadata = { title: "Media Library" };
export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  const { rows, connected } = await loadMediaAssets();
  return (
    <div className="space-y-6">
      <MediaLibraryPanel rows={rows} connected={connected} storageReady={isStorageConfigured()} />
      <SuperInfoNote title="About the Media Library">
        One media store serves every content type. Each asset keeps its alt text, caption, folder and tags, and deletion is blocked while the file is still referenced by content, so nothing breaks silently.
      </SuperInfoNote>
    </div>
  );
}
