import { cn } from "@/lib/utils";

type Tone = "violet" | "pink" | "green" | "blue" | "orange" | "indigo" | "amber" | "teal" | "gray" | "red";

const toneMap: Record<Tone, string> = {
  violet: "bg-violet/10 text-violet",
  pink: "bg-pink-brand/10 text-pink-brand",
  green: "bg-emerald-500/10 text-emerald-600",
  blue: "bg-blue-500/10 text-blue-600",
  orange: "bg-orange-brand/10 text-orange-brand",
  indigo: "bg-indigo-500/10 text-indigo-600",
  amber: "bg-amber-500/10 text-amber-700",
  teal: "bg-teal-500/10 text-teal-600",
  gray: "bg-ink/10 text-ink-soft",
  red: "bg-red-500/10 text-red-600",
};

export function StatusPill({ tone = "gray", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
        toneMap[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({ name, size = 32, className }: { name: string; size?: number; className?: string }) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet to-orange-brand font-bold text-white", className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

export function CompanyIcon({ name, size = 28, className }: { name: string; size?: number; className?: string }) {
  const c = name.charAt(0).toUpperCase();
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-md bg-violet/10 font-bold text-violet", className)}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {c}
    </div>
  );
}
