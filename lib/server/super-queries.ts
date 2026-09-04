import "server-only";
import { AdminScopeLevel, Role, SuspensionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Data layer for the Super Admin screens.
 *
 * Screens are described declaratively (model, search fields, filters, row
 * mapping) so listing, filtering, pagination, CSV export and single-record
 * lookup all share one implementation instead of a bespoke function per page.
 *
 * Every spec reads the real database. A screen with no spec renders the
 * "not connected to a production data source yet" state, and a query failure
 * renders "Data source unavailable" — we never substitute fabricated rows
 * (handoff rule 5).
 */

export type SuperRow = { id: string; cells: (string | null)[] };
export type SuperResult = { rows: SuperRow[]; total: number; connected: boolean };

export const EMPTY: SuperResult = { rows: [], total: 0, connected: false };

export type SuperQueryArgs = {
  q?: string;
  page?: number;
  pageSize?: number;
  filters?: Record<string, string | undefined>;
};

/* ------------------------------------------------------------------ format */

const fmtDate = (d: Date | null | undefined) =>
  d ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(d) : null;

const fmtMoney = (n: number | null | undefined, currency = "USD") =>
  n == null ? null : new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

const label = (s: string | null | undefined) =>
  s ? s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ") : null;

const yesNo = (b: boolean | null | undefined) => (b == null ? null : b ? "Yes" : "No");

/* -------------------------------------------------------------------- spec */

type Row = Record<string, unknown>;

type TableSpec = {
  /** Prisma delegate name, e.g. "user". */
  model: string;
  orderBy: Record<string, "asc" | "desc">;
  /** Fields matched against the `q` search box (case-insensitive contains). */
  search?: string[];
  /** Base filter always applied. */
  where?: Record<string, unknown>;
  /** Maps a URL filter param to a Prisma where fragment. */
  filters?: Record<string, (value: string) => Record<string, unknown>>;
  include?: Record<string, unknown>;
  map: (row: Row) => (string | null)[];
};

const contains = (q: string) => ({ contains: q, mode: "insensitive" as const });

/** Equality filter helper for a plain column. */
const eq = (field: string) => (v: string) => ({ [field]: v });
/** Boolean filter driven by an "Enabled"/"Disabled" style option. */
const bool = (field: string, truthy: string) => (v: string) => ({ [field]: v === truthy });

const SPECS: Record<string, TableSpec> = {
  /* ---------------------------------------------------------- users */
  "user-management-all-users": {
    model: "user",
    orderBy: { createdAt: "desc" },
    search: ["name", "email"],
    filters: { role: eq("role") },
    map: (r) => [
      r.name as string,
      r.email as string,
      label(r.role as string),
      null,
      null,
      fmtDate(r.updatedAt as Date),
      "View",
    ],
  },

  "user-management-admins": {
    model: "user",
    orderBy: { createdAt: "desc" },
    search: ["name", "email"],
    where: { role: { in: [Role.SUPER_ADMIN, Role.ADMIN, Role.OWNER] } },
    filters: { role: eq("role") },
    map: (r) => [
      r.name as string,
      r.email as string,
      label(r.role as string),
      "Global",
      null,
      fmtDate(r.updatedAt as Date),
      "Manage",
    ],
  },

  "user-management-sub-admins": {
    model: "adminAssignment",
    orderBy: { createdAt: "desc" },
    where: {
      scopeLevel: { in: [AdminScopeLevel.ORGANIZATION, AdminScopeLevel.WORKSPACE, AdminScopeLevel.MODULE] },
    },
    filters: { scope: eq("scopeLevel") },
    include: { user: true, grantedBy: true, roleDefinition: true },
    map: (r) => {
      const u = r.user as Row | null;
      const g = r.grantedBy as Row | null;
      return [
        (u?.name as string) ?? null,
        (u?.email as string) ?? null,
        (g?.name as string) ?? null,
        label(r.scopeLevel as string),
        null,
        fmtDate(r.createdAt as Date),
        "Manage",
      ];
    },
  },

  "user-management-roles-and-permissions": {
    model: "roleDefinition",
    orderBy: { createdAt: "asc" },
    search: ["name", "key"],
    include: { _count: { select: { permissions: true, assignments: true } } },
    map: (r) => {
      const c = r._count as { permissions: number; assignments: number };
      return [
        r.name as string,
        (r.description as string) ?? null,
        r.isSystem ? "System" : "Custom",
        String(c.permissions),
        String(c.assignments),
        "Edit",
      ];
    },
  },

  "user-management-access-assignments": {
    model: "adminAssignment",
    orderBy: { createdAt: "desc" },
    filters: { scope: eq("scopeLevel") },
    include: { user: true, grantedBy: true, roleDefinition: true, organization: true },
    map: (r) => {
      const u = r.user as Row | null;
      const g = r.grantedBy as Row | null;
      const o = r.organization as Row | null;
      const role = r.roleDefinition as Row | null;
      return [
        (u?.name as string) ?? null,
        (role?.name as string) ?? null,
        label(r.scopeLevel as string),
        (o?.name as string) ?? (r.workspaceId as string) ?? null,
        (g?.name as string) ?? null,
        fmtDate(r.expiresAt as Date),
        "Revoke",
      ];
    },
  },

  "user-management-invitations": {
    model: "invitation",
    orderBy: { createdAt: "desc" },
    search: ["email"],
    filters: { status: eq("status") },
    include: { invitedBy: true, organization: true },
    map: (r) => {
      const inv = r.invitedBy as Row | null;
      const o = r.organization as Row | null;
      return [
        r.email as string,
        (o?.name as string) ?? null,
        label(r.scopeLevel as string),
        (inv?.name as string) ?? null,
        label(r.status as string),
        fmtDate(r.expiresAt as Date),
        "Resend",
      ];
    },
  },

  "user-management-sessions-devices": {
    model: "userSession",
    orderBy: { lastActiveAt: "desc" },
    where: { revokedAt: null },
    include: { user: true },
    map: (r) => {
      const u = r.user as Row | null;
      const combo = [r.browser, r.os].filter(Boolean).join(" / ");
      return [
        (u?.name as string) ?? null,
        (r.device as string) ?? null,
        combo || null,
        (r.ipAddress as string) ?? null,
        (r.location as string) ?? null,
        fmtDate(r.lastActiveAt as Date),
        "Revoke",
      ];
    },
  },

  "user-management-suspended-access": {
    model: "accessSuspension",
    orderBy: { createdAt: "desc" },
    where: { status: SuspensionStatus.ACTIVE },
    filters: { status: eq("status") },
    include: { user: true, suspendedBy: true },
    map: (r) => {
      const u = r.user as Row | null;
      const by = r.suspendedBy as Row | null;
      return [
        (u?.name as string) ?? null,
        r.reason as string,
        (by?.name as string) ?? null,
        label(r.status as string),
        fmtDate(r.createdAt as Date),
        "Lift",
      ];
    },
  },

  /* ---------------------------------------------------------- audit */
  "audit-logs-global-audit-logs": {
    model: "platformAuditLog",
    orderBy: { createdAt: "desc" },
    search: ["action"],
    include: { actor: true },
    map: (r) => {
      const a = r.actor as Row | null;
      const res = [r.resourceType, r.resourceId].filter(Boolean).join(":");
      return [
        (a?.name as string) ?? (r.actorUserId as string) ?? null,
        r.action as string,
        res || null,
        label(r.scopeLevel as string),
        (r.ipAddress as string) ?? null,
        fmtDate(r.createdAt as Date),
      ];
    },
  },

  /* -------------------------------------------------- organizations */
  "organizations-organizations": {
    model: "organization",
    orderBy: { createdAt: "desc" },
    search: ["name"],
    filters: { status: eq("status") },
    map: (r) => [
      r.name as string,
      r.plan as string,
      r.status as string,
      String(r.userCount),
      fmtDate(r.createdAt as Date),
      "Manage",
    ],
  },

  "organizations-tenant-workspace-management": {
    model: "workspace",
    orderBy: { createdAt: "desc" },
    search: ["name", "slug"],
    include: { _count: { select: { memberships: true } } },
    map: (r) => {
      const c = r._count as { memberships: number };
      return [
        r.name as string,
        (r.domain as string) ?? null,
        r.planTier as string,
        String(c.memberships),
        fmtDate(r.createdAt as Date),
        "Manage",
      ];
    },
  },

  /* ------------------------------------------------- plans, billing */
  "plans-and-pricing-pricing-plans-overview": {
    model: "plan",
    orderBy: { price: "asc" },
    search: ["name"],
    include: { _count: { select: { subscriptions: true } } },
    map: (r) => {
      const c = r._count as { subscriptions: number };
      return [
        r.name as string,
        fmtMoney(r.price as number),
        r.interval as string,
        String((r.features as string[]).length),
        String(c.subscriptions),
        "Edit",
      ];
    },
  },

  "plans-and-pricing-pricing-benchmark-and-positioning": {
    model: "pricingBenchmark",
    orderBy: { capturedAt: "desc" },
    search: ["competitor", "planName"],
    map: (r) => [
      r.competitor as string,
      r.planName as string,
      fmtMoney(r.price as number, r.currency as string),
      r.interval as string,
      fmtDate(r.capturedAt as Date),
      (r.sourceUrl as string) ?? null,
    ],
  },

  "subscriptions-and-billing-subscriptions": {
    model: "subscription",
    orderBy: { createdAt: "desc" },
    filters: { status: eq("status") },
    include: { plan: true, workspace: true },
    map: (r) => {
      const w = r.workspace as Row;
      const p = r.plan as Row;
      return [
        w.name as string,
        p.name as string,
        r.status as string,
        `${fmtDate(r.currentPeriodStart as Date)} – ${fmtDate(r.currentPeriodEnd as Date)}`,
        fmtDate(r.currentPeriodEnd as Date),
        "Manage",
      ];
    },
  },

  "subscriptions-and-billing-billing-invoices": {
    model: "invoice",
    orderBy: { createdAt: "desc" },
    filters: { status: eq("status") },
    include: { workspace: true },
    map: (r) => {
      const w = r.workspace as Row;
      return [
        (r.id as string).slice(0, 10),
        w.name as string,
        fmtMoney(r.amount as number),
        r.status as string,
        fmtDate(r.paidAt as Date),
        "View",
      ];
    },
  },

  "subscriptions-and-billing-ai-credit-management": {
    model: "creditAdjustment",
    orderBy: { createdAt: "desc" },
    search: ["reason"],
    filters: { grantType: eq("grantType") },
    include: { user: true, organization: true, grantedBy: true },
    map: (r) => {
      const u = r.user as Row | null;
      const o = r.organization as Row | null;
      const g = r.grantedBy as Row | null;
      const value =
        r.amount == null
          ? r.days == null
            ? null
            : `${r.days} days`
          : fmtMoney(r.amount as number);
      return [
        label(r.grantType as string),
        (u?.name as string) ?? (o?.name as string) ?? null,
        value,
        r.reason as string,
        (g?.name as string) ?? null,
        fmtDate(r.effectiveAt as Date),
        fmtDate(r.expiresAt as Date),
      ];
    },
  },

  /* --------------------------------------------------------- system */
  "system-management-module-controls": {
    model: "moduleControl",
    orderBy: { name: "asc" },
    search: ["name", "key"],
    filters: { status: eq("status"), scope: eq("scopeLevel") },
    map: (r) => [
      r.name as string,
      (r.description as string) ?? null,
      label(r.status as string),
      label(r.scopeLevel as string),
      r.isCore ? "Core" : "Configure",
    ],
  },

  "system-management-feature-flags": {
    model: "featureFlag",
    orderBy: { name: "asc" },
    search: ["name", "key"],
    filters: { enabled: bool("enabled", "Enabled") },
    map: (r) => [
      r.name as string,
      (r.description as string) ?? null,
      r.enabled ? "Enabled" : "Disabled",
      r.rolloutPercent == null ? null : `${r.rolloutPercent}%`,
      label(r.scopeLevel as string),
      "Edit",
    ],
  },

  "system-management-usage-and-costs": {
    model: "usageCostRecord",
    orderBy: { periodStart: "desc" },
    search: ["category", "provider"],
    include: { organization: true },
    map: (r) => {
      const o = r.organization as Row | null;
      return [
        `${fmtDate(r.periodStart as Date)} – ${fmtDate(r.periodEnd as Date)}`,
        r.category as string,
        (r.provider as string) ?? null,
        String(r.units),
        fmtMoney(r.cost as number, r.currency as string),
        (o?.name as string) ?? null,
      ];
    },
  },

  "system-management-system-health": {
    model: "systemHealthCheck",
    orderBy: { checkedAt: "desc" },
    search: ["service"],
    map: (r) => [
      r.service as string,
      r.status as string,
      r.latencyMs == null ? null : `${r.latencyMs} ms`,
      (r.message as string) ?? null,
      fmtDate(r.checkedAt as Date),
    ],
  },

  /* ------------------------------------------ security & compliance */
  "security-and-compliance-consent-records": {
    model: "consentRecord",
    orderBy: { recordedAt: "desc" },
    search: ["subjectEmail", "consentType"],
    map: (r) => [
      r.subjectEmail as string,
      r.consentType as string,
      r.granted ? "Granted" : "Withdrawn",
      (r.source as string) ?? null,
      (r.ipAddress as string) ?? null,
      fmtDate(r.recordedAt as Date),
    ],
  },

  "security-and-compliance-suppression-lists": {
    model: "suppressionEntry",
    orderBy: { createdAt: "desc" },
    search: ["email", "reason"],
    map: (r) => [r.email as string, r.reason as string, (r.source as string) ?? null, fmtDate(r.createdAt as Date)],
  },

  "security-and-compliance-data-requests-dsar": {
    model: "dataRequest",
    orderBy: { requestedAt: "desc" },
    search: ["subjectEmail"],
    filters: { status: eq("status"), type: eq("type") },
    map: (r) => [
      r.subjectEmail as string,
      label(r.type as string),
      label(r.status as string),
      fmtDate(r.requestedAt as Date),
      fmtDate(r.completedAt as Date),
      "Process",
    ],
  },

  /* ------------------------------------------------------ affiliates */
  "affiliate-management-applications": {
    model: "affiliateApplication",
    orderBy: { createdAt: "desc" },
    search: ["name", "email"],
    filters: { status: eq("status") },
    map: (r) => [
      r.name as string,
      r.email as string,
      (r.website as string) ?? null,
      label(r.status as string),
      fmtDate(r.createdAt as Date),
      "Review",
    ],
  },

  "affiliate-management-affiliates": {
    model: "affiliate",
    orderBy: { createdAt: "desc" },
    search: ["name", "email", "code"],
    filters: { status: eq("status") },
    map: (r) => [
      r.name as string,
      r.email as string,
      r.code as string,
      label(r.status as string),
      `${r.commissionRate}%`,
      fmtDate(r.createdAt as Date),
      "Manage",
    ],
  },

  "affiliate-management-referrals-and-attribution": {
    model: "referral",
    orderBy: { landedAt: "desc" },
    include: { affiliate: true, organization: true },
    map: (r) => {
      const a = r.affiliate as Row;
      return [
        (r.id as string).slice(0, 10),
        a.name as string,
        (r.source as string) ?? null,
        r.status as string,
        fmtDate(r.landedAt as Date),
        fmtDate(r.convertedAt as Date),
      ];
    },
  },

  "affiliate-management-commissions": {
    model: "commission",
    orderBy: { createdAt: "desc" },
    filters: { status: eq("status") },
    include: { affiliate: true },
    map: (r) => {
      const a = r.affiliate as Row;
      return [
        a.name as string,
        (r.referralId as string) ?? null,
        fmtMoney(r.amount as number, r.currency as string),
        r.status as string,
        fmtDate(r.periodStart as Date),
        fmtDate(r.createdAt as Date),
      ];
    },
  },

  "affiliate-management-payouts": {
    model: "payout",
    orderBy: { createdAt: "desc" },
    filters: { status: eq("status") },
    include: { affiliate: true },
    map: (r) => {
      const a = r.affiliate as Row;
      return [
        a.name as string,
        fmtMoney(r.amount as number, r.currency as string),
        (r.method as string) ?? null,
        label(r.status as string),
        (r.reference as string) ?? null,
        fmtDate(r.processedAt as Date),
      ];
    },
  },

  "affiliate-management-fraud-and-risk": {
    model: "fraudSignal",
    orderBy: { createdAt: "desc" },
    search: ["signal"],
    map: (r) => [
      r.signal as string,
      (r.affiliateId as string) ?? null,
      r.severity as string,
      fmtDate(r.createdAt as Date),
      fmtDate(r.resolvedAt as Date),
    ],
  },

  /* ---------------------------------------------------------- partners */
  "partner-marketplace-programs": {
    model: "partnerProgram",
    orderBy: { createdAt: "desc" },
    search: ["name", "slug"],
    include: { _count: { select: { profiles: true } } },
    map: (r) => {
      const c = r._count as { profiles: number };
      return [
        r.name as string,
        r.slug as string,
        r.status as string,
        String(c.profiles),
        fmtDate(r.createdAt as Date),
        "Edit",
      ];
    },
  },

  "partner-marketplace-partner-profiles": {
    model: "partnerProfile",
    orderBy: { createdAt: "desc" },
    search: ["companyName", "contactEmail"],
    filters: { status: eq("status") },
    include: { program: true },
    map: (r) => {
      const p = r.program as Row | null;
      return [
        r.companyName as string,
        r.contactEmail as string,
        (p?.name as string) ?? null,
        (r.tier as string) ?? null,
        label(r.status as string),
        fmtDate(r.createdAt as Date),
        "View",
      ];
    },
  },

  "partner-marketplace-applications-and-approvals": {
    model: "partnerApplication",
    orderBy: { createdAt: "desc" },
    search: ["companyName", "contactEmail"],
    filters: { status: eq("status") },
    map: (r) => [
      r.companyName as string,
      r.contactEmail as string,
      (r.programId as string) ?? null,
      label(r.status as string),
      fmtDate(r.createdAt as Date),
      "Review",
    ],
  },

  /* --------------------------------------------------------- operations */
  "support-and-tickets-support-tickets": {
    model: "supportTicket",
    orderBy: { updatedAt: "desc" },
    search: ["subject", "requesterEmail"],
    filters: { status: eq("status"), priority: eq("priority") },
    include: { organization: true, assignedTo: true },
    map: (r) => {
      const o = r.organization as Row | null;
      return [
        r.subject as string,
        r.requesterEmail as string,
        (o?.name as string) ?? null,
        r.priority as string,
        label(r.status as string),
        fmtDate(r.updatedAt as Date),
        "Open",
      ];
    },
  },

  "announcements-announcements": {
    model: "announcement",
    orderBy: { createdAt: "desc" },
    search: ["title"],
    map: (r) => [
      r.title as string,
      r.audience as string,
      fmtDate(r.publishedAt as Date),
      fmtDate(r.expiresAt as Date),
      "Edit",
    ],
  },

  "support-and-tickets-product-updates-what-s-new": {
    model: "productUpdate",
    orderBy: { createdAt: "desc" },
    search: ["title"],
    map: (r) => [r.title as string, (r.version as string) ?? null, fmtDate(r.publishedAt as Date), "Edit"],
  },

  /* ------------------------------------------------------ command centre */
  "command-center-command-center": {
    model: "platformIncident",
    orderBy: { detectedAt: "desc" },
    search: ["title"],
    filters: { status: eq("status"), severity: eq("severity") },
    map: (r) => [
      r.title as string,
      r.severity as string,
      r.status as string,
      fmtDate(r.detectedAt as Date),
      fmtDate(r.resolvedAt as Date),
      "Open",
    ],
  },

  "command-center-notification-center": {
    model: "platformNotification",
    orderBy: { createdAt: "desc" },
    search: ["title"],
    map: (r) => [
      r.title as string,
      r.level as string,
      r.audience as string,
      fmtDate(r.createdAt as Date),
      "View",
    ],
  },

  /* --------------------------------------------------- content management */
  "content-management-blog-posts": {
    model: "blogPost",
    orderBy: { createdAt: "desc" },
    search: ["title", "author"],
    map: (r) => [
      r.title as string,
      (r.author as string) ?? null,
      ((r.tags as string[] | null) ?? [])[0] ?? null,
      r.isPublished ? "Published" : "Draft",
      fmtDate(r.publishedAt as Date),
      "Edit",
    ],
  },

  "content-management-authors": {
    model: "teamMember",
    orderBy: { createdAt: "desc" },
    search: ["name"],
    map: (r) => [r.name as string, null, (r.role as string) ?? null, null, "Edit"],
  },

  "content-management-media-library": {
    model: "asset",
    orderBy: { createdAt: "desc" },
    search: ["name"],
    map: (r) => [
      r.name as string,
      (r.type as string) ?? null,
      r.fileSize == null ? null : `${Math.round((r.fileSize as number) / 1024)} KB`,
      fmtDate(r.createdAt as Date),
      "Open",
    ],
  },

  "content-management-careers-job-openings": {
    model: "jobOpening",
    orderBy: { createdAt: "desc" },
    search: ["title", "department", "location"],
    filters: { status: eq("status") },
    include: { _count: { select: { applications: true } } },
    map: (r) => {
      const c = r._count as { applications: number };
      return [
        r.title as string,
        (r.department as string) ?? null,
        (r.location as string) ?? null,
        (r.employment as string) ?? null,
        label(r.status as string),
        String(c.applications),
        "Edit",
      ];
    },
  },

  "content-management-applications": {
    model: "jobApplication",
    orderBy: { createdAt: "desc" },
    search: ["candidate", "email"],
    filters: { stage: eq("stage") },
    include: { jobOpening: true },
    map: (r) => {
      const j = r.jobOpening as Row | null;
      return [
        r.candidate as string,
        (j?.title as string) ?? null,
        label(r.stage as string),
        (r.source as string) ?? null,
        fmtDate(r.createdAt as Date),
        "Review",
      ];
    },
  },


  /* ------------------------------------------------------ marketplace admin */
  "marketplace-management-seller-management": {
    model: "marketplaceSeller",
    orderBy: { createdAt: "desc" },
    search: ["storeName", "slug"],
    filters: { status: eq("status") },
    include: { user: true, _count: { select: { products: true } } },
    map: (r) => {
      const u = r.user as Row | null;
      const c = r._count as { products: number };
      return [
        r.storeName as string,
        (u?.email as string) ?? null,
        label(r.status as string),
        String(c.products),
        fmtDate(r.createdAt as Date),
        "Manage",
      ];
    },
  },

  "marketplace-management-seller-applications": {
    model: "marketplaceSellerApplication",
    orderBy: { createdAt: "desc" },
    search: ["storeName", "contactEmail"],
    filters: { status: eq("status") },
    map: (r) => [
      (r.contactEmail as string) ?? null,
      (r.website as string) ?? null,
      r.storeName as string,
      label(r.status as string),
      fmtDate(r.createdAt as Date),
      "Review",
    ],
  },

  "marketplace-management-product-review-and-moderation": {
    model: "marketplaceProduct",
    orderBy: { updatedAt: "desc" },
    search: ["title"],
    where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED"] } },
    filters: { status: eq("status") },
    include: { seller: true },
    map: (r) => {
      const s = r.seller as Row | null;
      return [
        r.title as string,
        (s?.storeName as string) ?? null,
        label(r.type as string),
        label(r.status as string),
        fmtDate(r.updatedAt as Date),
        "Moderate",
      ];
    },
  },

  "marketplace-management-categories-and-products": {
    model: "marketplaceProduct",
    orderBy: { createdAt: "desc" },
    search: ["title", "slug"],
    filters: { status: eq("status") },
    include: { seller: true, category: true },
    map: (r) => {
      const s = r.seller as Row | null;
      const c = r.category as Row | null;
      return [
        r.title as string,
        (s?.storeName as string) ?? null,
        (c?.name as string) ?? null,
        label(r.status as string),
        fmtDate(r.publishedAt as Date),
        "Edit",
      ];
    },
  },

  "marketplace-management-orders-refunds-and-disputes": {
    model: "marketplaceOrder",
    orderBy: { createdAt: "desc" },
    filters: { status: eq("status") },
    include: { buyer: true },
    map: (r) => {
      const b = r.buyer as Row | null;
      return [
        (r.id as string).slice(0, 10),
        (b?.email as string) ?? null,
        fmtMoney((r.totalCents as number) / 100, r.currency as string),
        label(r.status as string),
        fmtDate((r.placedAt as Date) ?? (r.createdAt as Date)),
        "Open",
      ];
    },
  },

  "marketplace-management-commissions-and-payouts": {
    model: "marketplacePayout",
    orderBy: { requestedAt: "desc" },
    filters: { status: eq("status") },
    include: { seller: true },
    map: (r) => {
      const s = r.seller as Row | null;
      return [
        (s?.storeName as string) ?? null,
        fmtMoney((r.amountCents as number) / 100, r.currency as string),
        label(r.status as string),
        (r.provider as string) ?? null,
        fmtDate(r.requestedAt as Date),
        "Review",
      ];
    },
  },

  /* ------------------------------------------------------ domains & email */
  "domains-and-email-publish-and-domains": {
    model: "domain",
    orderBy: { createdAt: "desc" },
    search: ["domain"],
    include: { workspace: true },
    map: (r) => {
      const w = r.workspace as Row | null;
      return [
        (r.domain as string) ?? null,
        (w?.name as string) ?? null,
        r.isVerified ? "Verified" : "Pending verification",
        yesNo(r.isVerified as boolean),
        fmtDate(r.createdAt as Date),
        "Manage",
      ];
    },
  },

  "domains-and-email-api-and-domains": {
    model: "apiKey",
    orderBy: { createdAt: "desc" },
    search: ["name"],
    include: { workspace: true },
    map: (r) => {
      const w = r.workspace as Row | null;
      return [
        (r.name as string) ?? null,
        (w?.name as string) ?? null,
        fmtDate(r.lastUsedAt as Date),
        fmtDate(r.createdAt as Date),
        "Revoke",
      ];
    },
  },

  "domains-and-email-email-deliverability": {
    model: "emailSend",
    orderBy: { createdAt: "desc" },
    search: ["recipientEmail"],
    map: (r) => [
      (r.recipientEmail as string) ?? null,
      (r.emailCampaignId as string) ?? null,
      (r.status as string) ?? null,
      yesNo(r.openedAt != null),
      yesNo(r.clickedAt != null),
      fmtDate(r.createdAt as Date),
    ],
  },

  "domains-and-email-landing-page-publishing": {
    model: "landingPage",
    orderBy: { createdAt: "desc" },
    search: ["title", "slug"],
    include: { workspace: true },
    map: (r) => {
      const w = r.workspace as Row | null;
      return [
        (r.title as string) ?? null,
        (w?.name as string) ?? null,
        r.isPublished ? "Published" : "Draft",
        fmtDate(r.publishedAt as Date),
        "Open",
      ];
    },
  },

  "integrations-connected-apps": {
    model: "integration",
    orderBy: { createdAt: "desc" },
    search: ["provider"],
    include: { workspace: true },
    map: (r) => {
      const w = r.workspace as Row | null;
      return [
        (r.provider as string) ?? null,
        (w?.name as string) ?? null,
        (r.status as string) ?? null,
        fmtDate(r.createdAt as Date),
        "Configure",
      ];
    },
  },
};

/* ----------------------------------------------------------------- runtime */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const delegate = (model: string) => (prisma as any)[model];

function buildWhere(spec: TableSpec, q: string, filters: Record<string, string | undefined>) {
  const and: Record<string, unknown>[] = [];
  if (spec.where) and.push(spec.where);
  if (q && spec.search?.length) {
    and.push({ OR: spec.search.map((f) => ({ [f]: contains(q) })) });
  }
  for (const [key, build] of Object.entries(spec.filters ?? {})) {
    const value = filters[key];
    if (value) and.push(build(value));
  }
  return and.length ? { AND: and } : {};
}

export function hasLoader(key: string) {
  return key in SPECS;
}

export async function loadSuperPage(key: string, args: SuperQueryArgs = {}): Promise<SuperResult> {
  const spec = SPECS[key];
  if (!spec) return EMPTY;

  const page = Math.max(1, args.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, args.pageSize ?? 25));
  const where = buildWhere(spec, args.q ?? "", args.filters ?? {});

  try {
    const d = delegate(spec.model);
    const [total, rows] = await Promise.all([
      d.count({ where }),
      d.findMany({
        where,
        orderBy: spec.orderBy,
        include: spec.include,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { total, connected: true, rows: (rows as Row[]).map((r) => ({ id: r.id as string, cells: spec.map(r) })) };
  } catch {
    // A query failure must never be presented as an empty platform.
    return EMPTY;
  }
}

/** All matching rows, unpaginated — used by CSV export. Capped for safety. */
export async function loadSuperPageForExport(key: string, args: SuperQueryArgs = {}): Promise<SuperResult> {
  const spec = SPECS[key];
  if (!spec) return EMPTY;
  const where = buildWhere(spec, args.q ?? "", args.filters ?? {});
  try {
    const d = delegate(spec.model);
    const rows = (await d.findMany({
      where,
      orderBy: spec.orderBy,
      include: spec.include,
      take: 10000,
    })) as Row[];
    return { total: rows.length, connected: true, rows: rows.map((r) => ({ id: r.id as string, cells: spec.map(r) })) };
  } catch {
    return EMPTY;
  }
}

export type SuperRecord = { id: string; fields: { label: string; value: string | null }[] };

/** Single record for a detail screen, rendered as label/value pairs. */
export async function loadSuperRecord(key: string, id: string, columns: string[]): Promise<SuperRecord | null> {
  const spec = SPECS[key];
  if (!spec) return null;
  try {
    const d = delegate(spec.model);
    const row = (await d.findUnique({ where: { id }, include: spec.include })) as Row | null;
    if (!row) return null;
    const cells = spec.map(row);
    return {
      id,
      fields: columns.map((label, i) => ({ label, value: cells[i] ?? null })),
    };
  } catch {
    return null;
  }
}

/** Counters for the dashboard status strip. Null means "no connected source". */
export async function loadDashboardSummary() {
  try {
    const [organizations, users, tickets, incidents] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.supportTicket.count({ where: { status: { in: ["OPEN", "PENDING"] } } }),
      prisma.platformIncident.count({ where: { status: "open" } }),
    ]);
    return { organizations, users, tickets, incidents, connected: true };
  } catch {
    return { organizations: null, users: null, tickets: null, incidents: null, connected: false };
  }
}
