"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Database, FileImage, Loader2, Upload } from "lucide-react";
import { deleteMediaAsset, saveMediaAsset } from "@/app/(admin)/admin/content-actions";
import { toastResult } from "@/lib/action-toast";
import { toast } from "@/lib/toast";
import { SuperCard, SuperCardHeader, SuperEmptyState } from "./primitives";

export type MediaRow = {
  id: string;
  fileName: string;
  url: string | null;
  mimeType: string;
  fileSize: number;
  altText: string;
  caption: string;
  description: string;
  folder: string;
  tags: string[];
  usedIn: number;
  createdAt: string;
};

const field = "h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[13.5px] text-admin-navy focus:border-royal-blue focus:outline-none";
const area = "w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[13.5px] focus:border-royal-blue focus:outline-none";
const label = "mb-1.5 block text-[13px] font-bold text-admin-navy";
const btnPrimary = "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-royal-blue px-5 text-[13.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-50";
const small = "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12.5px] font-bold text-admin-navy transition hover:bg-bg-soft disabled:opacity-50";

const size = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** Media library with upload, details and usage-aware deletion. */
export function MediaLibraryPanel({ rows, connected, storageReady }: { rows: MediaRow[]; connected: boolean; storageReady: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<MediaRow | null>(null);
  const [q, setQ] = useState("");

  if (!connected) {
    return (
      <SuperCard>
        <SuperEmptyState icon={Database} title="Data source unavailable" description="The platform database could not be reached, so media assets cannot be shown right now." />
      </SuperCard>
    );
  }

  const shown = rows.filter((r) => !q || `${r.fileName} ${r.folder} ${r.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()));

  async function upload(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error || "Upload failed.");
      const save = new FormData();
      save.set("fileName", file.name);
      save.set("url", json.url);
      save.set("storageKey", json.url);
      save.set("mimeType", file.type);
      save.set("fileSize", String(file.size));
      start(async () => {
        if (toastResult(await saveMediaAsset(save))) router.refresh();
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <SuperCard>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-6 py-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search media..." className="h-11 min-w-[200px] flex-1 rounded-xl border border-line px-3.5 text-[13px] focus:border-royal-blue focus:outline-none" />
          <label className={btnPrimary}>
            {busy || pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload media
            <input type="file" className="sr-only" disabled={busy || pending} onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ""; }} />
          </label>
        </div>
        {!storageReady && <p className="border-b border-line bg-amber-50 px-6 py-3 text-[12.5px] text-amber-900">Object storage is not configured, so uploads are stored on the application server.</p>}
        {shown.length === 0 ? (
          <SuperEmptyState icon={FileImage} title={rows.length ? "No media matches that search" : "No media yet"} description={rows.length ? "Try another file name, folder or tag." : "Upload images, video, documents or downloadable files to reuse across content."} />
        ) : (
          <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-3 xl:grid-cols-4">
            {shown.map((m) => (
              <button key={m.id} type="button" onClick={() => setSelected(m)} className="overflow-hidden rounded-xl border border-line text-left transition hover:border-royal-blue/50">
                <span className="flex h-32 items-center justify-center bg-bg-soft">
                  {m.url && m.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.altText || m.fileName} className="h-full w-full object-cover" />
                  ) : (
                    <FileImage className="h-6 w-6 text-ink-muted" />
                  )}
                </span>
                <span className="block px-3 py-2.5">
                  <span className="block truncate text-[12.5px] font-semibold text-admin-navy">{m.fileName}</span>
                  <span className="block text-[11.5px] text-ink-muted">{size(m.fileSize)} · {m.usedIn} use{m.usedIn === 1 ? "" : "s"}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </SuperCard>

      {selected && (
        <SuperCard>
          <SuperCardHeader title={selected.fileName} description="Media details, usage and file information." action={<button type="button" className={small} onClick={() => setSelected(null)}>Close</button>} />
          <form
            className="grid grid-cols-1 gap-6 px-6 py-5 xl:grid-cols-[minmax(0,1fr)_320px]"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              fd.set("id", selected.id);
              start(async () => {
                if (toastResult(await saveMediaAsset(fd))) {
                  setSelected(null);
                  router.refresh();
                }
              });
            }}
          >
            <div className="space-y-5">
              <label className="block"><span className={label}>File name *</span><input name="fileName" required defaultValue={selected.fileName} className={field} /></label>
              <label className="block"><span className={label}>Alt text</span><input name="altText" defaultValue={selected.altText} placeholder="Describe the image for accessibility..." className={field} /></label>
              <label className="block"><span className={label}>Caption</span><input name="caption" defaultValue={selected.caption} className={field} /></label>
              <label className="block"><span className={label}>Description</span><textarea name="description" rows={3} defaultValue={selected.description} className={area} /></label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label><span className={label}>Folder</span><input name="folder" defaultValue={selected.folder} className={field} /></label>
                <label><span className={label}>Tags</span><input name="tags" defaultValue={selected.tags.join(", ")} placeholder="Comma separated" className={field} /></label>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className={btnPrimary} disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />} Save details</button>
                <button
                  type="button"
                  className={small}
                  disabled={pending}
                  onClick={() => {
                    if (!window.confirm(`Delete ${selected.fileName}?`)) return;
                    start(async () => {
                      if (toastResult(await deleteMediaAsset(selected.id))) {
                        setSelected(null);
                        router.refresh();
                      }
                    });
                  }}
                >
                  Delete
                </button>
                {selected.url && <a href={selected.url} target="_blank" rel="noopener noreferrer" className={small}>Open file</a>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-line p-4">
                <div className="text-[13px] font-bold text-admin-navy">Usage</div>
                <p className="mt-1 text-[12.5px] text-ink-soft">{selected.usedIn === 0 ? "Not referenced by any content yet." : `Referenced in ${selected.usedIn} place${selected.usedIn === 1 ? "" : "s"}. Deletion is blocked until those references are changed.`}</p>
              </div>
              <div className="rounded-xl border border-line p-4">
                <div className="text-[13px] font-bold text-admin-navy">File details</div>
                <dl className="mt-2 space-y-1.5 text-[12.5px] text-ink-soft">
                  <div className="flex justify-between gap-3"><dt>File size</dt><dd>{size(selected.fileSize)}</dd></div>
                  <div className="flex justify-between gap-3"><dt>Format</dt><dd>{selected.mimeType || "—"}</dd></div>
                  <div className="flex justify-between gap-3"><dt>Uploaded</dt><dd>{selected.createdAt}</dd></div>
                </dl>
              </div>
            </div>
          </form>
        </SuperCard>
      )}
    </div>
  );
}
