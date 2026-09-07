import type { Metadata } from "next";
import { Search, Bell, Sparkles, ExternalLink, Bookmark } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { IntelSubnav } from "@/components/amplivanta/intel-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { NEWS } from "@/lib/intel-data";
import { Newspaper, TrendingUp, Bell as BellI, Rss } from "lucide-react";

export const metadata: Metadata = { title: "Industry News" };

const IMPACT_TONE = { High: "red", Medium: "amber", Low: "gray" } as const;

const CONTENT_FORMATS = [
  { label: "Blog Post", icon: Newspaper },
  { label: "Social Post", icon: Sparkles },
  { label: "Email Digest", icon: Rss },
  { label: "Video Script", icon: Sparkles },
  { label: "Infographic", icon: Sparkles },
];

export default function NewsPage() {
  const top = NEWS[0];
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Industry News"
        subtitle="Curated news. One click to turn a story into content."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Bell className="h-3.5 w-3.5" /> Alerts</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Sparkles className="h-3.5 w-3.5" /> Turn Into Content</button>
          </>
        }
      />
      <IntelSubnav />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Newspaper} label="Stories Today" value={null} tone="violet" />
        <KpiCard icon={TrendingUp} label="High Impact" value={null} tone="pink" />
        <KpiCard icon={BellI} label="Alerts" value={null} tone="amber" />
        <KpiCard icon={Bookmark} label="Saved" value={null} tone="blue" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
          <Search className="h-3.5 w-3.5 text-ink-muted" />
          <input placeholder="Search news…" className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none" />
        </div>
        {["All Sources", "All Topics", "Last 24h"].map((l) => (
          <button key={l} className="inline-flex h-10 items-center rounded-xl border border-line bg-white px-3 text-[12px] font-semibold text-ink-soft">{l}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {/* Top story */}
          <div className="rounded-2xl border border-violet/25 bg-gradient-to-br from-violet/[0.03] to-orange-brand/[0.03] p-5 shadow-card">
            <div className="mb-2 flex items-center gap-2">
              <StatusPill tone="violet">Top Story</StatusPill>
              <StatusPill tone={IMPACT_TONE[top.impact]}>{top.impact} Impact</StatusPill>
              <span className="text-[10.5px] text-ink-muted">Relevance {top.relevance}</span>
            </div>
            <div className="text-[16px] font-bold text-ink">{top.title}</div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{top.summary}</p>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <div className="text-[11.5px] text-ink-muted">{top.source} · {top.published}</div>
              <div className="flex gap-2">
                <button className="rounded-lg border border-line px-3 py-1.5 text-[11.5px] font-semibold text-ink"><ExternalLink className="mr-1 inline h-3 w-3" />Read</button>
                <button className="rounded-lg bg-grad-cta px-3 py-1.5 text-[11.5px] font-bold text-white shadow-violet"><Sparkles className="mr-1 inline h-3 w-3" />Turn Into Content</button>
              </div>
            </div>
          </div>

          {NEWS.slice(1).map((n) => (
            <div key={n.id} className="rounded-2xl border border-line bg-white p-5 shadow-card hover:border-violet/30">
              <div className="mb-2 flex items-center gap-2">
                <StatusPill tone={IMPACT_TONE[n.impact]}>{n.impact}</StatusPill>
                <span className="text-[10.5px] text-ink-muted">{n.topic}</span>
                <span className="text-[10.5px] text-ink-muted">· Relevance {n.relevance}</span>
              </div>
              <div className="text-[14px] font-bold text-ink">{n.title}</div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{n.summary}</p>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <div className="text-[11px] text-ink-muted">{n.source} · {n.published}</div>
                <div className="flex gap-2">
                  <button className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft"><Bookmark className="h-3.5 w-3.5" /></button>
                  <button className="rounded-lg border border-line px-3 py-1 text-[11px] font-semibold text-ink"><ExternalLink className="mr-1 inline h-3 w-3" />Read</button>
                  <button className="rounded-lg bg-grad-cta px-3 py-1 text-[11px] font-bold text-white shadow-violet"><Sparkles className="mr-1 inline h-3 w-3" />Content</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[13px] font-bold text-ink">Turn Into Content — Formats</div>
            <div className="space-y-2">
              {CONTENT_FORMATS.map((f) => (
                <button key={f.label} className="flex w-full items-center gap-2 rounded-xl border border-line p-2 text-left hover:border-violet/30">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet/10 text-violet"><f.icon className="h-3.5 w-3.5" /></div>
                  <span className="text-[12px] font-semibold text-ink">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink"><BellI className="h-3.5 w-3.5 text-amber-500" /> Alerts</div>
            <ul className="space-y-1.5 text-[12px] text-ink-soft">
              <li>· Cookieless attribution — <span className="font-bold text-red-600">high impact</span></li>
              <li>· HubSpot M&A activity</li>
              <li>· AI advertising regulation (EU)</li>
            </ul>
            <button className="mt-2 w-full rounded-lg border border-line py-1.5 text-[11.5px] font-semibold text-ink">Manage Alerts</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
