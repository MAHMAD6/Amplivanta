import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Section primitives for the public marketing pages, rebuilt in Tailwind from
 * the approved design reference. Every page composes these rather than
 * repeating raw utility strings, so the sections stay visually consistent.
 */

export function Crumb({ items }: { items: string[] }) {
  return <div className="mb-3 text-[14px] text-[#70809E]">{items.join(" / ")}</div>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-[13px] font-extrabold tracking-[2px] text-site-purple sm:text-[14px]">
      {children}
    </div>
  );
}

/** Hero: copy on the left, an illustrative panel on the right. */
export function Hero({
  eyebrow,
  title,
  lead,
  actions,
  aside,
  size = "md",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  /** The reference uses a slightly larger hero on Platform/Solutions/Industries. */
  size?: "md" | "lg";
}) {
  return (
    <section
      className={cn(
        "grid grid-cols-1 items-center gap-8 lg:gap-12",
        aside && "lg:grid-cols-[1.08fr_0.92fr]",
      )}
    >
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1
          className={cn(
            "m-0 mb-4 font-extrabold leading-[1.05] tracking-[-1.5px] text-site-ink",
            size === "lg"
              ? "text-[34px] sm:text-[46px] lg:text-[58px]"
              : "text-[32px] sm:text-[40px] lg:text-[48px]",
          )}
        >
          {title}
        </h1>
        {lead && (
          <p className="m-0 mb-6 max-w-[1000px] text-[16px] leading-[1.55] text-site-muted sm:text-[18px]">
            {lead}
          </p>
        )}
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
      {aside}
    </section>
  );
}

/** The gradient panel used beside a hero. */
export function HeroVisual({ title, items }: { title: string; items: string[] }) {
  return (
    <aside className="relative overflow-hidden rounded-[24px] border border-[#DEE5F4] bg-gradient-to-br from-[#F8FAFF] to-[#F1EEFF] p-[26px] shadow-[0_16px_42px_rgba(40,54,100,0.08)]">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-[110px] -top-[130px] h-[330px] w-[330px] rounded-full bg-[radial-gradient(circle,rgba(91,55,242,0.18),rgba(91,55,242,0)_70%)]"
      />
      <div className="relative mb-3.5 text-[19px] font-extrabold text-site-ink">{title}</div>
      <div className="relative grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex min-h-[58px] items-center gap-2.5 rounded-xl border border-[#E2E7F2] bg-white px-3.5 py-3 text-[14px] font-bold text-site-ink"
          >
            <span
              aria-hidden
              className="h-6 w-6 shrink-0 rounded-lg bg-gradient-to-br from-site-blue to-site-purple-2 shadow-[inset_0_0_0_7px_rgba(255,255,255,0.84)]"
            />
            {item}
          </div>
        ))}
      </div>
    </aside>
  );
}

export function Section({
  title,
  lead,
  action,
  children,
  className,
}: {
  title?: string;
  lead?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-8", className)}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-6">
          <div>
            {title && (
              <h2 className="m-0 mb-1.5 text-[24px] font-extrabold tracking-[-0.5px] text-site-ink sm:text-[30px]">
                {title}
              </h2>
            )}
            {lead && <p className="m-0 text-[14px] text-site-muted">{lead}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function CardGrid({ cols = 4, children }: { cols?: 2 | 3 | 4; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3.5 sm:grid-cols-2",
        cols === 3 && "lg:grid-cols-3",
        cols === 4 && "lg:grid-cols-4",
      )}
    >
      {children}
    </div>
  );
}

export function Card({
  icon,
  title,
  children,
  link,
}: {
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  link?: { label: string; href: string };
}) {
  return (
    <article className="min-h-[150px] rounded-2xl border border-site-line bg-white p-5">
      {icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#EEF1FF] to-[#F8ECFF] text-[15px] font-black text-site-purple">
          {icon}
        </div>
      )}
      <h3 className="m-0 mb-2 text-[17px] font-extrabold text-site-ink">{title}</h3>
      {children && <p className="m-0 text-[13.2px] leading-[1.5] text-site-muted">{children}</p>}
      {link && (
        <Link href={link.href} className="mt-3 block text-[13px] font-bold text-site-purple hover:underline">
          {link.label}
        </Link>
      )}
    </article>
  );
}

export function Panel({
  white,
  children,
  className,
}: {
  white?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "mt-5 rounded-[18px] border border-[#E5E7F5] p-[22px]",
        white ? "bg-white" : "bg-gradient-to-r from-[#F8FAFF] to-[#F4F0FF]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Split({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">{children}</div>;
}

export function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[15px] border border-site-line bg-white p-5">
      <h3 className="m-0 mb-2 text-[18px] font-extrabold text-site-ink">{title}</h3>
      <div className="text-[13.3px] leading-[1.52] text-site-muted [&_li]:mb-1 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-[18px]">
        {children}
      </div>
    </div>
  );
}

/**
 * The reference's neutral state. Used wherever a section has no published
 * records yet — deliberately not filled with sample content.
 */
export function EmptyState({
  icon = "i",
  title,
  children,
  actions,
}: {
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[190px] items-center justify-center rounded-[15px] border border-[#E7EBF3] bg-white p-7 text-center">
      <div>
        <div className="mx-auto mb-2.5 flex h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-[#F0ECFF] text-[24px] font-black text-site-purple">
          {icon}
        </div>
        <h3 className="m-0 mb-2 text-[20px] font-extrabold text-site-ink">{title}</h3>
        {children && (
          <p className="mx-auto m-0 max-w-[720px] text-[13.8px] leading-[1.5] text-site-muted">{children}</p>
        )}
        {actions && <div className="mt-4 flex flex-wrap justify-center gap-2.5">{actions}</div>}
      </div>
    </div>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 rounded-xl border border-[#E7EBF3] bg-white px-4 py-3 text-[12.8px] leading-[1.48] text-[#5F6D83]">
      {children}
    </p>
  );
}

export function Fine({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] leading-[1.45] text-[#6F7B91]">{children}</p>;
}

export function StatusChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-[7px] rounded-full bg-[#F2EFFF] px-3 py-2 text-[12px] font-extrabold text-[#5638E8]">
      <span aria-hidden className="h-2 w-2 rounded-full bg-site-purple-2" />
      {children}
    </span>
  );
}

export function RouteCard({
  title,
  children,
  href,
  cta = "Open",
}: {
  title: string;
  children: React.ReactNode;
  href: string;
  cta?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-5 rounded-[14px] border border-[#E3E8F2] bg-white p-[17px] transition hover:border-site-purple/40"
    >
      <span className="min-w-0">
        <strong className="mb-1 block text-[16px] font-extrabold text-site-ink">{title}</strong>
        <span className="block text-[12.8px] leading-[1.45] text-site-muted">{children}</span>
      </span>
      <span className="whitespace-nowrap font-extrabold text-site-purple">{cta}</span>
    </Link>
  );
}

export function RouteStack({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-2.5">{children}</div>;
}

/* ------------------------------------------------------------------ forms */

export const inputClass =
  "w-full rounded-[10px] border border-[#DCE2EF] bg-white px-3.5 py-3 text-[14px] text-[#52617A] focus:border-site-purple focus:outline-none";

export function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">{children}</div>;
}

export function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-[7px]", full && "sm:col-span-2")}>
      <span className="text-[13px] font-bold text-[#30405F]">{label}</span>
      {children}
    </label>
  );
}
