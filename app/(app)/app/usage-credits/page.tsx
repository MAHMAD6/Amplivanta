import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpCircle,
  Bell,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Cloud,
  ExternalLink,
  FileText,
  Info,
  Link2,
  Mail,
  Palette,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { MpCard, MpHeader } from "@/components/marketplace/ui";
import { BuyCredits } from "@/components/amplivanta/buy-credits";
import { loadUsageOverview, type UsageMetric } from "@/lib/server/loaders";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Usage & Credits" };

const METRICS: { key: UsageMetric; label: string; icon: LucideIcon; tone: string }[] = [
  { key: "aiCredits", label: "AI Credits", icon: Sparkles, tone: "text-violet" },
  { key: "emailSends", label: "Email Sends", icon: Mail, tone: "text-royal-blue" },
  { key: "storage", label: "Storage", icon: Cloud, tone: "text-emerald-600" },
  { key: "contacts", label: "Contacts", icon: Users, tone: "text-orange-500" },
  { key: "automations", label: "Automations", icon: Zap, tone: "text-violet" },
  { key: "connectedAccounts", label: "Connected Accounts", icon: Link2, tone: "text-royal-blue" },
];

const MODULES: { label: string; icon: LucideIcon; tone: string }[] = [
  { label: "AI Advisor", icon: Sparkles, tone: "text-violet" },
  { label: "Creative Studio", icon: Palette, tone: "text-pink-500" },
  { label: "Marketing Automation", icon: Mail, tone: "text-royal-blue" },
  { label: "Social Publishing", icon: Share2, tone: "text-emerald-600" },
  { label: "CRM", icon: Users, tone: "text-orange-500" },
  { label: "Analytics", icon: BarChart3, tone: "text-royal-blue" },
];

const HELP = "/resources/help-center";
const BILLING = "/app/settings/billing";

const fmt = (n: number | null) => (n == null ? "—" : n.toLocaleString("en-US"));

const periodLabel = (p: { start: Date; end: Date }) => {
  const d = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const y = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: "UTC" });
  return `${d.format(p.start)} – ${d.format(p.end)}, ${y.format(p.end)} (UTC)`;
};

function Banner({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-royal-blue/15 bg-royal-tint/60 px-4 py-3">
      <p className="flex items-center gap-2.5 text-[12.5px] text-deep-navy">
        <Info aria-hidden className="h-4 w-4 shrink-0 text-royal-blue" />
        {children}
      </p>
      {action}
    </div>
  );
}

function TextLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const Icon = external ? ExternalLink : ChevronRight;
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-royal-blue hover:underline">
      {children}
      <Icon aria-hidden className="h-3.5 w-3.5" />
    </Link>
  );
}

function RailCard({
  icon: Icon,
  title,
  badge,
  children,
}: {
  icon: LucideIcon;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <MpCard className="p-5">
      <h2 className="flex flex-wrap items-center gap-2.5 text-[14px] font-bold text-deep-navy">
        <Icon aria-hidden className="h-[18px] w-[18px] text-deep-navy" />
        {title}
        {badge && (
          <span className="rounded-full bg-royal-tint px-2 py-0.5 text-[10.5px] font-bold text-royal-blue">{badge}</span>
        )}
      </h2>
      <div className="mt-3 space-y-3 text-[12.5px] leading-relaxed text-ink-soft">{children}</div>
    </MpCard>
  );
}

export default async function UsageCreditsPage() {
  const usage = await loadUsageOverview();
  const anyUsage = Object.values(usage.used).some((v) => v != null);
  const w = usage.wallet;
  const available = w ? w.planCredits + w.purchasedCredits : null;
  const creditRows: [string, number | null][] = [
    ["Credits Used", w ? w.usedThisPeriod : null],
    ["Credits Remaining", available],
    ["Purchased / Add-on Credits", w ? w.purchasedCredits : null],
  ];

  return (
    <>
      <MpHeader title="Usage & Credits" description="Track your workspace usage, credits, and plan limits." />

      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-5">
          {/* Overview */}
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[17px] font-extrabold text-deep-navy">Usage Overview</h2>
                <span className="rounded-lg bg-royal-tint px-2.5 py-1 text-[11.5px] font-semibold text-royal-blue">
                  {usage.planName ? `Loaded from ${usage.planName} plan configuration` : "Loaded from plan configuration"}
                </span>
              </div>
              <div
                className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-2"
                title="Earlier periods appear once usage history exists"
              >
                <CalendarDays aria-hidden className="h-5 w-5 text-deep-navy" />
                <div>
                  <div className="text-[10.5px] text-ink-muted">Current Period</div>
                  <div className="text-[12.5px] font-bold text-deep-navy">
                    {usage.period ? periodLabel(usage.period) : "No active billing period"}
                  </div>
                </div>
                <ChevronDown aria-hidden className="h-4 w-4 text-ink-muted" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {METRICS.map(({ key, label, icon: Icon, tone }) => {
                const used = usage.used[key];
                const limit = usage.limits[key];
                const pct = used != null && limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
                return (
                  <MpCard key={key} className="p-4">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-deep-navy">
                      <Icon aria-hidden className={cn("h-4 w-4 shrink-0", tone)} />
                      {label}
                    </div>
                    <div className="mt-3 text-[20px] font-extrabold leading-none text-deep-navy">{fmt(used)}</div>
                    <div className="mt-2 text-[12px] text-ink-muted">{used == null ? "Not available yet" : `${pct}% of limit`}</div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg-soft" aria-hidden>
                      <div className="h-full rounded-full bg-royal-blue" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-3 text-[11.5px] text-ink-muted">
                      {fmt(used)} used of {fmt(limit)}
                    </div>
                  </MpCard>
                );
              })}
            </div>
            {!anyUsage && (
              <div className="mt-3">
                <Banner>Values will appear here once usage data is available for your workspace.</Banner>
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {/* Credits */}
            <MpCard className="p-5">
              <h2 className="flex items-center gap-3 text-[16px] font-extrabold text-deep-navy">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet text-white">
                  <Sparkles aria-hidden className="h-4 w-4" />
                </span>
                Credits
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-bg-soft p-4">
                  <div className="text-[13.5px] font-bold text-deep-navy">Credits Available</div>
                  <div className="mt-4 text-[22px] font-extrabold text-deep-navy">{fmt(available)}</div>
                  <div className="mt-2 text-[12px] text-ink-muted">
                    {w ? `${fmt(w.planCredits)} plan · ${fmt(w.purchasedCredits)} purchased` : "Not available yet"}
                  </div>
                </div>
                <dl className="divide-y divide-line rounded-xl border border-line">
                  {creditRows.map(([r, v]) => (
                    <div key={r} className="flex justify-between px-4 py-3 text-[12.5px]">
                      <dt className="text-deep-navy">{r}</dt>
                      <dd className={v == null ? "text-ink-muted" : "font-bold text-deep-navy"}>{fmt(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {usage.creditPacks.length > 0 && <BuyCredits packs={usage.creditPacks} />}
              {!w && (
                <div className="mt-4">
                  <Banner action={<TextLink href={BILLING}>View credit details</TextLink>}>
                    Credit balances will appear once credits are enabled for your plan.
                  </Banner>
                </div>
              )}
            </MpCard>

            {/* Plan limits */}
            <MpCard className="flex flex-col">
              <div className="flex gap-3 p-5 pb-3">
                <ShieldCheck aria-hidden className="h-7 w-7 shrink-0 text-royal-blue" />
                <div>
                  <h2 className="text-[15px] font-extrabold text-deep-navy">Plan Limits</h2>
                  <p className="text-[12px] text-ink-soft">
                    {usage.planName ? `Inclusive of your ${usage.planName} plan and active add-ons` : "Inclusive of your plan and active add-ons"}
                  </p>
                </div>
              </div>
              <dl className="flex-1 px-5">
                {METRICS.map(({ key, label }) => (
                  <div key={key} className="flex justify-between py-2 text-[12.5px]">
                    <dt className="text-deep-navy">{label}</dt>
                    <dd className="text-ink-muted">
                      {fmt(usage.used[key])} / {fmt(usage.limits[key])}
                    </dd>
                  </div>
                ))}
              </dl>
              <Link
                href={BILLING}
                className="flex items-center justify-between border-t border-line px-5 py-3.5 text-[12.5px] font-bold text-royal-blue hover:bg-bg-soft"
              >
                View full plan details
                <ChevronRight aria-hidden className="h-4 w-4" />
              </Link>
            </MpCard>

            {/* Usage by module */}
            <MpCard className="p-5">
              <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-deep-navy">
                Usage by Module
                <Info aria-hidden className="h-4 w-4 text-ink-muted" />
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {MODULES.map(({ label, icon: Icon, tone }) => (
                  <div key={label} className="rounded-xl border border-line p-3">
                    <div className="flex items-center gap-2 text-[11.5px] font-bold leading-tight text-deep-navy">
                      <Icon aria-hidden className={cn("h-4 w-4 shrink-0", tone)} />
                      {label}
                    </div>
                    <div className="mt-4 text-[15px] font-extrabold text-deep-navy">—</div>
                    <div className="mt-1 text-[11px] text-ink-muted">Not available yet</div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Banner action={<TextLink href={HELP} external>Learn how usage is calculated</TextLink>}>
                  Module usage will display here once metering is active.
                </Banner>
              </div>
            </MpCard>

            {/* Usage history */}
            <MpCard className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  <CalendarDays aria-hidden className="h-7 w-7 shrink-0 text-royal-blue" />
                  <div>
                    <h2 className="text-[15px] font-extrabold text-deep-navy">Usage History</h2>
                    <p className="text-[12px] text-ink-soft">Track your usage trend over time.</p>
                  </div>
                </div>
                <select
                  disabled
                  aria-label="History range"
                  title="Available once usage history exists"
                  className="h-10 rounded-xl border border-line bg-white px-3 text-[12.5px] text-deep-navy disabled:opacity-60"
                >
                  <option>Last 6 months</option>
                </select>
              </div>
              <div className="mt-5 flex flex-col items-center rounded-xl border border-line bg-bg-soft px-6 py-12 text-center">
                <TrendingUp aria-hidden className="h-9 w-9 text-royal-blue/60" />
                <h3 className="mt-4 text-[15px] font-extrabold text-deep-navy">No usage history yet.</h3>
                <p className="mt-2 text-[12.5px] text-ink-soft">History will appear once usage data is available.</p>
              </div>
            </MpCard>
          </div>

          {usage.grants.length > 0 && (
            <MpCard>
              <h2 className="border-b border-line px-5 py-3.5 text-[14px] font-bold text-deep-navy">
                Credits granted to your account
              </h2>
              <ul className="divide-y divide-line">
                {usage.grants.map((g) => (
                  <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <div className="text-[13px] font-semibold capitalize text-deep-navy">{g.type}</div>
                      <div className="text-[11.5px] text-ink-muted">
                        {g.reason} · {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(g.createdAt)}
                      </div>
                    </div>
                    <span className="text-[13px] font-bold text-deep-navy">
                      {g.amount != null
                        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(g.amount)
                        : g.days != null
                          ? `${g.days} days`
                          : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </MpCard>
          )}
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          <RailCard icon={Info} title="About Usage & Credits">
            <p>This page shows your consumption for metered resources based on your current plan and add-ons.</p>
            <p>Usage resets at the start of each billing period unless stated otherwise in your plan configuration.</p>
            <TextLink href={HELP} external>Learn more about usage</TextLink>
          </RailCard>
          <RailCard icon={FileText} title="Usage Details">
            <p>Understanding what counts toward each resource helps you plan better.</p>
            <TextLink href={HELP} external>View usage definitions</TextLink>
          </RailCard>
          <RailCard icon={Bell} title="Threshold Notifications" badge="Coming Soon">
            <p>Threshold options will appear when supported for a metered resource.</p>
            <TextLink href={HELP} external>Learn more</TextLink>
          </RailCard>
          <RailCard icon={ArrowUpCircle} title="Need More Capacity?">
            <p>Upgrade your plan or add capacity to continue growing.</p>
            <Link
              href={BILLING}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-deep-navy text-[13px] font-bold text-white transition hover:opacity-90"
            >
              Manage Plan &amp; Billing
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </RailCard>
        </aside>
      </div>

      <div className="mt-5">
        <Banner>
          Usage and credits are provided for visibility and planning purposes. Actual enforcement is based on your plan
          configuration.
        </Banner>
      </div>
    </>
  );
}
