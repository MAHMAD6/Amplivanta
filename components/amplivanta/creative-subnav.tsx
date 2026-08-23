"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Overview", href: "/app/creative-studio" },
  { label: "Images", href: "/app/creative-studio/images" },
  { label: "Graphics", href: "/app/creative-studio/graphics" },
  { label: "Video", href: "/app/creative-studio/video" },
  { label: "Documents", href: "/app/creative-studio/documents" },
  { label: "Brand Kit", href: "/app/creative-studio/brand-kit" },
  { label: "My Projects", href: "/app/creative-studio/projects" },
  { label: "Templates", href: "/app/creative-studio/templates" },
];

export function CreativeSubnav() {
  const pathname = usePathname();
  return (
    <div className="no-scrollbar mb-6 flex gap-1 overflow-x-auto border-b border-line">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "relative shrink-0 px-3.5 py-2.5 text-[13px] font-semibold transition",
              active ? "text-violet" : "text-ink-soft hover:text-ink"
            )}
          >
            {t.label}
            {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-grad-brand" />}
          </Link>
        );
      })}
    </div>
  );
}
