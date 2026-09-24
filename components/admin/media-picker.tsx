"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { saveMediaAsset } from "@/app/(admin)/admin/content-actions";
import { toastResult } from "@/lib/action-toast";
import { toast } from "@/lib/toast";

export type MediaOption = { id: string; fileName: string; url: string | null; mimeType: string };

const field = "h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[13.5px] text-admin-navy focus:border-royal-blue focus:outline-none";
const small = "inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12.5px] font-bold text-admin-navy transition hover:bg-bg-soft disabled:opacity-50";

/**
 * Picks an existing media asset or uploads a new one. Uploads go through the
 * platform upload route and are recorded in the media library, so every asset
 * has a usage trail.
 */
export function MediaPicker({
  label,
  media,
  value,
  onChange,
  storageReady,
  accept = "image/*",
}: {
  label: string;
  media: MediaOption[];
  value: string;
  onChange: (id: string) => void;
  storageReady: boolean;
  accept?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);
  const selected = media.find((m) => m.id === value) ?? null;

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
        const result = await saveMediaAsset(save);
        if (toastResult(result) && result.ok && result.id) {
          onChange(result.id);
          router.refresh();
        }
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-bold text-admin-navy">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-bg-soft">
          {selected?.url && selected.mimeType.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selected.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-5 w-5 text-ink-muted" />
          )}
        </span>
        <select value={value} onChange={(e) => onChange(e.target.value)} className={`${field} max-w-[320px] flex-1`}>
          <option value="">No file selected</option>
          {media.map((m) => <option key={m.id} value={m.id}>{m.fileName}</option>)}
        </select>
        <label className={small}>
          {busy || pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
          <input
            type="file"
            accept={accept}
            className="sr-only"
            disabled={busy || pending}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {!storageReady && <span className="mt-1 block text-[12px] text-ink-muted">Object storage is not configured, so uploads are stored on the application server.</span>}
    </div>
  );
}
