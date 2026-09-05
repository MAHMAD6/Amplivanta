import { LineChart } from "lucide-react";

/**
 * Stands in for a chart whose series has no connected production source.
 * Deliberately draws no line: an invented trend is worse than no trend.
 */
export function ChartPlaceholder({
  title = "No data yet",
  description = "This chart appears once its data source is connected.",
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-bg-soft px-6 py-12 text-center ${className ?? ""}`}>
      <LineChart className="h-8 w-8 text-ink-muted/50" />
      <div className="mt-3 text-[14px] font-bold text-ink">{title}</div>
      <p className="mt-1 max-w-[320px] text-[12.5px] text-ink-soft">{description}</p>
    </div>
  );
}
