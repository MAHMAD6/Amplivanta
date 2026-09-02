"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export type SuperFilter = { key: string; label: string; options: string[] };

/**
 * Search + filter controls. Everything writes to the URL query string so the
 * server component re-queries — these are real controls, not decoration.
 */
export function SuperFilterBar({
  searchPlaceholder = "Search...",
  filters = [],
}: {
  searchPlaceholder?: string;
  filters?: SuperFilter[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <label className="flex h-12 min-w-[260px] flex-1 items-center gap-2.5 rounded-xl border border-line bg-white px-4">
        <Search className="h-4 w-4 shrink-0 text-ink-muted" />
        <input
          type="search"
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => setParam("q", e.currentTarget.value)}
          placeholder={searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-[13.5px] placeholder:text-ink-muted focus:outline-none"
        />
      </label>

      <button
        type="button"
        className="inline-flex h-12 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13.5px] font-semibold text-admin-navy hover:bg-bg-soft"
      >
        <SlidersHorizontal className="h-4 w-4" /> Filters
      </button>

      {filters.map((f) => (
        <select
          key={f.key}
          defaultValue={params.get(f.key) ?? ""}
          onChange={(e) => setParam(f.key, e.currentTarget.value)}
          aria-label={f.label}
          className="h-12 rounded-xl border border-line bg-white px-4 text-[13.5px] font-semibold text-admin-navy focus:outline-none"
        >
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}

export function SuperPagination({ total, pageSize = 25 }: { total: number; pageSize?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const go = (p: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(Math.min(pages, Math.max(1, p))));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const setSize = (size: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("pageSize", size);
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const btn = "flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-ink-soft transition hover:bg-bg-soft disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
      <span className="text-[13px] text-ink-soft">Rows per page:</span>
      <select
        defaultValue={String(pageSize)}
        onChange={(e) => setSize(e.currentTarget.value)}
        aria-label="Rows per page"
        className="h-10 rounded-lg border border-line bg-white px-3 text-[13px] font-semibold text-admin-navy focus:outline-none"
      >
        {["10", "25", "50", "100"].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1.5">
        <button type="button" className={btn} onClick={() => go(1)} disabled={page <= 1} aria-label="First page">
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button type="button" className={btn} onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className={cn(btn, "border-royal-blue bg-royal-blue font-bold text-white")}>{page}</span>
        <button type="button" className={btn} onClick={() => go(page + 1)} disabled={page >= pages} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
        <button type="button" className={btn} onClick={() => go(pages)} disabled={page >= pages} aria-label="Last page">
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
