-- AlterTable
ALTER TABLE "MarketplaceCartItem" ADD COLUMN     "bundleId" TEXT;

-- AlterTable
ALTER TABLE "MarketplaceOrder" ADD COLUMN     "affiliateRef" TEXT,
ADD COLUMN     "couponCode" TEXT,
ADD COLUMN     "discountCents" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "MarketplaceStoreFollow" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplaceStoreFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceCoupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sellerId" TEXT,
    "percentOff" INTEGER,
    "amountOffCents" INTEGER,
    "currency" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "maxRedemptions" INTEGER,
    "redemptions" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplaceCoupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceBundle" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceBundleItem" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "MarketplaceBundleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceSponsoredPlacement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "placement" TEXT NOT NULL DEFAULT 'home',
    "label" TEXT NOT NULL DEFAULT 'Sponsored',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplaceSponsoredPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteEventAggregate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL DEFAULT '',
    "date" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SiteEventAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketplaceStoreFollow_userId_idx" ON "MarketplaceStoreFollow"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceStoreFollow_sellerId_userId_key" ON "MarketplaceStoreFollow"("sellerId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceCoupon_code_key" ON "MarketplaceCoupon"("code");

-- CreateIndex
CREATE INDEX "MarketplaceCoupon_sellerId_idx" ON "MarketplaceCoupon"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceBundle_slug_key" ON "MarketplaceBundle"("slug");

-- CreateIndex
CREATE INDEX "MarketplaceBundle_sellerId_idx" ON "MarketplaceBundle"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceBundleItem_bundleId_productId_key" ON "MarketplaceBundleItem"("bundleId", "productId");

-- CreateIndex
CREATE INDEX "MarketplaceSponsoredPlacement_placement_isActive_idx" ON "MarketplaceSponsoredPlacement"("placement", "isActive");

-- CreateIndex
CREATE INDEX "SiteEventAggregate_date_idx" ON "SiteEventAggregate"("date");

-- CreateIndex
CREATE UNIQUE INDEX "SiteEventAggregate_name_path_date_key" ON "SiteEventAggregate"("name", "path", "date");

-- AddForeignKey
ALTER TABLE "MarketplaceBundleItem" ADD CONSTRAINT "MarketplaceBundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "MarketplaceBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

