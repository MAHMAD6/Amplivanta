import { cn } from "@/lib/utils";

/**
 * Amplivanta eyebrow: a pill with a small gradient "dot badge" (sparkle) and
 * violet label text. Mirrors `.eyebrow` in the reference design.
 */
export function Eyebrow({
  label,
  className,
  align = "left",
}: {
  label: string;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[#e3d9fb] bg-[#faf7ff] px-3 py-[7px] pl-[10px] text-[12.5px] font-bold uppercase tracking-[0.02em] text-[#6D3BF5]",
        align === "center" && "mx-auto",
        className
      )}
    >
      <span className="bg-grad-brand-2 flex h-4 w-4 items-center justify-center rounded-full">
        <svg viewBox="0 0 24 24" className="h-[9px] w-[9px] fill-white">
          <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
        </svg>
      </span>
      {label}
    </span>
  );
}
