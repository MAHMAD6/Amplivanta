import "server-only";
import { Prisma, type CreditBucket, type CreditLedgerKind } from "@prisma/client";
import { db } from "@/lib/db";
import { parseCreditPacks, planConsumption, type CreditPack } from "@/lib/credits/policy";

/**
 * Workspace credit wallet and append-only ledger.
 *
 * Every balance change writes a ledger entry in the same transaction, and the
 * ledger's unique (sourceType, sourceId, kind, bucket) key makes each grant or
 * debit idempotent: replaying the same Stripe event or retrying the same usage
 * record cannot post twice.
 */

type Tx = Prisma.TransactionClient;

export const creditPacks = (): CreditPack[] => parseCreditPacks(process.env.CREDIT_PACKS);

const isUniqueViolation = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

export async function getWallet(workspaceId: string) {
  return db.creditWallet.findUnique({ where: { workspaceId } });
}

async function post(
  tx: Tx,
  entry: {
    workspaceId: string;
    kind: CreditLedgerKind;
    bucket: CreditBucket;
    amount: number;
    sourceType: string;
    sourceId: string;
    note?: string;
    actorUserId?: string;
  },
) {
  const field = entry.bucket === "PLAN" ? "planCredits" : "purchasedCredits";
  const wallet = await tx.creditWallet.upsert({
    where: { workspaceId: entry.workspaceId },
    create: { workspaceId: entry.workspaceId, [field]: entry.amount },
    update: { [field]: { increment: entry.amount } },
  });
  const balanceAfter = wallet[field];
  if (balanceAfter < 0) throw new Error("Credit balance would go negative");
  await tx.creditLedgerEntry.create({ data: { ...entry, balanceAfter } });
}

export type CreditResult = { ok: true; duplicate?: boolean } | { ok: false; error: string };

/**
 * Fulfils a Stripe credit purchase. Called only from the verified webhook,
 * after the payment has been checked against the amount fixed at checkout.
 */
export async function fulfilCreditPurchase(stripeSessionId: string, paymentRef: string | null): Promise<CreditResult> {
  try {
    return await db.$transaction(async (tx) => {
      const purchase = await tx.creditPurchase.findUnique({ where: { stripeSessionId } });
      if (!purchase) return { ok: false, error: "Unknown credit purchase" } as const;
      if (purchase.status === "fulfilled") return { ok: true, duplicate: true } as const;
      await post(tx, {
        workspaceId: purchase.workspaceId,
        kind: "PURCHASE",
        bucket: "PURCHASED",
        amount: purchase.credits,
        sourceType: "stripe_checkout",
        sourceId: stripeSessionId,
        note: purchase.packCode,
        actorUserId: purchase.userId ?? undefined,
      });
      await tx.creditPurchase.update({
        where: { id: purchase.id },
        data: { status: "fulfilled", fulfilledAt: new Date(), paymentRef },
      });
      return { ok: true } as const;
    });
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: true, duplicate: true };
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * Debits credits for metered usage: plan credits first, then purchased.
 * `sourceId` must identify the usage event so a retry cannot debit twice.
 */
export async function consumeCredits(
  workspaceId: string,
  amount: number,
  source: { type: string; id: string; note?: string; actorUserId?: string },
): Promise<CreditResult> {
  try {
    return await db.$transaction(
      async (tx) => {
        const wallet = (await tx.creditWallet.findUnique({ where: { workspaceId } })) ?? {
          planCredits: 0,
          purchasedCredits: 0,
        };
        const plan = planConsumption(wallet, amount);
        if (!plan.ok) return { ok: false, error: plan.error } as const;
        const base = { workspaceId, kind: "USAGE" as const, sourceType: source.type, sourceId: source.id, note: source.note, actorUserId: source.actorUserId };
        if (plan.fromPlan) await post(tx, { ...base, bucket: "PLAN", amount: -plan.fromPlan });
        if (plan.fromPurchased) await post(tx, { ...base, bucket: "PURCHASED", amount: -plan.fromPurchased });
        return { ok: true } as const;
      },
      { isolationLevel: "Serializable" },
    );
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: true, duplicate: true };
    return { ok: false, error: (e as Error).message };
  }
}

/** Sets the plan bucket for a billing period (e.g. on subscription renewal). */
export async function allocatePlanCredits(workspaceId: string, credits: number, periodKey: string): Promise<CreditResult> {
  try {
    return await db.$transaction(async (tx) => {
      const current = (await tx.creditWallet.findUnique({ where: { workspaceId } }))?.planCredits ?? 0;
      await post(tx, {
        workspaceId,
        kind: "PLAN_ALLOCATION",
        bucket: "PLAN",
        amount: credits - current,
        sourceType: "plan_period",
        sourceId: `${workspaceId}:${periodKey}`,
      });
      return { ok: true } as const;
    });
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: true, duplicate: true };
    return { ok: false, error: (e as Error).message };
  }
}

export async function recentLedger(workspaceId: string, take = 20) {
  return db.creditLedgerEntry.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take });
}
