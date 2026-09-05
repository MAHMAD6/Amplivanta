import type { Metadata } from "next";
import { Plus, Download, Sparkles, Users, TrendingUp, MessageSquare, Target } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { IntelSubnav } from "@/components/amplivanta/intel-subnav";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { COMPETITORS, COMPETITOR_POSTS, COMPETITOR_OPPORTUNITIES } from "@/lib/intel-data";

export const metadata: Metadata = { title: "Competitor Watch — Amplivanta" };

export default function CompetitorsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Competitor Watch"
        subtitle="Monitor competitor content — spot gaps and opportunities without copying protected creative."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink"><Download className="h-3.5 w-3.5" /> Report</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Plus className="h-3.5 w-3.5" /> Add Competitor</button>
          </>
        }
      />
      <IntelSubnav />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Users} label="Tracked" value={String(COMPETITORS.length)} tone="violet" />
        <KpiCard icon={MessageSquare} label="Posts (7d)" value={null} tone="blue" />
        <KpiCard icon={TrendingUp} label="Avg. Engagement" value={null} tone="pink" />
        <KpiCard icon={Target} label="Opportunities" value={String(COMPETITOR_OPPORTUNITIES.length)} tone="amber" />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {COMPETITORS.map((c) => (
          <div key={c.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold ${c.logoTone}`}>{c.logoLetter}</div>
              <div>
                <div className="text-[13.5px] font-bold text-ink">{c.name}</div>
                <div className="font-mono text-[11px] text-ink-muted">{c.handle}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-y border-line py-3 text-center">
              <div>
                <div className="text-[10px] text-ink-muted">Followers</div>
                <div className="text-[13px] font-bold text-ink">{(c.followers / 1000).toFixed(1)}K</div>
                <div className={`text-[10.5px] font-bold ${c.followersDelta >= 0 ? "text-emerald-600" : "text-red-600"}`}>{c.followersDelta >= 0 ? "↑" : "↓"} {Math.abs(c.followersDelta)}%</div>
              </div>
              <div>
                <div className="text-[10px] text-ink-muted">Posts/wk</div>
                <div className="text-[13px] font-bold text-ink">{c.postsPerWeek}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {c.topThemes.map((t) => <span key={t} className="rounded-md bg-violet/10 px-2 py-0.5 text-[10.5px] font-semibold text-violet">{t}</span>)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Top Competitor Posts</div>
            <span className="text-[11px] text-ink-muted">Last 7 days · public data</span>
          </div>
          <div className="space-y-3">
            {COMPETITOR_POSTS.map((p, i) => (
              <div key={i} className="rounded-xl border border-line p-3 hover:border-violet/30">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-ink">{p.competitor}</span>
                    <StatusPill tone="blue">{p.platform}</StatusPill>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600">{p.engagement.toLocaleString()} eng.</span>
                </div>
                <div className="text-[12.5px] text-ink">&ldquo;{p.excerpt}&rdquo;</div>
                <div className="mt-1.5 text-[10.5px] text-ink-muted">Theme: <span className="font-semibold text-ink">{p.theme}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[14px] font-bold text-ink">Theme Analysis</div>
            <div className="space-y-2">
              {[
                { t: "Attribution", share: 32 },
                { t: "PLG scoring", share: 26 },
                { t: "CAC reduction", share: 18 },
                { t: "Revenue ops", share: 14 },
                { t: "Forms / CRO", share: 10 },
              ].map((r) => (
                <div key={r.t}>
                  <div className="mb-1 flex items-center justify-between text-[11.5px]"><span className="text-ink-soft">{r.t}</span><span className="font-bold text-ink">{r.share}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft"><div className="h-full rounded-full bg-grad-brand" style={{ width: `${r.share}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-violet/20 bg-gradient-to-br from-violet/[0.05] to-orange-brand/[0.05] p-5">
            <div className="mb-3 flex items-center gap-1.5 text-[14px] font-bold text-ink"><Sparkles className="h-4 w-4 text-violet" /> Opportunities</div>
            <div className="space-y-2">
              {COMPETITOR_OPPORTUNITIES.map((o, i) => (
                <div key={i} className="rounded-xl border border-line bg-white p-3">
                  <div className="text-[12.5px] font-semibold text-ink">{o.title}</div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{o.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
