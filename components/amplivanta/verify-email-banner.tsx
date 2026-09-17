"use client";

import { useState } from "react";
import { MailWarning } from "lucide-react";
import { toast } from "@/lib/toast";

/** Shown until the signed-in member confirms their email address. */
export function VerifyEmailBanner() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function resend() {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/verify-email", { method: "PUT" });
      const json = (await res.json().catch(() => ({}))) as { error?: string; delivered?: boolean; alreadyVerified?: boolean };
      if (!res.ok) throw new Error(json.error || "Could not send the link.");
      if (json.alreadyVerified) toast.success("Your email is already confirmed. Refresh the page.");
      else if (json.delivered === false) toast.warning("No email provider is configured yet, so the link could not be delivered.");
      else {
        setSent(true);
        toast.success("Confirmation link sent. Check your inbox.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send the link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-900 sm:px-6 lg:px-9">
      <p className="flex items-center gap-2">
        <MailWarning aria-hidden className="h-4 w-4 shrink-0" />
        Confirm your email address to secure your account and receive alerts.
      </p>
      <button type="button" onClick={resend} disabled={busy || sent} className="rounded-md border border-amber-300 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-60">
        {sent ? "Link sent" : busy ? "Sending…" : "Send confirmation link"}
      </button>
    </div>
  );
}
