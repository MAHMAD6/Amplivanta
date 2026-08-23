import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  Workflow,
  Share2,
  Users,
  Target,
  BarChart3,
  Wand2,
  Plus,
  ArrowRight,
  Zap,
  Bot,
  Activity,
  Layers,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { KpiCard } from "@/components/amplivanta/kpi-card";
import { StatusPill } from "@/components/amplivanta/status-pill";
import { WS_CAMPAIGNS, WS_ACTIVITY } from "@/lib/workspace-data";
import { DEALS } from "@/lib/crm-data";
import { CAMPAIGNS } from "@/lib/marketing-auto-data";

export const metadata: Metadata = { title: "Workspace Dashboard — Amplivanta" };

const QUICK_ACTIONS = [
  { label: "New Campaign", href: "/app/marketing/campaigns/new", icon: Plus, tone: "bg-grad-brand text-white" },
  { label: "Ask AI Advisor", href: "/app/ai-advisor/ask", icon: Sparkles, tone: "bg-royal-blue text-white" },
  { label: "Create Social Post", href: "/app/social/composer", icon: Share2, tone: "bg-[#0F9D77] text-white" },
  { label: "Add Deal / Lead", href: "/app/crm/contacts", icon: Users, tone: "bg-[#F5731A] text-white" },
  { label: "Run Growth Audit", href: "/app/growth-audit", icon: Target, tone: "bg-deep-navy text-white" },
];

const MODULE_HUBS = [
  {
    title: "AI Growth Suite",
    desc: "Autonomous strategic recommendations, audit insights, and generative intelligence.",
    icon: Sparkles,
    tone: "text-[#6D3BF5] bg-[#6D3BF5]/10",
    links: [
      { label: "AI Advisor", href: "/app/ai-advisor" },
      { label: "Growth Audit", href: "/app/growth-audit" },
      { label: "Marketing Strategy", href: "/app/strategy" },
      { label: "Content Intelligence", href: "/app/content-intelligence" },
    ],
  },
  {
    title: "Marketing Automation",
    desc: "Multi-channel journeys, automated triggers, email campaigns, and conversion forms.",
    icon: Workflow,
    tone: "text-[#1D5FD6] bg-[#1D5FD6]/10",
    links: [
      { label: "Campaigns", href: "/app/marketing/campaigns" },
      { label: "Workflows", href: "/app/marketing/workflows" },
      { label: "Email Marketing", href: "/app/marketing/email-campaigns" },
      { label: "Landing Pages", href: "/app/marketing/landing-pages" },
    ],
  },
  {
    title: "Social & Creative Studio",
    desc: "Unified multi-platform publishing, media brand kits, and content production.",
    icon: Wand2,
    tone: "text-[#E33FA1] bg-[#E33FA1]/10",
    links: [
      { label: "Social Publishing", href: "/app/social" },
      { label: "Social Calendar", href: "/app/social/calendar" },
      { label: "Creative Studio", href: "/app/creative-studio" },
      { label: "Brand Kit", href: "/app/creative-studio/brand-kit" },
    ],
  },
  {
    title: "CRM & Revenue Pipeline",
    desc: "Unified contact profiles, pipeline stages, activity tracking, and closed deals.",
    icon: Users,
    tone: "text-[#F97316] bg-[#F97316]/10",
    links: [
      { label: "CRM Overview", href: "/app/crm" },
      { label: "Contacts & Leads", href: "/app/crm/contacts" },
      { label: "Deals Pipeline", href: "/app/crm/deals" },
      { label: "Activities & Tasks", href: "/app/crm/activities" },
    ],
  },
];

export default function WorkspaceDashboardPage() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-8">
      {/* Top Banner / Page Header */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-r from-deep-navy via-[#1b264f] to-deep-navy p-6 text-white shadow-xl sm:p-8 lg:flex-row lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[12px] font-semibold text-white">
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
            AI Growth Engine Active
          </div>
          <h1 className="mt-3 font-display text-[28px] font-extrabold tracking-tight sm:text-[34px]">
            Welcome to Amplivanta Workspace
          </h1>
          <p className="mt-1.5 max-w-[650px] text-[14px] leading-relaxed text-white/70">
            Engineered growth is now live. Monitor campaigns, execute automated workflows, engage prospects, and accelerate revenue across all channels.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/app/ai-advisor/ask"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-grad-brand px-5 text-[13.5px] font-bold text-white shadow-violet transition hover:opacity-95"
          >
            <Bot className="h-4 w-4" /> Ask AI Advisor
          </Link>
          <Link
            href="/app/marketing/campaigns"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-[13.5px] font-bold text-white transition hover:bg-white/20"
          >
            <Layers className="h-4 w-4" /> View Campaigns
          </Link>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div>
        <div className="mb-3 text-[13px] font-bold uppercase tracking-wider text-ink-muted">Quick Launch</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-card transition hover:-translate-y-0.5 hover:border-violet/40 hover:shadow-card-lg"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.tone} shadow-sm`}>
                <a.icon className="h-5 w-5" />
              </span>
              <span className="text-[13px] font-bold text-deep-navy">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Key Metric Tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={TrendingUp}
          label="Pipeline Value"
          value={`$${(DEALS.reduce((s, d) => s + d.value, 0) / 1000).toFixed(0)}K`}
          delta="18% vs last month"
          tone="green"
        />
        <KpiCard
          icon={Workflow}
          label="Active Campaigns"
          value={String(CAMPAIGNS.length || 6)}
          delta="4 running"
          tone="violet"
        />
        <KpiCard
          icon={Users}
          label="Total Contacts"
          value="1,248"
          delta="142 new this week"
          tone="blue"
        />
        <KpiCard
          icon={Zap}
          label="AI Credits Available"
          value="4,850"
          delta="5,000 monthly limit"
          tone="amber"
        />
      </div>

      {/* Module Hubs Bento */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-deep-navy">Platform Capabilities</h2>
            <p className="text-[13px] text-ink-soft">Direct access to core execution and strategic engines.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {MODULE_HUBS.map((hub) => (
            <div
              key={hub.title}
              className="flex flex-col justify-between rounded-2xl border border-line bg-white p-6 shadow-card transition hover:border-violet/30"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${hub.tone}`}>
                    <hub.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-bold text-deep-navy">{hub.title}</h3>
                    <p className="text-[12.5px] text-ink-muted">{hub.desc}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2 border-t border-line/60 pt-4">
                {hub.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-[13px] font-semibold text-deep-navy transition hover:bg-bg-soft hover:text-royal-blue"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-4 w-4 text-ink-muted" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Active Campaigns & Live Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Projects / Campaigns */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-deep-navy">Active Growth Campaigns</h3>
              <p className="text-[12.5px] text-ink-soft">Real-time status, budgets, and projected ROI.</p>
            </div>
            <Link href="/app/marketing/campaigns" className="text-[12.5px] font-bold text-royal-blue hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {WS_CAMPAIGNS.slice(0, 4).map((c) => (
              <div
                key={c.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-line p-4 transition hover:border-violet/40 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-deep-navy">{c.name}</span>
                    <StatusPill tone={c.status === "Live" ? "green" : c.status === "In Progress" ? "amber" : "blue"}>
                      {c.status}
                    </StatusPill>
                  </div>
                  <div className="mt-1 text-[12px] text-ink-muted">
                    {c.timeline} · Audience: {c.audience}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-[12.5px]">
                  <div>
                    <span className="text-ink-muted">Budget: </span>
                    <span className="font-bold text-deep-navy">${(c.budget / 1000).toFixed(0)}K</span>
                  </div>
                  <div>
                    <span className="text-ink-muted">ROI: </span>
                    <span className="font-bold text-emerald-600">{c.projectedROI}</span>
                  </div>
                  <div className="w-24">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span>{c.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-soft">
                      <div className="h-full rounded-full bg-grad-brand" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-deep-navy">Live Activity</h3>
            <Link href="/app/workspace/activity" className="text-[12.5px] font-bold text-royal-blue hover:underline">
              Feed →
            </Link>
          </div>
          <div className="space-y-3.5">
            {WS_ACTIVITY.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet/10 text-[12px]">
                  {a.category === "AI" ? "✨" : a.category === "Approve" ? "✅" : a.category === "Publish" ? "🚀" : "📝"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] leading-snug text-deep-navy">
                    <span className="font-bold">{a.actor}</span> {a.verb} <span className="font-semibold">{a.object}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">{a.module} · {a.when}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
