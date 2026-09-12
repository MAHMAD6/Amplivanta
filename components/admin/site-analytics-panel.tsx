import { Database } from "lucide-react";
import { SuperCard, SuperEmptyState } from "./primitives";

export type SiteEventRow = { name: string; path: string; count: number };

/**
 * Public-site event counts. Anonymous daily totals per event and path — no
 * visitor identity is collected, so this is a volume view, not a profile.
 */
export function SiteAnalyticsPanel({
  rows,
  days,
  connected,
}: {
  rows: SiteEventRow[];
  days: number;
  connected: boolean;
}) {
  if (!connected) {
    return (
      <SuperCard>
        <SuperEmptyState
          icon={Database}
          title="Data source unavailable"
          description="The platform database could not be reached, so public-site events cannot be shown."
        />
      </SuperCard>
    );
  }

  const byEvent = new Map<string, number>();
  for (const r of rows) byEvent.set(r.name, (byEvent.get(r.name) ?? 0) + r.count);
  const totals = [...byEvent.entries()].sort((a, b) => b[1] - a[1]);
  const topPages = rows
    .filter((r) => r.name === "page_view" && r.path)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  if (rows.length === 0) {
    return (
      <SuperCard>
        <SuperEmptyState
          icon={Database}
          title="No public-site events yet"
          description="Page views and CTA clicks on the public site appear here once visitors arrive."
        />
      </SuperCard>
    );
  }

  return (
    <>
      <SuperCard className="mb-4">
        <div className="border-b border-line px-6 py-4 text-[14px] font-bold text-admin-navy">
          Public site — last {days} days
        </div>
        <div className="divide-y divide-line">
          {totals.map(([name, count]) => (
            <div key={name} className="flex items-center justify-between px-6 py-3">
              <span className="text-[13.5px] text-ink-soft">{name.replace(/_/g, " ")}</span>
              <span className="text-[14px] font-bold text-admin-navy">{count.toLocaleString("en-US")}</span>
            </div>
          ))}
        </div>
      </SuperCard>

      {topPages.length > 0 && (
        <SuperCard>
          <div className="border-b border-line px-6 py-4 text-[14px] font-bold text-admin-navy">Most viewed pages</div>
          <div className="divide-y divide-line">
            {topPages.map((r) => (
              <div key={r.path} className="flex items-center justify-between gap-4 px-6 py-3">
                <span className="truncate text-[13px] text-ink-soft">{r.path}</span>
                <span className="text-[14px] font-bold text-admin-navy">{r.count.toLocaleString("en-US")}</span>
              </div>
            ))}
          </div>
        </SuperCard>
      )}
    </>
  );
}
