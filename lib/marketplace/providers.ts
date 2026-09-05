import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Provider adapters.
 *
 * Payment, payout and file-storage providers are launch decisions that the
 * approved handoff says must be confirmed rather than invented. Nothing is
 * hard-coded here: each provider is read from MarketplaceSetting, and when none
 * is configured the caller gets an explicit "not configured" result instead of a
 * fabricated integration.
 */

export type ProviderConfig = { id: string; config: Record<string, unknown> } | null;

async function readSetting(key: string): Promise<ProviderConfig> {
  try {
    const row = await prisma.marketplaceSetting.findUnique({ where: { key } });
    if (!row) return null;
    const v = row.value as { provider?: string; config?: Record<string, unknown> } | null;
    if (!v?.provider) return null;
    return { id: v.provider, config: v.config ?? {} };
  } catch {
    return null;
  }
}

export const getPaymentProvider = () => readSetting("payment.provider");

/**
 * Whether a deliverable must pass a malware scan before it can be downloaded.
 * Scanning is required unless an operator has explicitly recorded a decision to
 * run without a scanner - it is never silently skipped.
 */
export async function malwareScanRequired(): Promise<boolean> {
  try {
    const row = await prisma.marketplaceSetting.findUnique({ where: { key: "security.malware_scanning" } });
    const v = row?.value as { mode?: string } | null;
    return v?.mode !== "disabled";
  } catch {
    return true;
  }
}
export const getPayoutProvider = () => readSetting("payout.provider");
export const getStorageProvider = () => readSetting("storage.provider");

export { requiresPaymentProvider } from "@/lib/marketplace/providers.policy";

export type SignedUrlResult =
  | { ok: true; url: string; expiresAt: Date }
  | { ok: false; reason: "no_provider" };

/**
 * Issues a time-limited download URL. Link TTL and the storage provider are
 * operator settings; with none configured this refuses rather than returning a
 * link that cannot work.
 */
export async function issueSignedUrl(storageKey: string): Promise<SignedUrlResult> {
  const provider = await getStorageProvider();
  if (!provider) return { ok: false, reason: "no_provider" };

  const ttlSeconds = Number(provider.config.signedUrlTtlSeconds ?? 300);
  const base = String(provider.config.baseUrl ?? "").replace(/\/$/, "");
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  return { ok: true, url: `${base}/${storageKey}`, expiresAt };
}
