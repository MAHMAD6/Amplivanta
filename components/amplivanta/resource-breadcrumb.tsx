import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function ResourceBreadcrumb({ current }: { current: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-3 flex items-center gap-1.5 text-[12.5px] text-ink-muted"
    >
      <Link href="/app/resources/blog" className="hover:text-ink">
        Resources
      </Link>
      <ChevronRight className="h-3.5 w-3.5" />
      <span className="font-semibold text-ink">{current}</span>
    </nav>
  );
}

/** Right-rail card shell shared by every Resources page. */
export function RailCard({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-line bg-white p-5 shadow-card ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h2 className="text-[14px] font-bold text-ink">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
