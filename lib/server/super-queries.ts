import "server-only";
import { AdminScopeLevel, Role, SuspensionStatus, TicketStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Data loaders for the Super Admin screens.
 *
 * Every loader queries the real database. Pages whose domain has no connected
 * production source yet return an empty result, which renders the approved
 * empty state — we never substitute fabricated rows (handoff rule 5).
 */

export type SuperRow = { id: string; cells: (string | null)[] };
export type SuperResult = { rows: SuperRow[]; total: number; connected: boolean };

export const EMPTY: SuperResult = { rows: [], total: 0, connected: false };

export type SuperQueryArgs = { q?: string; page?: number; pageSize?: number };

const fmtDate = (d: Date | null | undefined) =>
  d ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(d) : null;

const fmtMoney = (n: number | null | undefined, currency = "USD") =>
  n == null ? null : new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

const title = (s: string | null | undefined) =>
  s ? s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ") : null;

/** Registry of loaders keyed by the manifest route key. */
type Loader = (a: Required<SuperQueryArgs>) => Promise<SuperResult>;

const loaders: Record<string, Loader> = {
  // ---------- User management ----------
  "user-management-all-users": async ({ q, page, pageSize }) => {
    const where = q
      ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }] }
      : {};
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: users.map((u) => ({
        id: u.id,
        cells: [u.name, u.email, title(u.role), null, null, fmtDate(u.updatedAt), "View"],
      })),
    };
  },

  "user-management-admins": async ({ q, page, pageSize }) => {
    const where = {
      role: { in: [Role.SUPER_ADMIN, Role.ADMIN, Role.OWNER] },
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }] } : {}),
    };
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: users.map((u) => ({ id: u.id, cells: [u.name, u.email, title(u.role), "Global", null, fmtDate(u.updatedAt), "Manage"] })),
    };
  },

  "user-management-sub-admins": async ({ page, pageSize }) => {
    const where = { scopeLevel: { in: [AdminScopeLevel.ORGANIZATION, AdminScopeLevel.WORKSPACE, AdminScopeLevel.MODULE] } };
    const [total, rows] = await Promise.all([
      prisma.adminAssignment.count({ where }),
      prisma.adminAssignment.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" }, include: { roleDefinition: true } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        cells: [r.userId, null, r.grantedByUserId, title(r.scopeLevel), null, fmtDate(r.createdAt), "Manage"],
      })),
    };
  },

  "user-management-roles-and-permissions": async ({ page, pageSize }) => {
    const [total, roles] = await Promise.all([
      prisma.roleDefinition.count(),
      prisma.roleDefinition.findMany({
        skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "asc" },
        include: { _count: { select: { permissions: true, assignments: true } } },
      }),
    ]);
    return {
      total,
      connected: true,
      rows: roles.map((r) => ({
        id: r.id,
        cells: [r.name, r.description, r.isSystem ? "System" : "Custom", String(r._count.permissions), String(r._count.assignments), "Edit"],
      })),
    };
  },

  "user-management-access-assignments": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.adminAssignment.count(),
      prisma.adminAssignment.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" }, include: { roleDefinition: true } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        cells: [r.userId, r.roleDefinition?.name ?? null, title(r.scopeLevel), r.organizationId ?? r.workspaceId, r.grantedByUserId, fmtDate(r.expiresAt), "Revoke"],
      })),
    };
  },

  "user-management-invitations": async ({ q, page, pageSize }) => {
    const where = q ? { email: { contains: q, mode: "insensitive" as const } } : {};
    const [total, rows] = await Promise.all([
      prisma.invitation.count({ where }),
      prisma.invitation.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        cells: [r.email, null, title(r.scopeLevel), r.invitedByUserId, title(r.status), fmtDate(r.expiresAt), "Resend"],
      })),
    };
  },

  "user-management-sessions-devices": async ({ page, pageSize }) => {
    const where = { revokedAt: null };
    const [total, rows] = await Promise.all([
      prisma.userSession.count({ where }),
      prisma.userSession.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { lastActiveAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        cells: [r.userId, r.device, [r.browser, r.os].filter(Boolean).join(" / ") || null, r.ipAddress, r.location, fmtDate(r.lastActiveAt), "Revoke"],
      })),
    };
  },

  "user-management-suspended-access": async ({ page, pageSize }) => {
    const where = { status: SuspensionStatus.ACTIVE };
    const [total, rows] = await Promise.all([
      prisma.accessSuspension.count({ where }),
      prisma.accessSuspension.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({ id: r.id, cells: [r.userId, r.reason, r.suspendedByUserId, title(r.status), fmtDate(r.createdAt), "Lift"] })),
    };
  },

  // ---------- Audit ----------
  "user-management-admin-activity": auditLoader(),
  "security-and-compliance-audit-log": auditLoader(),
  "audit-logs-audit-log": auditLoader(),
  "audit-logs-global-audit-logs": auditLoader(),
  "settings-audit-log": auditLoader(),
  "affiliate-management-audit-history": auditLoader(),

  // ---------- Organizations ----------
  "organizations-organizations": async ({ q, page, pageSize }) => {
    const where = q ? { name: { contains: q, mode: "insensitive" as const } } : {};
    const [total, rows] = await Promise.all([
      prisma.organization.count({ where }),
      prisma.organization.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({ id: r.id, cells: [r.name, r.plan, r.status, String(r.userCount), fmtDate(r.createdAt), "Manage"] })),
    };
  },

  "organizations-tenant-workspace-management": async ({ q, page, pageSize }) => {
    const where = q ? { name: { contains: q, mode: "insensitive" as const } } : {};
    const [total, rows] = await Promise.all([
      prisma.workspace.count({ where }),
      prisma.workspace.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" },
        include: { _count: { select: { memberships: true } } },
      }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({ id: r.id, cells: [r.name, null, r.planTier, String(r._count.memberships), fmtDate(r.createdAt), "Manage"] })),
    };
  },

  // ---------- Plans & billing ----------
  "plans-and-pricing-pricing-plans-overview": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.plan.count(),
      prisma.plan.findMany({
        skip: (page - 1) * pageSize, take: pageSize, orderBy: { price: "asc" },
        include: { _count: { select: { subscriptions: true } } },
      }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        cells: [r.name, fmtMoney(r.price), r.interval, String(r.features.length), String(r._count.subscriptions), "Edit"],
      })),
    };
  },

  "plans-and-pricing-pricing-benchmark-and-positioning": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.pricingBenchmark.count(),
      prisma.pricingBenchmark.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { capturedAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({ id: r.id, cells: [r.competitor, r.planName, fmtMoney(r.price, r.currency), r.interval, fmtDate(r.capturedAt), r.sourceUrl] })),
    };
  },

  "subscriptions-and-billing-subscriptions": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.findMany({
        skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" },
        include: { plan: true, workspace: true },
      }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        cells: [r.workspace.name, r.plan.name, r.status, `${fmtDate(r.currentPeriodStart)} – ${fmtDate(r.currentPeriodEnd)}`, fmtDate(r.currentPeriodEnd), "Manage"],
      })),
    };
  },

  "subscriptions-and-billing-billing-invoices": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.invoice.count(),
      prisma.invoice.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" }, include: { workspace: true } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({ id: r.id, cells: [r.id.slice(0, 10), r.workspace.name, fmtMoney(r.amount), r.status, fmtDate(r.paidAt), "View"] })),
    };
  },

  "subscriptions-and-billing-ai-credit-management": creditLoader(),
  "quick-actions-grant-access-credit": creditLoader(),

  // ---------- System management ----------
  "system-management-module-controls": async ({ q, page, pageSize }) => {
    const where = q ? { name: { contains: q, mode: "insensitive" as const } } : {};
    const [total, rows] = await Promise.all([
      prisma.moduleControl.count({ where }),
      prisma.moduleControl.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { name: "asc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({ id: r.id, cells: [r.name, r.description, title(r.status), title(r.scopeLevel), r.isCore ? "Core" : "Configure"] })),
    };
  },
  "quick-actions-module-controls": async (a) => loaders["system-management-module-controls"](a),

  "system-management-feature-flags": async ({ q, page, pageSize }) => {
    const where = q ? { name: { contains: q, mode: "insensitive" as const } } : {};
    const [total, rows] = await Promise.all([
      prisma.featureFlag.count({ where }),
      prisma.featureFlag.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { name: "asc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        cells: [r.name, r.description, r.enabled ? "Enabled" : "Disabled", r.rolloutPercent == null ? null : `${r.rolloutPercent}%`, title(r.scopeLevel), "Edit"],
      })),
    };
  },

  "system-management-usage-and-costs": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.usageCostRecord.count(),
      prisma.usageCostRecord.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { periodStart: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        cells: [`${fmtDate(r.periodStart)} – ${fmtDate(r.periodEnd)}`, r.category, r.provider, String(r.units), fmtMoney(r.cost, r.currency), r.organizationId],
      })),
    };
  },

  "system-management-system-health": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.systemHealthCheck.count(),
      prisma.systemHealthCheck.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { checkedAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({ id: r.id, cells: [r.service, r.status, r.latencyMs == null ? null : `${r.latencyMs} ms`, r.message, fmtDate(r.checkedAt)] })),
    };
  },
  "quick-actions-system-health-check": async (a) => loaders["system-management-system-health"](a),

  // ---------- Security & compliance ----------
  "security-and-compliance-consent-records": async ({ q, page, pageSize }) => {
    const where = q ? { subjectEmail: { contains: q, mode: "insensitive" as const } } : {};
    const [total, rows] = await Promise.all([
      prisma.consentRecord.count({ where }),
      prisma.consentRecord.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { recordedAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({ id: r.id, cells: [r.subjectEmail, r.consentType, r.granted ? "Granted" : "Withdrawn", r.source, r.ipAddress, fmtDate(r.recordedAt)] })),
    };
  },

  "security-and-compliance-suppression-lists": async ({ q, page, pageSize }) => {
    const where = q ? { email: { contains: q, mode: "insensitive" as const } } : {};
    const [total, rows] = await Promise.all([
      prisma.suppressionEntry.count({ where }),
      prisma.suppressionEntry.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return { total, connected: true, rows: rows.map((r) => ({ id: r.id, cells: [r.email, r.reason, r.source, fmtDate(r.createdAt)] })) };
  },

  "security-and-compliance-data-requests-dsar": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.dataRequest.count(),
      prisma.dataRequest.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { requestedAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({ id: r.id, cells: [r.subjectEmail, title(r.type), title(r.status), fmtDate(r.requestedAt), fmtDate(r.completedAt), "Process"] })),
    };
  },

  // ---------- Affiliates ----------
  "affiliate-management-applications": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.affiliateApplication.count(),
      prisma.affiliateApplication.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return { total, connected: true, rows: rows.map((r) => ({ id: r.id, cells: [r.name, r.email, r.website, title(r.status), fmtDate(r.createdAt), "Review"] })) };
  },

  "affiliate-management-affiliates": async ({ q, page, pageSize }) => {
    const where = q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }] } : {};
    const [total, rows] = await Promise.all([
      prisma.affiliate.count({ where }),
      prisma.affiliate.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({ id: r.id, cells: [r.name, r.email, r.code, title(r.status), `${r.commissionRate}%`, fmtDate(r.createdAt), "Manage"] })),
    };
  },

  "affiliate-management-referrals-and-attribution": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.referral.count(),
      prisma.referral.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { landedAt: "desc" }, include: { affiliate: true } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({ id: r.id, cells: [r.id.slice(0, 10), r.affiliate.name, r.source, r.status, fmtDate(r.landedAt), fmtDate(r.convertedAt)] })),
    };
  },

  "affiliate-management-commissions": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.commission.count(),
      prisma.commission.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" }, include: { affiliate: true } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        cells: [r.affiliate.name, r.referralId, fmtMoney(r.amount, r.currency), r.status, fmtDate(r.periodStart), fmtDate(r.createdAt)],
      })),
    };
  },

  "affiliate-management-payouts": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.payout.count(),
      prisma.payout.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" }, include: { affiliate: true } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({ id: r.id, cells: [r.affiliate.name, fmtMoney(r.amount, r.currency), r.method, title(r.status), r.reference, fmtDate(r.processedAt)] })),
    };
  },

  "affiliate-management-fraud-and-risk": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.fraudSignal.count(),
      prisma.fraudSignal.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return { total, connected: true, rows: rows.map((r) => ({ id: r.id, cells: [r.signal, r.affiliateId, r.severity, fmtDate(r.createdAt), fmtDate(r.resolvedAt)] })) };
  },

  // ---------- Partner marketplace ----------
  "partner-marketplace-programs": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.partnerProgram.count(),
      prisma.partnerProgram.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" }, include: { _count: { select: { profiles: true } } } }),
    ]);
    return { total, connected: true, rows: rows.map((r) => ({ id: r.id, cells: [r.name, r.slug, r.status, String(r._count.profiles), fmtDate(r.createdAt), "Edit"] })) };
  },

  "partner-marketplace-partner-profiles": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.partnerProfile.count(),
      prisma.partnerProfile.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" }, include: { program: true } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({ id: r.id, cells: [r.companyName, r.contactEmail, r.program?.name ?? null, r.tier, title(r.status), fmtDate(r.createdAt), "View"] })),
    };
  },

  "partner-marketplace-applications-and-approvals": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.partnerApplication.count(),
      prisma.partnerApplication.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return { total, connected: true, rows: rows.map((r) => ({ id: r.id, cells: [r.companyName, r.contactEmail, r.programId, title(r.status), fmtDate(r.createdAt), "Review"] })) };
  },

  // ---------- Operations ----------
  "support-and-tickets-support-tickets": ticketLoader(),
  "support-and-tickets-support-admin-cases": ticketLoader(),

  "announcements-announcements": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.announcement.count(),
      prisma.announcement.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return { total, connected: true, rows: rows.map((r) => ({ id: r.id, cells: [r.title, r.audience, fmtDate(r.publishedAt), fmtDate(r.expiresAt), "Edit"] })) };
  },

  "support-and-tickets-product-updates-what-s-new": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.productUpdate.count(),
      prisma.productUpdate.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return { total, connected: true, rows: rows.map((r) => ({ id: r.id, cells: [r.title, r.version, fmtDate(r.publishedAt), "Edit"] })) };
  },

  // ---------- Command center ----------
  "command-center-command-center": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.platformIncident.count(),
      prisma.platformIncident.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { detectedAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({ id: r.id, cells: [r.title, r.severity, r.status, fmtDate(r.detectedAt), fmtDate(r.resolvedAt), "Open"] })),
    };
  },

  "command-center-notification-center": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.platformNotification.count(),
      prisma.platformNotification.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return { total, connected: true, rows: rows.map((r) => ({ id: r.id, cells: [r.title, r.level, r.audience, fmtDate(r.createdAt), "View"] })) };
  },

  // ---------- Content management ----------
  "content-management-blog-posts": async ({ q, page, pageSize }) => {
    const where = q ? { title: { contains: q, mode: "insensitive" as const } } : {};
    const [total, rows] = await Promise.all([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        cells: [r.title, (r as { author?: string | null }).author ?? null, (r as { category?: string | null }).category ?? null,
          (r as { published?: boolean }).published ? "Published" : "Draft", fmtDate(r.createdAt), "Edit"],
      })),
    };
  },

  "content-management-authors": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.teamMember.count(),
      prisma.teamMember.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({ id: r.id, cells: [r.name, (r as { email?: string | null }).email ?? null, (r as { role?: string | null }).role ?? null, null, "Edit"] })),
    };
  },

  "content-management-media-library": async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        cells: [r.name, (r as { type?: string | null }).type ?? null, null, fmtDate(r.createdAt), "Open"],
      })),
    };
  },
};

function auditLoader(): Loader {
  return async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.platformAuditLog.count(),
      prisma.platformAuditLog.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        cells: [r.actorUserId, r.action, [r.resourceType, r.resourceId].filter(Boolean).join(":") || null, title(r.scopeLevel), r.ipAddress, fmtDate(r.createdAt)],
      })),
    };
  };
}

function creditLoader(): Loader {
  return async ({ page, pageSize }) => {
    const [total, rows] = await Promise.all([
      prisma.creditAdjustment.count(),
      prisma.creditAdjustment.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        cells: [title(r.grantType), r.userId ?? r.organizationId, r.amount == null ? (r.days == null ? null : `${r.days} days`) : fmtMoney(r.amount),
          r.reason, r.grantedByUserId, fmtDate(r.effectiveAt), fmtDate(r.expiresAt)],
      })),
    };
  };
}

function ticketLoader(): Loader {
  return async ({ q, page, pageSize }) => {
    const where = q ? { subject: { contains: q, mode: "insensitive" as const } } : {};
    const [total, rows] = await Promise.all([
      prisma.supportTicket.count({ where }),
      prisma.supportTicket.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { updatedAt: "desc" } }),
    ]);
    return {
      total,
      connected: true,
      rows: rows.map((r) => ({
        id: r.id,
        cells: [r.subject, r.requesterEmail, r.organizationId, r.priority, title(r.status), fmtDate(r.updatedAt), "Open"],
      })),
    };
  };
}

/** True when the page has a connected production source. */
export function hasLoader(key: string) {
  return key in loaders;
}

export async function loadSuperPage(key: string, args: SuperQueryArgs = {}): Promise<SuperResult> {
  const loader = loaders[key];
  if (!loader) return EMPTY;
  const resolved = { q: args.q ?? "", page: Math.max(1, args.page ?? 1), pageSize: Math.min(100, Math.max(1, args.pageSize ?? 25)) };
  try {
    return await loader(resolved);
  } catch {
    // A query failure must not fabricate data — fall back to the empty state.
    return EMPTY;
  }
}

/** Counters for the dashboard status strip. Null means "no connected source". */
export async function loadDashboardSummary() {
  try {
    const [organizations, users, tickets, incidents] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.supportTicket.count({ where: { status: { in: [TicketStatus.OPEN, TicketStatus.PENDING] } } }),
      prisma.platformIncident.count({ where: { status: "open" } }),
    ]);
    return { organizations, users, tickets, incidents, connected: true };
  } catch {
    return { organizations: null, users: null, tickets: null, incidents: null, connected: false };
  }
}
