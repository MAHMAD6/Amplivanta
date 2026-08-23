import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Calendar as CalIcon, TrendingUp, BarChart3, Users, Plus, Sparkles, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { SocialSubnav } from "@/components/amplivanta/social-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill, Avatar } from "@/components/amplivanta/status-pill";
import { PlatformIcon } from "@/components/amplivanta/platform-badge";
import { POSTS, ACCOUNTS, PLATFORM_META, STATUS_TONE } from "@/lib/social-data";

export const metadata: Metadata = { title: "Publishing Dashboard — Amplivanta" };

export default function SocialDashboardPage() {
  const published = POSTS.filter((p) => p.status === "Published");
  const upcoming = POSTS.filter((p) => p.status === "Scheduled").slice(0, 3);
  const top = [...published].sort((a, b) => (b.engagement?.likes ?? 0) - (a.engagement?.likes ?? 0)).slice(0, 3);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Publishing Dashboard"
        subtitle="Plan, create, schedule and publish content across all your social media platforms."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30">📅 Last 7 Days</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-violet/30 bg-white px-4 text-[13px] font-bold text-violet hover:bg-violet/5">
              <Plus className="h-3.5 w-3.5" /> Create Post
            </button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
              <Sparkles className="h-3.5 w-3.5" /> Create Post with AI
            </button>
          </>
        }
      />
      <SocialSubnav />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard icon={FileText} label="Posts Published" value="48" delta="24% vs last 7 days" tone="violet" />
        <KpiCard icon={CalIcon} label="Scheduled" value="36" delta="18%" tone="blue" />
        <KpiCard icon={TrendingUp} label="Engagement" value="8.7K" delta="30%" tone="green" />
        <KpiCard icon={BarChart3} label="Impressions" value="142K" delta="22%" tone="orange" />
        <KpiCard icon={Users} label="Profile Visits" value="2.6K" delta="16%" tone="pink" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Content Calendar preview */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Content Calendar</div>
            <Link href="/app/social/calendar" className="text-[12px] font-semibold text-violet">View Calendar →</Link>
          </div>
          <div className="mb-3 flex items-center justify-center gap-2 text-[12px] font-semibold text-ink">
            <button className="rounded-lg px-2 py-1 text-ink-muted">‹</button>
            May 12 – May 18, 2025
            <button className="rounded-lg px-2 py-1 text-ink-muted">›</button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {["Mon 12", "Tue 13", "Wed 14", "Thu 15", "Fri 16", "Sat 17", "Sun 18"].map((d, i) => (
              <div key={d} className="min-h-[140px] rounded-xl border border-line bg-bg-soft/40 p-2">
                <div className={"mb-1 text-center text-[11px] font-bold " + (i === 1 ? "text-white" : "text-ink-muted")}>
                  {i === 1 ? <span className="rounded-full bg-violet px-2 py-0.5 text-white">{d}</span> : d}
                </div>
                {[
                  { i: 0, p: "linkedin", t: "10:00 AM" },
                  { i: 1, p: "instagram", t: "10:30 AM" },
                  { i: 2, p: "facebook", t: "10:15 AM" },
                  { i: 4, p: "instagram", t: "6:00 AM" },
                ].filter((x) => x.i === i).map((x, k) => (
                  <div key={k} className="mb-1 rounded-lg border border-line bg-white p-1.5">
                    <div className="flex items-center gap-1 text-[9px] text-ink-muted">
                      <PlatformIcon platform={x.p as any} size={12} /> {x.t}
                    </div>
                    <div className="mt-0.5 h-6 rounded bg-gradient-to-br from-violet/20 to-orange-brand/20" />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-3 text-[10.5px] text-ink-muted">
            {[
              { c: "bg-emerald-500", l: "Published" },
              { c: "bg-blue-500", l: "Scheduled" },
              { c: "bg-violet", l: "Draft" },
              { c: "bg-amber-500", l: "Pending Approval" },
              { c: "bg-red-500", l: "Failed" },
            ].map((x) => (
              <span key={x.l} className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${x.c}`} /> {x.l}
              </span>
            ))}
          </div>
        </div>

        {/* Platform overview */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Platform Overview</div>
            <Link href="/app/social/analytics" className="text-[12px] font-semibold text-violet">View Analytics →</Link>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="pb-2"></th>
                <th className="pb-2 text-right">Followers</th>
                <th className="pb-2 text-right">Engage.</th>
                <th className="pb-2 text-right">Impress.</th>
              </tr>
            </thead>
            <tbody>
              {ACCOUNTS.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={a.platform} size={22} />
                      <span className="text-[12px] font-semibold text-ink">{PLATFORM_META[a.platform].label}</span>
                    </div>
                  </td>
                  <td className="py-2 text-right">
                    <div className="text-[12.5px] font-bold text-ink">{a.followers.toLocaleString()}</div>
                    <div className="text-[10px] font-semibold text-emerald-600">↑{a.followersDelta}%</div>
                  </td>
                  <td className="py-2 text-right">
                    <div className="text-[12.5px] font-bold text-ink">{a.engagement}%</div>
                    <div className="text-[10px] font-semibold text-emerald-600">↑{a.engagementDelta}%</div>
                  </td>
                  <td className="py-2 text-right">
                    <div className="text-[12.5px] font-bold text-ink">{(a.impressions / 1000).toFixed(1)}K</div>
                    <div className="text-[10px] font-semibold text-emerald-600">↑{a.impressionsDelta}%</div>
                  </td>
                </tr>
              ))}
              <tr className="bg-bg-soft/50 font-bold">
                <td className="py-2 text-[12px] text-ink">Total</td>
                <td className="py-2 text-right text-[12.5px]">74,604</td>
                <td className="py-2 text-right text-[12.5px]">3.7%</td>
                <td className="py-2 text-right text-[12.5px]">172.0K</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-bold text-ink">Publishing Activity</div>
            <button className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-2 text-[11px] font-semibold text-ink-soft">All Platforms</button>
          </div>
          <div className="space-y-3">
            {published.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                <PlatformIcon platform={p.platform} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-ink">{p.content}</div>
                  <div className="mt-0.5 text-[11px] text-ink-muted">{PLATFORM_META[p.platform].label} · Posted by {p.author}</div>
                </div>
                <div className="text-[11px] text-ink-muted">{p.publishedAt}</div>
                <StatusPill tone={STATUS_TONE[p.status]}>{p.status}</StatusPill>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Publishing Queue</div>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {[
              { label: "Scheduled", n: 36, tone: "blue" },
              { label: "Draft", n: 12, tone: "gray" },
              { label: "Pending Approval", n: 3, tone: "amber" },
              { label: "Failed", n: 1, tone: "red" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-line bg-bg-soft/40 p-3">
                <div className="text-[11px] font-semibold text-ink-muted">{s.label}</div>
                <div className="mt-1 text-[18px] font-extrabold text-ink">{s.n}</div>
              </div>
            ))}
          </div>

          <div className="mb-2 flex items-center justify-between">
            <div className="text-[13px] font-bold text-ink">Top Performing Posts</div>
            <Link href="/app/social/analytics" className="text-[11px] font-semibold text-violet">View Analytics →</Link>
          </div>
          <div className="space-y-2.5">
            {top.map((p) => (
              <div key={p.id} className="flex items-center gap-2.5">
                <PlatformIcon platform={p.platform} size={26} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-semibold text-ink">{p.content}</div>
                  <div className="text-[10.5px] text-ink-muted">{p.publishedAt}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10.5px] text-ink-muted">Engagement</div>
                  <div className="text-[12px] font-bold text-emerald-600">{p.engagement!.likes.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-violet/20 bg-gradient-to-r from-violet/[0.04] to-orange-brand/[0.04] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <Sparkles className="h-4 w-4 text-violet" /> AI Assistant Tip
            <span className="ml-2 font-normal text-ink-soft">Your audience is most active on Tuesdays and Thursdays between 10 AM – 12 PM.</span>
          </div>
          <button className="inline-flex h-9 items-center gap-1 rounded-xl bg-grad-cta px-3 text-[12px] font-bold text-white shadow-violet">
            <Sparkles className="h-3.5 w-3.5" /> Optimize Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
