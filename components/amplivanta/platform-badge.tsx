import { PLATFORM_META, type Platform } from "@/lib/social-data";
import { cn } from "@/lib/utils";

export function PlatformIcon({ platform, size = 24, className }: { platform: Platform; size?: number; className?: string }) {
  const meta = PLATFORM_META[platform];
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-md font-bold text-white", className)}
      style={{ width: size, height: size, background: meta.color, fontSize: size * 0.42 }}
      aria-label={meta.label}
    >
      {meta.short}
    </div>
  );
}
