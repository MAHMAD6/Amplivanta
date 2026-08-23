import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OAUTH_PROVIDERS, isProviderConfigured, verifyState, exchangeCode } from "@/lib/oauth";
import { encryptSecret } from "@/lib/crypto";

const APP_URL = () => process.env.NEXTAUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";

// GET /api/integrations/oauth/:provider/callback — exchange the code, store encrypted
// tokens on the Integration, and return the user to the connected-apps page.
export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: providerId } = await params;
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const back = (status: string) => NextResponse.redirect(`${APP_URL()}/app/integrations/connected?oauth=${status}`);

  const provider = OAUTH_PROVIDERS[providerId];
  if (!provider || !isProviderConfigured(provider)) return back("unsupported");
  if (!code || !state) return back("denied");

  const verified = verifyState(state);
  if (!verified || verified.provider !== providerId) return back("invalid_state");

  try {
    const tokens = await exchangeCode(provider, code);
    const config = {
      tokens: encryptSecret(JSON.stringify(tokens)),
      connectedAt: new Date().toISOString(),
    };
    const existing = await db.integration.findFirst({
      where: { workspaceId: verified.workspaceId, provider: provider.id },
    });
    if (existing) {
      await db.integration.update({
        where: { id: existing.id },
        data: { status: "connected", scopes: provider.scopes, config, lastSyncAt: new Date() },
      });
    } else {
      await db.integration.create({
        data: { workspaceId: verified.workspaceId, provider: provider.id, status: "connected", scopes: provider.scopes, config },
      });
    }
    return back("connected");
  } catch {
    return back("error");
  }
}
