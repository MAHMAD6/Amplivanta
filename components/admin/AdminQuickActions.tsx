"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Plus, BookOpen, Layers, Briefcase, Users } from "lucide-react";

export function AdminQuickActions() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = [
    { label: "New Blog Post", href: "/admin/blog/new", icon: BookOpen },
    { label: "New Service", href: "/admin/services/new", icon: Layers },
    { label: "New Case Study", href: "/admin/portfolio/new", icon: Briefcase },
    { label: "New Team Member", href: "/admin/team/new", icon: Users },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-xl bg-[#6D3BF5] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#5B2FE0] shadow-sm"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Create</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-[#e9e7f0] bg-white p-1 text-[#14121f] shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#14121f] transition hover:bg-[#f8f7fb]"
              >
                <Icon className="h-3.5 w-3.5 text-[#4a4756]" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
