import type { Metadata } from "next";
import { Eye, Heart, MessageSquare, Share2, TrendingUp, Users, Download } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { SocialSubnav } from "@/components/amplivanta/social-subnav";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { PlatformIcon } from "@/components/amplivanta/platform-badge";
import { ACCOUNTS, POSTS, PLATFORM_META } from "@/lib/social-data";

export const metadata: Metadata = { title: "Social Analytics — Amplivanta" };

export default function SocialAnalyticsPage() {
  const topPosts = POSTS.filter((p) => p.engagement).sort((a, b) => (b.engagement!.likes) - (a.engagement!.likes)).slice(0, 5);
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Social Analytics"
        subtitle="Channel, content and campaign performance."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30">📅 Last 30 days</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet"><Download className="h-3.5 w-3.5" /> Export</button>
          </>
        }
      />
      <SocialSubnav />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <KpiCard icon={Eye} label="Impressions" value="342K" delta="22%" tone="blue" />
        <KpiCard icon={Users} label="Reach" value="128K" delta="18%" tone="violet" />
        <KpiCard icon={Heart} label="Likes" value="12.4K" delta="30%" tone="pink" />
        <KpiCard icon={MessageSquare} label="Comments" value="1.8K" delta="24%" tone="amber" />
        <KpiCard icon={Share2} label="Shares" value="948" delta="14%" tone="teal" />
        <KpiCard icon={TrendingUp} label="Engagement Rate" value="4.2%" delta="0.6 pts" tone="green" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card lg:col-span-2">
          <div className="mb-3 text-[14px] font-bold text-ink">Engagement Trend</div>
          <svg viewBox="0 0 600 220" className="h-56 w-full">
            <defs>
              <linearGradient id="engGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#E8398F" stopOpacity="0.4" />
                <stop offset="1" stopColor="#E8398F" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,180 C60,150 120,160 180,120 C240,80 300,90 360,60 C420,40 480,50 540,30 L600,20 L600,220 L0,220 Z" fill="url(#engGrad)" />
            <path d="M0,180 C60,150 120,160 180,120 C240,80 300,90 360,60 C420,40 480,50 540,30 L600,20" fill="none" stroke="#E8398F" strokeWidth="2.5" />
            <path d="M0,190 C60,180 120,175 180,160 C240,145 300,150 360,130 C420,110 480,120 540,105 L600,100" fill="none" stroke="#6D3BF5" strokeWidth="2.5" />
            {[0, 100, 200, 300, 400, 500, 600].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="220" stroke="#e9e7f0" strokeDasharray="2 4" />)}
          </svg>
          <div className="mt-2 flex gap-3 text-[11px] text-ink-muted">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-pink-brand" /> Engagement</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet" /> Reach</span>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 text-[14px] font-bold text-ink">Platform Comparison</div>
          <div className="space-y-3">
            {ACCOUNTS.map((a) => {
              const pct = Math.round((a.impressions / 68700) * 100);
              return (
                <div key={a.id}>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={a.platform} size={18} />
                      <span className="font-semibold text-ink">{PLATFORM_META[a.platform].label}</span>
                    </div>
                    <span className="font-bold text-ink">{(a.impressions / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft">
                    <div className="h-full rounded-full bg-grad-brand" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 text-[14px] font-bold text-ink">Top Performing Posts</div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <th className="pb-2">Post</th>
              <th className="pb-2">Platform</th>
              <th className="pb-2 text-right">Reach</th>
              <th className="pb-2 text-right">Likes</th>
              <th className="pb-2 text-right">Comments</th>
              <th className="pb-2 text-right">Shares</th>
            </tr>
          </thead>
          <tbody>
            {topPosts.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="py-3 text-[13px] font-semibold text-ink">{p.content}</td>
                <td className="py-3"><PlatformIcon platform={p.platform} size={22} /></td>
                <td className="py-3 text-right text-[12.5px]">{p.engagement!.reach.toLocaleString()}</td>
                <td className="py-3 text-right text-[12.5px] font-bold text-emerald-600">{p.engagement!.likes.toLocaleString()}</td>
                <td className="py-3 text-right text-[12.5px]">{p.engagement!.comments}</td>
                <td className="py-3 text-right text-[12.5px]">{p.engagement!.shares}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
