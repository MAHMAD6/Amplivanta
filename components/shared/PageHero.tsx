import { cn } from "@/lib/utils";
import { SectionLabel } from "./SectionLabel";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  dark?: boolean;
}

export function PageHero({ eyebrow, title, highlight, description, dark = false }: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden px-4 pt-36 pb-20 sm:px-6 lg:px-8",
        dark ? "bg-[#1A3C2B]" : "bg-[#F4F4F4]"
      )}
    >
      <div className="mx-auto max-w-4xl text-center">
        <SectionLabel label={eyebrow} variant={dark ? "dark" : "lime"} />
        <h1
          className={cn(
            "mt-5 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl",
            dark ? "text-white" : "text-[#0A0A0A]"
          )}
        >
          {title}
          {highlight && <span className="text-[#B5FF2D]"> {highlight}</span>}
        </h1>
        {description && (
          <p className={cn("mx-auto mt-5 max-w-2xl text-lg", dark ? "text-white/70" : "text-[#5A5A5A]")}>
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
