import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE_SHORT } from "@/lib/constants";
import { LogoMark } from "./LogoMark";

export function Logo({
  dark = false,
  tagline = false,
  className,
}: {
  dark?: boolean;
  tagline?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label={`${SITE_SHORT} home`}>
      <LogoMark className="h-8 w-8" />
      <div className="flex flex-col">
        <span
          className={cn(
            "font-display text-xl font-bold tracking-tight leading-tight",
            dark ? "text-white" : "text-[#14121f]"
          )}
        >
          {SITE_SHORT}
        </span>
        {tagline && (
          <span className={cn("text-[9px] font-semibold uppercase tracking-[0.2em]", dark ? "text-white/50" : "text-ink-muted")}>
            Engineering Growth
          </span>
        )}
      </div>
    </Link>
  );
}
