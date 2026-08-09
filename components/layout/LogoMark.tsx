import { cn } from "@/lib/utils";

/**
 * Amplivanta icon mark — a rounded badge holding three ascending "amplify" bars
 * that resolve into an upward arrow, evoking growth and momentum.
 * Scales cleanly from favicon size to hero size.
 */
export function LogoMark({
  className,
  variant = "badge",
}: {
  className?: string;
  /** "badge" = filled dark square with lime bars; "flat" = transparent bg, lime bars */
  variant?: "badge" | "flat";
}) {
  const badge = variant === "badge";
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Amplivanta"
      xmlns="http://www.w3.org/2000/svg"
    >
      {badge && <rect x="0" y="0" width="40" height="40" rx="11" fill="#1A3C2B" />}
      {/* ascending bars */}
      <rect x="9" y="23" width="4.5" height="8" rx="2.25" fill="#B5FF2D" opacity="0.55" />
      <rect x="16" y="18" width="4.5" height="13" rx="2.25" fill="#B5FF2D" opacity="0.8" />
      <rect x="23" y="12" width="4.5" height="19" rx="2.25" fill="#B5FF2D" />
      {/* upward arrow head off the tallest bar */}
      <path
        d="M20 15 L25.25 9 L30.5 15"
        fill="none"
        stroke="#B5FF2D"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
