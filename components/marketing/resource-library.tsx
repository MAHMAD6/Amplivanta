"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { btn, btnPrimary } from "./site-buttons";
import { Card, CardGrid, EmptyState } from "./site-ui";
import { cn } from "@/lib/utils";

export type LibraryItem = { title: string; summary: string; href: string; topic?: string; date?: string; tag?: string };

export type LibraryConfig = {
  title: string;
  lead: string;
  allTopicsLabel: string;
  sortOptions: string[];
  chips?: string[];
  side: [string, string];
  emptyActions: [string, string][];
};

const selectClass =
  "h-11 rounded-[10px] border border-[#DCE2EF] bg-white px-3 text-[13.5px] text-site-ink focus:border-site-purple focus:outline-none";

/**
 * The reference's listing panel: search, topic and sort controls over the
 * section's published items, with distinct states for "nothing published"
 * and "nothing matches". The hero search and the topic cards drive it through
 * ?q= and ?topic= so both work as plain links.
 */
type LibraryProps = {
  items: LibraryItem[];
  topics: string[];
  config: LibraryConfig;
  empty: [string, string] | null;
};

/** Reads ?q= / ?topic= so the hero search and topic cards can drive it. */
export function ResourceLibrary(props: LibraryProps) {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const topic = params.get("topic") ?? "";
  return <LibraryView key={`${q}|${topic}`} {...props} initialQ={q} initialTopic={topic} />;
}

/**
 * The panel itself. Also rendered as the Suspense fallback so the listing is
 * in the server HTML, not only after hydration.
 */
export function LibraryView({
  items,
  topics,
  config,
  empty,
  initialQ = "",
  initialTopic = "",
}: LibraryProps & { initialQ?: string; initialTopic?: string }) {
  const [q, setQ] = useState(initialQ);
  const [topic, setTopic] = useState(initialTopic);
  const [sort, setSort] = useState(config.sortOptions[0]);
  const [chip, setChip] = useState(config.chips?.[0] ?? "");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = items.filter((i) => {
      if (topic && i.topic !== topic) return false;
      // The first chip is always "all"; the rest match the item's tag.
      if (config.chips && chip !== config.chips[0] && i.tag !== chip) return false;
      if (!needle) return true;
      return `${i.title} ${i.summary} ${i.topic ?? ""}`.toLowerCase().includes(needle);
    });
    if (sort === "A–Z") return [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "Oldest") return [...list].reverse();
    return list; // registries are kept newest-first
  }, [items, q, topic, sort, chip, config.chips]);

  const filtering = Boolean(q.trim() || topic || (config.chips && chip !== config.chips[0]));

  return (
    <section
      id="library"
      className="mt-8 scroll-mt-6 rounded-[18px] border border-[#E5E7F5] bg-gradient-to-r from-[#F8FAFF] to-[#F4F0FF] p-4 sm:p-[22px]"
    >
      <h2 className="m-0 mb-1.5 text-[22px] font-extrabold tracking-[-0.4px] text-site-ink sm:text-[26px]">
        {config.title}
      </h2>
      <p className="m-0 mb-4 text-[13.5px] text-site-muted">{config.lead}</p>

      {config.chips && (
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Quick filters">
          {config.chips.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={chip === c}
              onClick={() => setChip(c)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition",
                chip === c
                  ? "border-site-purple bg-site-purple text-white"
                  : "border-site-line bg-white text-site-ink hover:border-site-purple/40",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[minmax(0,1fr)_180px_160px]">
        <label className="min-w-0">
          <span className="sr-only">Search published content</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            placeholder="Search published content..."
            className="h-11 w-full rounded-[10px] border border-[#DCE2EF] bg-white px-3.5 text-[13.5px] text-site-ink focus:border-site-purple focus:outline-none"
          />
        </label>
        <label>
          <span className="sr-only">Topic</span>
          <select value={topic} onChange={(e) => setTopic(e.currentTarget.value)} className={cn(selectClass, "w-full")}>
            <option value="">{config.allTopicsLabel}</option>
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.currentTarget.value)} className={cn(selectClass, "w-full")}>
            {config.sortOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0" aria-live="polite">
          {results.length > 0 ? (
            <CardGrid cols={2}>
              {results.map((item) => (
                <Card key={item.href} title={item.title} link={{ label: "Open", href: item.href }}>
                  {[item.topic, item.date].filter(Boolean).join(" · ")}
                  {item.topic || item.date ? " — " : ""}
                  {item.summary}
                </Card>
              ))}
            </CardGrid>
          ) : items.length > 0 && filtering ? (
            <EmptyState
              icon="?"
              title="No matching results"
              actions={
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setTopic("");
                    setChip(config.chips?.[0] ?? "");
                  }}
                  className={btn}
                >
                  Clear filters
                </button>
              }
            >
              Nothing published matches that search. Try a different term or topic.
            </EmptyState>
          ) : (
            empty && (
              <EmptyState
                icon="A"
                title={empty[0]}
                actions={config.emptyActions.map(([label, href], i) => (
                  <Link key={href} href={href} className={cn(i === 0 ? btnPrimary : btn, "px-4 py-[11px] text-[13px]")}>
                    {label}
                  </Link>
                ))}
              >
                {empty[1]}
              </EmptyState>
            )
          )}
        </div>

        <aside className="rounded-[15px] border border-site-line bg-white p-5">
          <h3 className="m-0 mb-2 text-[17px] font-extrabold text-site-ink">{config.side[0]}</h3>
          <p className="m-0 text-[13px] leading-[1.5] text-site-muted">{config.side[1]}</p>
          <p className="mt-3 rounded-xl border border-[#E7EBF3] bg-white px-3.5 py-3 text-[12.3px] leading-[1.48] text-[#5F6D83]">
            Content, availability, metadata, authors, dates, views, registrations, downloads, ratings,
            and other operational details must come from production systems or remain hidden until
            available.
          </p>
        </aside>
      </div>
    </section>
  );
}
