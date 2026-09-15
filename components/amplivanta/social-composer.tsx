"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AtSign, CalendarDays, ChevronRight, ClipboardCheck, Clock, Eye, Hash, Image as ImageIcon, Link2, Loader2, ShieldCheck, SlidersHorizontal, Smile, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { toastResult } from "@/lib/action-toast";
import { composePost } from "@/app/(app)/app/social/workflow-actions";
import { SocialGlyph } from "@/components/amplivanta/social-glyph";
import { SOCIAL_PLATFORMS } from "@/lib/social/platforms";

const LIMIT = 2200;
const EMOJI = ["🚀", "✨", "🎉", "👏", "💡", "📣", "✅", "🔥"];

const card = "rounded-xl border border-line bg-white p-5";
const row = "flex items-center gap-3 rounded-lg border border-line px-4 py-3";

export function SocialComposer({
  hashtagSets,
  mentions,
  images,
  approvalRequired,
}: {
  hashtagSets: { id: string; name: string; tags: string[] }[];
  mentions: { id: string; label: string; handle: string }[];
  images: { id: string; name: string; url: string }[];
  approvalRequired: boolean;
}) {
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState("");
  const [link, setLink] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [mode, setMode] = useState<"draft" | "schedule">("draft");
  const [when, setWhen] = useState("");
  const [panel, setPanel] = useState<"none" | "emoji" | "hashtags" | "mentions">("none");
  const [pending, start] = useTransition();
  const router = useRouter();

  const insert = (text: string) => setContent((c) => (c ? `${c}${c.endsWith(" ") || c.endsWith("\n") ? "" : " "}${text}` : text));
  const toggle = (id: string) => setPlatforms((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const save = (intent: "draft" | "schedule" | "submit") =>
    start(async () => {
      const fd = new FormData();
      fd.set("content", content);
      fd.set("intent", intent);
      fd.set("platforms", platforms.join(","));
      if (media) fd.set("mediaUrl", media);
      if (link) fd.set("link", link);
      if (when && intent !== "draft") fd.set("scheduledAt", new Date(when).toISOString());
      const res = await composePost(fd);
      if (toastResult(res)) {
        setContent("");
        setMedia("");
        setLink("");
        setWhen("");
        router.push("/app/social/posts");
      }
    });

  const checklist: [string, boolean][] = [
    ["Add content for your post", content.trim().length > 0],
    ["Select at least one platform", platforms.length > 0],
    ["Add media or links (optional)", Boolean(media || link)],
    ["Choose when to publish", mode === "draft" || Boolean(when)],
  ];

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-4">
        <section className={card}>
          <h2 className="mb-3 text-[14.5px] font-semibold text-deep-navy">Select Platforms</h2>
          <div className="flex flex-wrap gap-2.5">
            {SOCIAL_PLATFORMS.map((p) => {
              const on = platforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(p.id)}
                  className={cn("flex h-12 items-center gap-2.5 rounded-lg border px-4 text-[13px] font-semibold text-deep-navy transition", on ? "border-[#0B5CFF] bg-royal-tint" : "border-line hover:bg-bg-soft")}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded" style={{ color: p.color }}>
                    {p.id === "threads" ? <AtSign className="h-5 w-5" /> : <SocialGlyph name={p.id} className="h-5 w-5" />}
                  </span>
                  {p.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[12.5px] text-ink-soft">Choose one or more platforms to create your post.</p>
        </section>

        <section className={cn(card, "space-y-4")}>
          <h2 className="text-[14.5px] font-semibold text-deep-navy">Content</h2>
          <div>
            <label htmlFor="caption" className="mb-1.5 block text-[13px] font-semibold text-deep-navy">Caption</label>
            <div className="rounded-lg border border-line focus-within:border-[#0B5CFF]">
              <textarea
                id="caption"
                value={content}
                maxLength={LIMIT}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Write your post caption here..."
                className="w-full resize-y rounded-t-lg px-3 py-2.5 text-[13.5px] text-deep-navy focus:outline-none"
              />
              <div className="flex items-center justify-between px-3 pb-2">
                <div className="flex gap-1.5">
                  {([["emoji", Smile], ["hashtags", Hash], ["mentions", AtSign]] as const).map(([k, Icon]) => (
                    <button key={k} type="button" aria-label={k} aria-expanded={panel === k} onClick={() => setPanel(panel === k ? "none" : k)} className={cn("rounded-md border border-line p-1.5 text-ink-soft hover:bg-bg-soft", panel === k && "border-[#0B5CFF] text-[#0B5CFF]")}>
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
                <span className="text-[12px] text-ink-muted">{content.length} / {LIMIT.toLocaleString("en-US")}</span>
              </div>
              {panel === "emoji" && (
                <div className="flex flex-wrap gap-1 border-t border-line px-3 py-2">
                  {EMOJI.map((e) => <button key={e} type="button" onClick={() => insert(e)} className="rounded px-1.5 py-0.5 text-[18px] hover:bg-bg-soft">{e}</button>)}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[13px] font-semibold text-deep-navy">Media</div>
            {images.length ? (
              <div className="rounded-lg border border-dashed border-line p-3">
                <div className="flex flex-wrap gap-2">
                  {images.map((img) => (
                    <button key={img.id} type="button" onClick={() => setMedia(media === img.url ? "" : img.url)} className={cn("overflow-hidden rounded-md border-2", media === img.url ? "border-[#0B5CFF]" : "border-transparent")} title={img.name}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.name} className="h-16 w-16 object-cover" />
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-ink-muted">Choose an image from your Creative Studio library. Media limits depend on connected platforms.</p>
              </div>
            ) : (
              <Link href="/app/creative-studio/images" className="flex flex-col items-center rounded-lg border border-dashed border-line px-4 py-7 text-center hover:bg-bg-soft/50">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><ImageIcon className="h-5 w-5" /></span>
                <span className="mt-2 text-[14px] font-semibold text-deep-navy">Add photos, videos, or GIFs</span>
                <span className="text-[12.5px] text-ink-soft">Upload media to your Creative Studio library to attach it here.</span>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="mb-1.5 text-[13px] font-semibold text-deep-navy">Hashtags</div>
              <button type="button" onClick={() => setPanel(panel === "hashtags" ? "none" : "hashtags")} className={cn(row, "w-full text-left hover:bg-bg-soft/50")}>
                <Hash className="h-5 w-5 text-[#3B3FD8]" />
                <span><span className="block text-[13px] font-semibold text-deep-navy">Insert a hashtag group</span><span className="block text-[12px] text-ink-soft">{hashtagSets.length ? `${hashtagSets.length} saved group${hashtagSets.length === 1 ? "" : "s"}` : "No saved groups yet"}</span></span>
              </button>
              {panel === "hashtags" && (
                <div className="mt-2 space-y-1 rounded-lg border border-line p-2">
                  {hashtagSets.length ? hashtagSets.map((h) => (
                    <button key={h.id} type="button" onClick={() => insert(h.tags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" "))} className="block w-full rounded px-2 py-1.5 text-left text-[12.5px] hover:bg-bg-soft">
                      <span className="font-semibold text-deep-navy">{h.name}</span> <span className="text-ink-muted">{h.tags.slice(0, 4).join(" ")}</span>
                    </button>
                  )) : <Link href="/app/social/hashtags" className="block px-2 py-1.5 text-[12.5px] text-[#0B5CFF]">Create a hashtag group</Link>}
                </div>
              )}
            </div>
            <div>
              <div className="mb-1.5 text-[13px] font-semibold text-deep-navy">Mentions</div>
              <button type="button" onClick={() => setPanel(panel === "mentions" ? "none" : "mentions")} className={cn(row, "w-full text-left hover:bg-bg-soft/50")}>
                <AtSign className="h-5 w-5 text-[#3B3FD8]" />
                <span><span className="block text-[13px] font-semibold text-deep-navy">Mention accounts</span><span className="block text-[12px] text-ink-soft">{mentions.length ? `${mentions.length} saved reference${mentions.length === 1 ? "" : "s"}` : "No saved references yet"}</span></span>
              </button>
              {panel === "mentions" && (
                <div className="mt-2 space-y-1 rounded-lg border border-line p-2">
                  {mentions.length ? mentions.map((m) => (
                    <button key={m.id} type="button" onClick={() => insert(m.handle.startsWith("@") ? m.handle : `@${m.handle}`)} className="block w-full rounded px-2 py-1.5 text-left text-[12.5px] hover:bg-bg-soft">
                      <span className="font-semibold text-deep-navy">{m.label}</span> <span className="text-ink-muted">{m.handle}</span>
                    </button>
                  )) : <Link href="/app/social/hashtags" className="block px-2 py-1.5 text-[12.5px] text-[#0B5CFF]">Add a mention reference</Link>}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[13px] font-semibold text-deep-navy">Link Preview (Optional)</div>
            <div className={row}>
              <Link2 className="h-5 w-5 text-[#3B3FD8]" />
              {showLink ? (
                <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" className="h-9 flex-1 rounded-md border border-line px-3 text-[13px] focus:border-[#0B5CFF] focus:outline-none" />
              ) : (
                <span className="flex-1"><span className="block text-[13px] font-semibold text-deep-navy">Add a link to your post</span><span className="block text-[12px] text-ink-soft">The link is appended to the caption.</span></span>
              )}
              <button type="button" onClick={() => { if (showLink) setLink(""); setShowLink(!showLink); }} className="rounded-md border border-line px-3 py-1.5 text-[12.5px] font-semibold text-[#0B5CFF] hover:bg-bg-soft">{showLink ? "Remove" : "Add Link"}</button>
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[13px] font-semibold text-deep-navy">Scheduling</div>
            <div className={cn(row, "flex-wrap")}>
              <CalendarDays className="h-5 w-5 text-[#3B3FD8]" />
              <span className="flex-1"><span className="block text-[13px] font-semibold text-deep-navy">Choose when to publish</span><span className="block text-[12px] text-ink-soft">Save as a draft, or pick a date and time.</span></span>
              <label className="flex items-center gap-1.5 text-[13px]"><input type="radio" name="mode" checked={mode === "draft"} onChange={() => setMode("draft")} className="accent-[#0B5CFF]" /> Save as draft</label>
              <label className="flex items-center gap-1.5 text-[13px]"><input type="radio" name="mode" checked={mode === "schedule"} onChange={() => setMode("schedule")} className="accent-[#0B5CFF]" /> Schedule for later</label>
              {mode === "schedule" && <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="h-9 rounded-md border border-line px-2 text-[13px]" aria-label="Schedule date and time" />}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2.5 pt-1">
            <button type="button" disabled={pending} onClick={() => save("draft")} className="inline-flex h-10 items-center rounded-md border border-line px-5 text-[13.5px] font-semibold text-deep-navy hover:bg-bg-soft disabled:opacity-50">Save Draft</button>
            <button type="button" disabled={pending} onClick={() => save("submit")} className="inline-flex h-10 items-center rounded-md border border-[#0B5CFF] px-5 text-[13.5px] font-semibold text-[#0B5CFF] hover:bg-royal-tint disabled:opacity-50">Submit for Approval</button>
            <button type="button" disabled={pending || mode !== "schedule"} onClick={() => save("schedule")} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0B5CFF] px-5 text-[13.5px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />} {approvalRequired ? "Schedule (needs approval)" : "Schedule"}
            </button>
          </div>
        </section>

        {([
          [SlidersHorizontal, "Per-Platform Customization", "Tailor content, media, and settings per platform", "Per-platform variants become available once a publishing channel is connected.", "/app/social/accounts"],
          [ShieldCheck, "Content Guidelines", "Need help creating effective content?", "Review your publishing rules and approval requirements.", "/app/social/settings"],
        ] as const).map(([Icon, title, body, sub, href]) => (
          <Link key={title} href={href} className="flex items-center gap-4 rounded-xl border border-line bg-white p-5 hover:bg-bg-soft/40">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Icon className="h-5 w-5" /></span>
            <span className="flex-1"><span className="block text-[14px] font-semibold text-deep-navy">{title}</span><span className="block text-[12.5px] text-ink-soft">{body}</span><span className="block text-[12px] text-ink-muted">{sub}</span></span>
            <ChevronRight className="h-5 w-5 text-[#0B5CFF]" />
          </Link>
        ))}
      </div>

      <aside className="space-y-4">
        <section className={card}>
          <h2 className="mb-3 flex items-center gap-2 text-[14.5px] font-semibold text-deep-navy"><Eye className="h-5 w-5 text-[#0B5CFF]" /> Preview</h2>
          {content || media ? (
            <div className="rounded-lg border border-line p-3">
              <div className="mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-ink-muted">{platforms.length ? platforms.map((p) => SOCIAL_PLATFORMS.find((x) => x.id === p)?.label).join(" · ") : "No platform selected"}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {media && <img src={media} alt="" className="mb-2 max-h-48 w-full rounded object-cover" />}
              <p className="whitespace-pre-wrap text-[13px] text-deep-navy">{content}{link ? `\n\n${link}` : ""}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="h-24 w-36 rounded-lg border border-line bg-bg-soft" />
              <div className="mt-3 text-[14px] font-semibold text-deep-navy">No preview yet</div>
              <div className="text-[12.5px] text-ink-soft">Select platforms and add content to see a preview.</div>
            </div>
          )}
        </section>
        <section className={card}>
          <h2 className="mb-3 flex items-center gap-2 text-[14.5px] font-semibold text-deep-navy"><CalendarDays className="h-5 w-5 text-[#0B5CFF]" /> Scheduling Summary</h2>
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Clock className="h-5 w-5" /></span>
            <div>
              <div className="text-[14px] font-semibold text-deep-navy">{mode === "schedule" && when ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(when)) : "Not scheduled"}</div>
              <div className="text-[12.5px] text-ink-soft">{mode === "schedule" ? "The post joins the publishing queue." : "The post is saved as a draft."}</div>
            </div>
          </div>
        </section>
        <section className={card}>
          <h2 className="mb-3 flex items-center gap-2 text-[14.5px] font-semibold text-deep-navy"><ClipboardCheck className="h-5 w-5 text-[#0B5CFF]" /> Approval Requirements</h2>
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-royal-tint text-[#3B3FD8]"><Users className="h-5 w-5" /></span>
            <div>
              <div className="text-[14px] font-semibold text-deep-navy">{approvalRequired ? "Approval required" : "No approval workflow selected"}</div>
              <div className="text-[12.5px] text-ink-soft">{approvalRequired ? "Scheduled posts go to Approvals before they are queued." : "Turn on approval in Social Publishing Settings to review posts before publishing."}</div>
              <Link href="/app/social/settings" className="mt-2 inline-flex rounded-md border border-line px-3 py-1.5 text-[12.5px] font-semibold text-deep-navy hover:bg-bg-soft">Approval settings</Link>
            </div>
          </div>
        </section>
        <section className={card}>
          <h2 className="mb-3 flex items-center gap-2 text-[14.5px] font-semibold text-deep-navy"><ClipboardCheck className="h-5 w-5 text-[#0B5CFF]" /> Before You Publish</h2>
          <ul className="space-y-2.5">
            {checklist.map(([label, done]) => (
              <li key={label} className="flex items-center gap-2.5 text-[13px] text-deep-navy">
                <span className={cn("flex h-4 w-4 items-center justify-center rounded border", done ? "border-[#0B5CFF] bg-[#0B5CFF] text-white" : "border-line")}>{done && "✓"}</span>
                {label}
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
