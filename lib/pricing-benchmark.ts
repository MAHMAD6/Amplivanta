/** Pure helpers for the internal Pricing Benchmark & Positioning screen. */

export type BenchmarkRow = { competitor: string; planName: string; price: number; currency: string; interval: string };

export const BENCHMARK_INTERVALS: [string, string][] = [
  ["month", "Per month"],
  ["year", "Per year"],
  ["one_time", "One time"],
];

export const COMPARISON_DIMENSIONS: [string, string][] = [
  ["price", "Plan / Price"],
  ["capabilities", "Plan / Price / Capabilities"],
];

/** Monthly equivalent, so monthly and annual benchmarks can be compared. Null for one-time prices. */
export function monthlyEquivalent(price: number, interval: string): number | null {
  if (interval === "month") return price;
  if (interval === "year") return price / 12;
  return null;
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export type Position = {
  plan: string;
  monthly: number;
  compared: number;
  median: number | null;
  cheaperThan: number;
  /** Share of comparable benchmark prices at or above this plan's price, 0–100. */
  percentile: number | null;
  label: "Below market" | "At market" | "Above market" | "No comparison";
};

/**
 * Positions each paid Amplivanta plan against benchmark prices in the same
 * currency, using monthly equivalents. "At market" is within ±10% of the median.
 */
export function positionPlans(plans: { name: string; price: number }[], rows: BenchmarkRow[], currency: string): Position[] {
  const prices = rows
    .filter((r) => r.currency === currency)
    .map((r) => monthlyEquivalent(r.price, r.interval))
    .filter((v): v is number => v != null && v > 0);
  const med = median(prices);
  return plans
    .filter((p) => p.price > 0)
    .map((p) => {
      if (!prices.length || med == null) return { plan: p.name, monthly: p.price, compared: 0, median: null, cheaperThan: 0, percentile: null, label: "No comparison" as const };
      const cheaperThan = prices.filter((v) => v > p.price).length;
      const atOrAbove = prices.filter((v) => v >= p.price).length;
      const ratio = p.price / med;
      return {
        plan: p.name,
        monthly: p.price,
        compared: prices.length,
        median: Math.round(med * 100) / 100,
        cheaperThan,
        percentile: Math.round((atOrAbove / prices.length) * 100),
        label: ratio < 0.9 ? ("Below market" as const) : ratio > 1.1 ? ("Above market" as const) : ("At market" as const),
      };
    });
}

/** RFC 4180 CSV cell. Leading formula characters are neutralised for spreadsheet safety. */
export function csvCell(v: unknown): string {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Platform roles allowed to open and maintain internal pricing benchmarks. */
export const BENCHMARK_ROLES = ["SUPER_ADMIN", "ADMIN", "OWNER"];
