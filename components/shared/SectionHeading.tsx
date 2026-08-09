import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  highlight?: string;
  after?: string;
  subtitle?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}

export function SectionHeading({
  title,
  highlight,
  after,
  subtitle,
  align = "left",
  dark = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        align === "center" ? "text-center mx-auto" : "text-left",
        "max-w-3xl",
        align === "center" && "max-w-3xl mx-auto",
        className
      )}
    >
      <h2
        className={cn(
          "font-display text-4xl md:text-5xl font-bold leading-tight tracking-tight",
          dark ? "text-white" : "text-[#0A0A0A]"
        )}
      >
        {title}
        {highlight && <span className="text-[#B5FF2D]"> {highlight}</span>}
        {after && <span>{" "}{after}</span>}
      </h2>
      {subtitle && (
        <p className={cn("mt-4 text-lg", dark ? "text-white/70" : "text-[#5A5A5A]")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
