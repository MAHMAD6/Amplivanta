"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, ImageIcon, Loader2, Upload } from "lucide-react";
import { saveContentItem } from "@/app/(admin)/admin/content-actions";
import {
  ACCESS_MODES,
  CONTENT_STATUSES,
  EVENT_FORMATS,
  EVENT_TYPES,
  RECURRENCES,
  STATUS_LABEL,
  TEMPLATE_TYPES,
  VISIBILITIES,
  contentTypeMeta,
  slugify,
} from "@/lib/admin/content";
import { toastResult } from "@/lib/action-toast";
import { SuperCard, SuperCardHeader } from "./primitives";
import { MediaPicker } from "./media-picker";

export type EditorItem = {
  id: string;
  contentType: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: string;
  visibility: string;
  authorName: string;
  categories: string[];
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  scheduledAt: string;
  featuredMediaId: string | null;
  featuredMediaUrl: string | null;
  data: Record<string, unknown>;
  versions: { version: number; status: string; createdAt: string }[];
};

export type MediaOption = { id: string; fileName: string; url: string | null; mimeType: string };

const field = "h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[13.5px] text-admin-navy focus:border-royal-blue focus:outline-none";
const area = "w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[13.5px] text-admin-navy focus:border-royal-blue focus:outline-none";
const label = "mb-1.5 block text-[13px] font-bold text-admin-navy";
const hint = "mt-1 block text-[12px] text-ink-muted";
const btnPrimary = "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-royal-blue px-5 text-[13.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-50";
const btn = "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 text-[13.5px] font-bold text-admin-navy transition hover:bg-bg-soft disabled:opacity-50";

const d = (data: Record<string, unknown>, key: string, fallback = "") => (data[key] == null ? fallback : String(data[key]));
const dBool = (data: Record<string, unknown>, key: string) => data[key] === true || data[key] === "true";
const dList = (data: Record<string, unknown>, key: string) => (Array.isArray(data[key]) ? (data[key] as string[]).join(", ") : "");

/**
 * One editor for every content type. Shared fields come first; the type's own
 * fields render beside them, and the publishing controls enforce the shared
 * lifecycle.
 */
export function ContentEditor({
  item,
  contentType,
  media,
  forms,
  pages,
  storageReady,
}: {
  item: EditorItem | null;
  contentType: string;
  media: MediaOption[];
  forms: { id: string; name: string }[];
  pages: { id: string; name: string }[];
  storageReady: boolean;
}) {
  const meta = contentTypeMeta(contentType);
  const router = useRouter();
  const [pending, start] = useTransition();
  const data = item?.data ?? {};
  const [title, setTitle] = useState(item?.title ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [status, setStatus] = useState(item?.status ?? "DRAFT");
  const [featuredMediaId, setFeaturedMediaId] = useState(item?.featuredMediaId ?? "");
  const [fileMediaId, setFileMediaId] = useState(d(data, "fileMediaId"));
  const [thumbnailMediaId, setThumbnailMediaId] = useState(d(data, "thumbnailMediaId"));
  const [registration, setRegistration] = useState(dBool(data, "registrationEnabled"));
  const [accessMode, setAccessMode] = useState(d(data, "accessMode", "FORM_REQUIRED"));

  if (!meta) return null;
  const editor = meta.editor;

  const submit = (e: React.FormEvent<HTMLFormElement>, nextStatus?: string) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (nextStatus) fd.set("status", nextStatus);
    fd.set("contentType", contentType);
    if (item) fd.set("id", item.id);
    fd.set("featuredMediaId", featuredMediaId);
    if (editor === "lead_magnet") fd.set("data.fileMediaId", fileMediaId);
    if (editor === "template") fd.set("data.thumbnailMediaId", thumbnailMediaId);
    start(async () => {
      const res = await saveContentItem(fd);
      if (toastResult(res)) {
        if (!item && res.ok && res.id) router.push(`${meta.href}?edit=${res.id}`);
        else router.refresh();
      }
    });
  };

  return (
    <form onSubmit={(e) => submit(e)} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[12.5px] text-ink-soft">Content Management / {meta.plural} / {item ? "Edit" : "Create"}</div>
          <h2 className="text-[22px] font-extrabold text-admin-navy">{item ? `Edit ${meta.label}` : `Create ${meta.label}`}</h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href={meta.href} className={btn}>Cancel</Link>
          <button type="submit" className={btn} disabled={pending} onClick={(e) => submit(e as never, "DRAFT")}>Save draft</button>
          <button type="submit" className={btnPrimary} disabled={pending} onClick={(e) => submit(e as never, status === "SCHEDULED" ? "SCHEDULED" : "PUBLISHED")}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} {status === "SCHEDULED" ? "Schedule" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <SuperCard>
            <SuperCardHeader title={editor === "event" ? "Event details" : editor === "lead_magnet" ? "Lead magnet details" : editor === "template" ? "Template details" : "Content"} />
            <div className="space-y-5 px-6 py-5">
              <label className="block">
                <span className={label}>Title *</span>
                <input name="title" required maxLength={200} value={title} onChange={(e) => { setTitle(e.target.value); if (!item) setSlug(slugify(e.target.value)); }} placeholder="Enter a compelling title..." className={field} />
              </label>
              <label className="block">
                <span className={label}>Slug *</span>
                <input name="slug" maxLength={120} value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="your-item-slug" className={field} />
                <span className={hint}>Used in the public URL.</span>
              </label>
              <label className="block">
                <span className={label}>{editor === "template" ? "Description" : "Excerpt"}</span>
                <textarea name="excerpt" rows={3} maxLength={500} defaultValue={item?.excerpt} placeholder="Write a short summary..." className={area} />
                <span className={hint}>Required before publishing{editor === "template" ? " is not enforced for templates" : ""}.</span>
              </label>
              {editor !== "template" && (
                <label className="block">
                  <span className={label}>{editor === "event" ? "Description *" : "Content"}</span>
                  <textarea name="body" rows={12} maxLength={100000} defaultValue={item?.body} placeholder="Start writing your content..." className={area} />
                </label>
              )}
              {editor === "content" && contentType === "video" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label><span className={label}>Video URL</span><input name="data.videoUrl" defaultValue={d(data, "videoUrl")} placeholder="https://..." className={field} /></label>
                  <label><span className={label}>Duration label</span><input name="data.durationLabel" defaultValue={d(data, "durationLabel")} placeholder="12 min" className={field} /></label>
                </div>
              )}
            </div>
          </SuperCard>

          {editor === "event" && (
            <SuperCard>
              <SuperCardHeader title="Schedule and format" description="Registration stays off until a link is configured." />
              <div className="grid grid-cols-1 gap-5 px-6 py-5 md:grid-cols-2">
                <label><span className={label}>Event type *</span>
                  <select name="data.eventType" defaultValue={d(data, "eventType")} className={field}>
                    <option value="">Select event type...</option>
                    {EVENT_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </label>
                <label><span className={label}>Format *</span>
                  <select name="data.format" defaultValue={d(data, "format", "online")} className={field}>
                    {EVENT_FORMATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </label>
                <label><span className={label}>Starts</span><input type="datetime-local" name="data.startAt" defaultValue={d(data, "startAt")} className={field} /></label>
                <label><span className={label}>Ends</span><input type="datetime-local" name="data.endAt" defaultValue={d(data, "endAt")} className={field} /></label>
                <label><span className={label}>Timezone</span><input name="data.timezone" defaultValue={d(data, "timezone")} placeholder="Europe/Berlin" className={field} /></label>
                <label><span className={label}>Recurrence</span>
                  <select name="data.recurrence" defaultValue={d(data, "recurrence", "none")} className={field}>
                    {RECURRENCES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </label>
                <label className="md:col-span-2"><span className={label}>Location</span><input name="data.location" defaultValue={d(data, "location")} placeholder="Venue or joining instructions" className={field} /></label>
                <label className="md:col-span-2"><span className={label}>Speakers</span><input name="data.speakers" defaultValue={dList(data, "speakers")} placeholder="Comma separated names" className={field} /></label>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2.5 text-[13.5px] font-bold text-admin-navy">
                    <input type="checkbox" name="data.registrationEnabled" checked={registration} onChange={(e) => setRegistration(e.target.checked)} className="h-4 w-4" /> Registration enabled
                  </label>
                  {registration && (
                    <label className="mt-3 block">
                      <span className={label}>Registration link *</span>
                      <input name="data.registrationUrl" defaultValue={d(data, "registrationUrl")} placeholder="https://" className={field} />
                      <span className={hint}>Registration and attendee counts are only shown once a provider reports them.</span>
                    </label>
                  )}
                </div>
              </div>
            </SuperCard>
          )}

          {editor === "lead_magnet" && (
            <SuperCard>
              <SuperCardHeader title="Downloadable file and conversion path" />
              <div className="space-y-5 px-6 py-5">
                <MediaPicker label="Downloadable file" media={media} value={fileMediaId} onChange={setFileMediaId} storageReady={storageReady} accept="application/pdf,application/zip,application/msword,image/*" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label><span className={label}>Lead capture form</span>
                    <select name="data.formId" defaultValue={d(data, "formId")} className={field}>
                      <option value="">Select a form...</option>
                      {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </label>
                  <label><span className={label}>Landing page (optional)</span>
                    <select name="data.landingPageId" defaultValue={d(data, "landingPageId")} className={field}>
                      <option value="">Select a landing page...</option>
                      {pages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </label>
                </div>
                <label className="block"><span className={label}>CTA text (optional)</span><input name="data.ctaText" defaultValue={d(data, "ctaText")} placeholder="Download the guide" className={field} /></label>
                <fieldset>
                  <legend className={label}>Access settings</legend>
                  {ACCESS_MODES.map(([v, l, description]) => (
                    <label key={v} className="mt-2 flex items-start gap-2.5 text-[13px]">
                      <input type="radio" name="data.accessMode" value={v} checked={accessMode === v} onChange={() => setAccessMode(v)} className="mt-1" />
                      <span><span className="font-bold text-admin-navy">{l}</span><span className="block text-ink-soft">{description}</span></span>
                    </label>
                  ))}
                </fieldset>
              </div>
            </SuperCard>
          )}

          {editor === "template" && (
            <SuperCard>
              <SuperCardHeader title="Template file" description="Visual editing stays in Creative Studio; this screen manages the metadata." />
              <div className="space-y-5 px-6 py-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label><span className={label}>Template type *</span>
                    <select name="data.templateType" defaultValue={d(data, "templateType")} className={field}>
                      <option value="">Select template type...</option>
                      {TEMPLATE_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </label>
                  <label><span className={label}>Dimensions</span><input name="data.dimensions" defaultValue={d(data, "dimensions")} placeholder="1080 × 1080" className={field} /></label>
                </div>
                <MediaPicker label="Thumbnail image" media={media} value={thumbnailMediaId} onChange={setThumbnailMediaId} storageReady={storageReady} accept="image/*" />
                <label className="block"><span className={label}>Creative Studio reference</span><input name="data.creativeStudioRef" defaultValue={d(data, "creativeStudioRef")} placeholder="Creative Studio template id or URL" className={field} /><span className={hint}>Required before publishing to the template library.</span></label>
                <label className="block"><span className={label}>Supported formats</span><input name="data.supportedFormats" defaultValue={dList(data, "supportedFormats")} placeholder="PNG, JPG, PDF" className={field} /></label>
                <label className="block"><span className={label}>Instructions (optional)</span><textarea name="data.instructions" rows={3} defaultValue={d(data, "instructions")} className={area} /></label>
                <div className="flex flex-wrap gap-5">
                  <label className="flex items-center gap-2.5 text-[13px] font-bold text-admin-navy"><input type="checkbox" name="data.featured" defaultChecked={dBool(data, "featured")} className="h-4 w-4" /> Featured template</label>
                  <label className="flex items-center gap-2.5 text-[13px] font-bold text-admin-navy"><input type="checkbox" name="data.allowTeamUse" defaultChecked={dBool(data, "allowTeamUse")} className="h-4 w-4" /> Allow workspace teams to use it</label>
                </div>
                <Link href="/app/creative-studio/templates" className={btn} target="_blank"><ExternalLink className="h-4 w-4" /> Open Creative Studio</Link>
              </div>
            </SuperCard>
          )}
        </div>

        <div className="space-y-6">
          <SuperCard>
            <SuperCardHeader title="Publishing" />
            <div className="space-y-5 px-6 py-5">
              <label className="block">
                <span className={label}>Status</span>
                <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
                  {CONTENT_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </label>
              {status === "SCHEDULED" && (
                <label className="block"><span className={label}>Publish at *</span><input type="datetime-local" name="scheduledAt" defaultValue={item?.scheduledAt} className={field} /></label>
              )}
              <label className="block">
                <span className={label}>Visibility</span>
                <select name="visibility" defaultValue={item?.visibility ?? "public"} className={field}>
                  {VISIBILITIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
              {item && item.versions.length > 0 && (
                <div>
                  <span className={label}>Version history</span>
                  <ul className="space-y-1 text-[12.5px] text-ink-soft">
                    {item.versions.map((v) => <li key={v.version}>v{v.version} · {STATUS_LABEL[v.status] ?? v.status} · {v.createdAt}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </SuperCard>

          <SuperCard>
            <SuperCardHeader title="Organization" />
            <div className="space-y-5 px-6 py-5">
              <label className="block"><span className={label}>Categories</span><input name="categories" defaultValue={item?.categories.join(", ")} placeholder="Comma separated" className={field} /></label>
              <label className="block"><span className={label}>Tags</span><input name="tags" defaultValue={item?.tags.join(", ")} placeholder="Comma separated" className={field} /></label>
              {(editor === "content" || editor === "event") && (
                <label className="block"><span className={label}>Author</span><input name="authorName" defaultValue={item?.authorName} placeholder="Author name" className={field} /></label>
              )}
              <MediaPicker label={editor === "event" ? "Event image" : editor === "lead_magnet" ? "Cover image" : "Featured image"} media={media} value={featuredMediaId} onChange={setFeaturedMediaId} storageReady={storageReady} accept="image/*" />
            </div>
          </SuperCard>

          <SuperCard>
            <SuperCardHeader title="SEO & metadata" />
            <div className="space-y-5 px-6 py-5">
              <label className="block"><span className={label}>SEO title</span><input name="seoTitle" maxLength={200} defaultValue={item?.seoTitle} className={field} /></label>
              <label className="block"><span className={label}>Meta description</span><textarea name="seoDescription" rows={3} maxLength={400} defaultValue={item?.seoDescription} className={area} /></label>
            </div>
          </SuperCard>
        </div>
      </div>
    </form>
  );
}

/** Small preview of a chosen media asset. */
export function MediaThumb({ url, fileName }: { url: string | null; fileName: string }) {
  if (!url) return <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-bg-soft text-ink-muted"><ImageIcon className="h-4 w-4" /></span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={fileName} className="h-12 w-12 rounded-lg object-cover" />;
}

export const uploadIcon = Upload;
