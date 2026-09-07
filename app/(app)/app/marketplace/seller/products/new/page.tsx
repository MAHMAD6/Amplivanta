import type { Metadata } from "next";
import { MpDenied, MpHeader, MpNote } from "@/components/marketplace/ui";
import { ProductWizard } from "@/components/marketplace/product-wizard";
import { MARKETPLACE_FLAGS } from "@/lib/marketplace/config";
import { getMarketplaceViewer, guardMarketplace } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Add New Product" };

export default async function NewProductPage() {
  const viewer = await getMarketplaceViewer();
  const gate = guardMarketplace(viewer, {
    permission: "marketplace.seller.products.create",
    requireApprovedSeller: true,
    flag: MARKETPLACE_FLAGS.productUploads,
  });
  if (!gate.ok) return <MpDenied denial={gate} />;

  let categories: { id: string; name: string }[] = [];
  try {
    categories = await prisma.marketplaceCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    });
  } catch {
    categories = [];
  }

  // Product types are individually flag-gated.
  const allowedTypes = [
    { value: "TEMPLATE", label: "Template", enabled: true },
    { value: "DOCUMENT", label: "Document", enabled: true },
    { value: "TOOL_KIT", label: "Tool or kit", enabled: true },
    { value: "GRAPHIC", label: "Graphic", enabled: true },
    { value: "IMAGE", label: "Image", enabled: viewer.flags[MARKETPLACE_FLAGS.imageProducts] === true },
    { value: "VIDEO", label: "Video", enabled: viewer.flags[MARKETPLACE_FLAGS.videoProducts] === true },
  ].filter((t) => t.enabled);

  return (
    <>
      <MpHeader
        title="Add New Product"
        description="Create a new Marketplace product and submit it for review."
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "Seller Dashboard", href: "/app/marketplace/seller" },
          { label: "My Products", href: "/app/marketplace/seller/products" },
          { label: "Add New Product" },
        ]}
      />
      <ProductWizard categories={categories} types={allowedTypes} />
      <MpNote title="Files and review">
        Supported file types, maximum upload size, retention policy and malware scanning are
        Marketplace operator settings. File upload is enabled once storage and scanning are configured.
      </MpNote>
    </>
  );
}
