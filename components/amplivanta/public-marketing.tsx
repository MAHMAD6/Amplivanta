"use client";

import { useEffect, useRef, useState } from "react";
import type { FormField } from "@/lib/marketing/logic";

/** Client pieces of hosted landing pages and forms: visit beacon and the lead form. */

const visitKey = (pageId: string) => `av_visit_${pageId}`;

function sourceOf(): string {
  const utm = new URLSearchParams(window.location.search).get("utm_medium")?.toLowerCase() ?? "";
  if (["cpc", "paid", "ppc"].includes(utm)) return "paid";
  if (utm === "email") return "email";
  if (utm === "social") return "social";
  const ref = document.referrer;
  if (!ref) return "direct";
  try {
    const host = new URL(ref).hostname;
    if (host === window.location.hostname) return "direct";
    if (/google|bing|duckduckgo|yahoo|baidu/.test(host)) return "search";
    if (/facebook|instagram|linkedin|twitter|x\.com|t\.co|tiktok|youtube|pinterest|reddit/.test(host)) return "social";
    return "referral";
  } catch {
    return "direct";
  }
}

export function VisitBeacon({ pageId, experimentId, variant, track }: { pageId: string; experimentId?: string; variant?: string; track: boolean }) {
  useEffect(() => {
    if (!track) return;
    const w = window.innerWidth;
    fetch("/api/public/lp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pageId, experimentId, variant, source: sourceOf(), device: w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop" }),
      keepalive: true,
    })
      .then((r) => r.json())
      .then((d) => {
        try {
          if (d.visitId) sessionStorage.setItem(visitKey(pageId), d.visitId);
        } catch {
          /* storage unavailable */
        }
      })
      .catch(() => null);
  }, [pageId, experimentId, variant, track]);
  return null;
}

type FormDef = { id: string; fields: FormField[]; submitButtonText: string; requireConsent: boolean; consentText: string | null; privacyUrl: string | null; termsUrl: string | null };

export function LeadForm({ form, pageId, heading, countView }: { form: FormDef; pageId?: string; heading?: string; countView?: boolean }) {
  const [state, setState] = useState<{ status: "idle" | "sending" | "done" | "error"; message?: string }>({ status: "idle" });
  const started = useRef(false);
  const post = (payload: Record<string, unknown>) =>
    fetch(`/api/public/forms/${form.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  const visitId = () => {
    try {
      return pageId ? sessionStorage.getItem(visitKey(pageId)) ?? undefined : undefined;
    } catch {
      return undefined;
    }
  };
  useEffect(() => {
    if (countView) post({ action: "view" }).catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countView]);

  if (state.status === "done") return <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-[15px] font-semibold text-emerald-800">{state.message}</div>;

  return (
    <form
      id="form"
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      onFocus={() => {
        if (started.current) return;
        started.current = true;
        post({ action: "start", visitId: visitId() }).catch(() => null);
      }}
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const data: Record<string, string | boolean> = {};
        for (const f of form.fields) data[f.name] = f.type === "checkbox" ? fd.get(f.name) === "on" : String(fd.get(f.name) ?? "");
        setState({ status: "sending" });
        try {
          const res = await post({ action: "submit", data, visitId: visitId(), consent: fd.get("__consent") === "on", website: String(fd.get("website") ?? ""), source: pageId ? "landing_page" : "hosted_form" });
          const d = await res.json().catch(() => ({}));
          if (!res.ok) return setState({ status: "error", message: d.error || "Something went wrong. Please try again." });
          if (d.redirectUrl) window.location.href = d.redirectUrl;
          setState({ status: "done", message: d.message || "Thank you!" });
        } catch {
          setState({ status: "error", message: "Something went wrong. Please try again." });
        }
      }}
    >
      {heading && <h2 className="text-[22px] font-bold text-slate-900">{heading}</h2>}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      {form.fields.map((f) =>
        f.type === "hidden" ? null : f.type === "checkbox" ? (
          <label key={f.id} className="flex items-start gap-2 text-[14px] text-slate-700">
            <input type="checkbox" name={f.name} required={f.required} className="mt-1" /> {f.label}
          </label>
        ) : (
          <label key={f.id} className="block text-[14px] font-medium text-slate-800">
            {f.label}
            {f.required && <span className="text-red-600"> *</span>}
            {f.type === "dropdown" ? (
              <select name={f.name} required={f.required} className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3">
                <option value="">Select…</option>
                {f.options.split("\n").map((o) => o.trim()).filter(Boolean).map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input name={f.name} type={f.type === "email" ? "email" : "text"} required={f.required} className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3" />
            )}
          </label>
        ),
      )}
      {form.requireConsent && (
        <label className="flex items-start gap-2 text-[13px] text-slate-600">
          <input type="checkbox" name="__consent" required className="mt-1" />
          <span>
            {form.consentText || "I agree to receive communications and accept the privacy policy."}{" "}
            {form.privacyUrl && <a href={form.privacyUrl} target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>}
            {form.termsUrl && <> · <a href={form.termsUrl} target="_blank" rel="noopener noreferrer" className="underline">Terms</a></>}
          </span>
        </label>
      )}
      {state.status === "error" && <p role="alert" className="text-[13px] text-red-600">{state.message}</p>}
      <button type="submit" disabled={state.status === "sending"} className="h-11 w-full rounded-md bg-[#0B5CFF] text-[15px] font-semibold text-white disabled:opacity-60">
        {state.status === "sending" ? "Sending…" : form.submitButtonText}
      </button>
    </form>
  );
}

/** Keeps a visitor on the same A/B variant for 30 days. */
export function ExperimentCookie({ id, variant }: { id: string; variant: string }) {
  useEffect(() => {
    document.cookie = `av_exp_${id}=${variant}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
  }, [id, variant]);
  return null;
}
