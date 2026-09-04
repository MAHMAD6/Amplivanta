import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileDown } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { getMarketplaceViewer } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Purchase Detail" };

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const viewer = await getMarketplaceViewer();
  const { orderId } = await params;

  // Ownership check before any order data is read.
  let order: { id: string; status: string; items: { id: string; titleSnapshot: string; licenseVersion: string }[] } | null = null;
  let reachable = true;
  try {
    order = viewer.userId
      ? await prisma.marketplaceOrder.findFirst({
          where: { id: orderId, buyerUserId: viewer.userId },
          select: { id: true, status: true, items: { select: { id: true, titleSnapshot: true, licenseVersion: true } } },
        })
      : null;
  } catch {
    reachable = false;
  }
  if (reachable && !order) notFound();

  return (
    <>
      <MpHeader
        title="Purchase Detail"
        description="Download and licence details for this order."
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "My Purchases", href: "/app/marketplace/purchases" },
          { label: "Order" },
        ]}
      />
      <MpCard>
        {order && order.items.length > 0 ? (
          <div className="px-6 py-2">
            {order.items.map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-4 border-b border-line py-4 last:border-0">
                <div>
                  <div className="text-[14px] font-bold text-deep-navy">{i.titleSnapshot}</div>
                  <div className="text-[12px] text-ink-muted">Licence {i.licenseVersion}</div>
                </div>
                <MpButton disabled title="Downloads require an active entitlement and a configured storage provider.">
                  Download
                </MpButton>
              </div>
            ))}
          </div>
        ) : (
          <MpEmpty
            icon={FileDown}
            title={reachable ? "Nothing to download yet" : "Purchase unavailable"}
            description={
              reachable
                ? "This order has no line items with an active entitlement."
                : "The platform database could not be reached, so this purchase cannot be shown right now."
            }
          />
        )}
      </MpCard>
      <MpNote title="Signed downloads">
        Download links are short-lived signed URLs issued per request and recorded against your
        entitlement. Link TTL and the file-storage provider are launch decisions still to be confirmed.
      </MpNote>
    </>
  );
}
