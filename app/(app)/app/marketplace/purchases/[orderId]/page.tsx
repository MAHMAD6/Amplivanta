import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileDown } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { DownloadButton } from "@/components/marketplace/purchase-ui";
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

  let order: Awaited<ReturnType<typeof load>> = null;
  let reachable = true;
  async function load() {
    // Ownership check before any order data is read.
    return prisma.marketplaceOrder.findFirst({
      where: { id: orderId, buyerUserId: viewer.userId ?? "__none__" },
      select: {
        id: true,
        status: true,
        items: {
          select: {
            id: true,
            titleSnapshot: true,
            licenseVersion: true,
            entitlements: { select: { id: true, status: true } },
          },
        },
      },
    });
  }
  try {
    order = await load();
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
          <div className="divide-y divide-line">
            {order.items.map((i) => {
              const active = i.entitlements.find((e) => e.status === "ACTIVE");
              return (
                <div key={i.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <div className="text-[14px] font-bold text-deep-navy">{i.titleSnapshot}</div>
                    <div className="text-[12px] text-ink-muted">
                      Licence {i.licenseVersion}
                      {i.entitlements[0] ? ` · entitlement ${i.entitlements[0].status.toLowerCase()}` : ""}
                    </div>
                  </div>
                  {active ? (
                    <DownloadButton entitlementId={active.id} />
                  ) : (
                    <MpButton disabled title="No active entitlement for this item.">Download</MpButton>
                  )}
                </div>
              );
            })}
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
        entitlement. Link TTL and the file-storage provider are operator settings.
      </MpNote>
    </>
  );
}
