import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionContext, errorResponse, requireRole } from "@/lib/tenant";
import { OAUTH_NONCE_COOKIE, OAUTH_PROVIDERS, authorizeUrl, isProviderConfigured, signState } from "@/lib/oauth";
import { decryptSecret } from "@/lib/crypto";

// GET /api/integrations/oauth/:provider/start — redirect the user to the provider's consent screen.
export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  try {
    const { provider: providerId } = await params;
    const provider = OAUTH_PROVIDERS[providerId];
    if (!provider) return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
    if (!isProviderConfigured(provider)) {
      return NextResponse.json({ error: `${provider.name} is not available yet` }, { status: 503 });
    }
    const ctx = await getSessionContext(req);
    requireRole(ctx, "ADMIN");

    // Re-consent only when an existing connection has no refresh token to reuse.
    let forceConsent = true;
    if (provider.family === "google") {
      const existing = await db.integration.findFirst({ where: { workspaceId: ctx.workspaceId, provider: provider.id }, select: { config: true } });
      const raw = (existing?.config as { tokens?: string } | null)?.tokens;
      let hasRefresh = false;
      try {
        hasRefresh = Boolean(raw && (JSON.parse(decryptSecret(raw)) as { refresh_token?: string }).refresh_token);
      } catch {
        hasRefresh = false;
      }
      forceConsent = !hasRefresh;
    }

    const returnTo = new URL(req.url).searchParams.get("returnTo");
    const { state, nonce } = signState({ workspaceId: ctx.workspaceId, userId: ctx.userId }, provider.id, returnTo ?? "");
    const res = NextResponse.redirect(authorizeUrl(provider, state, { forceConsent }));
    res.cookies.set(OAUTH_NONCE_COOKIE, nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/integrations/oauth",
      maxAge: 600,
    });
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
