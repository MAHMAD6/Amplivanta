import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Tone = "violet" | "pink" | "green" | "blue" | "orange" | "indigo" | "amber" | "teal" | "red" | "gray";

const toneMap: Record<Tone, string> = {
  violet: "bg-violet/10 text-violet",
  pink: "bg-pink-brand/10 text-pink-brand",
  green: "bg-emerald-500/10 text-emerald-600",
  blue: "bg-blue-500/10 text-blue-600",
  orange: "bg-orange-brand/10 text-orange-brand",
  indigo: "bg-indigo-500/10 text-indigo-600",
  amber: "bg-amber-500/10 text-amber-600",
  teal: "bg-teal-500/10 text-teal-600",
  red: "bg-red-500/10 text-red-600",
  gray: "bg-ink/10 text-ink-soft",
};

export interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  /** Null when no production source is connected - renders an honest empty state. */
  value: string | null;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  tone?: Tone;
  className?: string;
}

export function KpiCard({ icon: Icon, label, value, delta, deltaTone = "up", tone = "violet", className }: KpiCardProps) {
  return (
    <div className={cn("rounded-2xl border border-line bg-white p-5 shadow-card", className)}>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[12px] font-medium text-ink-muted">{label}</div>
          <div
            className={cn(
              "mt-0.5 leading-none",
              value ? "text-[22px] font-extrabold text-ink" : "text-[13px] font-medium text-ink-muted",
            )}
          >
            {value ?? "No data yet"}
          </div>
          {value && delta && (
            <div
              className={cn(
                "mt-1 text-[11px] font-semibold",
                deltaTone === "up" && "text-emerald-600",
                deltaTone === "down" && "text-red-500",
                deltaTone === "neutral" && "text-ink-muted"
              )}
            >
              {deltaTone === "up" ? "↑" : deltaTone === "down" ? "↓" : "·"} {delta}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
