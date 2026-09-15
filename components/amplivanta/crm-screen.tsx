import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ChevronRight, Clock, Diamond, Search, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared CRM screen, rebuilt from the corrected 2508×1411 CRM references:
 * breadcrumb + title, Connect Integrations and a primary action, four figure
 * cards, the main record table with search and filters, two rail cards and an
 * insights card. Every value is passed in from production data; anything
 * without a source renders "Not available yet" rather than a placeholder.
 */

export type CrmStat = { label: string; value: string | null; hint?: string };
export type CrmRailRow = [label: string, value: string | null];
export type CrmSelect = { name: string; label: string; value: string; options: [value: string, label: string][] };

const STAT_ICONS: LucideIcon[] = [Diamond, Clock, ArrowUpRight, Target];

export const crmPrimaryBtn =
  "inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-[#0B5CFF] px-5 text-[14px] font-bold text-white transition hover:bg-[#0A4FDB]";

export function CrmScreen({
  crumb,
  title,
  subtitle,
  primaryAction,
  stats,
  table,
  rail,
  insights,
}: {
  crumb: string;
  title: string;
  subtitle: string;
  primaryAction: React.ReactNode;
  stats: CrmStat[];
  table: {
    title: string;
    action: string;
    q: string;
    selects: CrmSelect[];
    columns: string[];
    rows: React.ReactNode[][];
    reachable: boolean;
    empty: { title: string; body: string; action: React.ReactNode };
  };
  rail: [
    { title: string; rows: CrmRailRow[]; manage?: { href: string; label?: string } },
    { title: string; rows: CrmRailRow[] },
  ];
  insights: { title: string; body?: string | null };
}) {
  const na = (v: string | null) => (v == null ? "—" : v);
  return (
    <div className="mx-auto max-w-[1680px]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-[#0B5CFF]">
            <Link href="/app/crm" className="hover:underline">CRM</Link>
            <ChevronRight className="h-3.5 w-3.5 text-ink-muted" />
            <span>{crumb}</span>
          </nav>
          <h1 className="mt-1 font-display text-[32px] font-extrabold leading-tight text-deep-navy">{title}</h1>
          <p className="mt-0.5 text-[14.5px] text-ink-soft">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/app/integrations"
            className="inline-flex h-11 items-center rounded-lg border border-line bg-white px-5 text-[14px] font-bold text-deep-navy transition hover:bg-bg-soft"
          >
            Connect Integrations
          </Link>
          {primaryAction}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = STAT_ICONS[i] ?? Diamond;
          return (
            <div key={s.label} className="rounded-xl border border-line bg-white p-4">
              <div className="flex items-center gap-2.5 text-[14px] text-deep-navy">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-royal-tint text-[#0B5CFF]">
                  <Icon className="h-4 w-4" />
                </span>
                {s.label}
              </div>
              <div className={cn("mt-4 text-[22px] font-extrabold leading-none", s.value == null ? "text-deep-navy" : "text-deep-navy")}>
                {s.value ?? "—"}
              </div>
              <div className="mt-2 text-[12.5px] text-ink-muted">{s.value == null ? "Not available yet" : (s.hint ?? "")}</div>
            </div>
          );
        })}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="min-w-0 rounded-xl border border-line bg-white">
          <div className="flex items-baseline gap-2.5 border-b border-line px-4 py-4">
            <h2 className="text-[17px] font-bold text-deep-navy">{table.title}</h2>
            <span className="text-[12.5px] text-ink-muted">Production-backed CRM data only</span>
          </div>
          <form method="get" action={table.action} className="flex flex-wrap items-center gap-2.5 px-4 py-3.5">
            <label className="relative w-full max-w-[330px]">
              <span className="sr-only">Search</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
              <input
                name="q"
                defaultValue={table.q}
                placeholder="Search..."
                className="h-10 w-full rounded-lg border border-line bg-white pl-8 pr-3 text-[13px] focus:border-[#0B5CFF] focus:outline-none"
              />
            </label>
            {table.selects.map((s) => (
              <label key={s.name}>
                <span className="sr-only">{s.label}</span>
                <select
                  name={s.name}
                  defaultValue={s.value}
                  className="h-10 rounded-lg border border-line bg-white px-3 text-[13px] text-ink-soft focus:border-[#0B5CFF] focus:outline-none"
                >
                  <option value="">{s.label}</option>
                  {s.options.map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </label>
            ))}
            <button type="submit" className="h-10 rounded-lg border border-line bg-white px-4 text-[13px] font-semibold text-deep-navy hover:bg-bg-soft">
              Apply
            </button>
          </form>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="bg-bg-soft/80 text-[12.5px] font-bold text-deep-navy">
                  {table.columns.map((c) => (
                    <th key={c} className="px-4 py-3.5">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((cells, r) => (
                  <tr key={r} className="border-t border-line text-[13px] text-ink-soft">
                    {cells.map((cell, c) => (
                      <td key={c} className={cn("px-4 py-3", c === 0 && "font-semibold text-deep-navy")}>{cell ?? "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {table.rows.length === 0 && (
            <div className="flex flex-col items-center px-6 pb-10 pt-9 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-royal-tint">
                <Diamond className="h-6 w-6 text-[#0B5CFF]/80" />
              </span>
              <h3 className="mt-4 text-[20px] font-bold text-deep-navy">
                {table.reachable ? table.empty.title : "CRM data unavailable"}
              </h3>
              <p className="mt-1 max-w-[440px] text-[13.5px] text-ink-soft">
                {table.reachable ? table.empty.body : "The database could not be reached, so these records cannot be shown right now."}
              </p>
              {table.reachable && <div className="mt-5">{table.empty.action}</div>}
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <div className="rounded-xl border border-line bg-white p-4">
            <h2 className="text-[16px] font-bold text-deep-navy">{rail[0].title}</h2>
            <p className="mt-2 text-[13px] text-ink-soft">Views and saved configurations will appear here when available.</p>
            <dl className="mt-3 divide-y divide-line border-t border-line">
              {rail[0].rows.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-3 text-[13px]">
                  <dt className="text-deep-navy">{k}</dt>
                  <dd className="m-0 text-ink-soft">{na(v)}</dd>
                </div>
              ))}
            </dl>
            {rail[0].manage ? (
              <Link href={rail[0].manage.href} className="mt-2 inline-flex h-10 items-center rounded-lg border border-line px-4 text-[13.5px] font-bold text-deep-navy hover:bg-bg-soft">
                {rail[0].manage.label ?? "Manage"}
              </Link>
            ) : (
              <button type="button" disabled title="Saved views are not available yet" className="mt-2 inline-flex h-10 cursor-not-allowed items-center rounded-lg border border-line px-4 text-[13.5px] font-bold text-deep-navy opacity-60">
                Manage
              </button>
            )}
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <h2 className="text-[16px] font-bold text-deep-navy">{rail[1].title}</h2>
            <p className="mt-2 text-[13px] text-ink-soft">Source-driven CRM information will appear here after records are connected.</p>
            <dl className="mt-3 divide-y divide-line border-t border-line">
              {rail[1].rows.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-3 text-[13px]">
                  <dt className="text-deep-navy">{k}</dt>
                  <dd className="m-0 text-ink-soft">{v ?? "Not available"}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>

      <section className="rounded-xl border border-line bg-white px-4 py-4">
        <h2 className="text-[17px] font-bold text-deep-navy">{insights.title}</h2>
        <p className="flex items-center justify-center gap-2.5 py-8 text-[13.5px] text-ink-soft">
          <TrendingUp className="h-4 w-4" />
          {insights.body ?? "No insight data yet. Insights will appear when sufficient CRM data is available."}
        </p>
      </section>
    </div>
  );
}

/** Formats a record date consistently across CRM tables. */
export const crmDate = (d: Date | null | undefined) =>
  d ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d) : null;

export const crmMoney = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

/** Start of a trailing window, for "recent" figures. */
export const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
