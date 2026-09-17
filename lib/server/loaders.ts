import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/tenant";
import { isStripeConfigured } from "@/lib/stripe";
import { parseCreditPacks } from "@/lib/credits/policy";

async function ctxOrNull() {
  try {
    return await getSessionContext();
  } catch {
    return null;
  }
}

export const USAGE_METRICS = [
  "aiCredits",
  "emailSends",
  "storage",
  "contacts",
  "automations",
  "connectedAccounts",
] as const;
export type UsageMetric = (typeof USAGE_METRICS)[number];

export const MODULE_LABELS = ["AI Advisor", "Creative Studio", "Marketing Automation", "Social Publishing", "CRM", "Analytics", "Marketplace"] as const;

/** Module a credit ledger entry belongs to, from its source and AI task code. */
export function creditModule(sourceType: string, note: string | null): string {
  if (sourceType === "media_generation") return "Creative Studio";
  const code = note ?? "";
  if (code.startsWith("document_") || code.startsWith("image") || code.startsWith("video")) return "Creative Studio";
  if (code.startsWith("social_")) return "Social Publishing";
  if (code.startsWith("listing_")) return "Marketplace";
  if (code.startsWith("email_") || code.startsWith("landing_") || code.startsWith("workflow_")) return "Marketing Automation";
  if (code.startsWith("crm_") || code.startsWith("contact_") || code.startsWith("deal_")) return "CRM";
  if (code.startsWith("report_") || code.startsWith("analytics_")) return "Analytics";
  return "AI Advisor";
}

/** FeatureEntitlement keys (lib/plan-config) for each usage metric. */
const ENTITLEMENT_KEY: Record<UsageMetric, string> = { aiCredits: "ai_credits", emailSends: "email_sends", storage: "storage_gb", contacts: "contacts", automations: "automations", connectedAccounts: "connected_accounts" };

export interface UsageOverview {
  live: boolean;
  planName: string | null;
  period: { start: Date; end: Date } | null;
  /** Limit per metric from plan entitlements; null when the plan does not configure one. */
  limits: Record<UsageMetric, number | null>;
  /** Metrics the plan configures as unlimited. */
  unlimited: UsageMetric[];
  /** Credits consumed this period per module, from the credit ledger; null without a wallet. */
  moduleCredits: Record<string, number> | null;
  /** Credits consumed per month for the last six months, oldest first; null without a wallet. */
  history: [month: string, credits: number][] | null;
  /** Consumption measured from workspace records (storage in GB); null when it cannot be measured. */
  used: Record<UsageMetric, number | null>;
  grants: { id: string; type: string; amount: number | null; days: number | null; reason: string; createdAt: Date }[];
  /** The workspace credit wallet; null until any credit has been posted. */
  wallet: { planCredits: number; purchasedCredits: number; usedThisPeriod: number } | null;
  /** One-time credit packs on offer; empty unless Stripe and CREDIT_PACKS are configured. */
  creditPacks: { code: string; label: string; credits: number }[];
}

const nullMetrics = () =>
  Object.fromEntries(USAGE_METRICS.map((m) => [m, null])) as Record<UsageMetric, number | null>;

/** Plan period, plan limits and credit grants for the Usage & Credits page. */
export async function loadUsageOverview(): Promise<UsageOverview> {
  const empty: UsageOverview = {
    live: false, planName: null, period: null, limits: nullMetrics(), unlimited: [], moduleCredits: null, history: null, used: nullMetrics(), grants: [],
    wallet: null, creditPacks: [],
  };
  const ctx = await ctxOrNull();
  if (!ctx) return empty;
  try {
    const [subscription, grants] = await Promise.all([
      db.subscription.findFirst({
        where: { workspaceId: ctx.workspaceId },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
      }),
      ctx.userId
        ? db.creditAdjustment.findMany({ where: { userId: ctx.userId }, orderBy: { createdAt: "desc" }, take: 20 })
        : Promise.resolve([]),
    ]);

    const since = subscription?.currentPeriodStart;
    const [wallet, usage] = await Promise.all([
      db.creditWallet.findUnique({ where: { workspaceId: ctx.workspaceId } }),
      db.creditLedgerEntry.aggregate({
        where: { workspaceId: ctx.workspaceId, kind: "USAGE", ...(since ? { createdAt: { gte: since } } : {}) },
        _sum: { amount: true },
      }),
    ]);

    // Limits come from the plan's entitlements (configured on Pricing Plans); the legacy limits JSON is a fallback.
    const limits = nullMetrics();
    const unlimited: UsageMetric[] = [];
    const raw = subscription?.plan?.limits;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      for (const m of USAGE_METRICS) {
        const v = (raw as Record<string, unknown>)[m];
        if (typeof v === "number" && Number.isFinite(v)) limits[m] = v;
      }
    }
    if (subscription) {
      const ents = await db.featureEntitlement.findMany({ where: { planId: subscription.planId }, select: { featureKey: true, limitValue: true, enabled: true } });
      for (const m of USAGE_METRICS) {
        const e = ents.find((x) => x.featureKey === ENTITLEMENT_KEY[m]);
        if (!e) continue;
        if (!e.enabled) limits[m] = 0;
        else if (e.limitValue == null) unlimited.push(m);
        else limits[m] = e.limitValue;
      }
    }

    // Measured consumption from workspace records for the current period (or all time where the metric is a standing count).
    const w = ctx.workspaceId;
    const periodStart = since ?? new Date(Date.now() - 30 * 86400000);
    const [emailSends, storageBytes, contacts, automations, social, integrations] = await Promise.all([
      db.emailSend.count({ where: { emailCampaign: { workspaceId: w }, status: "sent", createdAt: { gte: periodStart } } }),
      db.asset.aggregate({ where: { workspaceId: w }, _sum: { fileSize: true } }),
      db.contact.count({ where: { workspaceId: w } }),
      db.workflow.count({ where: { workspaceId: w, status: "active" } }),
      db.socialAccount.count({ where: { workspaceId: w, isConnected: true } }),
      db.integration.count({ where: { workspaceId: w, status: "connected" } }),
    ]);
    let moduleCredits: Record<string, number> | null = null;
    let history: [string, number][] | null = null;
    if (wallet) {
      const sixMonths = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 5, 1));
      const entries = await db.creditLedgerEntry.findMany({ where: { workspaceId: w, kind: { in: ["USAGE", "REFUND"] }, createdAt: { gte: sixMonths < periodStart ? sixMonths : periodStart } }, select: { amount: true, sourceType: true, note: true, createdAt: true } });
      moduleCredits = Object.fromEntries(MODULE_LABELS.map((m) => [m, 0]));
      const months = new Map<string, number>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - i, 1));
        months.set(d.toISOString().slice(0, 7), 0);
      }
      for (const e of entries) {
        const spent = -e.amount; // usage is negative, refunds positive
        const key = e.createdAt.toISOString().slice(0, 7);
        if (months.has(key)) months.set(key, (months.get(key) ?? 0) + spent);
        if (e.createdAt >= periodStart) {
          const mod = creditModule(e.sourceType, e.note);
          moduleCredits[mod] = (moduleCredits[mod] ?? 0) + spent;
        }
      }
      history = [...months.entries()];
    }

    const used = nullMetrics();
    used.aiCredits = wallet ? -(usage._sum.amount ?? 0) : null;
    used.emailSends = emailSends;
    used.storage = Math.round(((storageBytes._sum.fileSize ?? 0) / 1024 ** 3) * 100) / 100;
    used.contacts = contacts;
    used.automations = automations;
    used.connectedAccounts = social + integrations;

    return {
      live: true,
      planName: subscription?.plan?.name ?? null,
      period: subscription ? { start: subscription.currentPeriodStart, end: subscription.currentPeriodEnd } : null,
      limits,
      used,
      unlimited,
      moduleCredits,
      history,
      wallet: wallet
        ? {
            planCredits: wallet.planCredits,
            purchasedCredits: wallet.purchasedCredits,
            usedThisPeriod: -(usage._sum.amount ?? 0),
          }
        : null,
      creditPacks: isStripeConfigured()
        ? parseCreditPacks(process.env.CREDIT_PACKS).map(({ code, label, credits }) => ({ code, label, credits }))
        : [],
      grants: grants.map((g) => ({
        id: g.id,
        type: g.grantType.replace(/_/g, " ").toLowerCase(),
        amount: g.amount,
        days: g.days,
        reason: g.reason,
        createdAt: g.createdAt,
      })),
    };
  } catch {
    return empty;
  }
}

/** Workspace pipeline stages as {value:id,label:name} for form selects. Empty when unauthenticated. */
export async function loadStageOptions(): Promise<{ value: string; label: string }[]> {
  const ctx = await ctxOrNull();
  if (!ctx) return [];
  try {
    const rows = await db.stage.findMany({
      where: { workspaceId: ctx.workspaceId },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    });
    return rows.map((s) => ({ value: s.id, label: s.name }));
  } catch {
    return [];
  }
}
