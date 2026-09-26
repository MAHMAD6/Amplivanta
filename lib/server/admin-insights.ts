import "server-only";
import { prisma } from "@/lib/prisma";
import { PartyStatus } from "@prisma/client";

/**
 * Read models for the Super Admin board and settings screens that summarise
 * many tables at once rather than listing one.
 *
 * Every loader returns `connected: false` when the database could not answer,
 * so a screen can tell "the source is down" apart from "there is nothing yet"
 * and never has to invent a number (handoff rule 5). Values are always derived
 * from stored records; nothing is estimated, projected or seeded.
 */

const money = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

const num = (n: number) => new Intl.NumberFormat("en-US").format(n);

const pct = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 1000) / 10}%` : null);

const dt = (d: Date | null | undefined) =>
  d ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d) : null;

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

/** One headline figure with the table it came from, so a reader can check it. */
export type Metric = { label: string; value: string | null; note?: string | null; source: string };

/** A simple named breakdown used for source/device/channel tables. */
export type Breakdown = { name: string; count: number; extra?: string | null };

/* --------------------------------------------------- executive dashboard */

export type ExecutiveSummary = {
  connected: boolean;
  metrics: Metric[];
  pipeline: { stage: string; deals: number; value: string }[];
  incidents: { id: string; title: string; severity: string; detected: string | null }[];
  health: { service: string; status: string; latencyMs: number | null; checked: string | null }[];
  actions: { title: string; detail: string; href: string }[];
};

export async function loadExecutiveSummary(): Promise<ExecutiveSummary> {
  try {
    const since = daysAgo(30);
    const [
      organizations,
      workspaces,
      users,
      activeSubs,
      trialingSubs,
      invoices,
      openDeals,
      wonDeals,
      activeCampaigns,
      contacts30,
      incidents,
      healthRows,
      pendingInvites,
      openTickets,
      failingIntegrations,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.workspace.count(),
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "active" } }),
      prisma.subscription.count({ where: { status: "trialing" } }),
      prisma.invoice.aggregate({ where: { status: "paid", paidAt: { gte: since } }, _sum: { amount: true }, _count: true }),
      prisma.deal.aggregate({ where: { status: "open" }, _sum: { value: true }, _count: true }),
      prisma.deal.aggregate({ where: { status: "won", updatedAt: { gte: since } }, _sum: { value: true }, _count: true }),
      prisma.campaign.count({ where: { status: "active" } }),
      prisma.contact.count({ where: { createdAt: { gte: since } } }),
      prisma.platformIncident.findMany({ where: { status: { not: "resolved" } }, orderBy: { detectedAt: "desc" }, take: 8 }),
      prisma.systemHealthCheck.findMany({ orderBy: { checkedAt: "desc" }, take: 40 }),
      prisma.invitation.count({ where: { status: "PENDING" } }),
      prisma.supportTicket.count({ where: { status: { in: ["OPEN", "PENDING"] } } }),
      prisma.integration.count({ where: { status: "error" } }),
    ]);

    // Latest check per service, so a board shows current state not history.
    const latest = new Map<string, (typeof healthRows)[number]>();
    for (const row of healthRows) if (!latest.has(row.service)) latest.set(row.service, row);

    const dealsByStage = await prisma.deal.groupBy({
      by: ["stageId"],
      where: { status: "open" },
      _count: true,
      _sum: { value: true },
    });
    const stageIds = dealsByStage.map((d) => d.stageId).filter((s): s is string => Boolean(s));
    const stages = stageIds.length ? await prisma.stage.findMany({ where: { id: { in: stageIds } } }) : [];
    const stageName = new Map(stages.map((s) => [s.id, s.name]));

    const actions: { title: string; detail: string; href: string }[] = [];
    if (incidents.length)
      actions.push({ title: "Resolve open incidents", detail: `${incidents.length} unresolved on the platform.`, href: "/admin/command-center/command-center" });
    if (failingIntegrations)
      actions.push({ title: "Repair failing integrations", detail: `${failingIntegrations} integration${failingIntegrations === 1 ? "" : "s"} reporting an error.`, href: "/admin/integrations-api/integrations" });
    if (openTickets)
      actions.push({ title: "Work the support queue", detail: `${openTickets} ticket${openTickets === 1 ? "" : "s"} open or pending.`, href: "/admin/support-tickets/support-tickets" });
    if (pendingInvites)
      actions.push({ title: "Chase pending invitations", detail: `${pendingInvites} invitation${pendingInvites === 1 ? "" : "s"} not yet accepted.`, href: "/admin/user-management/invitations" });

    return {
      connected: true,
      metrics: [
        { label: "Organizations", value: num(organizations), note: `${num(workspaces)} workspaces`, source: "Organization" },
        { label: "Users", value: num(users), source: "User" },
        { label: "Active subscriptions", value: num(activeSubs), note: trialingSubs ? `${num(trialingSubs)} trialing` : null, source: "Subscription" },
        { label: "Invoiced (30 days)", value: money(invoices._sum.amount ?? 0), note: `${num(invoices._count)} paid invoices`, source: "Invoice" },
        { label: "Open pipeline", value: money(openDeals._sum.value ?? 0), note: `${num(openDeals._count)} open deals`, source: "Deal" },
        { label: "Won (30 days)", value: money(wonDeals._sum.value ?? 0), note: `${num(wonDeals._count)} deals`, source: "Deal" },
        { label: "Active campaigns", value: num(activeCampaigns), source: "Campaign" },
        { label: "New contacts (30 days)", value: num(contacts30), source: "Contact" },
      ],
      pipeline: dealsByStage
        .map((d) => ({
          stage: (d.stageId && stageName.get(d.stageId)) || "Unassigned",
          deals: d._count,
          value: money(d._sum.value ?? 0),
        }))
        .sort((a, b) => b.deals - a.deals),
      incidents: incidents.map((i) => ({ id: i.id, title: i.title, severity: i.severity, detected: dt(i.detectedAt) })),
      health: [...latest.values()].map((h) => ({ service: h.service, status: h.status, latencyMs: h.latencyMs, checked: dt(h.checkedAt) })),
      actions,
    };
  } catch {
    return { connected: false, metrics: [], pipeline: [], incidents: [], health: [], actions: [] };
  }
}

/* ----------------------------------------------------- affiliate program */

export type AffiliateCommandCenter = {
  connected: boolean;
  metrics: Metric[];
  topAffiliates: { id: string; name: string; code: string; referrals: number; converted: number; earned: string }[];
  pendingApplications: { id: string; name: string; email: string; created: string | null }[];
  openSignals: { id: string; signal: string; severity: string; created: string | null }[];
};

export async function loadAffiliateCommandCenter(): Promise<AffiliateCommandCenter> {
  try {
    const [affiliates, approved, pending, referrals, converted, commissionPending, commissionPaid, payoutPending, signals, applications] =
      await Promise.all([
        prisma.affiliate.count(),
        prisma.affiliate.count({ where: { status: PartyStatus.APPROVED } }),
        prisma.affiliateApplication.count({ where: { status: PartyStatus.PENDING } }),
        prisma.referral.count(),
        prisma.referral.count({ where: { convertedAt: { not: null } } }),
        prisma.commission.aggregate({ where: { status: "pending" }, _sum: { amount: true }, _count: true }),
        prisma.commission.aggregate({ where: { status: "paid" }, _sum: { amount: true } }),
        prisma.payout.aggregate({ where: { status: "PENDING" }, _sum: { amount: true }, _count: true }),
        prisma.fraudSignal.findMany({ where: { resolvedAt: null }, orderBy: { createdAt: "desc" }, take: 8 }),
        prisma.affiliateApplication.findMany({ where: { status: PartyStatus.PENDING }, orderBy: { createdAt: "desc" }, take: 8 }),
      ]);

    const rows = await prisma.affiliate.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { referrals: { select: { convertedAt: true } }, commissions: { select: { amount: true, status: true } } },
    });

    return {
      connected: true,
      metrics: [
        { label: "Affiliates", value: num(affiliates), note: `${num(approved)} approved`, source: "Affiliate" },
        { label: "Applications pending", value: num(pending), source: "AffiliateApplication" },
        { label: "Referrals", value: num(referrals), note: pct(converted, referrals) ? `${pct(converted, referrals)} converted` : null, source: "Referral" },
        { label: "Commission owed", value: money(commissionPending._sum.amount ?? 0), note: `${num(commissionPending._count)} pending`, source: "Commission" },
        { label: "Commission paid", value: money(commissionPaid._sum.amount ?? 0), source: "Commission" },
        { label: "Payouts pending", value: money(payoutPending._sum.amount ?? 0), note: `${num(payoutPending._count)} requests`, source: "Payout" },
        { label: "Open fraud signals", value: num(signals.length), source: "FraudSignal" },
      ],
      topAffiliates: rows
        .map((a) => ({
          id: a.id,
          name: a.name,
          code: a.code,
          referrals: a.referrals.length,
          converted: a.referrals.filter((r) => r.convertedAt).length,
          earnedRaw: a.commissions.reduce((sum, c) => sum + c.amount, 0),
        }))
        .sort((a, b) => b.earnedRaw - a.earnedRaw || b.referrals - a.referrals)
        .slice(0, 10)
        .map(({ earnedRaw, ...rest }) => ({ ...rest, earned: money(earnedRaw) })),
      pendingApplications: applications.map((a) => ({ id: a.id, name: a.name, email: a.email, created: dt(a.createdAt) })),
      openSignals: signals.map((s) => ({ id: s.id, signal: s.signal, severity: s.severity, created: dt(s.createdAt) })),
    };
  } catch {
    return { connected: false, metrics: [], topAffiliates: [], pendingApplications: [], openSignals: [] };
  }
}

/** Keys the affiliate program settings screen manages, with their meaning. */
export const AFFILIATE_SETTING_KEYS: { key: string; label: string; help: string; kind: "number" | "text" | "boolean" }[] = [
  { key: "default_commission_rate", label: "Default commission rate (%)", help: "Applied to a new affiliate when none is set on the record.", kind: "number" },
  { key: "cookie_window_days", label: "Attribution window (days)", help: "How long a referral stays attributable after the visit.", kind: "number" },
  { key: "payout_threshold", label: "Minimum payout (USD)", help: "Earnings below this are held until the next period.", kind: "number" },
  { key: "hold_period_days", label: "Commission hold (days)", help: "Delay before a commission becomes payable, to cover refunds.", kind: "number" },
  { key: "auto_approve_applications", label: "Approve applications automatically", help: "Off by default: applications are reviewed by an administrator.", kind: "boolean" },
  { key: "program_terms_url", label: "Program terms URL", help: "Linked from the affiliate signup and dashboard.", kind: "text" },
];

export async function loadAffiliateProgramSettings() {
  try {
    const rows = await prisma.affiliateProgramSetting.findMany();
    const byKey = new Map(rows.map((r) => [r.key, r]));
    return {
      connected: true,
      settings: AFFILIATE_SETTING_KEYS.map((def) => {
        const row = byKey.get(def.key);
        return {
          ...def,
          value: row ? String((row.value as unknown) ?? "") : "",
          set: Boolean(row),
          updatedAt: dt(row?.updatedAt ?? null),
        };
      }),
    };
  } catch {
    return { connected: false, settings: [] };
  }
}

/* ------------------------------------------------------- partner program */

export type PartnerInsights = {
  connected: boolean;
  metrics: Metric[];
  programs: { id: string; name: string; status: string; partners: number; approved: number }[];
  tiers: Breakdown[];
  contribution: { name: string; referrals: number; converted: number; earned: string }[];
};

export async function loadPartnerInsights(): Promise<PartnerInsights> {
  try {
    const [programs, profiles, pendingApps, approvedProfiles, referrals, converted, commissions] = await Promise.all([
      prisma.partnerProgram.findMany({ orderBy: { createdAt: "desc" }, include: { profiles: true } }),
      prisma.partnerProfile.count(),
      prisma.partnerApplication.count({ where: { status: PartyStatus.PENDING } }),
      prisma.partnerProfile.count({ where: { status: PartyStatus.APPROVED } }),
      prisma.referral.count(),
      prisma.referral.count({ where: { convertedAt: { not: null } } }),
      prisma.commission.aggregate({ _sum: { amount: true } }),
    ]);

    const tierMap = new Map<string, number>();
    for (const program of programs) {
      for (const profile of program.profiles) {
        const tier = profile.tier?.trim() || "No tier set";
        tierMap.set(tier, (tierMap.get(tier) ?? 0) + 1);
      }
    }

    const affiliates = await prisma.affiliate.findMany({
      take: 50,
      include: { referrals: { select: { convertedAt: true } }, commissions: { select: { amount: true } } },
    });

    return {
      connected: true,
      metrics: [
        { label: "Programs", value: num(programs.length), note: `${num(programs.filter((p) => p.status === "active").length)} active`, source: "PartnerProgram" },
        { label: "Partners", value: num(profiles), note: `${num(approvedProfiles)} approved`, source: "PartnerProfile" },
        { label: "Applications pending", value: num(pendingApps), source: "PartnerApplication" },
        { label: "Referrals", value: num(referrals), note: pct(converted, referrals) ? `${pct(converted, referrals)} converted` : null, source: "Referral" },
        { label: "Commission recorded", value: money(commissions._sum.amount ?? 0), source: "Commission" },
      ],
      programs: programs.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        partners: p.profiles.length,
        approved: p.profiles.filter((x) => x.status === PartyStatus.APPROVED).length,
      })),
      tiers: [...tierMap.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      contribution: affiliates
        .map((a) => ({
          name: a.name,
          referrals: a.referrals.length,
          converted: a.referrals.filter((r) => r.convertedAt).length,
          earnedRaw: a.commissions.reduce((s, c) => s + c.amount, 0),
        }))
        .filter((a) => a.referrals > 0 || a.earnedRaw > 0)
        .sort((a, b) => b.earnedRaw - a.earnedRaw)
        .slice(0, 15)
        .map(({ earnedRaw, ...rest }) => ({ ...rest, earned: money(earnedRaw) })),
    };
  } catch {
    return { connected: false, metrics: [], programs: [], tiers: [], contribution: [] };
  }
}

/* ---------------------------------------------------- reports & analytics */

export type TrafficInsights = {
  connected: boolean;
  metrics: Metric[];
  topPaths: Breakdown[];
  sources: Breakdown[];
  devices: Breakdown[];
  daily: [string, number][];
};

export async function loadTrafficAnalytics(days = 30): Promise<TrafficInsights> {
  try {
    const since = daysAgo(days);
    const [aggregates, visits, pageviewTotal] = await Promise.all([
      prisma.siteEventAggregate.findMany({ where: { date: { gte: since } }, orderBy: { date: "asc" } }),
      prisma.landingPageVisit.findMany({ where: { createdAt: { gte: since } }, select: { source: true, device: true, formStarted: true, converted: true } }),
      prisma.siteEventAggregate.aggregate({ where: { date: { gte: since }, name: "page_view" }, _sum: { count: true } }),
    ]);

    const daily = new Map<string, number>();
    const paths = new Map<string, number>();
    for (const row of aggregates) {
      const key = row.date.toISOString().slice(0, 10);
      daily.set(key, (daily.get(key) ?? 0) + row.count);
      if (row.name === "page_view") paths.set(row.path || "/", (paths.get(row.path || "/") ?? 0) + row.count);
    }

    const sources = new Map<string, number>();
    const devices = new Map<string, number>();
    for (const v of visits) {
      sources.set(v.source?.trim() || "Direct / unknown", (sources.get(v.source?.trim() || "Direct / unknown") ?? 0) + 1);
      devices.set(v.device?.trim() || "Not recorded", (devices.get(v.device?.trim() || "Not recorded") ?? 0) + 1);
    }
    const convertedVisits = visits.filter((v) => v.converted).length;

    return {
      connected: true,
      metrics: [
        { label: "Tracked events", value: num(aggregates.reduce((s, r) => s + r.count, 0)), note: `last ${days} days`, source: "SiteEventAggregate" },
        { label: "Page views", value: num(pageviewTotal._sum.count ?? 0), note: `last ${days} days`, source: "SiteEventAggregate" },
        { label: "Landing page visits", value: num(visits.length), source: "LandingPageVisit" },
        { label: "Visit conversion", value: pct(convertedVisits, visits.length), note: `${num(convertedVisits)} converted`, source: "LandingPageVisit" },
      ],
      topPaths: [...paths.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 12),
      sources: [...sources.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 12),
      devices: [...devices.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      daily: [...daily.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    };
  } catch {
    return { connected: false, metrics: [], topPaths: [], sources: [], devices: [], daily: [] };
  }
}

export type CampaignInsights = {
  connected: boolean;
  metrics: Metric[];
  rows: { id: string; name: string; channel: string | null; status: string; impressions: string; clicks: string; ctr: string | null; conversions: string; spend: string; revenue: string; roas: string | null }[];
  channels: { name: string; spend: string; revenue: string; conversions: string }[];
};

export async function loadCampaignAnalytics(): Promise<CampaignInsights> {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: { metrics: true },
    });

    const totals = { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 };
    const channels = new Map<string, { spend: number; revenue: number; conversions: number }>();

    const rows = campaigns.map((c) => {
      const agg = c.metrics.reduce(
        (a, m) => ({
          impressions: a.impressions + m.impressions,
          clicks: a.clicks + m.clicks,
          conversions: a.conversions + m.conversions,
          spend: a.spend + m.spend,
          revenue: a.revenue + m.revenue,
        }),
        { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 },
      );
      totals.impressions += agg.impressions;
      totals.clicks += agg.clicks;
      totals.conversions += agg.conversions;
      totals.spend += agg.spend;
      totals.revenue += agg.revenue;

      const channelKey = c.channel?.trim() || "Unassigned";
      const entry = channels.get(channelKey) ?? { spend: 0, revenue: 0, conversions: 0 };
      entry.spend += agg.spend;
      entry.revenue += agg.revenue;
      entry.conversions += agg.conversions;
      channels.set(channelKey, entry);

      return {
        id: c.id,
        name: c.name,
        channel: c.channel ?? null,
        status: c.status,
        impressions: num(agg.impressions),
        clicks: num(agg.clicks),
        ctr: pct(agg.clicks, agg.impressions),
        conversions: num(agg.conversions),
        spend: money(agg.spend),
        revenue: money(agg.revenue),
        roas: agg.spend > 0 ? `${(Math.round((agg.revenue / agg.spend) * 100) / 100).toFixed(2)}×` : null,
      };
    });

    return {
      connected: true,
      metrics: [
        { label: "Campaigns", value: num(campaigns.length), note: `${num(campaigns.filter((c) => c.status === "active").length)} active`, source: "Campaign" },
        { label: "Impressions", value: num(totals.impressions), source: "CampaignMetric" },
        { label: "Clicks", value: num(totals.clicks), note: pct(totals.clicks, totals.impressions) ? `${pct(totals.clicks, totals.impressions)} CTR` : null, source: "CampaignMetric" },
        { label: "Conversions", value: num(totals.conversions), source: "CampaignMetric" },
        { label: "Spend", value: money(totals.spend), source: "CampaignMetric" },
        { label: "Revenue", value: money(totals.revenue), note: totals.spend > 0 ? `${(Math.round((totals.revenue / totals.spend) * 100) / 100).toFixed(2)}× ROAS` : null, source: "CampaignMetric" },
      ],
      rows: rows.filter((r) => r.impressions !== "0" || r.spend !== money(0) || r.conversions !== "0"),
      channels: [...channels.entries()]
        .map(([name, v]) => ({ name, spendRaw: v.spend, spend: money(v.spend), revenue: money(v.revenue), conversions: num(v.conversions) }))
        .sort((a, b) => b.spendRaw - a.spendRaw)
        .map(({ spendRaw, ...rest }) => rest),
    };
  } catch {
    return { connected: false, metrics: [], rows: [], channels: [] };
  }
}

export type FunnelInsights = {
  connected: boolean;
  stages: { stage: string; count: number; label: string; ofPrevious: string | null; ofTop: string | null; source: string }[];
  note: string | null;
};

/**
 * Visit → form start → form submission → contact → deal → won, each step from
 * the table that records it. Steps with no records are still listed so a gap in
 * instrumentation is visible instead of hidden.
 */
export async function loadConversionFunnel(days = 90): Promise<FunnelInsights> {
  try {
    const since = daysAgo(days);
    const [visits, formStarted, submissions, contacts, deals, won] = await Promise.all([
      prisma.landingPageVisit.count({ where: { createdAt: { gte: since } } }),
      prisma.landingPageVisit.count({ where: { createdAt: { gte: since }, formStarted: true } }),
      prisma.formSubmission.count({ where: { createdAt: { gte: since } } }),
      prisma.contact.count({ where: { createdAt: { gte: since } } }),
      prisma.deal.count({ where: { createdAt: { gte: since } } }),
      prisma.deal.count({ where: { createdAt: { gte: since }, status: "won" } }),
    ]);

    const raw: { stage: string; count: number; source: string }[] = [
      { stage: "Landing page visits", count: visits, source: "LandingPageVisit" },
      { stage: "Form started", count: formStarted, source: "LandingPageVisit" },
      { stage: "Form submitted", count: submissions, source: "FormSubmission" },
      { stage: "Contact created", count: contacts, source: "Contact" },
      { stage: "Deal created", count: deals, source: "Deal" },
      { stage: "Deal won", count: won, source: "Deal" },
    ];

    const top = raw[0].count;
    const stages = raw.map((s, i) => ({
      stage: s.stage,
      count: s.count,
      label: num(s.count),
      ofPrevious: i === 0 ? null : pct(s.count, raw[i - 1].count),
      ofTop: i === 0 ? null : pct(s.count, top),
      source: s.source,
    }));

    return {
      connected: true,
      stages,
      note: raw.every((s) => s.count === 0) ? `No funnel activity has been recorded in the last ${days} days.` : null,
    };
  } catch {
    return { connected: false, stages: [], note: null };
  }
}

export type AttributionInsights = {
  connected: boolean;
  metrics: Metric[];
  byChannel: { name: string; conversions: string; revenue: string; spend: string; roas: string | null; share: string | null }[];
  byCampaign: { name: string; channel: string | null; revenue: string; spend: string; roi: string | null }[];
  invoiced: { period: string; amount: string; invoices: number }[];
};

export async function loadRevenueAttribution(months = 6): Promise<AttributionInsights> {
  try {
    const now = new Date();
    const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));
    const [campaigns, invoices] = await Promise.all([
      prisma.campaign.findMany({ take: 200, include: { metrics: true } }),
      prisma.invoice.findMany({ where: { status: "paid", paidAt: { gte: since } }, select: { amount: true, paidAt: true } }),
    ]);

    const channels = new Map<string, { revenue: number; spend: number; conversions: number }>();
    const perCampaign: { name: string; channel: string | null; revenueRaw: number; spendRaw: number }[] = [];
    let totalRevenue = 0;
    let totalSpend = 0;
    let totalConversions = 0;

    for (const c of campaigns) {
      const revenue = c.metrics.reduce((s, m) => s + m.revenue, 0);
      const spend = c.metrics.reduce((s, m) => s + m.spend, 0);
      const conversions = c.metrics.reduce((s, m) => s + m.conversions, 0);
      if (revenue === 0 && spend === 0 && conversions === 0) continue;
      totalRevenue += revenue;
      totalSpend += spend;
      totalConversions += conversions;
      const key = c.channel?.trim() || "Unassigned";
      const entry = channels.get(key) ?? { revenue: 0, spend: 0, conversions: 0 };
      entry.revenue += revenue;
      entry.spend += spend;
      entry.conversions += conversions;
      channels.set(key, entry);
      perCampaign.push({ name: c.name, channel: c.channel ?? null, revenueRaw: revenue, spendRaw: spend });
    }

    const monthly = new Map<string, { amount: number; invoices: number }>();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      monthly.set(d.toISOString().slice(0, 7), { amount: 0, invoices: 0 });
    }
    for (const inv of invoices) {
      const key = inv.paidAt.toISOString().slice(0, 7);
      const entry = monthly.get(key);
      if (entry) {
        entry.amount += inv.amount;
        entry.invoices += 1;
      }
    }

    return {
      connected: true,
      metrics: [
        { label: "Attributed revenue", value: money(totalRevenue), note: "From campaign metrics", source: "CampaignMetric" },
        { label: "Attributed spend", value: money(totalSpend), source: "CampaignMetric" },
        { label: "Return on ad spend", value: totalSpend > 0 ? `${(Math.round((totalRevenue / totalSpend) * 100) / 100).toFixed(2)}×` : null, note: totalSpend > 0 ? null : "No spend recorded", source: "CampaignMetric" },
        { label: "Attributed conversions", value: num(totalConversions), source: "CampaignMetric" },
        { label: "Invoiced revenue", value: money(invoices.reduce((s, i) => s + i.amount, 0)), note: `${num(invoices.length)} paid invoices, last ${months} months`, source: "Invoice" },
      ],
      byChannel: [...channels.entries()]
        .map(([name, v]) => ({
          name,
          revenueRaw: v.revenue,
          conversions: num(v.conversions),
          revenue: money(v.revenue),
          spend: money(v.spend),
          roas: v.spend > 0 ? `${(Math.round((v.revenue / v.spend) * 100) / 100).toFixed(2)}×` : null,
          share: pct(v.revenue, totalRevenue),
        }))
        .sort((a, b) => b.revenueRaw - a.revenueRaw)
        .map(({ revenueRaw, ...rest }) => rest),
      byCampaign: perCampaign
        .sort((a, b) => b.revenueRaw - a.revenueRaw)
        .slice(0, 15)
        .map((c) => ({
          name: c.name,
          channel: c.channel,
          revenue: money(c.revenueRaw),
          spend: money(c.spendRaw),
          roi: c.spendRaw > 0 ? pct(c.revenueRaw - c.spendRaw, c.spendRaw) : null,
        })),
      invoiced: [...monthly.entries()].map(([period, v]) => ({ period, amount: money(v.amount), invoices: v.invoices })),
    };
  } catch {
    return { connected: false, metrics: [], byChannel: [], byCampaign: [], invoiced: [] };
  }
}

/** The analytics hub: one metric table naming the source of every figure. */
export async function loadAnalyticsHub() {
  try {
    const [traffic, campaign, funnel, attribution] = await Promise.all([
      loadTrafficAnalytics(30),
      loadCampaignAnalytics(),
      loadConversionFunnel(90),
      loadRevenueAttribution(6),
    ]);
    const connected = traffic.connected && campaign.connected && funnel.connected && attribution.connected;
    const rows: { metric: string; value: string | null; period: string; source: string }[] = [
      ...traffic.metrics.map((m) => ({ metric: m.label, value: m.value, period: "Last 30 days", source: m.source })),
      ...campaign.metrics.map((m) => ({ metric: m.label, value: m.value, period: "All recorded", source: m.source })),
      ...funnel.stages.map((s) => ({ metric: `Funnel — ${s.stage}`, value: s.label, period: "Last 90 days", source: s.source })),
      ...attribution.metrics.map((m) => ({ metric: m.label, value: m.value, period: "Last 6 months", source: m.source })),
    ];
    return { connected, rows };
  } catch {
    return { connected: false, rows: [] };
  }
}

/* -------------------------------------------------------------- settings */

/** Platform-wide settings stored in SiteSetting, grouped for the hub screen. */
export const GENERAL_SETTING_KEYS: { key: string; label: string; help: string }[] = [
  { key: "site_name", label: "Platform name", help: "Shown in page titles and transactional email." },
  { key: "support_email", label: "Support email", help: "Reply-to address on platform messages." },
  { key: "contact_email", label: "Contact email", help: "Destination for public contact form submissions." },
  { key: "default_timezone", label: "Default time zone", help: "Used when a workspace has not chosen one." },
  { key: "marketing_site_url", label: "Marketing site URL", help: "Canonical public address used in links." },
];

export async function loadGeneralSettings() {
  try {
    const [rows, workspaces, organizations, plans, domains] = await Promise.all([
      prisma.siteSetting.findMany(),
      prisma.workspace.count(),
      prisma.organization.count(),
      prisma.plan.count(),
      prisma.domain.count(),
    ]);
    const byKey = new Map(rows.map((r) => [r.key, r]));
    return {
      connected: true,
      settings: GENERAL_SETTING_KEYS.map((def) => {
        const row = byKey.get(def.key);
        return { ...def, value: row?.value ?? "", set: Boolean(row), updatedAt: dt(row?.updatedAt ?? null) };
      }),
      otherKeys: rows.filter((r) => !GENERAL_SETTING_KEYS.some((d) => d.key === r.key)).map((r) => ({ key: r.key, updatedAt: dt(r.updatedAt) })),
      scope: [
        { label: "Organizations", value: num(organizations) },
        { label: "Workspaces", value: num(workspaces) },
        { label: "Plans", value: num(plans) },
        { label: "Custom domains", value: num(domains) },
      ],
    };
  } catch {
    return { connected: false, settings: [], otherKeys: [], scope: [] };
  }
}

/**
 * Platform view of notification delivery. Per-member preferences live on the
 * member's own settings screen; this screen reports what the platform has
 * actually sent and how much of it has been read.
 */
export async function loadNotificationOverview(days = 30) {
  try {
    const since = daysAgo(days);
    const [total, recent, unread, byCategory, bySeverity, platform, states] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { createdAt: { gte: since } } }),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.groupBy({ by: ["category"], _count: true, where: { createdAt: { gte: since } } }),
      prisma.notification.groupBy({ by: ["severity"], _count: true, where: { createdAt: { gte: since } } }),
      prisma.platformNotification.count(),
      prisma.notificationState.count({ where: { readAt: { not: null } } }),
    ]);
    return {
      connected: true,
      metrics: [
        { label: "Notifications sent", value: num(total), note: `${num(recent)} in the last ${days} days`, source: "Notification" },
        { label: "Unread", value: num(unread), note: pct(unread, total) ? `${pct(unread, total)} of all` : null, source: "Notification" },
        { label: "Read receipts", value: num(states), source: "NotificationState" },
        { label: "Platform announcements", value: num(platform), source: "PlatformNotification" },
      ] as Metric[],
      categories: byCategory
        .map((c) => ({ name: c.category?.trim() || "Uncategorised", count: c._count }))
        .sort((a, b) => b.count - a.count) as Breakdown[],
      severities: bySeverity
        .map((s) => ({ name: s.severity, count: s._count }))
        .sort((a, b) => b.count - a.count) as Breakdown[],
    };
  } catch {
    return { connected: false, metrics: [] as Metric[], categories: [] as Breakdown[], severities: [] as Breakdown[] };
  }
}
