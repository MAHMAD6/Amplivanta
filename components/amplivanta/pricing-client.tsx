"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, X, Tag, Sprout, Rocket, TrendingUp, Briefcase, ShieldCheck, Lock, Headphones, Table2, ChevronDown } from "lucide-react";
import { PLANS, FEATURE_MATRIX, type Plan, type PlanTier } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const ICONS = { leaf: Sprout, rocket: Rocket, trending: TrendingUp, briefcase: Briefcase, shield: ShieldCheck };
const TRUST = [
  { icon: Lock, title: "Secure by Design", desc: "Security built around tenant isolation, access controls and data protection." },
  { icon: TrendingUp, title: "Built to Scale", desc: "Start small, upgrade anytime. We grow with you." },
  { icon: Headphones, title: "Human Support", desc: "Helpful support from real people." },
  { icon: ShieldCheck, title: "Transparent Pricing", desc: "No hidden fees." },
];

export function PricingClient() {
  const [annual, setAnnual] = useState(true);
  const [compare, setCompare] = useState(false);
  const cols: PlanTier[] = ["FREE", "STARTER", "GROWTH", "PROFESSIONAL", "ENTERPRISE"];

  return (
    <section className="bg-white pb-16">
      <div className="mx-auto max-w-[1320px] px-4 lg:px-8">
        {/* Launch offer */}
        <div className="mb-4 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-royal-tint px-4 py-1.5 text-[13px] font-bold text-royal-blue"><Tag className="h-4 w-4" /> LAUNCH OFFER — SAVE 25%</span>
        </div>
        <p className="text-center text-[13px] text-ink-soft">Launch pricing applies to all paid plans &nbsp;•&nbsp; Annual billing saves an additional 10%.</p>

        {/* Billing toggle */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Billing Cycle:</span>
          <span className={cn("text-[13px]", !annual && "font-bold text-deep-navy")}>Monthly</span>
          <button onClick={() => setAnnual((v) => !v)} className="relative h-6 w-12 rounded-full bg-royal-blue p-0.5" aria-label="Toggle billing">
            <span className={cn("block h-5 w-5 rounded-full bg-white shadow transition", annual ? "translate-x-6" : "translate-x-0")} />
          </button>
          <span className={cn("text-[13px]", annual && "font-bold text-deep-navy")}>Annual</span>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600">Save 10%</span>
          <span className="ml-2 text-[12px] text-ink-muted">All prices in USD</span>
        </div>
        <p className="mt-3 text-center text-[12px] text-ink-muted">Annual pricing reflects 25% launch discount plus additional 10% annual discount (32.5% total savings vs list price).</p>

        {/* Plan cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {PLANS.map((plan) => <PlanCard key={plan.key} plan={plan} annual={annual} />)}
        </div>

        {/* Compare toggle */}
        <div className="mt-6 flex justify-center">
          <button onClick={() => setCompare((v) => !v)} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-5 py-2.5 text-[13px] font-semibold text-deep-navy shadow-card hover:border-royal-blue/40">
            <Table2 className="h-4 w-4" /> Compare all features <ChevronDown className={cn("h-4 w-4 transition", compare && "rotate-180")} />
          </button>
        </div>

        {compare && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-4 py-3 text-left font-semibold text-ink-muted">Feature</th>
                  {cols.map((c) => <th key={c} className="px-3 py-3 text-center font-bold text-deep-navy">{PLANS.find((p) => p.key === c)?.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {FEATURE_MATRIX.map((section) => (
                  <>
                    <tr key={section.section} className="bg-bg-soft/60"><td colSpan={6} className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">{section.section}</td></tr>
                    {section.rows.map((row) => (
                      <tr key={row.label} className="border-b border-line/60">
                        <td className="px-4 py-2.5 text-ink-soft">{row.label}</td>
                        {cols.map((c) => (
                          <td key={c} className="px-3 py-2.5 text-center">
                            {typeof row.values[c] === "boolean"
                              ? (row.values[c] ? <Check className="mx-auto h-4 w-4 text-emerald-600" /> : <X className="mx-auto h-4 w-4 text-ink-muted/40" />)
                              : <span className="font-medium text-deep-navy">{row.values[c]}</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Trust row */}
        <div className="mt-8 grid grid-cols-1 gap-6 rounded-2xl bg-royal-tint/40 p-6 md:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.title} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-deep-navy shadow-card"><t.icon className="h-5 w-5" /></span>
              <div><div className="text-[13.5px] font-bold text-deep-navy">{t.title}</div><p className="mt-0.5 text-[11.5px] text-ink-soft">{t.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan, annual }: { plan: Plan; annual: boolean }) {
  const Icon = ICONS[plan.icon];
  const custom = plan.priceAnnual === null;
  const price = annual ? plan.priceAnnual : plan.priceMonthly;
  return (
    <div className={cn("relative flex flex-col rounded-2xl border bg-white p-5 shadow-card", plan.featured ? "border-royal-blue ring-2 ring-royal-blue/20" : "border-line")}>
      {plan.featured && <div className="absolute inset-x-0 -top-px mx-auto w-max rounded-b-lg bg-deep-navy px-4 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Most Popular</div>}
      <div className={cn("flex items-start gap-3", plan.featured && "mt-3")}>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-royal-tint text-royal-blue"><Icon className="h-5 w-5" /></span>
        <div><div className="text-[16px] font-bold text-deep-navy">{plan.name}</div><p className="mt-0.5 text-[11.5px] leading-snug text-ink-soft">{plan.tagline}</p></div>
      </div>

      <div className="mt-5 min-h-[64px]">
        {custom ? (
          <div className="text-[24px] font-extrabold text-deep-navy">Custom pricing</div>
        ) : (
          <>
            <div className="flex items-baseline gap-1.5">
              {annual && plan.priceMonthly ? <span className="text-[15px] font-semibold text-ink-muted line-through">${plan.priceMonthly}</span> : null}
              <span className="text-[32px] font-extrabold text-deep-navy">${price}</span>
              <span className="text-[13px] text-ink-muted">/month</span>
            </div>
            {annual && plan.annualTotal && plan.annualSaving ? (
              <>
                <div className="mt-1 text-[11px] text-ink-soft">Billed annually (${plan.annualTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/year)</div>
                <div className="text-[11px] font-semibold text-emerald-600">Save ${plan.annualSaving.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per year</div>
              </>
            ) : plan.priceAnnual === 0 ? (
              <div className="mt-0.5 text-[11px] font-semibold text-emerald-600">No time limit</div>
            ) : null}
          </>
        )}
      </div>

      <ul className="mt-4 flex-1 space-y-2 border-t border-line pt-4">
        {plan.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-[12.5px] text-ink-soft"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> {b}</li>
        ))}
      </ul>

      <Link href={plan.ctaHref} className={cn("mt-4 inline-flex h-11 items-center justify-center rounded-xl text-[13px] font-bold transition", plan.outline ? "border border-emerald-600 text-emerald-700 hover:bg-emerald-50" : "bg-emerald-600 text-white hover:bg-emerald-700")}>
        {plan.ctaLabel}
      </Link>
      {plan.priceAnnual === 0 && <p className="mt-2 text-center text-[11px] text-ink-muted">No credit card required</p>}
    </div>
  );
}
