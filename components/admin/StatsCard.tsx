import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  variant?: "default" | "warning" | "success" | "accent" | "purple";
  href?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  isPositive = true,
  subtitle,
  variant = "default",
}: StatsCardProps) {
  const iconGradients: Record<string, string> = {
    default: "from-[#6D3BF5] to-[#C43BE0] text-white shadow-[#6D3BF5]/20",
    accent: "from-[#14121f] to-[#26233a] text-[#b79bff] shadow-black/20",
    warning: "from-amber-400 to-amber-600 text-white shadow-amber-500/20",
    success: "from-emerald-400 to-emerald-600 text-white shadow-emerald-500/20",
    purple: "from-purple-500 to-indigo-600 text-white shadow-purple-500/20",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#e9e7f0] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#14121f]/20">
      {/* Top row: Icon + Trend */}
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-md transition-transform group-hover:scale-110",
            iconGradients[variant]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        {change && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-bold shadow-xs",
              isPositive
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-800"
            )}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change}
          </span>
        )}
      </div>

      {/* Main Count */}
      <div className="mt-4">
        <p className="font-mono text-3xl font-extrabold text-[#14121f] tracking-tight">{value}</p>
        <p className="mt-1 text-xs font-bold text-[#4a4756] uppercase tracking-wider">{title}</p>
        {subtitle && <p className="mt-0.5 text-[11px] text-[#767287]">{subtitle}</p>}
      </div>

      {/* Decorative Accent Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#6D3BF5] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
