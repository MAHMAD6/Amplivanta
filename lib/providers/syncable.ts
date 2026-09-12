/**
 * Providers with a connector implemented. Shared by the server (which runs
 * them) and the UI (which only offers Sync where something will actually run),
 * so a connect-only provider never shows a button that does nothing.
 */
export const SYNCABLE_PROVIDERS = ["google", "meta", "hubspot"] as const;

export type SyncableProvider = (typeof SYNCABLE_PROVIDERS)[number];

export const isSyncable = (provider: string | undefined | null): provider is SyncableProvider =>
  typeof provider === "string" && (SYNCABLE_PROVIDERS as readonly string[]).includes(provider);
