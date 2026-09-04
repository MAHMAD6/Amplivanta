import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Info, Lock, PlugZap, ShieldAlert, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccessDenial } from "@/lib/server/marketplace-access";

export function MpHeader({
  title,
  description,
  action,
  breadcrumb,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}) {
  return (
    <div className="mb-7">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-muted">
          {breadcrumb.map((b, i) => (
            <span key={b.label} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>›</span>}
              {b.href ? (
                <Link href={b.href} className="hover:text-royal-blue">
                  {b.label}
                </Link>
              ) : (
                <span className="text-ink-soft">{b.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[27px] font-extrabold leading-tight text-deep-navy">{title}</h1>
          {description && <p className="mt-1 text-[13.5px] text-ink-soft">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function MpCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-line bg-white shadow-card", className)}>{children}</div>;
}

/**
 * Metric tile. `value` is optional on purpose — with no connected source it
 * renders the approved em-dash plus "No data yet" rather than a made-up number.
 */
export function MpStat({ label, value, hint }: { label: string; value?: string | null; hint?: string }) {
  return (
    <MpCard className="px-5 py-4">
      <div className="text-[13px] font-bold text-deep-navy">{label}</div>
      <div className={cn("mt-2 text-[24px] font-extrabold leading-none", value ? "text-deep-navy" : "text-ink-muted")}>
        {value ?? "—"}
      </div>
      <div className="mt-2 text-[12px] text-ink-muted">{value ? hint ?? "" : hint ?? "No data yet"}</div>
    </MpCard>
  );
}

export function MpEmpty({
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
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full border border-line bg-bg-soft">
        <Icon className="h-9 w-9 text-royal-blue/45" />
      </span>
      <h2 className="mt-6 text-[19px] font-extrabold text-deep-navy">{title}</h2>
      <p className="mt-2 max-w-[420px] text-[13.5px] leading-relaxed text-ink-soft">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function MpButton({
  children,
  href,
  variant = "secondary",
  icon: Icon,
  disabled,
  title,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  icon?: LucideIcon;
  disabled?: boolean;
  title?: string;
}) {
  const cls = cn(
    "inline-flex h-11 items-center gap-2 rounded-xl px-4 text-[13.5px] font-bold transition",
    variant === "primary" ? "bg-royal-blue text-white hover:bg-royal-soft" : "border border-line bg-white text-deep-navy hover:bg-bg-soft",
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
      <Link href={href} className={cls} title={title}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} disabled={disabled} title={title}>
      {inner}
    </button>
  );
}

export function MpNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 flex gap-3.5 rounded-2xl border border-line bg-bg-soft px-5 py-4">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-royal-blue" />
      <div>
        <div className="text-[13px] font-bold text-deep-navy">{title}</div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{children}</p>
      </div>
    </div>
  );
}

/**
 * Renders the reason a marketplace surface is unavailable. Each state is
 * distinct so an operator can tell a disabled module from a permissions
 * problem from an outage.
 */
export function MpDenied({ denial }: { denial: Exclude<AccessDenial, { ok: true }> }) {
  const map: Record<string, { icon: LucideIcon; title: string; body: string }> = {
    module_disabled: {
      icon: Store,
      title: "Marketplace is not enabled",
      body: "The Marketplace module is currently switched off for this platform. Existing orders, products, licences and payout records are preserved and become visible again when it is re-enabled.",
    },
    unauthenticated: {
      icon: Lock,
      title: "Sign in to continue",
      body: "The Marketplace is available to signed-in accounts.",
    },
    forbidden: {
      icon: ShieldAlert,
      title: "You do not have access to this",
      body: "Your role does not include the permission required for this Marketplace area.",
    },
    not_seller: {
      icon: Store,
      title: "Seller access required",
      body: "This area is available to approved sellers. If you have applied, it unlocks once your application is approved.",
    },
    flag_disabled: {
      icon: PlugZap,
      title: "Not available yet",
      body: "This Marketplace feature is currently turned off for your account.",
    },
    degraded: {
      icon: PlugZap,
      title: "Marketplace is temporarily unavailable",
      body: "The platform database could not be reached, so Marketplace data cannot be shown right now. This is a connection problem, not an empty catalogue.",
    },
  };
  const m = map[denial.reason];
  return (
    <MpCard>
      <MpEmpty icon={m.icon} title={m.title} description={m.body} />
    </MpCard>
  );
}
