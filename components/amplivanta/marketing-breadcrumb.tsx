import Link from "next/link";
import { ChevronRight } from "lucide-react";

/** Breadcrumb for marketing pages. Items are [label, href|null] — null = current page. */
export function MarketingBreadcrumb({ items }: { items: [string, string | null][] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-muted">
      {items.map(([label, href], i) => (
        <span key={label} className="flex items-center gap-1.5">
          {href ? <Link href={href} className="transition hover:text-royal-blue">{label}</Link> : <span className="font-semibold text-deep-navy">{label}</span>}
          {i < items.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
        </span>
      ))}
    </nav>
  );
}
