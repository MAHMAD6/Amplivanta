-- Content Creation disclosure, required on every Marketplace listing by the
-- Marketplace spec. Additive: one enum and one nullable column, so listings
-- created before the disclosure existed remain valid. The server requires a
-- value on every new product.
-- Generated with `prisma migrate diff` against a throwaway shadow database.

-- CreateEnum
CREATE TYPE "ContentCreation" AS ENUM ('HUMAN_CREATED', 'AI_ASSISTED', 'PRIMARILY_AI_GENERATED');

-- AlterTable
ALTER TABLE "MarketplaceProduct" ADD COLUMN     "contentCreation" "ContentCreation";
