-- AlterTable
ALTER TABLE "ChannelPlan" ADD COLUMN     "approvalStatus" TEXT NOT NULL DEFAULT 'not_submitted',
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "assumptions" TEXT,
ADD COLUMN     "expectedReturn" DOUBLE PRECISION,
ADD COLUMN     "plannedSpend" DOUBLE PRECISION,
ADD COLUMN     "scenario" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN     "targetLeads" INTEGER,
ADD COLUMN     "targetRevenue" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ContentIdea" ADD COLUMN     "goal" TEXT,
ADD COLUMN     "saved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "EventItem" ADD COLUMN     "country" TEXT,
ADD COLUMN     "goal" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'custom';

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "campaignIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "NewsItem" ADD COLUMN     "relevance" DOUBLE PRECISION,
ADD COLUMN     "saved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "topic" TEXT;

-- AlterTable
ALTER TABLE "Persona" ADD COLUMN     "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "needs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "objections" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "segmentId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "triggers" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "sharedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "Strategy" ADD COLUMN     "pillars" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "swot" JSONB;

-- AlterTable
ALTER TABLE "Trend" ADD COLUMN     "country" TEXT,
ADD COLUMN     "engagement" DOUBLE PRECISION,
ADD COLUMN     "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "mentions" INTEGER,
ADD COLUMN     "relevance" DOUBLE PRECISION,
ADD COLUMN     "source" TEXT;

-- CreateTable
CREATE TABLE "GrowthAudit" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "industry" TEXT,
    "goal" TEXT,
    "periodDays" INTEGER NOT NULL DEFAULT 30,
    "competitors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'completed',
    "score" INTEGER,
    "checks" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrowthAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GrowthAudit_workspaceId_createdAt_idx" ON "GrowthAudit"("workspaceId", "createdAt");

