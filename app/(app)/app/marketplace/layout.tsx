import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";
import { MpDenied } from "@/components/marketplace/ui";

/**
 * Marketplace gate. Evaluated in the approved order: module kill switch, then
 * authentication. Per-screen permission, seller-status and feature-flag checks
 * happen inside each page.
 */
export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer);
  if (!gate.ok) return <MpDenied denial={gate} />;
  return <>{children}</>;
}
