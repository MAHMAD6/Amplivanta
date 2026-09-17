-- AlterTable
ALTER TABLE "Recommendation" ADD COLUMN     "actionHref" TEXT,
ADD COLUMN     "evidence" TEXT,
ADD COLUMN     "metric" TEXT,
ADD COLUMN     "ruleKey" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'ai';

-- CreateTable
CREATE TABLE "GrowthScoreSnapshot" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "score" INTEGER,
    "status" TEXT NOT NULL,
    "coverage" DOUBLE PRECISION NOT NULL,
    "dimensions" JSONB NOT NULL,
    "windowDays" INTEGER NOT NULL DEFAULT 30,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrowthScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GrowthScoreSnapshot_workspaceId_createdAt_idx" ON "GrowthScoreSnapshot"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "GrowthScoreSnapshot" ADD CONSTRAINT "GrowthScoreSnapshot_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

