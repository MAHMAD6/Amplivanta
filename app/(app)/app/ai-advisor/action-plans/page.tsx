import type { Metadata } from "next";
import { CheckCircle2, Circle, Plus, User } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { AdvisorTabs } from "@/components/amplivanta/advisor-tabs";
import { AdvisorIcon } from "@/components/amplivanta/advisor-icon";
import { ACTION_PLAN_STATS, ACTION_PLANS } from "@/lib/advisor-data";

export const metadata: Metadata = { title: "Action Plans — Amplivanta" };

export default function ActionPlansPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-violet">AI Advisor</div>
      <PageHeader
        title="Action Plans"
        subtitle="Turn saved insights into structured, trackable plans your team can execute."
        actions={
          <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet px-4 text-[13px] font-semibold text-white transition hover:bg-violet-hover">
            <Plus className="h-4 w-4" /> New Action Plan
          </button>
        }
      />

      <AdvisorTabs />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ACTION_PLAN_STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.tone}`}>
              <AdvisorIcon name={s.icon} className="h-4 w-4" />
            </div>
            <div className="mt-3 text-[24px] font-extrabold text-ink">{s.value}</div>
            <div className="text-[12px] font-semibold text-ink">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Plan cards */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {ACTION_PLANS.map((p) => {
          const done = p.tasks.filter((t) => t.done).length;
          return (
            <article key={p.id} className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-[15px] font-bold leading-snug text-ink">{p.title}</h2>
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${p.statusTone}`}>{p.status}</span>
              </div>
              <p className="mt-1.5 text-[12.5px] text-ink-soft">{p.goal}</p>

              <div className="mt-3 flex items-center gap-3 text-[11.5px] text-ink-muted">
                <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> {p.owner}</span>
                <span>Due {p.due}</span>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-[11px] text-ink-soft">
                  <span>Progress</span>
                  <span className="font-semibold">{p.progress}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-soft">
                  <div className="h-full rounded-full bg-violet" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              <ul className="mt-4 space-y-2">
                {p.tasks.map((t) => (
                  <li key={t.label} className="flex items-center gap-2 text-[12.5px]">
                    {t.done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-ink-muted" />
                    )}
                    <span className={t.done ? "text-ink-muted line-through" : "text-ink-soft"}>{t.label}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 border-t border-line pt-3 text-[11.5px] font-semibold text-ink-muted">
                {done} / {p.tasks.length} tasks complete
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
