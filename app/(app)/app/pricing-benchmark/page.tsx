import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Lock, ServerCrash } from "lucide-react";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { cn } from "@/lib/utils";
import { DataTable, EmptyState, Pill, ScreenHeader, fmtDate, fmtDateTime, fmtMoney, kitField, kitOutline, kitPrimary } from "@/components/amplivanta/screen-kit";
import { FormDialog, type FieldSpec } from "@/components/amplivanta/creative-ui";
import { BenchmarkNotesForm, DeleteBenchmarkButton } from "@/components/amplivanta/pricing-benchmark-ui";
import { BENCHMARK_INTERVALS, BENCHMARK_ROLES, COMPARISON_DIMENSIONS, positionPlans } from "@/lib/pricing-benchmark";
import { addBenchmark, updateBenchmark } from "./actions";

export const metadata: Metadata = { title: "Pricing Benchmark & Positioning" };
export const dynamic = "force-dynamic";

const BASE = "/app/pricing-benchmark";
const crumbs: [string, string?][] = [["Settings", "/app/settings"], ["Internal Pricing"], ["Benchmark & Positioning"]];

type SP = { set?: string; asOf?: string; dimension?: string; currency?: string };

type Row = { id: string; benchmarkSet: string; competitor: string; planName: string; price: number; currency: string; interval: string; dimensions: string | null; effectiveDate: Date | null; notes: string | null; sourceUrl: string | null; capturedAt: Date; updatedAt: Date };

function benchmarkFields(r?: Row, defaultSet?: string): FieldSpec[] {
  return [
    ...(r ? [{ name: "id", kind: "hidden" as const, value: r.id }] : []),
    { name: "benchmarkSet", label: "Benchmark set", kind: "text", required: true, defaultValue: r?.benchmarkSet ?? defaultSet ?? "Default", placeholder: "e.g. 2026 CRM & marketing suites" },
    { name: "competitor", label: "Benchmark / Source", kind: "text", required: true, defaultValue: r?.competitor, placeholder: "Company or product name" },
    { name: "planName", label: "Plan / Tier", kind: "text", required: true, defaultValue: r?.planName },
    { name: "price", label: "Price", kind: "number", required: true, defaultValue: r?.price.toString() },
    { name: "currency", label: "Currency", kind: "text", required: true, defaultValue: r?.currency ?? "USD", placeholder: "USD" },
    { name: "interval", label: "Billing interval", kind: "select", required: true, options: BENCHMARK_INTERVALS, defaultValue: r?.interval ?? "month" },
    { name: "dimensions", label: "Value dimensions", kind: "text", defaultValue: r?.dimensions ?? "", placeholder: "e.g. 5 users, 10k contacts, AI credits" },
    { name: "effectiveDate", label: "Effective date", kind: "date", defaultValue: r?.effectiveDate?.toISOString().slice(0, 10) },
    { name: "sourceUrl", label: "Source link", kind: "text", defaultValue: r?.sourceUrl ?? "", placeholder: "https://…" },
    { name: "notes", label: "Notes", kind: "textarea", rows: 3, defaultValue: r?.notes ?? "", placeholder: "Required when there is no source link" },
  ];
}

export default async function PricingBenchmarkPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  let ctx: { role: string; userId: string } | null = null;
  try {
    ctx = await getSessionContext();
  } catch {
    ctx = null;
  }

  // Internal screen: authorization is enforced here, not by hiding the nav item.
  if (!ctx || !BENCHMARK_ROLES.includes(ctx.role)) {
    return (
      <div className="mx-auto max-w-[1600px]">
        <ScreenHeader crumbs={crumbs} title="Pricing Benchmark & Positioning" />
        <section className="rounded-xl border border-line bg-white p-5">
          <EmptyState icon={Lock} title="Internal — authorized roles only" body="Pricing benchmarks are an internal workspace. Your role does not include access to it." />
        </section>
      </div>
    );
  }

  const asOf = sp.asOf && /^\d{4}-\d{2}-\d{2}$/.test(sp.asOf) ? sp.asOf : "";
  const dimension = COMPARISON_DIMENSIONS.some(([v]) => v === sp.dimension) ? sp.dimension! : "capabilities";

  let data: null | { sets: string[]; currencies: string[]; rows: Row[]; assumptions: string; setUpdated: Date | null; plans: { name: string; price: number }[]; lastChange: { action: string; createdAt: Date; actor: string | null } | null; total: number } = null;
  try {
    const [setRows, currencyRows, total] = await Promise.all([
      db.pricingBenchmark.findMany({ distinct: ["benchmarkSet"], select: { benchmarkSet: true }, orderBy: { benchmarkSet: "asc" } }),
      db.pricingBenchmark.findMany({ distinct: ["currency"], select: { currency: true }, orderBy: { currency: "asc" } }),
      db.pricingBenchmark.count(),
    ]);
    const sets = setRows.map((s) => s.benchmarkSet);
    const set = sp.set && sets.includes(sp.set) ? sp.set : sets[0] ?? "Default";
    const currencies = currencyRows.map((c) => c.currency);
    const currency = sp.currency && currencies.includes(sp.currency) ? sp.currency : "";
    const asOfDate = asOf ? new Date(`${asOf}T23:59:59Z`) : null;
    const [rows, notes, plans, lastChange] = await Promise.all([
      db.pricingBenchmark.findMany({
        where: { benchmarkSet: set, ...(currency ? { currency } : {}), ...(asOfDate ? { OR: [{ effectiveDate: null }, { effectiveDate: { lte: asOfDate } }] } : {}) },
        orderBy: [{ competitor: "asc" }, { price: "asc" }],
        take: 500,
      }),
      db.pricingBenchmarkSet.findUnique({ where: { name: set } }),
      db.plan.findMany({ select: { name: true, price: true }, orderBy: [{ sortOrder: "asc" }, { price: "asc" }] }),
      db.platformAuditLog.findFirst({ where: { resourceType: "PricingBenchmark" }, orderBy: { createdAt: "desc" }, select: { action: true, createdAt: true, actor: { select: { name: true, email: true } } } }),
    ]);
    data = {
      sets,
      currencies,
      rows,
      assumptions: notes?.assumptions ?? "",
      setUpdated: notes?.updatedAt ?? null,
      plans,
      total,
      lastChange: lastChange ? { action: lastChange.action.replace("pricing_benchmark.", "").replace(/_/g, " "), createdAt: lastChange.createdAt, actor: lastChange.actor?.name || lastChange.actor?.email || null } : null,
    };
  } catch {
    data = null;
  }

  const set = data ? (sp.set && data.sets.includes(sp.set) ? sp.set : data.sets[0] ?? "Default") : "Default";
  const currency = data && sp.currency && data.currencies.includes(sp.currency) ? sp.currency : "";
  const positionCurrency = currency || (data?.rows.some((r) => r.currency === "USD") ? "USD" : data?.rows[0]?.currency ?? "USD");
  const positions = data ? positionPlans(data.plans, data.rows, positionCurrency) : [];
  const exportQs = new URLSearchParams({ set, ...(currency ? { currency } : {}), ...(asOf ? { asOf } : {}) });

  const columns = dimension === "price" ? ["Benchmark / Source", "Plan / Tier", "Price", "Effective Date", "Notes", ""] : ["Benchmark / Source", "Plan / Tier", "Price", "Value Dimensions", "Effective Date", "Notes", ""];
  const tableRows = (data?.rows ?? []).map((r) => {
    const source = r.sourceUrl ? <a key="s" href={r.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="hover:text-[#0B5CFF] hover:underline">{r.competitor}</a> : r.competitor;
    const price = `${fmtMoney(r.price, r.currency)} ${BENCHMARK_INTERVALS.find(([v]) => v === r.interval)?.[1].toLowerCase() ?? ""}`;
    const actions = (
      <div key="a" className="flex items-center justify-end gap-3">
        <FormDialog title="Edit Benchmark" label="Edit" className="text-[12px] font-semibold text-[#0B5CFF] hover:underline" action={updateBenchmark} submitLabel="Save changes" fields={benchmarkFields(r)} />
        <DeleteBenchmarkButton id={r.id} label={`${r.competitor} ${r.planName}`} />
      </div>
    );
    const notes = <span key="n" className="line-clamp-2 max-w-[260px]" title={r.notes ?? undefined}>{r.notes ?? "—"}</span>;
    return dimension === "price" ? [source, r.planName, price, fmtDate(r.effectiveDate), notes, actions] : [source, r.planName, price, r.dimensions ?? "—", fmtDate(r.effectiveDate), notes, actions];
  });

  return (
    <div className="mx-auto max-w-[1600px]">
      <ScreenHeader
        crumbs={crumbs}
        title="Pricing Benchmark & Positioning"
        subtitle="Internal workspace for reviewing maintained pricing benchmarks and positioning assumptions."
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-md border border-orange-cta bg-orange-50 px-6 py-2 text-[12px] font-semibold text-orange-700">Internal — Authorized Roles Only</span>
        <div className="flex flex-wrap gap-2.5">
          <FormDialog title="Add Benchmark" label="Add Benchmark" className={cn(kitPrimary, "min-w-[180px]")} action={addBenchmark} submitLabel="Add benchmark" fields={benchmarkFields(undefined, data?.sets.length ? set : "Default")} note="Benchmarks are maintained records. Keep the source link or a note on where the price came from." />
          {data && data.rows.length > 0 ? (
            <a href={`/api/pricing-benchmarks/export?${exportQs}`} className={cn(kitOutline, "min-w-[180px]")}>Export</a>
          ) : (
            <button type="button" disabled className={cn(kitOutline, "min-w-[180px] text-ink-muted")} title="Export becomes available once benchmark data exists.">Export</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
        <section className="h-fit rounded-xl border border-line bg-white p-5">
          <h2 className="mb-4 text-[17px] font-semibold text-deep-navy">Benchmark Controls</h2>
          <form method="get" action={BASE} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-deep-navy">Benchmark Set</span>
              {data && data.sets.length > 0 ? (
                <select name="set" defaultValue={set} className={kitField}>{data.sets.map((s) => <option key={s} value={s}>{s}</option>)}</select>
              ) : (
                <select disabled className={kitField}><option>Not configured</option></select>
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-deep-navy">Effective Date</span>
              <input type="date" name="asOf" defaultValue={asOf} className={kitField} aria-describedby="asof-hint" />
              <span id="asof-hint" className="mt-1 block text-[11.5px] text-ink-muted">{asOf ? "Showing benchmarks effective on or before this date." : "Not selected — all effective dates are shown."}</span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-deep-navy">Comparison Dimension</span>
              <select name="dimension" defaultValue={dimension} className={kitField}>{COMPARISON_DIMENSIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-deep-navy">Currency</span>
              <select name="currency" defaultValue={currency} className={kitField}>
                <option value="">Use benchmark source</option>
                {(data?.currencies ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <div className="flex gap-2.5">
              <button type="submit" className={cn(kitPrimary, "flex-1")}>Apply</button>
              <Link href={BASE} className={kitOutline}>Reset</Link>
            </div>
          </form>
          <div className="mt-6 border-t border-line pt-5">
            <BenchmarkNotesForm set={set} assumptions={data?.assumptions ?? ""} disabled={!data} />
            {data?.setUpdated && <p className="mt-2 text-[11.5px] text-ink-muted">Notes for “{set}” last saved {fmtDateTime(data.setUpdated)}.</p>}
          </div>
        </section>

        <div className="min-w-0 space-y-6">
          <section className="rounded-xl border border-line bg-white p-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[17px] font-semibold text-deep-navy">Benchmark Dataset</h2>
              {data && data.rows.length > 0 && <span className="text-[12.5px] text-ink-soft">{data.rows.length} in “{set}”{currency ? ` · ${currency}` : ""}{asOf ? ` · as of ${asOf}` : ""}</span>}
            </div>
            {data === null ? (
              <EmptyState icon={ServerCrash} tone="orange" title="Benchmark data unavailable" body="The platform database could not be reached, so benchmarks cannot be shown right now." />
            ) : (
              <DataTable
                columns={columns}
                rows={tableRows}
                minWidth={880}
                empty={
                  <div className="py-10">
                    <EmptyState
                      icon={BarChart3}
                      title={data.total === 0 ? "No benchmark data loaded" : "No benchmarks match these controls"}
                      body={data.total === 0 ? "External comparison inputs will appear only after an authorized user adds maintained benchmark data." : "Change the effective date or currency, or choose another benchmark set."}
                    />
                  </div>
                }
              />
            )}
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <section className="rounded-xl border border-line bg-white p-5">
              <h2 className="text-[17px] font-semibold text-deep-navy">Amplivanta Positioning</h2>
              {positions.length === 0 || positions.every((p) => p.label === "No comparison") ? (
                <div className="py-8 text-center">
                  <div className="text-[16px] font-semibold text-deep-navy">No positioning comparison yet</div>
                  <p className="mt-1.5 text-[12.5px] text-ink-soft">{data?.plans.some((p) => p.price > 0) ? "Plan/value comparisons appear when benchmark inputs exist." : "Plan/value comparisons appear when paid plans and benchmark inputs exist."}</p>
                </div>
              ) : (
                <>
                  <p className="mt-1 text-[12.5px] text-ink-soft">Monthly equivalents in {positionCurrency} against {positions[0].compared} benchmark price{positions[0].compared === 1 ? "" : "s"} (median {fmtMoney(positions[0].median, positionCurrency)}). Within ±10% of the median counts as at market.</p>
                  <ul className="mt-3 divide-y divide-line">
                    {positions.map((p) => (
                      <li key={p.plan} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                        <div>
                          <div className="font-semibold text-deep-navy">{p.plan} · {fmtMoney(p.monthly)}/mo</div>
                          <div className="text-[11.5px] text-ink-soft">Lower than {p.cheaperThan} of {p.compared} benchmark prices</div>
                        </div>
                        <Pill tone={p.label === "Above market" ? "amber" : p.label === "Below market" ? "blue" : "green"}>{p.label}</Pill>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11.5px] text-ink-muted">Price position only. Capabilities are compared using the value dimensions recorded on each benchmark.</p>
                </>
              )}
            </section>
            <section className="rounded-xl border border-line bg-white p-5">
              <h2 className="text-[17px] font-semibold text-deep-navy">Data Governance</h2>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">Benchmark records should retain source attribution, assumptions, effective dates, and update history. External pricing inputs must be maintainable without code changes.</p>
              <ul className="mt-4 space-y-1.5 text-[12.5px] text-ink">
                <li>Every benchmark needs a source link or a note on its origin.</li>
                <li>Adds, edits, removals and exports are recorded in the platform audit log.</li>
                <li>Bulk CSV import is available in Admin → Plans &amp; Pricing.</li>
              </ul>
              {data?.lastChange && <p className="mt-4 rounded-md bg-bg-soft px-3 py-2 text-[12px] text-ink-soft">Last change: {data.lastChange.action}{data.lastChange.actor ? ` by ${data.lastChange.actor}` : ""}, {fmtDateTime(data.lastChange.createdAt)}.</p>}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
