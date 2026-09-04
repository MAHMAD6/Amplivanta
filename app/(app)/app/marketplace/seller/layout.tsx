import { MpDenied } from "@/components/marketplace/ui";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";

/** Seller area: approved sellers only, checked server-side on every request. */
export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.dashboard.read",
    requireApprovedSeller: true,
  });
  if (!gate.ok) return <MpDenied denial={gate} />;
  return <>{children}</>;
}
