import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState, Pill, kitPrimary } from "@/components/amplivanta/screen-kit";
import type { ResourceEntry } from "@/lib/server/resources-hub";

export const resourceCrumbs = (page?: string): [string, string?][] => (page ? [["Resources", "/app/resources"], [page]] : [["Resources"], ["Resources Hub"]]);

export function ResourceSearch({ action, q, placeholder, children }: { action: string; q?: string; placeholder: string; children?: React.ReactNode }) {
  return (
    <form method="get" action={action} role="search" className="mb-5 flex flex-wrap gap-2.5 rounded-xl border border-line bg-white p-4">
      <label className="relative min-w-[220px] flex-1">
        <span className="sr-only">Search</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input name="q" defaultValue={q} placeholder={placeholder} className="h-11 w-full rounded-md border border-line pl-9 pr-3 text-[13.5px] text-deep-navy focus:border-[#0B5CFF] focus:outline-none" />
      </label>
      {children}
      <button type="submit" className={kitPrimary}>Search</button>
    </form>
  );
}

const TYPE_TONE = { Article: "blue", Help: "violet", Video: "amber", Webinar: "green", Template: "gray" } as const;

export function ResourceList({ entries, empty }: { entries: ResourceEntry[]; empty: { icon: LucideIcon; title: string; body: string; action?: React.ReactNode } }) {
  if (!entries.length) return <EmptyState icon={empty.icon} title={empty.title} body={empty.body} action={empty.action} />;
  return (
    <ul className="divide-y divide-line">
      {entries.map((e) => (
        <li key={e.href} className="py-4">
          <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-ink-muted">
            <Pill tone={TYPE_TONE[e.type]}>{e.type}</Pill>
            {e.topic && <span>{e.topic}</span>}
            {e.date && <span>· {e.date}</span>}
          </div>
          <Link href={e.href} {...(e.href.startsWith("/app/") ? {} : { target: "_blank", rel: "noopener" })} className="group mt-1.5 inline-flex items-start gap-1 text-[15px] font-semibold text-deep-navy hover:text-[#0B5CFF]">
            {e.title} {!e.href.startsWith("/app/") && <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-ink-muted group-hover:text-[#0B5CFF]" aria-label="Opens in a new tab" />}
          </Link>
          <p className="mt-0.5 text-[13px] text-ink-soft">{e.summary}</p>
        </li>
      ))}
    </ul>
  );
}

export function TopicChips({ base, topics, active, q }: { base: string; topics: string[]; active?: string; q?: string }) {
  const href = (t?: string) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (t) u.set("topic", t);
    return u.size ? `${base}?${u}` : base;
  };
  return (
    <nav aria-label="Topics" className="mb-4 flex flex-wrap gap-2">
      {[undefined, ...topics].map((t) => (
        <Link key={t ?? "all"} href={href(t)} className={cn("rounded-full border px-3.5 py-1.5 text-[12.5px]", active === t ? "border-[#0B5CFF] bg-royal-tint font-semibold text-[#0B5CFF]" : "border-line bg-white text-ink-soft hover:text-deep-navy")}>
          {t ?? "All topics"}
        </Link>
      ))}
    </nav>
  );
}
