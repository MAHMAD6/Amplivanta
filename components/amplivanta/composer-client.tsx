"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Video, BarChart2, Smile, Hash, AtSign, Link2, Calendar, Clock, Sparkles, MoreHorizontal, Loader2, Save, Send } from "lucide-react";
import { PLATFORM_META, type Platform } from "@/lib/social-data";
import { PlatformIcon } from "./platform-badge";
import { createSocialPost } from "@/app/(app)/app/social/actions";
import { toastResult } from "@/lib/action-toast";
import { cn } from "@/lib/utils";

const PLATFORMS: Platform[] = ["facebook", "instagram", "linkedin", "x", "tiktok", "youtube"];
const LIMITS: Record<Platform, number> = { facebook: 63206, instagram: 2200, linkedin: 3000, x: 280, tiktok: 2200, youtube: 5000, pinterest: 500, threads: 500 };

export function ComposerClient() {
  const [selected, setSelected] = useState<Platform[]>(["instagram", "linkedin"]);
  const [content, setContent] = useState("New product launch this week! Stay tuned 🚀\n\n{feature_1}\n{feature_2}\n\nSign up: amplivanta.com");
  const [preview, setPreview] = useState<Platform>("instagram");

  const togglePlatform = (p: Platform) => setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));

  const [mediaUrl, setMediaUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  const save = (schedule: boolean) =>
    start(async () => {
      const fd = new FormData();
      fd.set("content", content);
      if (mediaUrl.trim()) fd.set("mediaUrl", mediaUrl.trim());
      for (const p of selected) fd.set(`platform_${p}`, "on");
      if (schedule && scheduledAt) fd.set("scheduledAt", new Date(scheduledAt).toISOString());
      if (toastResult(await createSocialPost(fd))) {
        setContent("");
        setMediaUrl("");
        setScheduledAt("");
        router.refresh();
      }
    });

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,_1.4fr)_minmax(0,_1fr)]">
      {/* LEFT: editor */}
      <div className="space-y-4">
        {/* Platforms */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[13px] font-bold text-ink">Publish To</div>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-[12.5px] font-semibold transition",
                  selected.includes(p) ? "border-violet/40 bg-violet/5 text-ink" : "border-line bg-white text-ink-soft hover:border-ink/30"
                )}
              >
                <PlatformIcon platform={p} size={18} />
                {PLATFORM_META[p].label}
                {selected.includes(p) && <span className="ml-1 h-2 w-2 rounded-full bg-emerald-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Save controls — the composer writes real rows; nothing is published
            because no social channel is connected yet. */}
        {/* Editor */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[13px] font-bold text-ink">Content</div>
            <div className="flex gap-1 text-[11px] text-ink-muted">
              {selected.map((p) => {
                const remaining = LIMITS[p] - content.length;
                return (
                  <span key={p} className={cn("rounded-full px-2 py-0.5 font-semibold", remaining < 0 ? "bg-red-50 text-red-600" : "bg-bg-soft text-ink-muted")}>
                    {PLATFORM_META[p].short}: {remaining}
                  </span>
                );
              })}
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full resize-none rounded-xl border border-line bg-white p-4 text-[14px] leading-relaxed text-ink focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
          />
          <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-line pt-3">
            {[
              { icon: ImageIcon, label: "Image" },
              { icon: Video, label: "Video" },
              { icon: BarChart2, label: "Poll" },
              { icon: Smile, label: "Emoji" },
              { icon: Hash, label: "Hashtag" },
              { icon: AtSign, label: "Mention" },
              { icon: Link2, label: "Link" },
            ].map((t) => (
              <button key={t.label} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-bg-soft">
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              <button className="inline-flex items-center gap-1 rounded-lg border border-violet/30 bg-violet/5 px-2.5 py-1.5 text-[11px] font-bold text-violet">
                <Sparkles className="h-3 w-3" /> Rewrite with AI
              </button>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[13px] font-bold text-ink">Media</div>
          <div className="grid grid-cols-4 gap-3">
            <div className="aspect-square rounded-xl border border-line bg-gradient-to-br from-violet/20 to-orange-brand/20" />
            <div className="aspect-square rounded-xl border border-line bg-gradient-to-br from-pink-brand/20 to-violet/20" />
            <button className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line text-[11px] font-semibold text-ink-muted hover:border-violet/40 hover:text-violet">
              <ImageIcon className="h-4 w-4" />
              Upload
            </button>
            <button className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-violet/30 bg-violet/5 text-[11px] font-bold text-violet">
              <Sparkles className="h-4 w-4" />
              Generate
            </button>
          </div>
        </div>

        {/* Post settings */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[13px] font-bold text-ink">Post Settings</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SettingField label="Campaign" value="Spring Launch" />
            <SettingField label="Tags" value="product-launch, spring" />
            <SettingField label="UTM Source" value="social" />
            <SettingField label="UTM Medium" value="organic" />
          </div>
        </div>

        {/* Schedule */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[13px] font-bold text-ink">Schedule</div>
          <div className="flex flex-wrap items-center gap-2">
            {["Publish Now", "Schedule for later", "AI-optimal time", "Recurring"].map((opt, i) => (
              <button
                key={opt}
                className={cn(
                  "rounded-xl border px-3 py-2 text-[12.5px] font-semibold",
                  i === 1 ? "border-violet/40 bg-violet/5 text-ink" : "border-line bg-white text-ink-soft"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-ink">
                <Calendar aria-hidden className="h-3.5 w-3.5 text-ink-muted" /> Schedule for
              </span>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.currentTarget.value)}
                className="h-11 w-full rounded-xl border border-line px-3 text-[12.5px] focus:border-violet focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-ink">
                <ImageIcon aria-hidden className="h-3.5 w-3.5 text-ink-muted" /> Media URL
              </span>
              <input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.currentTarget.value)}
                placeholder="https://…"
                className="h-11 w-full rounded-xl border border-line px-3 text-[12.5px] focus:border-violet focus:outline-none"
              />
            </label>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
            <Clock aria-hidden className="h-3.5 w-3.5" />
            Times are in your browser&apos;s timezone. No channel is connected yet, so a scheduled
            post is held here rather than sent.
          </p>
        </div>


        <div className="flex flex-wrap justify-end gap-2.5">
          <button
            type="button"
            onClick={() => save(false)}
            disabled={pending || !content.trim()}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-bold text-ink transition hover:bg-bg-soft disabled:opacity-50"
          >
            {pending ? <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" /> : <Save aria-hidden className="h-3.5 w-3.5" />}
            Save draft
          </button>
          <button
            type="button"
            onClick={() => save(true)}
            disabled={pending || !content.trim() || !scheduledAt}
            title={!scheduledAt ? "Pick a date and time first." : undefined}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet disabled:opacity-50"
          >
            <Send aria-hidden className="h-3.5 w-3.5" /> Schedule
          </button>
        </div>
      </div>

      {/* RIGHT: preview */}
      <div className="space-y-4">
        <div className="sticky top-20">
          <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[13px] font-bold text-ink">Live Preview</div>
              <div className="flex gap-1">
                {selected.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPreview(p)}
                    className={cn("rounded-lg p-1.5", preview === p ? "bg-violet/10" : "hover:bg-bg-soft")}
                  >
                    <PlatformIcon platform={p} size={18} />
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-line bg-white">
              <div className="flex items-center gap-2 p-3 border-b border-line">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet to-orange-brand" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold text-ink">Amplivanta</div>
                  <div className="text-[10.5px] text-ink-muted">Just now · {PLATFORM_META[preview].label}</div>
                </div>
                <button className="text-ink-muted"><MoreHorizontal className="h-4 w-4" /></button>
              </div>
              <div className="p-3">
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink">{content}</p>
              </div>
              <div className="aspect-video bg-gradient-to-br from-violet/30 via-fuchsia-300/30 to-orange-brand/30" />
              <div className="flex items-center justify-between border-t border-line p-3 text-[12px] text-ink-muted">
                <div className="flex gap-4">
                  <span>❤ Like</span>
                  <span>💬 Comment</span>
                  <span>↪ Share</span>
                </div>
                <span className="text-[10.5px]">0 reactions</span>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-violet/20 bg-violet/[0.03] p-3 text-[11.5px] text-ink-soft">
              <div className="mb-1 flex items-center gap-1 font-bold text-violet"><Sparkles className="h-3 w-3" /> AI Suggestions</div>
              <ul className="space-y-1">
                <li>· Add 3–5 relevant hashtags to lift reach by ~18%.</li>
                <li>· Optimal post time for this account: Tue 10:30 AM.</li>
                <li>· Consider a shorter first line (currently 43 chars).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-ink-muted">{label}</label>
      <input defaultValue={value} className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] focus:border-violet focus:outline-none" />
    </div>
  );
}
