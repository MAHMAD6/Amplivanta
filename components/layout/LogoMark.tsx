import { cn } from "@/lib/utils";

/**
 * Amplivanta icon mark — custom 'A' shape with ascending data bars and sweeping upward arrow,
 * rendered in pure white (#FFFFFF) for a sleek, high-contrast monochrome design.
 */
export function LogoMark({
  className,
  variant = "badge",
}: {
  className?: string;
  /** "badge" = dark rounded badge container with white icon; "flat" = transparent bg with white icon */
  variant?: "badge" | "flat";
}) {
  return (
    <svg
      viewBox="0 0 800 800"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Amplivanta"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="amp-mark-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6D3BF5" />
          <stop offset="55%" stopColor="#C43BE0" />
          <stop offset="100%" stopColor="#F5731A" />
        </linearGradient>
      </defs>

      {/* Brand gradient container for badge variant */}
      {variant === "badge" && (
        <rect width="100%" height="100%" rx="160" fill="url(#amp-mark-grad)" />
      )}

      {/* Background Layer: The inverted 'V' creating the main structure of the 'A' */}
      <path
        d="M 120 640 L 360 140 L 440 140 L 680 640 L 590 640 L 400 245 L 210 640 Z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="12"
        strokeLinejoin="round"
      />

      {/* Foreground Layer: Data Bars and Upward Arrow Swoosh */}
      <g
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinejoin="round"
      >
        {/* Leftmost Bar (Shortest) */}
        <path d="M 270 548 Q 270 540 278 540 L 308 540 Q 316 540 316 548 L 316 640 L 270 640 Z" />

        {/* Middle Bar */}
        <path d="M 328 458 Q 328 450 336 450 L 366 450 Q 374 450 374 458 L 374 640 L 328 640 Z" />

        {/* Rightmost Bar continuously morphing into the sweeping arrow */}
        <path d="M 386 640 L 386 358 Q 386 350 394 350 L 424 350 Q 432 350 432 358 L 432 500 A 280 280 0 0 0 660 270 L 640 250 L 750 215 L 715 325 L 695 305 A 330 330 0 0 1 386 640 Z" />
      </g>
    </svg>
  );
}

