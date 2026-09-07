"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Megaphone, Sparkles, X } from "lucide-react";
import { createSocialPost, draftProductPromotion } from "@/app/(app)/app/social/actions";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
];

/**
 * Promote a product through Social Publishing.
 *
 * Produces a draft post in the seller's workspace, prefilled with the
 * product's image, copy and PUBLIC link. It never publishes: no social channel
 * is connected, so the post lands as a draft or a scheduled item and the
 * copy stays editable before anything leaves the platform.
 */
export function PromotePopover({ productId, className }: { productId: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<{ content: string; mediaUrl: string | null } | null>(null);
  const [stubbed, setStubbed] = useState(false);
  const [selected, setSelected] = useState<string[]>(["linkedin"]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const load = async () => {
    setOpen(true);
    if (draft) return;
    setLoading(true);
    const res = await draftProductPromotion(productId);
    setLoading(false);
    if (res.ok) {
      setDraft({ content: res.draft.content, mediaUrl: res.draft.mediaUrl });
      setStubbed(res.stubbed);
    } else {
      setMsg({ ok: false, text: res.error });
    }
  };

  const save = (schedule: boolean) =>
    start(async () => {
      if (!draft) return;
      const fd = new FormData();
      fd.set("content", draft.content);
      if (draft.mediaUrl) fd.set("mediaUrl", draft.mediaUrl);
      for (const p of selected) fd.set(`platform_${p}`, "on");
      if (schedule) {
        // One hour out, so a scheduled item is never created in the past.
        fd.set("scheduledAt", new Date(Date.now() + 60 * 60 * 1000).toISOString());
      }
      const res = await createSocialPost(fd);
      setMsg(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error });
      if (res.ok) router.refresh();
    });

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : load())}
        aria-expanded={open}
        className="inline-flex h-12 items-center gap-2 rounded-xl border border-violet/30 bg-white px-4 text-[13.5px] font-bold text-violet transition hover:bg-violet/5"
      >
        <Megaphone aria-hidden className="h-4 w-4" /> Promote product
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Promote with Amplivanta"
          className="absolute right-0 top-full z-30 mt-2 w-[340px] rounded-2xl border border-line bg-white p-4 shadow-card-lg"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[13.5px] font-extrabold text-deep-navy">Promote with Amplivanta</h3>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="text-ink-muted hover:text-deep-navy">
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
            Creates a social post draft in your workspace, prefilled with this product&apos;s image,
            copy and public link.
          </p>

          {loading ? (
            <p className="mt-4 flex items-center gap-2 text-[12.5px] text-ink-muted">
              <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" /> Preparing a draft…
            </p>
          ) : draft ? (
            <>
              <label className="mt-3.5 block">
                <span className="mb-1.5 block text-[12px] font-bold text-deep-navy">Post copy</span>
                <textarea
                  rows={6}
                  value={draft.content}
                  onChange={(e) => setDraft({ ...draft, content: e.currentTarget.value })}
                  className="w-full rounded-xl border border-line px-3 py-2.5 text-[12.5px] leading-relaxed focus:border-violet focus:outline-none"
                />
              </label>
              {stubbed && (
                <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-muted">
                  <Sparkles aria-hidden className="mt-0.5 h-3 w-3 shrink-0" />
                  Assembled from your listing. Set an AI key to have copy written for you.
                </p>
              )}

              <fieldset className="mt-3.5">
                <legend className="mb-1.5 text-[12px] font-bold text-deep-navy">Channels</legend>
                <div className="flex flex-wrap gap-1.5">
                  {PLATFORMS.map((p) => {
                    const on = selected.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          setSelected(on ? selected.filter((x) => x !== p.id) : [...selected, p.id])
                        }
                        className={cn(
                          "rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition",
                          on ? "border-violet bg-violet/10 text-violet" : "border-line text-ink-soft hover:border-violet/40",
                        )}
                      >
                        {on && <Check aria-hidden className="mr-1 inline h-3 w-3" />}
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <p className="mt-3 rounded-lg bg-bg-soft px-2.5 py-2 text-[11px] leading-relaxed text-ink-muted">
                No social channel is connected yet, so this is saved for review rather than posted.
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => save(false)}
                  disabled={pending}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-white text-[12.5px] font-bold text-deep-navy transition hover:bg-bg-soft disabled:opacity-50"
                >
                  {pending && <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />} Save draft
                </button>
                <button
                  type="button"
                  onClick={() => save(true)}
                  disabled={pending || selected.length === 0}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-violet text-[12.5px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  Schedule
                </button>
              </div>

              <a
                href="/app/social/posts"
                className="mt-2.5 block text-center text-[12px] font-bold text-violet hover:underline"
              >
                Open in Social Publishing
              </a>
            </>
          ) : null}

          {msg && (
            <p
              role="status"
              className={cn(
                "mt-3 rounded-lg px-2.5 py-2 text-[12px] font-semibold",
                msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
              )}
            >
              {msg.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
