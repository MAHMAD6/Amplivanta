import type { Metadata } from "next";
import { Plus, Filter, Mail, Phone, Calendar as CalIcon, StickyNote, CheckCircle2, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { CrmSubnav } from "@/components/amplivanta/crm-subnav";
import { Avatar, StatusPill } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { type ActivityType } from "@/lib/crm-data";
import { LiveBadge } from "@/components/amplivanta/live-badge";
import { loadActivities } from "@/lib/server/loaders";

export const metadata: Metadata = { title: "CRM Activities — Amplivanta" };
export const dynamic = "force-dynamic";

const TYPE_META: Record<ActivityType, { emoji: string; tone: "violet" | "blue" | "green" | "amber" | "pink" | "teal" }> = {
  email: { emoji: "✉️", tone: "blue" },
  call: { emoji: "📞", tone: "green" },
  meeting: { emoji: "📅", tone: "violet" },
  note: { emoji: "📝", tone: "amber" },
  task: { emoji: "✅", tone: "teal" },
  sms: { emoji: "💬", tone: "pink" },
};

export default async function ActivitiesPage() {
  const { items: activities, live } = await loadActivities();
  return (
    <div className="mx-auto max-w-[1300px]">
      <PageHeader
        title="Activities"
        subtitle="Every call, email, meeting, and note across contacts and deals."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30">
              <Filter className="h-3.5 w-3.5" /> Filters
            </button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
              <Plus className="h-3.5 w-3.5" /> Log Activity
            </button>
          </>
        }
      />
      <CrmSubnav />
      {live && <LiveBadge label={`Live · ${activities.length} activities from database`} />}

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Mail} label="Emails Sent" value="428" delta="18% vs last 30 days" tone="blue" />
        <KpiCard icon={Phone} label="Calls Logged" value="142" delta="9%" tone="green" />
        <KpiCard icon={CalIcon} label="Meetings" value="38" delta="4 upcoming" tone="violet" />
        <KpiCard icon={StickyNote} label="Notes Added" value="256" delta="24%" tone="amber" />
      </div>

      <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[14px] font-bold text-ink">Activity Timeline</div>
          <div className="flex gap-1">
            {["All", "Email", "Call", "Meeting", "Note", "Task"].map((f, i) => (
              <button key={f} className={`rounded-full px-3 py-1 text-[11.5px] font-semibold ${i === 0 ? "bg-violet/10 text-violet" : "text-ink-soft hover:bg-bg-soft"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="relative space-y-5 border-l border-line pl-6">
          {activities.map((a) => {
            const meta = TYPE_META[a.type];
            return (
              <div key={a.id} className="relative">
                <div className="absolute -left-[29px] top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-white text-[14px] shadow">
                  {meta.emoji}
                </div>
                <div className="rounded-xl border border-line bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[13.5px] font-semibold text-ink">{a.title}</div>
                      {a.detail && <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{a.detail}</p>}
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-ink-muted">
                        <Avatar name={a.owner} size={18} />
                        <span>{a.owner}</span>
                        <span>·</span>
                        <span>{a.contact}</span>
                        <span>·</span>
                        <span>{a.when}</span>
                      </div>
                    </div>
                    <StatusPill tone={meta.tone}>{a.type}</StatusPill>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
