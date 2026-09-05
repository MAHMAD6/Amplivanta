import type { Metadata } from "next";
import { Search, Sparkles, Clock, Zap } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { MarketingSubnav } from "@/components/amplivanta/marketing-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { AUTO_TEMPLATES } from "@/lib/marketing-auto-data";

export const metadata: Metadata = { title: "Automation Templates — Amplivanta" };

const CATS = ["All", "Onboarding", "E-commerce", "PLG", "Retention", "Events", "SaaS", "Feedback"];

export default function AutoTemplatesPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Automation Templates"
        subtitle="Launch proven automations faster."
      />
      <MarketingSubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Zap} label="Templates Available" value={String(AUTO_TEMPLATES.length)} tone="violet" />
        <KpiCard icon={Sparkles} label="AI Recommended" value={null} tone="pink" />
        <KpiCard icon={Clock} label="Fastest Setup" value={null} tone="green" />
        <KpiCard icon={Zap} label="Total Uses" value={null} tone="blue" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="h-3.5 w-3.5 text-ink-muted" />
          <input placeholder="Search templates…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
        </div>
        {CATS.map((c, i) => (
          <button key={c} className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${i === 0 ? "bg-violet/10 text-violet" : "text-ink-soft hover:bg-bg-soft"}`}>{c}</button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {AUTO_TEMPLATES.map((t) => (
          <div key={t.id} className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-violet/30">
            <div className="mb-3 flex items-start justify-between">
              <StatusPill tone="violet">{t.category}</StatusPill>
              <StatusPill tone={t.performance === "High" ? "green" : t.performance === "Medium" ? "amber" : "blue"}>{t.performance}</StatusPill>
            </div>
            <div className="text-[14px] font-bold text-ink">{t.name}</div>
            <div className="mt-2 flex gap-3 text-[11px] text-ink-muted">
              <span>⏱ {t.setupTime}</span>
              <span>· {t.actions} actions</span>
              <span>· {t.uses} uses</span>
            </div>
            <div className="mt-2 text-[10.5px] text-ink-muted">Difficulty: {t.difficulty}</div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-xl border border-line py-2 text-[12px] font-semibold text-ink">Preview</button>
              <button className="flex-1 rounded-xl bg-grad-cta py-2 text-[12px] font-bold text-white shadow-violet">Use Template</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
