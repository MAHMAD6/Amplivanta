import "server-only";
import { db } from "@/lib/db";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { OAUTH_PROVIDERS, isProviderConfigured } from "@/lib/oauth";

/**
 * Access tokens for a workspace's connected provider.
 *
 * Tokens are stored encrypted on the Integration row by the OAuth callback.
 * They are decrypted only here, refreshed when expired (when the provider
 * returned a refresh token), and never leave the server.
 */

type StoredTokens = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  obtained_at?: number;
  [k: string]: unknown;
};

export type TokenResult =
  | { ok: true; accessToken: string; config: Record<string, unknown> }
  | { ok: false; reason: "not_connected" | "no_token" | "refresh_failed" | "provider_unconfigured" };

function parse(config: unknown): StoredTokens | null {
  if (!config || typeof config !== "object") return null;
  const raw = (config as Record<string, unknown>).tokens;
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(decryptSecret(raw)) as StoredTokens;
  } catch {
    return null;
  }
}

const expired = (t: StoredTokens) =>
  typeof t.expires_in === "number" && typeof t.obtained_at === "number"
    ? Date.now() > t.obtained_at + (t.expires_in - 120) * 1000
    : false;

export async function getProviderToken(workspaceId: string, provider: string): Promise<TokenResult> {
  const p = OAUTH_PROVIDERS[provider];
  if (!p || !isProviderConfigured(p)) return { ok: false, reason: "provider_unconfigured" };

  const integration = await db.integration.findFirst({ where: { workspaceId, provider } });
  if (!integration) return { ok: false, reason: "not_connected" };
  const tokens = parse(integration.config);
  const config = (integration.config as Record<string, unknown>) ?? {};
  if (!tokens?.access_token) return { ok: false, reason: "no_token" };

  if (!expired(tokens)) return { ok: true, accessToken: tokens.access_token, config };
  if (!tokens.refresh_token) return { ok: false, reason: "refresh_failed" };

  try {
    const res = await fetch(p.tokenUrl, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokens.refresh_token,
        client_id: p.clientId!,
        client_secret: p.clientSecret!,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { ok: false, reason: "refresh_failed" };
    const fresh = (await res.json()) as StoredTokens;
    const merged: StoredTokens = {
      ...tokens,
      ...fresh,
      refresh_token: fresh.refresh_token ?? tokens.refresh_token,
      obtained_at: Date.now(),
    };
    await db.integration.update({
      where: { id: integration.id },
      data: { config: { ...config, tokens: encryptSecret(JSON.stringify(merged)) } },
    });
    return merged.access_token
      ? { ok: true, accessToken: merged.access_token, config }
      : { ok: false, reason: "refresh_failed" };
  } catch {
    return { ok: false, reason: "refresh_failed" };
  }
}

/** Human-readable reason, for admin-visible failure states. */
export const tokenReason: Record<Exclude<TokenResult, { ok: true }>["reason"], string> = {
  not_connected: "This provider is not connected for your workspace.",
  no_token: "The stored connection has no access token. Reconnect the provider.",
  refresh_failed: "The access token expired and could not be refreshed. Reconnect the provider.",
  provider_unconfigured: "This provider has no credentials configured on the server yet.",
};
