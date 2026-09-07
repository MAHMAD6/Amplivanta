import type { Metadata } from "next";
import { Sparkles, Download, TrendingUp, Zap, Globe, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { IntelSubnav } from "@/components/amplivanta/intel-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { TRENDS } from "@/lib/intel-data";

export const metadata: Metadata = { title: "Trending Topics" };

const SOURCE_TONE = { X: "gray", Reddit: "orange", LinkedIn: "blue", News: "violet", TikTok: "pink" } as const;

export default function TrendingPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Trending Topics"
        subtitle="Timely topics — turn them into content opportunities."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Download className="h-3.5 w-3.5" /> Export</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Sparkles className="h-3.5 w-3.5" /> Generate Content</button>
          </>
        }
      />
      <IntelSubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={TrendingUp} label="Trending Topics" value={String(TRENDS.length)} tone="violet" />
        <KpiCard icon={Zap} label="Avg. Velocity" value={null} tone="pink" />
        <KpiCard icon={Globe} label="Sources" value={null} tone="blue" />
        <KpiCard icon={MessageCircle} label="Mentions (24h)" value={null} tone="green" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {["All Sources", "X", "Reddit", "LinkedIn", "News", "TikTok"].map((s, i) => (
          <button key={s} className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${i === 0 ? "border-violet/40 bg-violet/10 text-violet" : "border-line bg-white text-ink-soft"}`}>{s}</button>
        ))}
        <select className="ml-auto rounded-xl border border-line bg-white px-3 py-2 text-[12px]"><option>Industry: All</option><option>SaaS</option><option>Marketing</option><option>E-commerce</option><option>Sales</option></select>
        <select className="rounded-xl border border-line bg-white px-3 py-2 text-[12px]"><option>Country: All</option><option>US</option><option>EU</option><option>Global</option></select>
        <select className="rounded-xl border border-line bg-white px-3 py-2 text-[12px]"><option>Last 24h</option><option>Last 7 days</option><option>Last 30 days</option></select>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {TRENDS.map((t) => (
          <div key={t.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <StatusPill tone={SOURCE_TONE[t.source]}>{t.source}</StatusPill>
                <span className="text-[11px] text-ink-muted">{t.industry} · {t.country}</span>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600">↑ {t.velocity}%</span>
            </div>
            <div className="text-[14px] font-bold text-ink">{t.topic}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {t.hashtags.map((h) => <span key={h} className="rounded-md bg-violet/10 px-2 py-0.5 text-[10.5px] font-semibold text-violet">{h}</span>)}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center text-[11px]">
              <div><div className="text-ink-muted">Mentions</div><div className="font-bold text-ink">{t.mentions.toLocaleString()}</div></div>
              <div><div className="text-ink-muted">Engagement</div><div className="font-bold text-ink">{t.engagement}%</div></div>
              <div><div className="text-ink-muted">Updated</div><div className="font-bold text-ink">{t.updatedAt}</div></div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-xl border border-line py-1.5 text-[11.5px] font-semibold text-ink">Compare</button>
              <button className="flex-1 rounded-xl bg-grad-cta py-1.5 text-[11.5px] font-bold text-white shadow-violet">Generate Content →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
