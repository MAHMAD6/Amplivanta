"use server";

import { revalidatePath } from "next/cache";
import { MarketplacePayoutStatus, PartyStatus, Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectiveAccess, hasPermission } from "@/lib/server/rbac";

/**
 * Affiliate Program and Partner Program administration.
 *
 * Separate modules from the Marketplace by design. Both were read-only until
 * now; every action here re-checks authorization, requires a reason for
 * consequential decisions, and writes an audit event.
 */

export type PartnerResult = { ok: true; message: string } | { ok: false; error: string };

async function actor() {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!user) return null;
  const access = await getEffectiveAccess(user.id ?? null, user.role ?? null);
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "OWNER";
  if (!isAdmin && !hasPermission(access, "marketplace.admin.read")) return null;
  return user;
}

async function audit(
  actorUserId: string | null,
  action: string,
  resourceType: string,
  resourceId?: string,
  metadata?: Prisma.InputJsonValue,
  reason?: string,
) {
  try {
    await prisma.platformAuditLog.create({
      data: { actorUserId, action, resourceType, resourceId, metadata: metadata ?? {}, reason },
    });
  } catch {
    /* an authorized change is not rolled back because auditing failed */
  }
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

/* ----------------------------------------------------------- affiliates --- */

export async function decideAffiliateApplication(
  applicationId: string,
  decision: "APPROVED" | "REJECTED",
  reason: string,
): Promise<PartnerResult> {
  const user = await actor();
  if (!user) return { ok: false, error: "You are not authorized to review affiliate applications." };
  if (!reason.trim()) return { ok: false, error: "A reason is required." };

  try {
    const app = await prisma.affiliateApplication.findUnique({ where: { id: applicationId } });
    if (!app) return { ok: false, error: "Application not found." };
    if (app.status === PartyStatus.APPROVED || app.status === PartyStatus.REJECTED) {
      return { ok: false, error: "That application has already been decided." };
    }

    if (decision === "APPROVED") {
      await prisma.$transaction(async (tx) => {
        const existing = await tx.affiliate.findUnique({ where: { email: app.email } });
        if (!existing) {
          // Referral code must be unique and stable once issued.
          let code = slugify(app.name).slice(0, 12) || "affiliate";
          let n = 1;
          while (await tx.affiliate.findUnique({ where: { code } })) {
            n += 1;
            code = `${slugify(app.name).slice(0, 12)}-${n}`;
          }
          await tx.affiliate.create({
            data: { name: app.name, email: app.email, code, status: PartyStatus.APPROVED },
          });
        }
        await tx.affiliateApplication.update({
          where: { id: applicationId },
          data: {
            status: PartyStatus.APPROVED,
            notes: reason,
            reviewedByUserId: user.id ?? null,
            reviewedAt: new Date(),
          },
        });
      });
    } else {
      await prisma.affiliateApplication.update({
        where: { id: applicationId },
        data: {
          status: PartyStatus.REJECTED,
          notes: reason,
          reviewedByUserId: user.id ?? null,
          reviewedAt: new Date(),
        },
      });
    }

    await audit(user.id ?? null, `affiliate.application.${decision.toLowerCase()}`, "AffiliateApplication", applicationId, {}, reason);
    revalidatePath("/admin/affiliate-management/applications");
    revalidatePath("/admin/affiliate-management/affiliates");
    return { ok: true, message: `Application ${decision.toLowerCase()}.` };
  } catch {
    return { ok: false, error: "Could not record the decision — the platform database was unreachable." };
  }
}

export async function setAffiliateStatus(affiliateId: string, status: string, reason: string): Promise<PartnerResult> {
  const user = await actor();
  if (!user) return { ok: false, error: "You are not authorized to manage affiliates." };
  if (!reason.trim()) return { ok: false, error: "A reason is required." };
  if (!Object.values(PartyStatus).includes(status as PartyStatus)) {
    return { ok: false, error: "Choose a valid status." };
  }
  try {
    const a = await prisma.affiliate.update({
      where: { id: affiliateId },
      data: { status: status as PartyStatus },
    });
    await audit(user.id ?? null, "affiliate.status_changed", "Affiliate", affiliateId, { status }, reason);
    revalidatePath("/admin/affiliate-management/affiliates");
    return { ok: true, message: `${a.name} is now ${status.toLowerCase()}.` };
  } catch {
    return { ok: false, error: "Could not update the affiliate." };
  }
}

/** Affiliate payout decisions mirror the marketplace payout state machine. */
const PAYOUT_NEXT: Record<string, MarketplacePayoutStatus[]> = {
  REQUESTED: ["PENDING", "HELD", "CANCELLED"],
  PENDING: ["PROCESSING", "HELD", "CANCELLED"],
  PROCESSING: ["PAID", "FAILED", "HELD"],
  HELD: ["PENDING", "CANCELLED"],
  FAILED: ["PENDING", "CANCELLED"],
} as unknown as Record<string, MarketplacePayoutStatus[]>;

export async function decideAffiliatePayout(payoutId: string, toStatus: string, reason: string): Promise<PartnerResult> {
  const user = await actor();
  if (!user) return { ok: false, error: "You are not authorized to manage affiliate payouts." };
  if (!reason.trim()) return { ok: false, error: "A reason is required." };

  try {
    const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
    if (!payout) return { ok: false, error: "Payout not found." };
    const allowed = PAYOUT_NEXT[payout.status] ?? [];
    if (!allowed.includes(toStatus as MarketplacePayoutStatus)) {
      return { ok: false, error: `A ${payout.status.toLowerCase()} payout cannot move to ${toStatus.toLowerCase()}.` };
    }
    await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: toStatus as never,
        processedAt: toStatus === "PAID" ? new Date() : payout.processedAt,
      },
    });
    await audit(user.id ?? null, "affiliate.payout.decided", "Payout", payoutId, { from: payout.status, to: toStatus }, reason);
    revalidatePath("/admin/affiliate-management/payouts");
    return { ok: true, message: `Payout moved to ${toStatus.toLowerCase()}.` };
  } catch {
    return { ok: false, error: "Could not update the payout." };
  }
}

/* ------------------------------------------------------ partner program --- */

export async function upsertPartnerProgram(formData: FormData): Promise<PartnerResult> {
  const user = await actor();
  if (!user) return { ok: false, error: "You are not authorized to manage partner programs." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "A program name is required." };
  const id = String(formData.get("id") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);

  try {
    const data = {
      name,
      slug,
      description: String(formData.get("description") ?? "").trim() || null,
      status: String(formData.get("status") ?? "draft"),
    };
    const rec = id
      ? await prisma.partnerProgram.update({ where: { id }, data })
      : await prisma.partnerProgram.create({ data });
    await audit(user.id ?? null, id ? "partner.program.updated" : "partner.program.created", "PartnerProgram", rec.id, { name });
    revalidatePath("/admin/partner-program/programs");
    return { ok: true, message: `Program "${name}" saved.` };
  } catch (e) {
    const dup = e instanceof Error && e.message.includes("Unique constraint");
    return { ok: false, error: dup ? "A program with that slug already exists." : "Could not save the program." };
  }
}

export async function decidePartnerApplication(
  applicationId: string,
  decision: "APPROVED" | "REJECTED",
  reason: string,
): Promise<PartnerResult> {
  const user = await actor();
  if (!user) return { ok: false, error: "You are not authorized to review partner applications." };
  if (!reason.trim()) return { ok: false, error: "A reason is required." };

  try {
    const app = await prisma.partnerApplication.findUnique({ where: { id: applicationId } });
    if (!app) return { ok: false, error: "Application not found." };
    if (app.status === PartyStatus.APPROVED || app.status === PartyStatus.REJECTED) {
      return { ok: false, error: "That application has already been decided." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.partnerApplication.update({
        where: { id: applicationId },
        data: { status: decision as PartyStatus, notes: reason, reviewedAt: new Date() },
      });
      if (decision === "APPROVED") {
        const existing = await tx.partnerProfile.findFirst({ where: { contactEmail: app.contactEmail } });
        if (!existing) {
          await tx.partnerProfile.create({
            data: {
              programId: app.programId,
              companyName: app.companyName,
              contactEmail: app.contactEmail,
              status: PartyStatus.APPROVED,
            },
          });
        }
      }
    });

    await audit(user.id ?? null, `partner.application.${decision.toLowerCase()}`, "PartnerApplication", applicationId, {}, reason);
    revalidatePath("/admin/partner-program/applications-and-approvals");
    revalidatePath("/admin/partner-program/partner-profiles");
    return { ok: true, message: `Application ${decision.toLowerCase()}.` };
  } catch {
    return { ok: false, error: "Could not record the decision." };
  }
}

export async function setPartnerProfileStatus(profileId: string, status: string, reason: string): Promise<PartnerResult> {
  const user = await actor();
  if (!user) return { ok: false, error: "You are not authorized to manage partners." };
  if (!reason.trim()) return { ok: false, error: "A reason is required." };
  if (!Object.values(PartyStatus).includes(status as PartyStatus)) {
    return { ok: false, error: "Choose a valid status." };
  }
  try {
    const p = await prisma.partnerProfile.update({
      where: { id: profileId },
      data: { status: status as PartyStatus },
    });
    await audit(user.id ?? null, "partner.profile.status_changed", "PartnerProfile", profileId, { status }, reason);
    revalidatePath("/admin/partner-program/partner-profiles");
    return { ok: true, message: `${p.companyName} is now ${status.toLowerCase()}.` };
  } catch {
    return { ok: false, error: "Could not update the partner." };
  }
}

/* ----------------------------------------------------------------- loaders */

const date = (d: Date | null | undefined) =>
  d ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d) : null;

const money = (cents: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);

export async function loadAffiliateAdminData() {
  try {
    const [applications, affiliates, payouts] = await Promise.all([
      prisma.affiliateApplication.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
      prisma.affiliate.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
      prisma.payout.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { affiliate: true } }),
    ]);
    return {
      connected: true,
      applications: applications.map((a) => ({
        id: a.id, name: a.name, email: a.email, website: a.website,
        status: a.status as string, created: date(a.createdAt) ?? "",
      })),
      affiliates: affiliates.map((a) => ({
        id: a.id, name: a.name, email: a.email, code: a.code,
        status: a.status as string, rate: `${a.commissionRate}%`,
      })),
      payouts: payouts.map((p) => ({
        id: p.id, affiliate: p.affiliate?.name ?? null,
        amount: money(Math.round(p.amount * 100), p.currency),
        status: p.status as string, requested: date(p.createdAt),
      })),
    };
  } catch {
    return { connected: false, applications: [], affiliates: [], payouts: [] };
  }
}

export async function loadPartnerAdminData() {
  try {
    const [programs, profiles, applications] = await Promise.all([
      prisma.partnerProgram.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { profiles: true } } },
      }),
      prisma.partnerProfile.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { program: true } }),
      prisma.partnerApplication.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    ]);
    return {
      connected: true,
      programs: programs.map((p) => ({
        id: p.id, name: p.name, slug: p.slug, status: p.status, partners: p._count.profiles,
      })),
      profiles: profiles.map((p) => ({
        id: p.id, companyName: p.companyName, contactEmail: p.contactEmail,
        program: p.program?.name ?? null, status: p.status as string,
      })),
      applications: applications.map((a) => ({
        id: a.id, companyName: a.companyName, contactEmail: a.contactEmail,
        status: a.status as string, created: date(a.createdAt) ?? "",
      })),
    };
  } catch {
    return { connected: false, programs: [], profiles: [], applications: [] };
  }
}
