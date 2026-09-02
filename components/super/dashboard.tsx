import Link from "next/link";
import {
  Activity,
  BarChart3,
  Building2,
  ChevronRight,
  ClipboardList,
  Contact,
  CreditCard,
  FolderOpen,
  Handshake,
  Headphones,
  Lightbulb,
  Mail,
  Palette,
  Plug,
  Server,
  Share2,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Zap,
} from "lucide-react";
import { SuperCard, SuperDataRow, SuperEmptyState, SuperInfoNote, SuperStatCard } from "./primitives";
import { loadDashboardSummary } from "@/lib/server/super-queries";

const MODULES = [
  { name: "Growth Intelligence", desc: "Growth audit, opportunities, recommendations & insights", icon: Lightbulb, href: "/app/ai-advisor", badge: "New" as const },
  { name: "CRM", desc: "Manage contacts, companies, deals and pipelines", icon: Contact, href: "/app/crm", badge: "New" as const },
  { name: "Affiliate Management", desc: "Manage affiliates, referrals, commissions and payouts", icon: Handshake, href: "/super/affiliate-management/affiliate-command-center", badge: "New" as const, featured: true, chips: [
    { label: "Applications", href: "/super/affiliate-management/applications" },
    { label: "Commissions", href: "/super/affiliate-management/commissions" },
    { label: "Payouts", href: "/super/affiliate-management/payouts" },
  ] },
  { name: "Partner Marketplace", desc: "Partner recruitment, matching and marketplace management", icon: Store, href: "/super/partner-marketplace/partner-growth-dashboard", badge: "Soon" as const },
  { name: "Content Management", desc: "Manage content, categories and media library", icon: FolderOpen, href: "/super/content-management/content-and-resources-admin" },
  { name: "Creative Studio", desc: "Design, templates and brand assets", icon: Palette, href: "/app/creative-studio" },
  { name: "Marketing Automation", desc: "Campaigns, workflows and automation management", icon: Mail, href: "/app/marketing" },
  { name: "AI Management", desc: "AI models, usage and configuration", icon: Sparkles, href: "/app/workspace" },
  { name: "Social Publishing", desc: "Manage social accounts and publishing", icon: Share2, href: "/app/social" },
  { name: "Integrations", desc: "Third-party integrations and API management", icon: Plug, href: "/app/integrations" },
  { name: "Reports & Analytics", desc: "Analytics, reports and business intelligence", icon: BarChart3, href: "/super/reports-analytics/analytics-dashboard" },
  { name: "System Management", desc: "System settings, maintenance and configuration", icon: Server, href: "/super/system-management/module-controls" },
];

const QUICK_ACTIONS = [
  { name: "Module Controls", desc: "Enable, disable & manage modules", icon: Server, href: "/super/quick-actions/module-controls" },
  { name: "Grant Access / Credit", desc: "Extend access, usage or billing credits", icon: Zap, href: "/super/quick-actions/grant-access-credit", featured: true },
  { name: "Create Organization", desc: "Add a new organization", icon: Building2, href: "/super/quick-actions/create-organization" },
  { name: "Invite User", desc: "Add a new admin or user", icon: Users, href: "/super/quick-actions/invite-user" },
  { name: "System Health Check", desc: "Run system diagnostics", icon: ShieldCheck, href: "/super/quick-actions/system-health-check" },
  { name: "View Audit Logs", desc: "Review system activity", icon: ClipboardList, href: "/super/quick-actions/view-audit-logs" },
];

function ModuleBadge({ kind }: { kind: "New" | "Soon" }) {
  return (
    <span
      className={
        kind === "New"
          ? "rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600"
          : "rounded-md bg-bg-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted"
      }
    >
      {kind}
    </span>
  );
}

export async function SuperDashboard() {
  const summary = await loadDashboardSummary();
  const count = (n: number | null) => (n == null ? null : n.toLocaleString("en-US"));

  return (
    <>
      {/* Status strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SuperStatCard icon={ShieldCheck} label="System Status" value={null} tone="positive" href="/super/system-management/system-health" />
        <SuperStatCard icon={Building2} label="Organizations" value={count(summary.organizations)} href="/super/organizations/organizations" />
        <SuperStatCard icon={Users} label="Users" value={count(summary.users)} href="/super/user-management/all-users" />
        <SuperStatCard icon={Headphones} label="Support Tickets" value={count(summary.tickets)} tone="warning" href="/super/support-tickets/support-tickets" />
        <SuperStatCard icon={Activity} label="System Alerts" value={count(summary.incidents)} href="/super/command-center/command-center" />
      </div>

      {/* Platform modules */}
      <SuperCard className="mt-6">
        <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
          <div>
            <h2 className="text-[18px] font-extrabold text-admin-navy">Platform Modules</h2>
            <p className="mt-0.5 text-[13px] text-ink-soft">Quick access to key administrative areas</p>
          </div>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
          {MODULES.map((m) => (
            <Link
              key={m.name}
              href={m.href}
              className={
                "group flex flex-col rounded-2xl border p-5 transition hover:border-royal-blue/50 hover:shadow-card " +
                (m.featured ? "border-orange-cta/35 bg-orange-cta/[0.04]" : "border-line bg-white")
              }
            >
              <div className="flex items-start gap-3.5">
                <span
                  className={
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl " +
                    (m.featured ? "bg-orange-cta/15 text-orange-cta" : "bg-royal-tint text-royal-blue")
                  }
                >
                  <m.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-admin-navy">{m.name}</span>
                    {m.badge && <ModuleBadge kind={m.badge} />}
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{m.desc}</p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-ink-muted transition group-hover:text-royal-blue" />
              </div>
              {m.chips && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {m.chips.map((c) => (
                    <span key={c.label} className="rounded-lg border border-line bg-white px-2.5 py-1 text-[11.5px] font-semibold text-ink-soft">
                      {c.label}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </SuperCard>

      {/* Activity / overview / quick actions */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <SuperCard>
          <div className="px-6 pt-6">
            <h2 className="text-[16px] font-bold text-admin-navy">Activity Center</h2>
            <p className="mt-0.5 text-[13px] text-ink-soft">Recent administrative activity across the platform</p>
          </div>
          <SuperEmptyState
            icon={ClipboardList}
            title="No recent activity"
            description="System and administrative actions will appear here."
            action={
              <Link
                href="/super/audit-logs/global-audit-logs"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13.5px] font-bold text-royal-blue hover:bg-bg-soft"
              >
                View all activity <ChevronRight className="h-4 w-4" />
              </Link>
            }
          />
        </SuperCard>

        <SuperCard>
          <div className="flex items-start justify-between gap-4 px-6 pt-6">
            <div>
              <h2 className="text-[16px] font-bold text-admin-navy">System Overview</h2>
              <p className="mt-0.5 text-[13px] text-ink-soft">High-level overview of platform health and performance</p>
            </div>
            <Link href="/super/reports-analytics/analytics-dashboard" className="shrink-0 text-[12.5px] font-bold text-royal-blue hover:underline">
              View full report →
            </Link>
          </div>
          <div className="px-6 pb-2 pt-3">
            <SuperDataRow icon={Building2} label="Total Organizations" value={count(summary.organizations)} />
            <SuperDataRow icon={Users} label="Total Users" value={count(summary.users)} />
            <SuperDataRow icon={Activity} label="System Uptime" value={null} />
            <SuperDataRow icon={Plug} label="Active Integrations" value={null} />
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-start gap-2.5 rounded-xl bg-royal-tint px-4 py-3 text-[12.5px] text-admin-navy">
              <Activity className="mt-0.5 h-4 w-4 shrink-0 text-royal-blue" />
              System metrics will appear here once data is available.
            </div>
          </div>
        </SuperCard>

        <SuperCard>
          <div className="px-6 pt-6">
            <h2 className="text-[16px] font-bold text-admin-navy">Quick Actions</h2>
          </div>
          <div className="space-y-1.5 p-4">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.name}
                href={a.href}
                className={
                  "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition " +
                  (a.featured ? "border-orange-cta/35 bg-orange-cta/[0.05]" : "border-transparent hover:border-line hover:bg-bg-soft")
                }
              >
                <span className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " + (a.featured ? "bg-orange-cta/15 text-orange-cta" : "bg-bg-soft text-royal-blue")}>
                  <a.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold text-admin-navy">{a.name}</span>
                  <span className="block truncate text-[11.5px] text-ink-soft">{a.desc}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" />
              </Link>
            ))}
            <Link
              href="/super/quick-actions/module-controls"
              className="flex items-center justify-between rounded-xl border border-line px-3.5 py-2.5 text-[13px] font-bold text-royal-blue hover:bg-bg-soft"
            >
              See all actions <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </SuperCard>
      </div>

      <SuperInfoNote title="About the Super Admin Command Center">
        Counters reconcile to the platform database. Metrics without a connected production source stay
        unavailable rather than showing placeholder values.
      </SuperInfoNote>
    </>
  );
}
