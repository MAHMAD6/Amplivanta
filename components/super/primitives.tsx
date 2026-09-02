import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** Row of page-level actions (Export / Import / primary CTA). */
export function SuperActionBar({ children }: { children: React.ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-center justify-end gap-2.5">{children}</div>;
}

export function SuperButton({
  children,
  href,
  variant = "secondary",
  icon: Icon,
  disabled,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  icon?: LucideIcon;
  disabled?: boolean;
}) {
  const cls = cn(
    "inline-flex h-11 items-center gap-2 rounded-xl px-4 text-[13.5px] font-bold transition",
    variant === "primary" && "bg-royal-blue text-white hover:bg-royal-soft",
    variant === "secondary" && "border border-line bg-white text-admin-navy hover:bg-bg-soft",
    variant === "ghost" && "text-ink-soft hover:bg-bg-soft",
    disabled && "cursor-not-allowed opacity-45",
  );
  const inner = (
    <>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </>
  );
  if (href && !disabled) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} disabled={disabled}>
      {inner}
    </button>
  );
}

/** Card wrapper matching the approved table/panel treatment. */
export function SuperCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-white shadow-card", className)}>{children}</div>
  );
}

export function SuperCardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
      <div>
        <h2 className="text-[16px] font-bold text-admin-navy">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Centered empty state used wherever production data is not yet connected. */
export function SuperEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <span className="flex h-[104px] w-[104px] items-center justify-center rounded-full border border-line bg-bg-soft">
        <Icon className="h-10 w-10 text-royal-blue/45" />
      </span>
      <h3 className="mt-7 text-[21px] font-extrabold text-admin-navy">{title}</h3>
      <p className="mt-2 max-w-[440px] text-[13.5px] leading-relaxed text-ink-soft">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/**
 * Table shell. Renders the approved column header row and, when there are no
 * rows, the production-safe empty state instead of fabricated placeholder data.
 */
export function SuperTable({
  columns,
  rows,
  empty,
}: {
  columns: string[];
  rows?: React.ReactNode;
  empty: React.ReactNode;
}) {
  return (
    <SuperCard>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-line">
              {columns.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="whitespace-nowrap px-6 py-4 text-left text-[13px] font-bold text-admin-navy"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          {rows && <tbody>{rows}</tbody>}
        </table>
      </div>
      {!rows && empty}
    </SuperCard>
  );
}

/** Footer note card ("About <page>") from the approved designs. */
export function SuperInfoNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 flex gap-3.5 rounded-2xl border border-line bg-bg-soft px-6 py-5">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-royal-blue" />
      <div>
        <div className="text-[13.5px] font-bold text-admin-navy">{title}</div>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{children}</p>
      </div>
    </div>
  );
}

/**
 * Status tile. `value` is intentionally optional — when a metric has no
 * connected production source it renders "No data available" rather than a
 * fabricated number.
 */
export function SuperStatCard({
  icon: Icon,
  label,
  value,
  tone = "neutral",
  href,
}: {
  icon: LucideIcon;
  label: string;
  value?: string | null;
  tone?: "neutral" | "positive" | "warning";
  href?: string;
}) {
  const body = (
    <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-white px-5 py-4 shadow-card transition hover:border-royal-blue/40">
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
          tone === "positive" && "bg-emerald-50 text-emerald-600",
          tone === "warning" && "bg-orange-cta/10 text-orange-cta",
          tone === "neutral" && "bg-royal-tint text-royal-blue",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="text-[13px] font-bold text-admin-navy">{label}</div>
        <div className={cn("text-[12.5px]", value ? "font-semibold text-ink" : "text-ink-muted")}>
          {value ?? "No data available"}
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

/** Key/value row used on detail and overview panels. */
export function SuperDataRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: LucideIcon;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3.5 last:border-0">
      <div className="flex items-center gap-2.5 text-[13.5px] font-semibold text-admin-navy">
        {Icon && <Icon className="h-4 w-4 text-ink-muted" />}
        {label}
      </div>
      <div className={cn("text-[13px]", value ? "font-semibold text-ink" : "text-ink-muted")}>
        {value ?? "No data available"}
      </div>
    </div>
  );
}
