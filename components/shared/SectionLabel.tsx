import { cn } from "@/lib/utils";

interface SectionLabelProps {
  label: string;
  variant?: "light" | "dark" | "lime";
  className?: string;
}

export function SectionLabel({ label, variant = "light", className }: SectionLabelProps) {
  const styles: Record<string, string> = {
    light: "bg-[#F4F4F4] text-[#0A0A0A]",
    lime: "bg-[#B5FF2D] text-black",
    dark: "text-[#B5FF2D] bg-transparent px-0",
  };

  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest",
        styles[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
