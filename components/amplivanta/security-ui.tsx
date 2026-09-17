"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, ShieldCheck } from "lucide-react";
import { toastResult } from "@/lib/action-toast";
import { toast } from "@/lib/toast";
import { confirmTwoFactor, disableTwoFactor, regenerateRecoveryCodes, revokeSession, startTwoFactor } from "@/app/(app)/app/settings/security-actions";

const primary = "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#0B5CFF] px-6 text-[13.5px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-60";
const outline = "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-6 text-[13.5px] font-semibold text-deep-navy hover:bg-bg-soft disabled:opacity-60";
const field = "h-11 w-full max-w-[290px] rounded-md border border-line bg-white px-3 text-[13.5px] text-deep-navy focus:border-[#0B5CFF] focus:outline-none";

function Codes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <h3 className="text-[14px] font-semibold text-amber-900">Save your recovery codes</h3>
      <p className="mt-1 text-[12.5px] text-amber-800">Each code works once if you lose your authenticator. They are shown only now.</p>
      <ul className="mt-3 grid grid-cols-2 gap-1.5 font-mono text-[13px] text-amber-900">
        {codes.map((c) => <li key={c}>{c}</li>)}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2.5">
        <button
          type="button"
          className={outline}
          onClick={() => {
            navigator.clipboard?.writeText(codes.join("\n")).then(() => toast.success("Recovery codes copied"), () => toast.error("Could not copy. Select and copy them manually."));
          }}
        >
          <Copy className="h-4 w-4" /> Copy codes
        </button>
        <button type="button" className={primary} onClick={onDone}>I saved them</button>
      </div>
    </div>
  );
}

/** Two-factor enrolment: start, confirm a code, show recovery codes, disable. */
export function TwoFactorPanel({ enabled, enabledAt, recoveryLeft }: { enabled: boolean; enabledAt: string | null; recoveryLeft: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [mode, setMode] = useState<"idle" | "disable" | "regenerate">("idle");

  const run = (fn: () => Promise<Awaited<ReturnType<typeof startTwoFactor>>>, after?: (r: { codes?: string[]; secret?: string; uri?: string }) => void) =>
    start(async () => {
      const r = await fn();
      toastResult(r.ok ? { ok: true, message: r.message } : { ok: false, error: r.error });
      if (r.ok) {
        after?.(r);
        router.refresh();
      }
    });

  if (codes) return <Codes codes={codes} onDone={() => { setCodes(null); setSetup(null); setMode("idle"); router.refresh(); }} />;

  if (setup) {
    return (
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          run(() => confirmTwoFactor(fd), (r) => setCodes(r.codes ?? null));
        }}
      >
        <p className="text-[13px] text-ink-soft">Add this key to an authenticator app (1Password, Google Authenticator, Authy), then enter the six-digit code it shows.</p>
        <div className="mt-3 rounded-lg border border-line bg-bg-soft/60 p-3">
          <div className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">Setup key</div>
          <code className="mt-1 block break-all font-mono text-[14px] text-deep-navy">{setup.secret}</code>
          <button type="button" className="mt-2 text-[12.5px] font-semibold text-[#0B5CFF]" onClick={() => navigator.clipboard?.writeText(setup.secret).then(() => toast.success("Key copied"), () => toast.error("Could not copy"))}>Copy key</button>
          <a href={setup.uri} className="ml-4 text-[12.5px] font-semibold text-[#0B5CFF]">Open in authenticator app</a>
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-[13px] font-semibold text-deep-navy">Six-digit code</span>
          <input name="code" inputMode="numeric" autoComplete="one-time-code" required maxLength={6} placeholder="000000" className={`${field} tracking-[0.3em]`} />
        </label>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <button type="submit" className={primary} disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />} Turn on two-factor</button>
          <button type="button" className={outline} onClick={() => setSetup(null)} disabled={pending}>Cancel</button>
        </div>
      </form>
    );
  }

  if (mode !== "idle") {
    const disabling = mode === "disable";
    return (
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          run(() => (disabling ? disableTwoFactor(fd) : regenerateRecoveryCodes(fd)), (r) => { if (!disabling) setCodes(r.codes ?? null); else setMode("idle"); });
        }}
      >
        <p className="text-[13px] text-ink-soft">{disabling ? "Confirm your password to turn two-factor off." : "Confirm your password to replace your recovery codes. The old codes stop working."}</p>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-[13px] font-semibold text-deep-navy">Account password</span>
          <input name="password" type="password" required autoComplete="current-password" className={field} />
        </label>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <button type="submit" className={primary} disabled={pending}>{pending && <Loader2 className="h-4 w-4 animate-spin" />} {disabling ? "Turn off two-factor" : "Generate new codes"}</button>
          <button type="button" className={outline} onClick={() => setMode("idle")} disabled={pending}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-4">
      <dl className="grid grid-cols-[180px_1fr] items-center gap-y-3 text-[13.5px]">
        <dt className="font-semibold text-deep-navy">Enrollment status</dt>
        <dd className={enabled ? "font-semibold text-emerald-700" : "text-ink-soft"}>{enabled ? `On since ${enabledAt}` : "Off"}</dd>
        <dt className="font-semibold text-deep-navy">Recovery codes</dt>
        <dd className="text-ink-soft">{enabled ? `${recoveryLeft} unused` : "Generated when you turn two-factor on"}</dd>
      </dl>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {enabled ? (
          <>
            <button type="button" className={outline} onClick={() => setMode("regenerate")}>New recovery codes</button>
            <button type="button" className={outline} onClick={() => setMode("disable")}>Turn off two-factor</button>
          </>
        ) : (
          <button type="button" className={primary} disabled={pending} onClick={() => run(startTwoFactor, (r) => r.secret && r.uri && setSetup({ secret: r.secret, uri: r.uri }))}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Set up two-factor
          </button>
        )}
      </div>
    </div>
  );
}

/** Ends one recorded session. */
export function RevokeSessionButton({ id, canRevoke }: { id: string; canRevoke: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (!canRevoke) return <span className="text-[12px] text-ink-muted">—</span>;
  return (
    <button
      type="button"
      disabled={pending}
      className="text-[12.5px] font-semibold text-ink-soft hover:text-red-600 disabled:opacity-50"
      onClick={() => start(async () => { const r = await revokeSession(id); toastResult(r.ok ? { ok: true, message: r.message } : { ok: false, error: r.error }); if (r.ok) router.refresh(); })}
    >
      End session
    </button>
  );
}
