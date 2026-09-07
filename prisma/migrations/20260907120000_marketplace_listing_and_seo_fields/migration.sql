-- Listing presentation and seller-authored SEO fields for Marketplace products.
-- Purely additive: 11 new columns, all nullable or defaulted, no data rewritten.
-- Generated with `prisma migrate diff` against a throwaway shadow database.

-- AlterTable
ALTER TABLE "MarketplaceProduct" ADD COLUMN     "allowIndexing" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "coverImageAlt" TEXT,
ADD COLUMN     "galleryImageAlts" TEXT[],
ADD COLUMN     "galleryImages" TEXT[],
ADD COLUMN     "highlights" TEXT[],
ADD COLUMN     "keywords" TEXT[],
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'English',
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "perfectFor" TEXT[],
ADD COLUMN     "primaryKeyword" TEXT,
ADD COLUMN     "seoTitle" TEXT;
