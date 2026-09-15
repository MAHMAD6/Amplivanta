"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, RefreshCw, Search, X } from "lucide-react";
import {
  addCompetitor,
  confirmDiscovered,
  discoverCompetitors,
  dismissCandidates,
  refreshCompetitorNow,
  removeCompetitor,
  setCompetitorTracking,
  type Suggestion,
} from "@/app/(app)/app/content-intelligence/competitors/actions";
import { toastResult } from "@/lib/action-toast";
import { toast } from "@/lib/toast";

const field =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[13.5px] focus:border-royal-blue focus:outline-none";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-navy/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-extrabold text-deep-navy">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AddCompetitorButton({ variant = "outline", label = "Add Manually" }: { variant?: "outline" | "solid"; label?: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const cls =
    variant === "solid"
      ? "inline-flex h-10 items-center gap-2 rounded-xl bg-royal-blue px-4 text-[13px] font-bold text-white hover:bg-royal-soft"
      : "inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-royal-blue bg-white px-6 text-[14px] font-bold text-royal-blue hover:bg-royal-tint";
  return (
    <>
      <button type="button" className={cls} onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {label}
      </button>
      {open && (
        <Modal title="Add a competitor" onClose={() => setOpen(false)}>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              start(async () => {
                if (toastResult(await addCompetitor(fd))) {
                  setOpen(false);
                  router.refresh();
                }
              });
            }}
          >
            <label className="block">
              <span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Name</span>
              <input name="name" required minLength={2} className={field} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Website (optional)</span>
              <input name="website" placeholder="example.com" className={field} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Type</span>
              <select name="type" defaultValue="direct" className={field}>
                <option value="direct">Direct competitor</option>
                <option value="indirect">Indirect competitor</option>
                <option value="aspirational">Aspirational / benchmark</option>
              </select>
            </label>
            <div className="mt-2 flex justify-end">
              <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-royal-blue px-5 text-[13px] font-bold text-white hover:bg-royal-soft disabled:opacity-60">
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} Track competitor
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export function FindCompetitorsButton() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const router = useRouter();

  const close = () => {
    setOpen(false);
    setSuggestions(null);
    setPicked(new Set());
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-royal-blue px-6 text-[14px] font-bold text-white hover:bg-royal-soft"
      >
        <Search className="h-4 w-4" /> Find Competitors
      </button>
      {open && (
        <Modal title={suggestions ? "Review suggested competitors" : "Tell us about your business"} onClose={close}>
          {!suggestions ? (
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                start(async () => {
                  const res = await discoverCompetitors(fd);
                  if (res.ok) {
                    setSuggestions(res.suggestions);
                    setPicked(new Set());
                  } else toast.error("Discovery unavailable", { description: res.error });
                });
              }}
            >
              <label className="block">
                <span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Your website</span>
                <input name="website" placeholder="yourcompany.com" className={field} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Target keywords</span>
                <textarea name="keywords" rows={3} placeholder="Products or services you sell, separated by commas" className={field + " h-auto py-2.5"} />
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Market</span>
                  <input name="location" placeholder="United States" className={field} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[12.5px] font-bold text-deep-navy">Language</span>
                  <input name="language" placeholder="English" className={field} />
                </label>
              </div>
              <p className="text-[11.5px] text-ink-muted">We compare search visibility for your website and keywords. Provide at least one.</p>
              <div className="mt-2 flex justify-end">
                <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-royal-blue px-5 text-[13px] font-bold text-white hover:bg-royal-soft disabled:opacity-60">
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />} Find competitors
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p className="mb-3 text-[12.5px] text-ink-soft">Select the ones to track. Nothing is added until you confirm.</p>
              <div className="divide-y divide-line rounded-xl border border-line">
                {suggestions.map((s, i) => (
                  <label key={s.id} className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-bg-soft">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-royal-blue"
                      checked={picked.has(i)}
                      onChange={() =>
                        setPicked((prev) => {
                          const next = new Set(prev);
                          if (next.has(i)) next.delete(i);
                          else next.add(i);
                          return next;
                        })
                      }
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13.5px] font-bold text-deep-navy">{s.domain}</span>
                        <span className="shrink-0 rounded-full bg-royal-tint px-2 py-0.5 text-[11px] font-bold text-royal-blue">Relevance {Math.round(s.score)}</span>
                      </span>
                      {s.reasons.length > 0 && (
                        <span className="mt-1 flex flex-wrap gap-1.5">
                          {s.reasons.map((r) => (
                            <span key={r} className="rounded-md bg-bg-soft px-1.5 py-0.5 text-[11px] text-ink-soft">{r}</span>
                          ))}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-ink-muted">Based on shared search rankings from our search-data provider. Check each one before tracking.</p>
              <div className="mt-4 flex justify-between gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const rest = suggestions.filter((_, i) => !picked.has(i)).map((s) => s.id);
                      if (picked.size > 0) await dismissCandidates(suggestions.filter((_, i) => picked.has(i)).map((s) => s.id));
                      else await dismissCandidates(rest);
                      close();
                    })
                  }
                  className="h-10 rounded-xl border border-line px-4 text-[13px] font-bold text-deep-navy hover:bg-bg-soft disabled:opacity-60"
                >
                  {picked.size > 0 ? "Dismiss selected" : "Dismiss all"}
                </button>
                <button
                  type="button"
                  disabled={pending || picked.size === 0}
                  onClick={() =>
                    start(async () => {
                      const chosen = suggestions.filter((_, i) => picked.has(i)).map((s) => s.id);
                      if (toastResult(await confirmDiscovered(chosen))) {
                        close();
                        router.refresh();
                      }
                    })
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-royal-blue px-5 text-[13px] font-bold text-white hover:bg-royal-soft disabled:opacity-60"
                >
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />} Track {picked.size || ""} selected
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

export function CompetitorRowActions({ id, tracking, canRefresh = false }: { id: string; tracking: boolean; canRefresh?: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="flex justify-end gap-1.5">
      {canRefresh && tracking && (
        <button
          type="button"
          disabled={pending}
          title="Refresh search data"
          aria-label="Refresh search data"
          onClick={() => start(async () => { if (toastResult(await refreshCompetitorNow(id))) router.refresh(); })}
          className="rounded-lg border border-line px-2 py-1 text-ink-soft hover:bg-bg-soft disabled:opacity-50"
        >
          <RefreshCw className={pending ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => { if (toastResult(await setCompetitorTracking(id, !tracking))) router.refresh(); })}
        className="rounded-lg border border-line px-2.5 py-1 text-[11.5px] font-semibold text-ink-soft hover:bg-bg-soft disabled:opacity-50"
      >
        {tracking ? "Pause" : "Resume"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Stop tracking and remove this competitor?")) return;
          start(async () => { if (toastResult(await removeCompetitor(id))) router.refresh(); });
        }}
        className="rounded-lg border border-line px-2.5 py-1 text-[11.5px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}
