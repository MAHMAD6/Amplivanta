/**
 * Pure provider policy, split out so it is unit-testable without server-only
 * imports. `lib/marketplace/providers.ts` re-exports it.
 */

/**
 * A zero-total order needs no payment provider, so free products complete the
 * full purchase to entitlement to download flow. Any balance due requires one.
 */
export function requiresPaymentProvider(totalCents: number) {
  return totalCents > 0;
}
