import { Youtube, Facebook, Instagram, Linkedin, Send, MessageCircle, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORM_META, type Platform } from "@/lib/app-data";

const ICONS: Record<Platform, typeof Youtube> = {
  youtube: Youtube,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  telegram: Send,
  whatsapp: MessageCircle,
  tiktok: Music2,
};

export function PlatformBadge({
  platform,
  size = "md",
  className,
}: {
  platform: Platform;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = ICONS[platform];
  const { color, label } = PLATFORM_META[platform];
  const dims = size === "sm" ? "h-9 w-9 rounded-xl" : size === "lg" ? "h-14 w-14 rounded-2xl" : "h-11 w-11 rounded-xl";
  const ic = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center text-white shadow-sm", dims, className)}
      style={{ backgroundColor: color }}
      aria-label={label}
    >
      <Icon className={ic} fill={platform === "instagram" || platform === "linkedin" ? "none" : "currentColor"} strokeWidth={platform === "instagram" ? 2 : 1.8} />
    </span>
  );
}
