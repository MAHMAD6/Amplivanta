"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, ChevronRight, Clock, Loader2, PlusCircle, X } from "lucide-react";

export type CreditPackOption = { code: string; label: string; credits: number; priceCents: number; currency: string };

export type PurchaseOutcome =
  | { state: "success"; credits: number; balance: number | null }
  | { state: "processing" }
  | { state: "payment_failed" }
  | null;

const money = (c: number, cur: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur.toUpperCase() }).format(c / 100);

const row = "flex items-center justify-between text-[13px]";

/**
 * Buy Credits drawer (Usage & Credits spec): states default, drawer_open,
 * processing, success, payment_failed and purchase_unavailable.
 *
 * Packages and prices come from billing configuration; nothing is hard-coded.
 * The purchase is created server-side, and the success state is shown only
 * for a purchase the server has verified as paid — never from the redirect.
 */
export function BuyCreditsDrawer({
  packs,
  outcome,
}: {
  packs: CreditPackOption[];
  outcome: PurchaseOutcome;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(outcome));
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const pack = packs.find((p) => p.code === code) ?? null;
  const unavailable = packs.length === 0;

  useEffect(() => {
    if (outcome) setOpen(true);
  }, [outcome]);

  const close = () => {
    setOpen(false);
    setError(null);
    // Drop the ?purchase / session_id params once the outcome has been seen.
    if (outcome) router.replace("/app/usage-credits");
  };

  const purchase = () =>
    start(async () => {
      setError(null);
      try {
        const res = await fetch("/api/billing/credits/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ packCode: code }),
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout could not be started.");
        window.location.assign(data.url);
      } catch (e) {
        setError((e as Error).message);
      }
    });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-violet to-royal-blue px-4 text-[13.5px] font-bold text-white shadow-violet transition hover:opacity-95"
      >
        <PlusCircle className="h-4 w-4" /> Buy Credits
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-deep-navy/30" role="dialog" aria-modal="true" aria-label="Buy additional credits">
          <div className="flex h-full w-full max-w-[540px] flex-col overflow-y-auto bg-white px-7 py-8 shadow-2xl">
            <div className="flex justify-end">
              <button type="button" onClick={close} aria-label="Close" className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft">
                <X className="h-5 w-5" />
              </button>
            </div>

            {outcome?.state === "success" ? (
              <div className="text-center">
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                </span>
                <h2 className="mt-5 text-[26px] font-extrabold text-deep-navy">Credits added</h2>
                <p className="mt-2 text-[13.5px] text-ink-soft">Purchased credits are now available to your workspace.</p>
                <dl className="mt-8 space-y-4 rounded-2xl border border-line p-5 text-left">
                  <div className={row}><dt className="text-ink-soft">Credits purchased</dt><dd className="font-bold text-deep-navy">{outcome.credits.toLocaleString("en-US")}</dd></div>
                  <div className={row}><dt className="text-ink-soft">Payment status</dt><dd className="font-bold text-deep-navy">Confirmed</dd></div>
                  <div className={row}>
                    <dt className="text-ink-soft">Updated balance</dt>
                    <dd className="font-bold text-deep-navy">{outcome.balance == null ? "Loaded from account" : outcome.balance.toLocaleString("en-US")}</dd>
                  </div>
                </dl>
                <button type="button" onClick={close} className="mt-6 h-12 w-full rounded-xl bg-violet text-[14px] font-bold text-white hover:bg-violet-hover">
                  Done
                </button>
                <p className="mt-3 text-[11.5px] text-ink-muted">Purchase history and receipts remain available in Billing.</p>
              </div>
            ) : outcome?.state === "processing" ? (
              <div className="text-center">
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-royal-tint">
                  <Clock className="h-10 w-10 text-royal-blue" />
                </span>
                <h2 className="mt-5 text-[24px] font-extrabold text-deep-navy">Confirming your payment</h2>
                <p className="mt-2 text-[13.5px] text-ink-soft">
                  Credits are added only after the payment provider confirms the payment. This usually takes a moment.
                </p>
                <button type="button" onClick={() => router.refresh()} className="mt-6 h-11 w-full rounded-xl border border-line text-[13.5px] font-bold text-deep-navy hover:bg-bg-soft">
                  Check again
                </button>
              </div>
            ) : outcome?.state === "payment_failed" ? (
              <div className="text-center">
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                  <AlertTriangle className="h-10 w-10 text-red-600" />
                </span>
                <h2 className="mt-5 text-[24px] font-extrabold text-deep-navy">Payment not completed</h2>
                <p className="mt-2 text-[13.5px] text-ink-soft">No credits were added and you were not charged for this attempt.</p>
                <button type="button" onClick={close} className="mt-6 h-11 w-full rounded-xl border border-line text-[13.5px] font-bold text-deep-navy hover:bg-bg-soft">
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-[26px] font-extrabold text-deep-navy">Buy Additional Credits</h2>
                <p className="mt-1 text-[13.5px] text-ink-soft">Purchase add-on credits when available for your workspace.</p>

                {unavailable ? (
                  <div className="mt-6 rounded-2xl border border-line bg-bg-soft/60 p-5">
                    <div className="text-[14px] font-bold text-deep-navy">Credit purchases are not available yet</div>
                    <p className="mt-1 text-[12.5px] text-ink-soft">
                      No credit packages are configured for your workspace. Packages and prices appear here once billing is set up.
                    </p>
                  </div>
                ) : null}

                <label className="mt-6 block">
                  <span className="mb-2 block text-[15px] font-bold text-deep-navy">Credit package</span>
                  <select
                    value={code}
                    onChange={(e) => setCode(e.currentTarget.value)}
                    disabled={unavailable}
                    className="h-12 w-full rounded-xl border border-line bg-white px-4 text-[13.5px] text-deep-navy focus:border-royal-blue focus:outline-none disabled:bg-bg-soft"
                  >
                    <option value="">Select a package</option>
                    {packs.map((p) => (
                      <option key={p.code} value={p.code}>{p.label}</option>
                    ))}
                  </select>
                </label>
                <p className="mt-2 text-[12px] text-ink-muted">Packages and prices are loaded from billing configuration.</p>

                <dl className="mt-4 space-y-3 rounded-2xl border border-line bg-bg-soft/40 p-5">
                  <div className={row}><dt className="text-ink-soft">Credits included</dt><dd className="font-bold text-deep-navy">{pack ? pack.credits.toLocaleString("en-US") : "—"}</dd></div>
                  <div className={row}><dt className="text-ink-soft">Price</dt><dd className="font-bold text-deep-navy">{pack ? money(pack.priceCents, pack.currency) : "—"}</dd></div>
                </dl>

                <div className="mt-6 text-[15px] font-bold text-deep-navy">Payment method</div>
                <Link href="/app/settings/billing" className="mt-2 flex items-center justify-between rounded-2xl border border-line px-5 py-4 hover:bg-bg-soft">
                  <span>
                    <span className="block text-[14px] font-bold text-deep-navy">Managed in Billing</span>
                    <span className="block text-[12px] text-ink-muted">Available methods appear after configuration.</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-royal-blue" />
                </Link>

                <div className="mt-4 rounded-2xl border border-line px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[14px] font-bold text-deep-navy">
                        Auto-recharge <span className="text-[11px] font-normal text-ink-muted">Optional</span>
                      </div>
                      <p className="mt-1 text-[12px] text-ink-soft">
                        Automatically purchase the selected package when your balance falls below a threshold you configure.
                      </p>
                      <p className="mt-2 text-[12px] font-bold text-violet">Off until you explicitly enable it.</p>
                    </div>
                    {/* Off by default; enabling needs a saved payment method, which billing does not offer yet. */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked="false"
                      disabled
                      title="Available once saved payment methods are supported in Billing"
                      className="relative mt-1 h-6 w-11 shrink-0 cursor-not-allowed rounded-full bg-line"
                    >
                      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 text-[15px] font-bold text-deep-navy">Order summary</div>
                <dl className="mt-2 space-y-2.5 rounded-2xl border border-line p-5">
                  <div className={row}><dt className="text-ink-soft">Credits</dt><dd className="text-deep-navy">{pack ? pack.credits.toLocaleString("en-US") : "—"}</dd></div>
                  <div className={row}><dt className="text-ink-soft">Subtotal</dt><dd className="text-deep-navy">{pack ? money(pack.priceCents, pack.currency) : "—"}</dd></div>
                  <div className={row}><dt className="text-ink-soft">Tax</dt><dd className="text-deep-navy">{pack ? "Calculated at checkout" : "—"}</dd></div>
                  <div className={`${row} border-t border-line pt-2.5`}><dt className="font-bold text-deep-navy">Total</dt><dd className="font-bold text-deep-navy">{pack ? money(pack.priceCents, pack.currency) : "—"}</dd></div>
                </dl>

                {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[12.5px] font-semibold text-red-700">{error}</p>}

                <button
                  type="button"
                  disabled={!pack || pending || unavailable}
                  onClick={purchase}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet text-[14.5px] font-bold text-white transition hover:bg-violet-hover disabled:bg-violet/35"
                >
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />} Purchase Credits
                </button>
                <p className="mt-3 text-[11.5px] text-ink-muted">Select a package to continue. Final amount is shown before purchase.</p>
                <p className="mt-2 text-[11.5px] text-ink-muted">Credits are added only after verified payment confirmation.</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
