import type { Metadata } from "next";
import { Plus, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { SocialSubnav } from "@/components/amplivanta/social-subnav";
import { PlatformIcon } from "@/components/amplivanta/platform-badge";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { POSTS, STATUS_TONE, PLATFORM_META } from "@/lib/social-data";

export const metadata: Metadata = { title: "Content Calendar — Amplivanta" };

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const dates: number[] = Array.from({ length: 35 }, (_, i) => ((i - 4 + 31) % 31) + 1);
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Content Calendar"
        subtitle="Visual planning of scheduled, draft and published social content."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30"><Filter className="h-3.5 w-3.5" /> Filters</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Plus className="h-3.5 w-3.5" /> New Post</button>
          </>
        }
      />
      <SocialSubnav />

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-line p-1.5 text-ink-muted hover:bg-bg-soft"><ChevronLeft className="h-4 w-4" /></button>
            <div className="text-[15px] font-bold text-ink">August 2026</div>
            <button className="rounded-lg border border-line p-1.5 text-ink-muted hover:bg-bg-soft"><ChevronRight className="h-4 w-4" /></button>
            <button className="ml-2 rounded-lg border border-line px-2.5 py-1.5 text-[11.5px] font-semibold">Today</button>
          </div>
          <div className="flex gap-1">
            {["Month", "Week", "Day", "List"].map((v, i) => (
              <button key={v} className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold ${i === 0 ? "bg-violet/10 text-violet" : "text-ink-soft hover:bg-bg-soft"}`}>{v}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 border-t border-line">
          {DAYS.map((d) => (
            <div key={d} className="border-b border-r border-line bg-bg-soft/40 p-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted last:border-r-0">{d}</div>
          ))}
          {dates.map((date, i) => {
            const posts = POSTS.slice(i % POSTS.length, (i % POSTS.length) + (i % 4 === 0 ? 2 : i % 3 === 0 ? 1 : 0));
            const isCurrent = date === 15;
            return (
              <div key={i} className={`min-h-[110px] border-b border-r border-line p-2 last:border-r-0 ${isCurrent ? "bg-violet/[0.03]" : ""}`}>
                <div className={`mb-1 text-[11px] font-bold ${isCurrent ? "text-violet" : "text-ink-muted"}`}>
                  {isCurrent ? <span className="rounded-full bg-violet px-1.5 py-0.5 text-white">{date}</span> : date}
                </div>
                <div className="space-y-1">
                  {posts.map((p) => (
                    <div key={p.id} className="flex items-center gap-1 rounded bg-white px-1.5 py-1 text-[10px] shadow-sm">
                      <PlatformIcon platform={p.platform} size={12} />
                      <span className="min-w-0 truncate text-[9.5px] font-semibold text-ink">{p.content.slice(0, 20)}…</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-ink-muted">
          {[
            { c: "bg-emerald-500", l: "Published" },
            { c: "bg-blue-500", l: "Scheduled" },
            { c: "bg-violet", l: "Draft" },
            { c: "bg-amber-500", l: "Pending Approval" },
            { c: "bg-red-500", l: "Failed" },
          ].map((x) => (
            <span key={x.l} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${x.c}`} />{x.l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
