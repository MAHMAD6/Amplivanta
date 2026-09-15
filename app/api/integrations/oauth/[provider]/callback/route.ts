import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { OAUTH_NONCE_COOKIE, OAUTH_PROVIDERS, exchangeCode, isProviderConfigured, verifyState } from "@/lib/oauth";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { isGoogleService, missingScopes, validateGoogleService } from "@/lib/google/services";

const APP_URL = () => process.env.NEXTAUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";

/**
 * GET /api/integrations/oauth/:provider/callback
 *
 * Validates state (signature, expiry, browser nonce) before exchanging the
 * code; for Google services also checks the granted scopes, runs a validation
 * call that lists reachable resources, stores encrypted tokens and writes an
 * audit event, then returns the user to where they started.
 */
export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: providerId } = await params;
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const nonce = jar.get(OAUTH_NONCE_COOKIE)?.value;

  const verified = state ? verifyState(state, nonce) : null;
  const base = verified?.returnTo ?? "/app/integrations/connected";
  const back = (status: string) => {
    const target = new URL(`${APP_URL()}${base}`);
    target.searchParams.set("oauth", status);
    target.searchParams.set("provider", providerId);
    const res = NextResponse.redirect(target);
    res.cookies.set(OAUTH_NONCE_COOKIE, "", { path: "/api/integrations/oauth", maxAge: 0 });
    return res;
  };

  const provider = OAUTH_PROVIDERS[providerId];
  if (!provider || !isProviderConfigured(provider)) return back("unsupported");
  if (!verified || verified.provider !== providerId) return back("invalid_state");
  if (!code) return back("denied");

  const audit = (action: string, metadata: Record<string, unknown>) =>
    db.auditLog
      .create({ data: { workspaceId: verified.workspaceId, actorUserId: verified.userId, action, resourceType: "Integration", metadata: metadata as never } })
      .catch(() => null);

  try {
    const membership = await db.membership.findFirst({ where: { workspaceId: verified.workspaceId, userId: verified.userId }, select: { id: true } });
    if (!membership) return back("invalid_state");

    const tokens = await exchangeCode(provider, code);
    const existing = await db.integration.findFirst({ where: { workspaceId: verified.workspaceId, provider: provider.id } });
    const prior = existing?.config as Record<string, unknown> | null;

    // Google returns a refresh token only on first consent; keep the stored one.
    if (!tokens.refresh_token && typeof prior?.tokens === "string") {
      try {
        const old = JSON.parse(decryptSecret(prior.tokens)) as { refresh_token?: string };
        if (old.refresh_token) tokens.refresh_token = old.refresh_token;
      } catch {
        /* no usable prior token */
      }
    }

    let status = "connected";
    let extra: Record<string, unknown> = {};
    let grantedScopes = provider.scopes;
    if (isGoogleService(provider.id)) {
      const granted = typeof tokens.scope === "string" ? tokens.scope : "";
      grantedScopes = granted.split(/\s+/).filter(Boolean);
      const missing = missingScopes(provider.id, granted);
      if (missing.length) {
        await audit("integration.connect_failed", { provider: provider.id, reason: "scopes_not_granted" });
        return back("scopes_missing");
      }
      const check = await validateGoogleService(provider.id, String(tokens.access_token ?? ""));
      if (check.ok) {
        const previous = typeof prior?.selectedResource === "string" ? prior.selectedResource : null;
        const selected = check.resources.find((r) => r.id === previous)?.id ?? (check.resources.length === 1 ? check.resources[0].id : null);
        extra = { resources: check.resources.slice(0, 200), selectedResource: selected, validatedAt: new Date().toISOString(), lastErrorCode: null };
        if (check.resources.length === 0) status = "needs_resource";
      } else {
        status = check.code === "reauth_required" ? "reauth_required" : "error";
        extra = { resources: [], selectedResource: null, lastErrorCode: check.code, lastErrorMessage: check.message };
      }
    }

    const config = {
      ...(prior ?? {}),
      ...extra,
      tokens: encryptSecret(JSON.stringify(tokens)),
      connectedAt: new Date().toISOString(),
      connectedByUserId: verified.userId,
    };
    const row = existing
      ? await db.integration.update({ where: { id: existing.id }, data: { status, isConnected: status === "connected", scopes: grantedScopes, config } })
      : await db.integration.create({
          data: { workspaceId: verified.workspaceId, provider: provider.id, status, isConnected: status === "connected", scopes: grantedScopes, config },
        });
    await audit(existing ? "integration.reconnected" : "integration.connected", { provider: provider.id, integrationId: row.id, status });
    return back(status === "connected" ? "connected" : status);
  } catch {
    await audit("integration.connect_failed", { provider: provider.id, reason: "exchange_failed" });
    return back("error");
  }
}
