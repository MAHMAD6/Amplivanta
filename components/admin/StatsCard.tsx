import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  change?: string;
  variant?: "default" | "warning" | "success";
}

export function StatsCard({ title, value, icon: Icon, change, variant = "default" }: StatsCardProps) {
  const iconBg: Record<string, string> = {
    default: "bg-[#B5FF2D] text-black",
    warning: "bg-amber-100 text-amber-700",
    success: "bg-green-100 text-green-700",
  };

  return (
    <div className="rounded-2xl border border-[#E3E3E3] bg-white p-6">
      <div className="flex items-center justify-between">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-full", iconBg[variant])}>
          <Icon className="h-5 w-5" />
        </span>
        {change && <span className="text-xs text-[#9A9A9A]">{change}</span>}
      </div>
      <p className="mt-4 font-mono text-3xl font-bold text-[#0A0A0A]">{value}</p>
      <p className="mt-1 text-sm text-[#5A5A5A]">{title}</p>
    </div>
  );
}
