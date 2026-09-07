"use client";

import { useState, useTransition } from "react";
import { Loader2, Wallet, X } from "lucide-react";
import {
  applyToSell,
  createProduct,
  requestWithdrawal,
  updateSellerProfile,
  type MpResult,
} from "@/app/(app)/app/marketplace/actions";
import { cn } from "@/lib/utils";
import { MpCard } from "./ui";

const field =
  "h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[13.5px] text-ink focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/15";
const area =
  "w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[13.5px] text-ink focus:border-royal-blue focus:outline-none focus:ring-2 focus:ring-royal-blue/15";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-bold text-deep-navy">
        {label} {required && <span className="text-orange-cta">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-ink-muted">{hint}</span>}
    </label>
  );
}

function Result({ result }: { result: { ok: boolean; message: string } | null }) {
  if (!result) return null;
  return (
    <p
      role="status"
      className={cn(
        "mt-5 rounded-xl px-4 py-3 text-[12.5px] font-semibold",
        result.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
      )}
    >
      {result.message}
    </p>
  );
}

function useAction() {
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<MpResult>, onOk?: () => void) =>
    start(async () => {
      const res = await fn();
      setResult(res.ok ? { ok: true, message: res.message } : { ok: false, message: res.error });
      if (res.ok) onOk?.();
    });
  return { result, pending, run };
}

const PRODUCT_TYPES = ["Templates", "Images", "Videos", "Graphics", "Documents", "Tools & Kits"];

export function SellerApplicationForm() {
  const { result, pending, run } = useAction();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        run(() => applyToSell(fd), () => form.reset());
      }}
    >
      <MpCard className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Store name" required>
              <input name="storeName" required placeholder="How your store appears to buyers" className={field} />
            </Field>
          </div>
          <Field label="Contact email" required>
            <input name="contactEmail" type="email" required placeholder="you@company.com" className={field} />
          </Field>
          <Field label="Website">
            <input name="website" placeholder="https://" className={field} />
          </Field>
          <div className="md:col-span-2">
            <span className="mb-2 block text-[12.5px] font-bold text-deep-navy">
              What do you plan to sell? <span className="text-orange-cta">*</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_TYPES.map((t) => (
                <label key={t} className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-[13px] text-ink hover:bg-bg-soft">
                  <input type="checkbox" name="productTypes" value={t} className="h-4 w-4 accent-royal-blue" />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <Field label="Tell us about your products">
              <textarea name="motivation" rows={5} placeholder="What you make, who it is for, and why it fits Amplivanta." className={area} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <label className="flex items-start gap-2.5 text-[13px] text-ink-soft">
              <input type="checkbox" name="agree" required className="mt-0.5 h-4 w-4 accent-royal-blue" />
              <span>
                I accept the{" "}
                <a href="/legal/marketplace-seller-agreement" className="font-semibold text-royal-blue hover:underline">
                  Seller Agreement
                </a>{" "}
                and the{" "}
                <a href="/legal/marketplace-product-content-policy" className="font-semibold text-royal-blue hover:underline">
                  Product Content Policy
                </a>
                .
              </span>
            </label>
          </div>
        </div>

        <Result result={result} />

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-royal-blue px-5 text-[13.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Submit application
          </button>
        </div>
      </MpCard>
    </form>
  );
}

export function SellerSettingsForm({
  storeName,
  slug,
  headline,
  bio,
}: {
  storeName: string;
  slug: string;
  headline: string;
  bio: string;
}) {
  const { result, pending, run } = useAction();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        run(() => updateSellerProfile(fd));
      }}
    >
      <MpCard className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Store name" required>
            <input name="storeName" required defaultValue={storeName} className={field} />
          </Field>
          <Field label="Store URL" hint="Your public store address. Contact support to change it.">
            <input value={`/app/marketplace/stores/${slug}`} readOnly className={cn(field, "bg-bg-soft text-ink-muted")} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Headline">
              <input name="headline" defaultValue={headline} placeholder="One line about your store" className={field} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="About your store">
              <textarea name="bio" rows={6} defaultValue={bio} className={area} />
            </Field>
          </div>
        </div>

        <Result result={result} />

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-royal-blue px-5 text-[13.5px] font-bold text-white transition hover:bg-royal-soft disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </button>
        </div>
      </MpCard>
    </form>
  );
}

/**
 * Withdrawal request. The trigger is only actionable when eligibility was
 * calculated server-side; otherwise it explains exactly what is missing.
 */
export function WithdrawalRequestDrawer({
  canRequest,
  availableLabel,
  blockedReason,
}: {
  canRequest: boolean;
  availableLabel: string;
  blockedReason: string | null;
}) {
  const [open, setOpen] = useState(false);
  const { result, pending, run } = useAction();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-xl px-4 text-[13.5px] font-bold transition",
          canRequest ? "bg-royal-blue text-white hover:bg-royal-soft" : "border border-line bg-white text-deep-navy",
        )}
      >
        <Wallet className="h-4 w-4" /> Request payout
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-deep-navy/40" role="dialog" aria-modal="true" aria-label="Request payout">
          <div className="h-full w-full max-w-[440px] overflow-y-auto bg-white p-6 shadow-card-lg">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[18px] font-extrabold text-deep-navy">Withdrawal Request</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-ink-muted hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-line bg-bg-soft px-4 py-3.5">
              <div className="text-[12.5px] text-ink-soft">Eligible balance</div>
              <div className="text-[22px] font-extrabold text-deep-navy">{availableLabel}</div>
            </div>

            {blockedReason ? (
              <p className="mt-5 rounded-xl bg-orange-cta/10 px-4 py-3 text-[12.5px] font-semibold text-orange-cta">
                {blockedReason}
              </p>
            ) : (
              <p className="mt-5 text-[13px] leading-relaxed text-ink-soft">
                The full eligible balance is requested. Amounts, fees and timing are confirmed by the
                payout provider once the request is processed.
              </p>
            )}

            <Result result={result} />

            <div className="mt-6 flex gap-2.5">
              <button type="button" onClick={() => setOpen(false)} className="h-12 flex-1 rounded-xl border border-line bg-white text-[13.5px] font-bold text-deep-navy hover:bg-bg-soft">
                Cancel
              </button>
              <button
                type="button"
                disabled={!canRequest || pending}
                onClick={() => run(() => requestWithdrawal())}
                className="inline-flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-royal-blue text-[13.5px] font-bold text-white transition hover:bg-royal-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} Request payout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
