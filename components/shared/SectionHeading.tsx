import { cn } from "@/lib/utils";
import { Eyebrow } from "./Eyebrow";
import { Highlight } from "./Highlight";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  after?: string;
  subtitle?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
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
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <div className={cn("mb-4", align === "center" && "flex justify-center")}>
          <Eyebrow label={eyebrow} align={align} />
        </div>
      )}
      <h2
        className={cn(
          "font-display text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl",
          dark ? "text-white" : "text-[#14121f]"
        )}
      >
        {title}
        {highlight &&
          (dark ? (
            <span className="text-gradient"> {highlight}</span>
          ) : (
            <>
              {" "}
              <Highlight>{highlight}</Highlight>
            </>
          ))}
        {after && <span> {after}</span>}
      </h2>
      {subtitle && (
        <p className={cn("mt-4 text-lg", dark ? "text-white/70" : "text-[#767287]")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
