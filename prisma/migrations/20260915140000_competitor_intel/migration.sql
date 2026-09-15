-- AlterTable
ALTER TABLE "Competitor" ADD COLUMN     "lastRefreshedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CompetitorDiscoveryRun" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "domain" TEXT,
    "location" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'running',
    "error" TEXT,
    "candidateCount" INTEGER NOT NULL DEFAULT 0,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorDiscoveryRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorCandidate" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "evidence" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'suggested',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorKeyword" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "competitorId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "position" INTEGER,
    "searchVolume" INTEGER,
    "url" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorKeywordGap" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "competitorId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "ourPosition" INTEGER,
    "theirPosition" INTEGER,
    "kind" TEXT NOT NULL,
    "searchVolume" INTEGER,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorKeywordGap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorPage" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "competitorId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "organicCount" INTEGER,
    "etv" DOUBLE PRECISION,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorSignal" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "competitorId" TEXT,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'low',
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderUsage" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "provider" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "taskId" TEXT,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompetitorDiscoveryRun_workspaceId_createdAt_idx" ON "CompetitorDiscoveryRun"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "CompetitorCandidate_workspaceId_status_idx" ON "CompetitorCandidate"("workspaceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorCandidate_runId_domain_key" ON "CompetitorCandidate"("runId", "domain");

-- CreateIndex
CREATE INDEX "CompetitorKeyword_workspaceId_idx" ON "CompetitorKeyword"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorKeyword_competitorId_keyword_key" ON "CompetitorKeyword"("competitorId", "keyword");

-- CreateIndex
CREATE INDEX "CompetitorKeywordGap_workspaceId_kind_idx" ON "CompetitorKeywordGap"("workspaceId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorKeywordGap_competitorId_keyword_key" ON "CompetitorKeywordGap"("competitorId", "keyword");

-- CreateIndex
CREATE INDEX "CompetitorPage_workspaceId_idx" ON "CompetitorPage"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorPage_competitorId_url_key" ON "CompetitorPage"("competitorId", "url");

-- CreateIndex
CREATE INDEX "CompetitorSignal_workspaceId_createdAt_idx" ON "CompetitorSignal"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "ProviderUsage_workspaceId_createdAt_idx" ON "ProviderUsage"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "ProviderUsage_provider_createdAt_idx" ON "ProviderUsage"("provider", "createdAt");

-- AddForeignKey
ALTER TABLE "CompetitorCandidate" ADD CONSTRAINT "CompetitorCandidate_runId_fkey" FOREIGN KEY ("runId") REFERENCES "CompetitorDiscoveryRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

