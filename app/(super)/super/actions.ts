"use server";

import { revalidatePath } from "next/cache";
import { GrantType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type GrantResult = { ok: true; id: string } | { ok: false; error: string };

const GRANT_TYPES = new Set<string>(Object.values(GrantType));

/**
 * Grant access or credit to an individual user or an organization.
 *
 * Authorization is enforced here, server-side — hiding the control in the UI is
 * not authorization (handoff rule 7). A reason is mandatory and every grant is
 * written to the immutable platform audit log (rule 11).
 */
export async function grantAccessCredit(formData: FormData): Promise<GrantResult> {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!user || user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "You are not authorized to grant access or credit." };
  }

  const grantType = String(formData.get("grantType") ?? "");
  if (!GRANT_TYPES.has(grantType)) return { ok: false, error: "Select a valid grant type." };

  const target = String(formData.get("target") ?? "user");
  const recipient = String(formData.get("recipient") ?? "").trim();
  if (!recipient) return { ok: false, error: "Choose who this grant applies to." };

  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return { ok: false, error: "A reason is required for this action." };

  const note = String(formData.get("note") ?? "").trim() || null;
  const rawDays = String(formData.get("days") ?? "").trim();
  const rawAmount = String(formData.get("amount") ?? "").trim();
  const rawEffective = String(formData.get("effectiveAt") ?? "").trim();

  const days = rawDays ? Number(rawDays) : null;
  const amount = rawAmount ? Number(rawAmount) : null;
  if (days != null && (!Number.isFinite(days) || days <= 0)) return { ok: false, error: "Number of days must be a positive number." };
  if (amount != null && (!Number.isFinite(amount) || amount <= 0)) return { ok: false, error: "Amount must be a positive number." };
  if (grantType === GrantType.ACCESS_EXTENSION && days == null) return { ok: false, error: "Enter the number of days to extend access by." };
  if ((grantType === GrantType.USAGE_CREDIT || grantType === GrantType.BILLING_CREDIT) && amount == null) {
    return { ok: false, error: "Enter the credit amount." };
  }

  try {
    const grant = await prisma.$transaction(async (tx) => {
      const created = await tx.creditAdjustment.create({
        data: {
          grantType: grantType as GrantType,
          amount,
          days,
          userId: target === "user" ? recipient : null,
          organizationId: target === "organization" ? recipient : null,
          reason,
          note,
          grantedByUserId: user.id ?? user.email ?? null,
          effectiveAt: rawEffective ? new Date(rawEffective) : new Date(),
        },
      });

      await tx.platformAuditLog.create({
        data: {
          actorUserId: user.id ?? user.email ?? null,
          action: "grant.access_credit",
          resourceType: "CreditAdjustment",
          resourceId: created.id,
          scopeLevel: target === "organization" ? "ORGANIZATION" : "GLOBAL",
          reason,
          metadata: { grantType, amount, days, target, recipient },
        },
      });

      return created;
    });

    revalidatePath("/super/quick-actions/grant-access-credit");
    revalidatePath("/super/subscriptions-billing/ai-credit-management");
    return { ok: true, id: grant.id };
  } catch {
    return { ok: false, error: "Could not record the grant. The platform database was unreachable." };
  }
}
