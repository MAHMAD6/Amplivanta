-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'uncategorized',
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT;

