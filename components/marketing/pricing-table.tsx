"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import {
  ANNUAL_EXTRA_DISCOUNT,
  COMMISSION_FOOTNOTE,
  COMPARISON,
  LAUNCH_DISCOUNT,
  PLANS,
  annualMonthlyPrice,
  annualTotal,
  money,
  monthlyPrice,
} from "@/lib/site-pricing";
import { btn } from "./site-shell";
import { cn } from "@/lib/utils";

/**
 * Plan cards and the comparison table.
 *
 * The billing toggle drives both, so the page can never show annual prices
 * against a monthly comparison. Every figure is derived from the plan's list
 * price and the two published discounts.
 */
export function PricingTable() {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      <div className="mt-7 flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-2 text-[13px] text-site-muted">
          <strong className="font-bold text-site-ink">
            Launch offer: {LAUNCH_DISCOUNT * 100}% off paid-plan list pricing
          </strong>
          <span>
            Annual billing adds a further {ANNUAL_EXTRA_DISCOUNT * 100}% discount while the launch
            offer is active.
          </span>
          <span>All prices shown in USD.</span>
        </div>

        <div
          role="radiogroup"
          aria-label="Billing cycle"
          className="mt-2 inline-flex items-center gap-1 rounded-full border border-site-line bg-white p-1"
        >
          {[
            ["Monthly", false],
            ["Annual", true],
          ].map(([label, value]) => (
            <button
              key={String(label)}
              type="button"
              role="radio"
              aria-checked={annual === value}
              onClick={() => setAnnual(value as boolean)}
              className={cn(
                "rounded-full px-5 py-2.5 text-[13.5px] font-bold transition",
                annual === value ? "bg-site-navy text-white" : "text-site-ink hover:bg-site-soft",
              )}
            >
              {label}
            </button>
          ))}
          <span className="ml-1 rounded-full bg-[#E8F7F0] px-3 py-2 text-[12px] font-bold text-site-green">
            Annual: additional {ANNUAL_EXTRA_DISCOUNT * 100}%
          </span>
        </div>

        <p className="max-w-[880px] text-center text-[12.5px] leading-[1.5] text-site-muted">
          Annual pricing applies the {LAUNCH_DISCOUNT * 100}% launch discount first, then the
          additional {ANNUAL_EXTRA_DISCOUNT * 100}% annual discount —{" "}
          {((1 - (1 - LAUNCH_DISCOUNT) * (1 - ANNUAL_EXTRA_DISCOUNT)) * 100).toFixed(1)}% effective
          savings compared with list pricing.
        </p>
      </div>

      {/* Plan cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {PLANS.map((plan) => {
          const perMonth =
            plan.listMonthly === null
              ? null
              : plan.listMonthly === 0
                ? 0
                : annual
                  ? annualMonthlyPrice(plan.listMonthly)
                  : monthlyPrice(plan.listMonthly);
          // From the unrounded rate: the rounded monthly figure × 12 would drift
          // (33.08 × 12 = 396.96, where the reference bills 396.90).
          const yearTotal = plan.listMonthly && annual ? annualTotal(plan.listMonthly) : null;
          const annualSaving =
            yearTotal !== null ? Math.round((plan.listMonthly! * 12 - yearTotal) * 100) / 100 : null;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-5",
                plan.recommended
                  ? "border-2 border-site-navy pt-9 shadow-[0_18px_44px_rgba(7,31,69,0.14)]"
                  : "border-site-line",
              )}
            >
              {plan.recommended && (
                <span className="absolute inset-x-0 top-0 rounded-t-2xl bg-site-navy py-1.5 text-center text-[11px] font-extrabold uppercase tracking-[1px] text-white">
                  Recommended
                </span>
              )}

              <div className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F0ECFF] text-[12px] font-black text-site-purple">
                  {plan.initial}
                </span>
                <span>
                  <span className="block text-[18px] font-extrabold text-site-ink">{plan.name}</span>
                  <span className="mt-1 block text-[12.5px] leading-[1.45] text-site-muted">
                    {plan.description}
                  </span>
                </span>
              </div>

              <div className="mt-5">
                {plan.listMonthly !== null && plan.listMonthly > 0 && (
                  <div className="text-[12.5px] text-site-muted">
                    List price: <s>{money(plan.listMonthly)}/month</s>
                  </div>
                )}
                {perMonth === null ? (
                  <div className="text-[22px] font-extrabold leading-tight text-site-ink">{plan.priceLabel}</div>
                ) : (
                  <div className="text-[32px] font-extrabold leading-none text-site-ink">
                    {perMonth === 0 ? "$0" : money(perMonth)}
                    <span className="text-[14px] font-bold text-site-muted">/month</span>
                  </div>
                )}
                {plan.priceNote && (
                  <div
                    className={cn(
                      "mt-1 text-[12.5px]",
                      plan.listMonthly === 0 ? "font-bold text-site-green" : "text-site-muted",
                    )}
                  >
                    {plan.priceNote}
                  </div>
                )}
                {yearTotal !== null && (
                  <>
                    <div className="mt-1 text-[12px] text-site-muted">
                      Billed annually: {money(yearTotal)}/year
                    </div>
                    <div className="mt-0.5 text-[12px] font-bold text-site-green">
                      Save {money(annualSaving!)} per year vs. list pricing
                    </div>
                  </>
                )}
              </div>

              <ul className="mt-5 flex-1 space-y-2 border-t border-site-line pt-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-[12.8px] text-site-ink">
                    <Check aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-site-green" />
                    {f}
                  </li>
                ))}
              </ul>

              <p className="mt-4 rounded-xl bg-[#F4F2FF] px-3 py-2.5 text-[11.5px] font-bold text-[#5638E8]">
                {plan.commission}
              </p>

              <Link
                href={plan.cta.href}
                className={cn(
                  "mt-4 w-full py-3 text-[13.5px]",
                  // The reference fills paid-plan buttons in navy and outlines
                  // Free and Enterprise, whose actions are not a purchase.
                  plan.listMonthly
                    ? "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] bg-site-navy font-bold text-white transition hover:opacity-90"
                    : btn,
                )}
              >
                {plan.cta.label}
              </Link>
              <p className="mt-2 text-center text-[11px] leading-[1.4] text-site-muted">{plan.fine}</p>
            </div>
          );
        })}
      </div>

      {/* Comparison */}
      <section className="mt-10" id="compare">
        <h2 className="text-center text-[24px] font-extrabold tracking-[-0.5px] text-site-ink sm:text-[30px]">
          Compare all features
        </h2>
        <p className="mt-1 text-center text-[13.5px] text-site-muted">
          Compare the published limits and capabilities available across each plan.
        </p>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-site-line">
          <table className="w-full min-w-[820px] border-collapse bg-white text-left">
            <thead>
              <tr className="bg-site-navy text-white">
                <th className="px-4 py-3 text-[12.5px] font-bold">Feature</th>
                {PLANS.map((p) => (
                  <th
                    key={p.id}
                    className={cn(
                      "px-4 py-3 text-[12.5px] font-bold",
                      p.recommended && "bg-site-purple",
                    )}
                  >
                    {p.name.replace(" Forever", "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="border-b border-site-line last:border-0">
                  <th scope="row" className="px-4 py-3 text-[12.5px] font-bold text-site-ink">
                    {row.feature}
                  </th>
                  {row.values.map((v, i) => (
                    <td
                      key={i}
                      className={cn(
                        "px-4 py-3 text-[12.5px] text-site-muted",
                        PLANS[i]?.recommended && "bg-[#F7F5FF] font-semibold text-site-ink",
                      )}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[11.5px] leading-[1.5] text-site-muted">{COMMISSION_FOOTNOTE}</p>
      </section>
    </>
  );
}
