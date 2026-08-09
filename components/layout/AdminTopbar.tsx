"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

function titleFromPath(path: string): string {
  if (path === "/admin") return "Dashboard";
  const seg = path.split("/").filter(Boolean);
  const last = seg[seg.length - 1];
  if (last === "new") return `New ${seg[seg.length - 2] ?? ""}`.trim();
  return (seg[1] ?? "Admin").replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function AdminTopbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E3E3E3] bg-white px-6">
      <h1 className="font-display text-lg font-bold capitalize text-[#0A0A0A]">
        {titleFromPath(pathname)}
      </h1>
      <div className="flex items-center gap-4">
        <button aria-label="Notifications" className="text-[#5A5A5A] hover:text-[#0A0A0A]">
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
