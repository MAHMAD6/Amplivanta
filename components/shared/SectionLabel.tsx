import { cn } from "@/lib/utils";
import { Eyebrow } from "./Eyebrow";

interface SectionLabelProps {
  label: string;
  variant?: "light" | "dark" | "lime";
  className?: string;
}

/**
 * Section eyebrow. The "light" and "lime" variants render the Amplivanta
 * gradient-dot pill; "dark" (used on dark surfaces) is plain violet-tinted text.
 */
export function SectionLabel({ label, variant = "light", className }: SectionLabelProps) {
  if (variant === "dark") {
    return (
      <span
        className={cn(
          "inline-block text-xs font-bold uppercase tracking-[0.14em] text-[#b79bff]",
          className
        )}
      >
        {label}
      </span>
    );
  }
  return <Eyebrow label={label} className={className} />;
}
