import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE_SHORT } from "@/lib/constants";
import { LogoMark } from "./LogoMark";

export function Logo({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label={`${SITE_SHORT} home`}>
      <LogoMark className="h-8 w-8" />
      <span
        className={cn(
          "font-display text-xl font-bold tracking-tight",
          dark ? "text-white" : "text-[#14121f]"
        )}
      >
        {SITE_SHORT}
      </span>
    </Link>
  );
}
