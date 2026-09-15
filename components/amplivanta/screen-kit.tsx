import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Building blocks of the September 2026 dashboard designs. Every screen is a
 * composition of these, fed by production data; a block without data shows
 * the design's neutral empty state rather than sample figures.
 */

export const kitPrimary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0B5CFF] px-5 text-[13.5px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-60";
export const kitOutline =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-5 text-[13.5px] font-semibold text-deep-navy hover:bg-bg-soft disabled:opacity-60";
export const kitField =
  "h-10 w-full rounded-md border border-line bg-white px-3 text-[13.5px] text-deep-navy placeholder:text-ink-muted focus:border-[#0B5CFF] focus:outline-none";

export type Crumb = [label: string, href?: string];

export function ScreenHeader({
  crumbs,
  title,
  subtitle,
  actions,
}: {
  crumbs?: Crumb[];
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1.5 text-[13.5px] text-ink-soft">
            {crumbs.map(([label, href], i) => (
              <span key={`${label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-muted" />}
                {href ? (
                  <Link href={href} className="hover:text-[#0B5CFF]">{label}</Link>
                ) : (
                  <span className={i === crumbs.length - 1 ? "text-[#0B5CFF]" : undefined}>{label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-display text-[30px] font-bold leading-tight text-deep-navy">{title}</h1>
        {subtitle && <p className="mt-1 text-[14.5px] text-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export type Stat = {
  label: string;
  icon: LucideIcon;
  /** Real figure, or null when there is no source data yet. */
  value: string | null;
  /** Shown under the figure; defaults to "Not available yet" when value is null. */
  hint?: string;
  tone?: Tone;
};

type Tone = "blue" | "green" | "violet" | "orange" | "pink" | "teal";
const TONES: Record<Tone, string> = {
  blue: "bg-royal-tint text-[#3B3FD8]",
  green: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet/10 text-violet",
  orange: "bg-orange-50 text-orange-500",
  pink: "bg-pink-50 text-pink-500",
  teal: "bg-teal-50 text-teal-600",
};

export function StatGrid({ stats, cols }: { stats: Stat[]; cols?: 3 | 4 | 5 | 6 }) {
  const n = cols ?? (stats.length as 3 | 4 | 5 | 6);
  return (
    <div
      className={cn(
        "mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2",
        n === 3 && "xl:grid-cols-3",
        n === 4 && "xl:grid-cols-4",
        n === 5 && "xl:grid-cols-5",
        n === 6 && "lg:grid-cols-3 2xl:grid-cols-6",
      )}
    >
      {stats.map((s) => (
        <div key={s.label} className="flex gap-4 rounded-xl border border-line bg-white px-5 py-5">
          <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", TONES[s.tone ?? "blue"])}>
            <s.icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-deep-navy">{s.label}</div>
            <div className="mt-1.5 text-[21px] font-bold leading-tight text-deep-navy">{s.value ?? "—"}</div>
            <div className="mt-1.5 text-[12px] text-ink-muted">{s.hint ?? (s.value == null ? "Not available yet" : "")}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  className,
  children,
  id,
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("min-w-0 rounded-xl border border-line bg-white p-5", className)}>
      {(title || action) && (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-[16.5px] font-semibold text-deep-navy">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-[12.5px] text-ink-soft">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  tone = "blue",
  compact,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
  tone?: Tone;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "py-6" : "py-10")}>
      <span className={cn("flex h-14 w-14 items-center justify-center rounded-full", TONES[tone])}>
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-[16px] font-semibold text-deep-navy">{title}</h3>
      {body && <p className="mt-1.5 max-w-[440px] text-[13px] text-ink-soft">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export type QuickAction = { label: string; icon: LucideIcon; href: string };

export function QuickActions({ actions, cols = 2 }: { actions: QuickAction[]; cols?: 2 | 3 | 4 }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", cols === 3 && "md:grid-cols-3", cols === 4 && "md:grid-cols-4")}>
      {actions.map((a) => (
        <Link
          key={a.label}
          href={a.href}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-line px-3 py-5 text-center text-[13px] font-semibold text-[#0B5CFF] transition hover:border-[#0B5CFF]/40 hover:bg-royal-tint/40"
        >
          <a.icon className="h-6 w-6" /> {a.label}
        </Link>
      ))}
    </div>
  );
}

/** Label / value rows, e.g. summaries and funnels. */
export function KeyList({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="divide-y divide-line">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between gap-3 py-3 text-[13.5px]">
          <dt className="text-deep-navy">{k}</dt>
          <dd className="m-0 text-right text-ink-soft">{v ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Title + description rows (settings summaries, info lists). */
export function InfoList({ rows }: { rows: { title: string; body: string; href?: string }[] }) {
  return (
    <ul className="divide-y divide-line">
      {rows.map((r) => (
        <li key={r.title} className="py-4">
          {r.href ? (
            <Link href={r.href} className="text-[14px] font-semibold text-deep-navy hover:text-[#0B5CFF]">{r.title}</Link>
          ) : (
            <div className="text-[14px] font-semibold text-deep-navy">{r.title}</div>
          )}
          <div className="mt-0.5 text-[12.5px] text-ink-soft">{r.body}</div>
        </li>
      ))}
    </ul>
  );
}

export function TabBar({ tabs, active, variant = "underline" }: { tabs: [label: string, href: string][]; active: string; variant?: "underline" | "boxed" | "pills" }) {
  return (
    <nav
      aria-label="Sections"
      className={cn(
        "no-scrollbar mb-5 flex gap-1 overflow-x-auto",
        variant === "underline" && "border-b border-line",
        variant === "boxed" && "gap-3 border-b border-line pb-2",
        variant === "pills" && "flex-wrap gap-2.5 rounded-xl border border-line bg-white px-5 py-3",
      )}
    >
      {tabs.map(([label, href]) => {
        const on = href === active;
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "shrink-0 text-[13.5px]",
              variant === "underline" && cn("px-3.5 py-2.5 font-semibold", on ? "-mb-px border-b-2 border-[#0B5CFF] text-[#0B5CFF]" : "text-ink-soft hover:text-deep-navy"),
              variant === "boxed" && cn("rounded-md px-4 py-2 font-semibold", on ? "border border-[#0B5CFF] bg-royal-tint text-[#0B5CFF]" : "text-deep-navy hover:bg-bg-soft"),
              variant === "pills" && cn("rounded-full border px-3.5 py-1.5", on ? "border-[#0B5CFF] bg-royal-tint font-semibold text-[#0B5CFF]" : "border-line bg-bg-soft/60 text-ink-soft hover:text-deep-navy"),
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function FootNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 flex items-center gap-2 text-[12.5px] text-ink-soft">
      <Info className="h-4 w-4 shrink-0 text-ink-muted" /> {children}
    </p>
  );
}

/** Simple data table with the design's header treatment. */
export function DataTable({
  columns,
  rows,
  empty,
  minWidth = 760,
}: {
  columns: string[];
  rows: React.ReactNode[][];
  empty?: React.ReactNode;
  minWidth?: number;
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-line bg-bg-soft/70 text-[12.5px] font-semibold text-deep-navy">
              {columns.map((c) => <th key={c} className="px-4 py-3">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((cells, i) => (
              <tr key={i} className="border-b border-line text-[13px] text-ink-soft last:border-0">
                {cells.map((c, j) => <td key={j} className={cn("px-4 py-3", j === 0 && "font-semibold text-deep-navy")}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && empty}
    </>
  );
}

export function Pill({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "green" | "blue" | "amber" | "red" | "violet" }) {
  const t = {
    gray: "bg-bg-soft text-ink-soft",
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-royal-tint text-[#0B5CFF]",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-600",
    violet: "bg-violet/10 text-violet",
  }[tone];
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold capitalize", t)}>{children}</span>;
}

export const fmtInt = (n: number | null | undefined) => (n == null ? null : n.toLocaleString("en-US"));
export const fmtMoney = (n: number | null | undefined, currency = "USD") =>
  n == null ? null : new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
export const fmtDate = (d: Date | null | undefined) => (d ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d) : "—");
export const fmtDateTime = (d: Date | null | undefined) =>
  d ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(d) : "—";
/** A count as a figure only when there is something to count. */
export const figure = (n: number | null | undefined) => (n ? n.toLocaleString("en-US") : null);
