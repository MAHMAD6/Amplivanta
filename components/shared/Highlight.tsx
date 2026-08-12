import { cn } from "@/lib/utils";

/**
 * Amplivanta emphasis: the highlighted words render in the brand gradient
 * (violet → magenta → orange), matching the `.grad` treatment in the reference
 * design. box-decoration-break keeps the clip clean across wrapped lines.
 */
export function Highlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-gradient [box-decoration-break:clone] [-webkit-box-decoration-break:clone]",
        className
      )}
    >
      {children}
    </span>
  );
}
