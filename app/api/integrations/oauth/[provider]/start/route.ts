import { NextResponse } from "next/server";
import { getSessionContext, errorResponse } from "@/lib/tenant";
import { OAUTH_PROVIDERS, isProviderConfigured, signState, authorizeUrl } from "@/lib/oauth";

// GET /api/integrations/oauth/:provider/start — redirect the user to the provider's consent screen.
export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  try {
    const { provider: providerId } = await params;
    const provider = OAUTH_PROVIDERS[providerId];
    if (!provider) return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
    if (!isProviderConfigured(provider)) {
      return NextResponse.json({ error: `${provider.name} OAuth is not configured` }, { status: 503 });
    }
    const ctx = await getSessionContext(req);
    const state = signState(ctx.workspaceId, provider.id);
    return NextResponse.redirect(authorizeUrl(provider, state));
  } catch (err) {
    return errorResponse(err);
  }
}
