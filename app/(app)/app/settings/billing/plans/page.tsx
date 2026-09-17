import type { Metadata } from "next";
import Link from "next/link";
import { Check, Tags } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { EmptyState, Pill, ScreenHeader, fmtMoney, kitOutline, kitPrimary } from "@/components/amplivanta/screen-kit";
import { FormDialog } from "@/components/amplivanta/creative-ui";
import { UpgradeDialog } from "@/components/amplivanta/settings/upgrade-dialog";
import { getSessionContext } from "@/lib/tenant";
import { NOT_CONFIGURED, PLAN_DIMENSIONS, annualSavings, dimensionValue, periodPrice } from "@/lib/plan-config";
import { configurePlan } from "./actions";

export const metadata: Metadata = { title: "Pricing Plans Overview" };
export const dynamic = "force-dynamic";

const BASE = "/app/settings/billing/plans";

type SP = { billing?: string; plan?: string };

export default async function PricingPlansOverviewPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const period = sp.billing === "annual" ? "annual" : "monthly";

  let ctx: { workspaceId: string; workspaceRole: string; role: string } | null = null;
  try {
    ctx = await getSessionContext();
  } catch {
    ctx = null;
  }

  let data: null | {
    plans: { id: string; name: string; price: number; annualPrice: number | null; recommended: boolean; contactSales: boolean; sortOrder: number; stripe: boolean; features: string[]; entitlements: { featureKey: string; limitValue: number | null; enabled: boolean }[] }[];
    currentPlanId: string | null;
  } = null;
  try {
    const [plans, sub] = await Promise.all([
      db.plan.findMany({ orderBy: [{ sortOrder: "asc" }, { price: "asc" }], include: { entitlements: { select: { featureKey: true, limitValue: true, enabled: true } } } }),
      ctx ? db.subscription.findFirst({ where: { workspaceId: ctx.workspaceId }, orderBy: { createdAt: "desc" }, select: { planId: true, status: true } }) : null,
    ]);
    data = {
      plans: plans.map((p) => ({ id: p.id, name: p.name, price: p.price, annualPrice: p.annualPrice, recommended: p.recommended, contactSales: p.contactSales, sortOrder: p.sortOrder, stripe: Boolean(p.stripePriceId), features: p.features, entitlements: p.entitlements })),
      currentPlanId: sub && sub.status !== "canceled" ? sub.planId : null,
    };
  } catch {
    data = null;
  }

  const isOwner = Boolean(ctx && ["OWNER", "SUPER_ADMIN"].includes(ctx.workspaceRole));
  const isPlatformAdmin = ctx?.role === "SUPER_ADMIN";
  const selected = data?.plans.find((p) => p.id === sp.plan) ?? null;
  const link = (q: { billing?: string; plan?: string }) => {
    const u = new URLSearchParams();
    if (q.billing === "annual") u.set("billing", "annual");
    if (q.plan) u.set("plan", q.plan);
    return u.size ? `${BASE}?${u}` : BASE;
  };
  const anyAnnual = data?.plans.some((p) => p.annualPrice != null) ?? false;

  return (
    <div>
      <ScreenHeader
        crumbs={[["Settings", "/app/settings"], ["Billing & Subscription", "/app/settings/billing"], ["Plans & Pricing"]]}
        title="Pricing Plans Overview"
        subtitle="Review available Amplivanta plans, entitlements, limits, and upgrade paths."
      />

      <div className="mb-7 flex flex-wrap items-center gap-5">
        <div className="inline-flex rounded-lg border border-line bg-white p-1" role="tablist" aria-label="Billing period">
          {(["monthly", "annual"] as const).map((p) => (
            <Link key={p} href={link({ billing: p, plan: sp.plan })} role="tab" aria-selected={period === p} scroll={false} className={cn("rounded-md px-9 py-2 text-[13.5px] font-semibold capitalize", period === p ? "bg-royal-tint text-[#0B5CFF]" : "text-deep-navy hover:bg-bg-soft")}>
              {p}
            </Link>
          ))}
        </div>
        <div className="text-[12.5px] leading-relaxed text-ink-soft">
          <p>Prices, limits, and plan recommendations are loaded from billing and entitlement configuration.</p>
          <p>The Recommended badge appears only when a plan is designated as recommended in configuration.</p>
        </div>
      </div>

      {data === null ? (
        <section className="rounded-xl border border-line bg-white p-5">
          <EmptyState icon={Tags} tone="orange" title="Plan configuration is unavailable" body="Billing configuration could not be loaded. Try again shortly." />
        </section>
      ) : data.plans.length === 0 ? (
        <section className="rounded-xl border border-line bg-white p-5">
          <EmptyState icon={Tags} title="No plans are configured" body="Plans appear here once billing configuration defines them." />
        </section>
      ) : (
        <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", data.plans.length >= 5 ? "xl:grid-cols-5" : data.plans.length === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3")}>
          {data.plans.map((p) => {
            const price = periodPrice(p, period);
            const current = data!.currentPlanId === p.id;
            const savings = period === "annual" ? annualSavings(p) : null;
            return (
              <article key={p.id} className={cn("relative flex flex-col rounded-xl border bg-white p-5", p.recommended ? "border-2 border-[#0B5CFF]" : "border-line", sp.plan === p.id && !p.recommended && "border-[#0B5CFF]/50")}>
                {p.recommended && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-md bg-[#0B5CFF] px-10 py-1 text-[11px] font-semibold text-white">Recommended</span>}
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-[22px] font-bold text-deep-navy">{p.name}</h2>
                  {current && <Pill tone="green">Current</Pill>}
                </div>
                <div className="mt-3 text-[24px] font-bold text-deep-navy">
                  {price == null ? "—" : price === 0 ? "Free" : fmtMoney(price)}
                  {price != null && price > 0 && <span className="text-[13px] font-medium text-ink-soft"> / {period === "annual" ? "year" : "month"}</span>}
                </div>
                <div className="mt-1 text-[12.5px] text-ink-soft">
                  {price == null ? "Annual price not configured" : savings ? `Saves ${savings}% versus monthly` : "Price from billing configuration"}
                </div>
                <dl className="mt-4 flex-1 space-y-4 border-t border-line pt-5">
                  {PLAN_DIMENSIONS.map((d) => {
                    const v = dimensionValue(d.key, p.entitlements);
                    return (
                      <div key={d.key}>
                        <dt className="text-[13.5px] font-semibold text-deep-navy">{d.label}</dt>
                        <dd className={cn("mt-0.5 text-[12.5px]", v ? "text-ink" : "text-ink-muted")}>{v ?? NOT_CONFIGURED[d.kind]}</dd>
                      </div>
                    );
                  })}
                </dl>
                <div className="mt-5 space-y-2">
                  {p.contactSales ? (
                    <Link href="/contact?topic=sales" className={cn(kitOutline, "w-full")}>Contact Sales</Link>
                  ) : (
                    <Link href={link({ billing: period, plan: p.id })} scroll={false} className={cn(p.recommended ? kitPrimary : kitOutline, "w-full")}>View Plan</Link>
                  )}
                  {isPlatformAdmin && (
                    <FormDialog
                      title={`Configure ${p.name}`}
                      label="Configure"
                      className="w-full text-center text-[12px] font-semibold text-ink-soft hover:text-[#0B5CFF]"
                      action={configurePlan}
                      submitLabel="Save configuration"
                      note={`Monthly price (${fmtMoney(p.price)}) follows the Stripe price and is not edited here. Limits: a whole number, "unlimited", "none", or blank for not configured.`}
                      fields={[
                        { name: "planId", kind: "hidden", value: p.id },
                        { name: "annualPrice", label: "Annual price (USD)", kind: "number", defaultValue: p.annualPrice?.toString() ?? "", placeholder: "Not configured" },
                        { name: "sortOrder", label: "Display order", kind: "number", defaultValue: String(p.sortOrder) },
                        { name: "recommended", label: "Recommended plan", kind: "checkbox", defaultChecked: p.recommended },
                        { name: "contactSales", label: "Sold through sales (Contact Sales)", kind: "checkbox", defaultChecked: p.contactSales },
                        ...PLAN_DIMENSIONS.map((d) => {
                          const e = p.entitlements.find((x) => x.featureKey === d.key);
                          return { name: `limit.${d.key}`, label: `${d.label} (${d.unit})`, kind: "text" as const, placeholder: "Not configured", defaultValue: !e ? "" : !e.enabled ? "none" : e.limitValue == null ? "unlimited" : String(e.limitValue) };
                        }),
                      ]}
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selected && (
        <section id="plan-detail" className="mt-6 rounded-xl border border-line bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-bold text-deep-navy">{selected.name}</h2>
              <p className="mt-1 text-[13px] text-ink-soft">
                {selected.price === 0 ? "Free" : `${fmtMoney(selected.price)} per month`}
                {selected.annualPrice != null && ` · ${fmtMoney(selected.annualPrice)} per year`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {data?.currentPlanId === selected.id ? (
                <Pill tone="green">Your current plan</Pill>
              ) : period === "annual" && selected.price > 0 ? (
                <Link href="/contact?topic=sales" className={kitOutline}>Contact Sales for annual billing</Link>
              ) : isOwner ? (
                <UpgradeDialog plans={[{ id: selected.id, name: selected.name, price: selected.price, features: selected.features }]} currentPlanId={data?.currentPlanId ?? undefined} trigger={<button type="button" className={kitPrimary}>{data?.currentPlanId ? `Switch to ${selected.name}` : `Choose ${selected.name}`}</button>} />
              ) : (
                <span className="text-[12.5px] text-ink-soft">Only a workspace owner can change the plan.</span>
              )}
              <Link href={link({ billing: period })} scroll={false} className={kitOutline}>Close</Link>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-[14px] font-semibold text-deep-navy">Included capabilities</h3>
              {selected.features.length ? (
                <ul className="mt-2 space-y-1.5">
                  {selected.features.map((f) => <li key={f} className="flex items-start gap-2 text-[13px] text-ink"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{f}</li>)}
                </ul>
              ) : (
                <p className="mt-2 text-[13px] text-ink-muted">No capabilities are listed for this plan yet.</p>
              )}
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-deep-navy">Limits and allowances</h3>
              <dl className="mt-2 divide-y divide-line">
                {PLAN_DIMENSIONS.map((d) => (
                  <div key={d.key} className="flex justify-between gap-3 py-2 text-[13px]">
                    <dt className="text-deep-navy">{d.label}</dt>
                    <dd className="text-right text-ink-soft">{dimensionValue(d.key, selected.entitlements) ?? "Not configured"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          {!selected.stripe && selected.price > 0 && <p className="mt-4 text-[12.5px] text-ink-soft">Online checkout is not connected for this plan yet; changing to it may require contacting sales.</p>}
        </section>
      )}

      <section className="mt-6 rounded-xl border border-line bg-bg-soft/60 px-5 py-5">
        <h2 className="text-[14px] font-semibold text-deep-navy">Plan selection should always reflect live billing configuration and entitlement rules.</h2>
        <p className="mt-1.5 text-[12.5px] text-ink-soft">
          Upgrade and downgrade behavior, proration, feature access, and usage limits are calculated from the configured subscription system rather than hard-coded in the interface.
          {period === "annual" && !anyAnnual && " No plan has annual pricing configured yet."}
        </p>
      </section>
    </div>
  );
}
