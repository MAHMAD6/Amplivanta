import Link from "next/link";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { PlatformBadge } from "@/components/app/PlatformBadge";
import { AVAILABLE_TASKS } from "@/lib/app-data";

export default function AvailableTasksPage() {
  return (
    <div className="flex flex-col pb-6">
      <AppHeader
        title="Available Tasks"
        right={
          <button className="text-[#14121f]" aria-label="Filter">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        }
      />

      <div className="px-5 pt-2">
        {/* search */}
        <div className="flex items-center gap-2 rounded-full border border-[#e9e7f0] bg-white px-4 py-3 shadow-sm">
          <Search className="h-4 w-4 text-[#a8a4b8]" />
          <input
            placeholder="Search task"
            className="flex-1 bg-transparent text-sm text-[#14121f] outline-none placeholder:text-[#a8a4b8]"
          />
        </div>

        {/* filter pill */}
        <button className="bg-grad-brand-2 mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white">
          Task <ChevronDown className="h-4 w-4" />
        </button>

        {/* list */}
        <ul className="mt-4 space-y-2.5">
          {AVAILABLE_TASKS.map((t) => (
            <li key={t.id}>
              <Link
                href={`/app/tasks/${t.id}`}
                className="flex items-center gap-3 rounded-full bg-[#f8f7fb] px-3 py-2.5 shadow-[0_6px_16px_-10px_rgba(30,20,60,0.4)] transition hover:bg-[#f2f0f9]"
              >
                <PlatformBadge platform={t.platform} size="sm" />
                <span className="flex-1 text-sm font-semibold text-[#14121f]">{t.title}</span>
                <span className="text-xs text-[#767287]">
                  Earn : <span className="font-bold text-[#6D3BF5]">${t.earn.toFixed(2)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
