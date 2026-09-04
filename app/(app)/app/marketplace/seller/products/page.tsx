import type { Metadata } from "next";
import { Package, Plus } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { getMarketplaceViewer } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "My Products" };

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft", SUBMITTED: "Submitted", UNDER_REVIEW: "Under review",
  CHANGES_REQUESTED: "Changes requested", APPROVED: "Approved", PUBLISHED: "Published",
  UNPUBLISHED: "Unpublished", SUSPENDED: "Suspended", ARCHIVED: "Archived", REJECTED: "Rejected",
};

export default async function SellerProductsPage() {
  const viewer = await getMarketplaceViewer();
  const sellerId = viewer.seller?.id;

  let products: { id: string; title: string; status: string; updatedAt: Date }[] = [];
  let reachable = true;
  try {
    products = sellerId
      ? await prisma.marketplaceProduct.findMany({
          where: { sellerId },
          orderBy: { updatedAt: "desc" },
          select: { id: true, title: true, status: true, updatedAt: true },
          take: 100,
        })
      : [];
  } catch {
    reachable = false;
  }

  return (
    <>
      <MpHeader
        title="My Products"
        description="Every product you have drafted, submitted or published."
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "Seller Dashboard", href: "/app/marketplace/seller" },
          { label: "My Products" },
        ]}
        action={<MpButton href="/app/marketplace/seller/products/new" variant="primary" icon={Plus}>Add product</MpButton>}
      />
      <MpCard>
        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b border-line">
                  {["Product", "Status", "Last updated"].map((h) => (
                    <th key={h} scope="col" className="px-6 py-4 text-left text-[13px] font-bold text-deep-navy">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0">
                    <td className="px-6 py-4 text-[13px] font-semibold text-deep-navy">{p.title}</td>
                    <td className="px-6 py-4 text-[13px] text-ink">{STATUS_LABEL[p.status] ?? p.status}</td>
                    <td className="px-6 py-4 text-[13px] text-ink-soft">
                      {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(p.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <MpEmpty
            icon={Package}
            title={reachable ? "No products yet" : "Products unavailable"}
            description={
              reachable
                ? "Create a product, then submit it for review. Approved products can be published to the catalogue."
                : "The platform database could not be reached, so your products cannot be listed right now."
            }
            action={<MpButton href="/app/marketplace/seller/products/new" variant="primary">Add your first product</MpButton>}
          />
        )}
      </MpCard>
      <MpNote title="Review flow">
        Products move draft → submitted → under review → approved → published. A version referenced by
        a completed order stays addressable forever; updates publish a new version instead.
      </MpNote>
    </>
  );
}
