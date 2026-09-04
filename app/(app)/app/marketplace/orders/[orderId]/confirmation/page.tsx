import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader } from "@/components/marketplace/ui";
import { getMarketplaceViewer } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Purchase Confirmation" };

export default async function PurchaseConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const viewer = await getMarketplaceViewer();
  const { orderId } = await params;

  // Buyer order-ownership check is mandatory before showing any order.
  let order: { id: string; status: string } | null = null;
  let reachable = true;
  try {
    order = viewer.userId
      ? await prisma.marketplaceOrder.findFirst({
          where: { id: orderId, buyerUserId: viewer.userId },
          select: { id: true, status: true },
        })
      : null;
  } catch {
    reachable = false;
  }
  if (reachable && !order) notFound();

  return (
    <>
      <MpHeader
        title="Purchase Confirmation"
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "My Purchases", href: "/app/marketplace/purchases" },
          { label: "Confirmation" },
        ]}
      />
      <MpCard>
        <MpEmpty
          icon={CheckCircle2}
          title={reachable ? "Order recorded" : "Confirmation unavailable"}
          description={
            reachable
              ? `Order status: ${order?.status ?? "unknown"}. Downloads unlock once the entitlement for this order is active.`
              : "The platform database could not be reached, so this confirmation cannot be shown right now."
          }
          action={<MpButton href="/app/marketplace/purchases" variant="primary">Go to My Purchases</MpButton>}
        />
      </MpCard>
    </>
  );
}
