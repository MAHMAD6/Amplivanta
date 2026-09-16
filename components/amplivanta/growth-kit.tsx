import Link from "next/link";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** Growth Intelligence layout pieces from the September 2026 designs. */

export const giPanel = "min-w-0 rounded-xl border border-line bg-white p-5";

export function PanelTitle({ children, hint, action }: { children: React.ReactNode; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 className="flex items-center gap-1.5 text-[16px] font-semibold text-deep-navy">
        {children}
        {hint && <Info className="h-3.5 w-3.5 text-ink-muted" aria-label={hint}><title>{hint}</title></Info>}
      </h2>
      {action}
    </div>
  );
}

/** Title / figure / caption cards; a null value renders the design's dash. */
export function MetricCards({ items, cols = 4 }: { items: { label: string; value: string | null; caption: string; hint?: string }[]; cols?: 4 | 5 }) {
  return (
    <div className={cn("mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2", cols === 4 ? "xl:grid-cols-4" : "lg:grid-cols-3 xl:grid-cols-5")}>
      {items.map((m) => (
        <div key={m.label} className="min-h-[122px] rounded-xl border border-line bg-white p-5">
          <PanelTitle hint={m.hint}>{m.label}</PanelTitle>
          <div className="mt-1 text-[24px] font-bold leading-tight text-deep-navy">{m.value ?? "—"}</div>
          <div className="mt-2 text-[12px] text-ink-muted">{m.caption}</div>
        </div>
      ))}
    </div>
  );
}

/** GET filter row: search box plus selects, applied on submit or change. */
export function FilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <form method="get" className={cn("mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-2", className)}>
      {children}
      <button type="submit" className="h-9 rounded-md border border-line px-4 text-[12.5px] font-semibold text-deep-navy hover:bg-bg-soft">Apply</button>
    </form>
  );
}

export const filterSelect = "h-9 rounded-md border border-line bg-white px-2.5 text-[12.5px] text-deep-navy focus:border-[#0B5CFF] focus:outline-none";
export const filterSearch = "h-9 min-w-[200px] flex-1 rounded-md border border-line bg-white px-3 text-[12.5px] text-deep-navy placeholder:text-ink-muted focus:border-[#0B5CFF] focus:outline-none";

export function Select({ name, value, all, options, label }: { name: string; value?: string; all: string; options: [string, string][]; label: string }) {
  return (
    <select name={name} defaultValue={value ?? ""} aria-label={label} className={cn(filterSelect, "w-full sm:w-[170px]")}>
      <option value="">{all}</option>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

/** Bordered label/value rows (Action Handoffs, Content Actions, Export & Sharing). */
export function RowList({ rows }: { rows: { label: string; value: React.ReactNode; href?: string }[] }) {
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label}>
          {r.href ? (
            <Link href={r.href} className="flex items-center justify-between gap-3 rounded-md border border-line bg-bg-soft/40 px-3 py-2.5 text-[12.5px] hover:border-[#0B5CFF]/40">
              <span className="font-semibold text-deep-navy">{r.label}</span>
              <span className="text-ink-soft">{r.value}</span>
            </Link>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-bg-soft/40 px-3 py-2.5 text-[12.5px]">
              <span className="font-semibold text-deep-navy">{r.label}</span>
              <span className="text-ink-soft">{r.value}</span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export function Chips({ items }: { items: { label: string; href?: string; active?: boolean; count?: number }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((c) =>
        c.href ? (
          <Link key={c.label} href={c.href} className={cn("rounded-full border px-3 py-1 text-[11.5px]", c.active ? "border-[#0B5CFF] bg-royal-tint font-semibold text-[#0B5CFF]" : "border-line bg-bg-soft/60 text-ink-soft hover:text-deep-navy")}>
            {c.label}{c.count != null ? ` · ${c.count}` : ""}
          </Link>
        ) : (
          <span key={c.label} className="rounded-full border border-line bg-bg-soft/60 px-3 py-1 text-[11.5px] text-ink-soft">{c.label}</span>
        ),
      )}
    </div>
  );
}

export function Progress({ value }: { value: number }) {
  const v = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-bg-soft" role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full", v >= 100 ? "bg-emerald-500" : "bg-[#0B5CFF]")} style={{ width: `${v}%` }} />
    </div>
  );
}

export const outlineSm = "inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-4 text-[12.5px] font-semibold text-[#0B5CFF] hover:border-[#0B5CFF]/40 disabled:opacity-50";
export const primarySm = "inline-flex h-9 items-center justify-center rounded-md bg-[#0B5CFF] px-4 text-[12.5px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50";
export const headerPrimary = "inline-flex h-10 items-center justify-center rounded-md bg-[#0B5CFF] px-5 text-[13px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50";
export const headerOutline = "inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-5 text-[13px] font-semibold text-[#0B5CFF] hover:border-[#0B5CFF]/40 disabled:opacity-50";
