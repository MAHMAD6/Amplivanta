"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Lock, Mail, XCircle } from "lucide-react";

const card = "rounded-2xl border border-line bg-white p-6 shadow-card lg:p-8";
const field = "flex h-12 items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-royal-blue focus-within:ring-2 focus-within:ring-royal-blue/20";
const input = "min-w-0 flex-1 bg-transparent text-[14px] focus:outline-none";
const primary = "inline-flex h-12 w-full items-center justify-center rounded-xl bg-royal-blue text-[15px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-60";

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const json = (await res.json().catch(() => ({}))) as { error?: string; delivered?: boolean };
  if (!res.ok) throw new Error(json.error || "Something went wrong. Try again.");
  return json;
}

/** Requests a password reset link. The answer never reveals whether the account exists. */
export function ForgotPasswordForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [delivered, setDelivered] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (state === "sent") {
    return (
      <div className={card}>
        <h2 className="flex items-center gap-2 text-[20px] font-bold text-deep-navy"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> Check your email</h2>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
          If an Amplivanta account uses that address, a reset link is on its way. The link works once and expires in an hour.
        </p>
        {!delivered && <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[12.5px] text-amber-800">No email provider is configured on this environment yet, so the message could not be delivered. Ask an administrator to finish email setup.</p>}
        <Link href="/login" className="mt-5 inline-block text-[13px] font-semibold text-royal-blue hover:underline">Back to sign in</Link>
      </div>
    );
  }

  return (
    <div className={card}>
      <h2 className="text-[20px] font-bold text-deep-navy">Reset your password</h2>
      <p className="mt-1.5 text-[13.5px] text-ink-soft">Enter the email address on your account and we will send a reset link.</p>
      <form
        className="mt-6 space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          const email = String(new FormData(e.currentTarget).get("email") ?? "");
          setState("sending");
          setError(null);
          try {
            const r = await post("/api/auth/password/forgot", { email });
            setDelivered(r.delivered !== false);
            setState("sent");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Try again.");
            setState("idle");
          }
        }}
      >
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">{error}</div>}
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-deep-navy">Email address</span>
          <span className={field}><Mail className="h-4 w-4 text-ink-muted" /><input name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={input} /></span>
        </label>
        <button type="submit" className={primary} disabled={state === "sending"}>{state === "sending" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send reset link"}</button>
        <Link href="/login" className="block text-center text-[13px] font-semibold text-royal-blue hover:underline">Back to sign in</Link>
      </form>
    </div>
  );
}

/** Sets a new password from the emailed token. */
export function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className={card}>
        <h2 className="flex items-center gap-2 text-[20px] font-bold text-deep-navy"><XCircle className="h-5 w-5 text-red-600" /> Link incomplete</h2>
        <p className="mt-3 text-[13.5px] text-ink-soft">This page needs the link from your reset email. Request a new one and open it from your inbox.</p>
        <Link href="/forgot-password" className="mt-5 inline-block text-[13px] font-semibold text-royal-blue hover:underline">Request a new link</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className={card}>
        <h2 className="flex items-center gap-2 text-[20px] font-bold text-deep-navy"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> Password updated</h2>
        <p className="mt-3 text-[13.5px] text-ink-soft">Sign in with your new password. Other sessions on this account were signed out.</p>
        <Link href="/login" className="mt-5 inline-block text-[13px] font-semibold text-royal-blue hover:underline">Go to sign in</Link>
      </div>
    );
  }

  return (
    <div className={card}>
      <h2 className="text-[20px] font-bold text-deep-navy">Choose a new password</h2>
      <form
        className="mt-6 space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const password = String(fd.get("password") ?? "");
          if (password !== String(fd.get("confirm") ?? "")) {
            setError("Both passwords must match.");
            return;
          }
          setBusy(true);
          setError(null);
          try {
            await post("/api/auth/password/reset", { token, password });
            setDone(true);
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">{error}</div>}
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-deep-navy">New password</span>
          <span className={field}><Lock className="h-4 w-4 text-ink-muted" /><input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" className={input} /></span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-deep-navy">Confirm new password</span>
          <span className={field}><Lock className="h-4 w-4 text-ink-muted" /><input name="confirm" type="password" required minLength={8} autoComplete="new-password" placeholder="Repeat the password" className={input} /></span>
        </label>
        <button type="submit" className={primary} disabled={busy}>{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update password"}</button>
      </form>
    </div>
  );
}

/** Confirms the address as soon as the page opens with a token. */
export function VerifyEmailPanel() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"checking" | "done" | "error" | "missing">(token ? "checking" : "missing");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) return;
    let active = true;
    post("/api/auth/verify-email", { token })
      .then(() => active && setState("done"))
      .catch((err: Error) => {
        if (!active) return;
        setMessage(err.message);
        setState("error");
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className={card}>
      {state === "checking" && <p className="flex items-center gap-2 text-[14px] text-ink-soft"><Loader2 className="h-4 w-4 animate-spin" /> Confirming your email address…</p>}
      {state === "done" && (
        <>
          <h2 className="flex items-center gap-2 text-[20px] font-bold text-deep-navy"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> Email confirmed</h2>
          <p className="mt-3 text-[13.5px] text-ink-soft">Thanks — your address is verified. You can head into the workspace.</p>
          <Link href="/app" className="mt-5 inline-block text-[13px] font-semibold text-royal-blue hover:underline">Open Amplivanta</Link>
        </>
      )}
      {(state === "error" || state === "missing") && (
        <>
          <h2 className="flex items-center gap-2 text-[20px] font-bold text-deep-navy"><XCircle className="h-5 w-5 text-red-600" /> {state === "missing" ? "Link incomplete" : "Link not valid"}</h2>
          <p className="mt-3 text-[13.5px] text-ink-soft">{state === "missing" ? "Open the confirmation link from your email." : message}</p>
          <p className="mt-3 text-[13px] text-ink-soft">Signed in? You can send a fresh link from the banner at the top of the app.</p>
          <Link href="/app" className="mt-5 inline-block text-[13px] font-semibold text-royal-blue hover:underline">Go to Amplivanta</Link>
        </>
      )}
    </div>
  );
}
